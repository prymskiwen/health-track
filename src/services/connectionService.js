import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "./firebase";

// Constants
const COLLECTIONS = {
  CONNECTIONS: "connections",
};

const CONNECTION_FIELDS = {
  USER1: "user1",
  USER2: "user2",
  USER1_ROLE: "user1Role",
  USER2_ROLE: "user2Role",
  REQUESTED_BY: "requestedBy",
  STATUS: "status",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
};

const CONNECTION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
};

const CONNECTION_ID_SEPARATOR = "_";

const ERROR_MESSAGES = {
  INVALID_USER_IDS: "Invalid user IDs",
  INVALID_USER_ROLES: "Invalid user roles",
  CONNECTION_EXISTS: "Connection request already exists",
  USER_NOT_AUTHENTICATED: "User not authenticated",
  USER_ID_MISMATCH: "User ID mismatch",
};

// Helper functions
const normalizeUserId = (userId) => String(userId);

const generateConnectionId = (userId1, userId2) =>
  [userId1, userId2].sort().join(CONNECTION_ID_SEPARATOR);

const getConnectionRef = (connectionId) =>
  doc(db, COLLECTIONS.CONNECTIONS, connectionId);

const normalizeUserIds = (fromUserId, toUserId, fromUserRole, toUserRole) => {
  const fromUserIdStr = normalizeUserId(fromUserId);
  const toUserIdStr = normalizeUserId(toUserId);
  const isFromUserFirst = fromUserIdStr < toUserIdStr;

  return {
    user1: isFromUserFirst ? fromUserIdStr : toUserIdStr,
    user2: isFromUserFirst ? toUserIdStr : fromUserIdStr,
    user1Role: isFromUserFirst
      ? normalizeUserId(fromUserRole)
      : normalizeUserId(toUserRole),
    user2Role: isFromUserFirst
      ? normalizeUserId(toUserRole)
      : normalizeUserId(fromUserRole),
  };
};

const getOtherUserData = (data, currentUserId) => {
  const currentUserIdStr = normalizeUserId(currentUserId);
  const isUser1 = data[CONNECTION_FIELDS.USER1] === currentUserIdStr;

  return {
    userId: isUser1
      ? data[CONNECTION_FIELDS.USER2]
      : data[CONNECTION_FIELDS.USER1],
    role: isUser1
      ? data[CONNECTION_FIELDS.USER2_ROLE]
      : data[CONNECTION_FIELDS.USER1_ROLE],
  };
};

const createConnectionQueries = (userId, status) => {
  const userIdStr = normalizeUserId(userId);
  const collectionRef = collection(db, COLLECTIONS.CONNECTIONS);

  return {
    q1: query(
      collectionRef,
      where(CONNECTION_FIELDS.USER1, "==", userIdStr),
      where(CONNECTION_FIELDS.STATUS, "==", status)
    ),
    q2: query(
      collectionRef,
      where(CONNECTION_FIELDS.USER2, "==", userIdStr),
      where(CONNECTION_FIELDS.STATUS, "==", status)
    ),
  };
};

// Send connection request
export const sendConnectionRequest = async (
  fromUserId,
  toUserId,
  fromUserRole,
  toUserRole
) => {
  try {
    if (!fromUserId || !toUserId) {
      return { success: false, error: ERROR_MESSAGES.INVALID_USER_IDS };
    }

    // Validate roles
    if (!fromUserRole || !toUserRole) {
      return { success: false, error: ERROR_MESSAGES.INVALID_USER_ROLES };
    }

    const connectionId = generateConnectionId(fromUserId, toUserId);
    const connectionRef = getConnectionRef(connectionId);

    // Check if connection already exists (with error handling for permission issues)
    try {
      const existingConnection = await getDoc(connectionRef);
      if (existingConnection.exists()) {
        return { success: false, error: ERROR_MESSAGES.CONNECTION_EXISTS };
      }
    } catch (error) {
      // If we can't read (permission issue), we'll try to create anyway
      // The create will fail if it already exists
      console.warn(
        "Could not check existing connection, proceeding with create:",
        error
      );
    }

    // Normalize user IDs and roles
    const { user1, user2, user1Role, user2Role } = normalizeUserIds(
      fromUserId,
      toUserId,
      fromUserRole,
      toUserRole
    );

    const fromUserIdStr = normalizeUserId(fromUserId);
    const connectionData = {
      [CONNECTION_FIELDS.USER1]: user1,
      [CONNECTION_FIELDS.USER2]: user2,
      [CONNECTION_FIELDS.USER1_ROLE]: user1Role,
      [CONNECTION_FIELDS.USER2_ROLE]: user2Role,
      [CONNECTION_FIELDS.REQUESTED_BY]: fromUserIdStr,
      [CONNECTION_FIELDS.STATUS]: CONNECTION_STATUS.PENDING,
      [CONNECTION_FIELDS.CREATED_AT]: new Date().toISOString(),
      [CONNECTION_FIELDS.UPDATED_AT]: new Date().toISOString(),
    };

    // Verify authentication before creating
    const currentAuthUser = auth.currentUser;

    if (!currentAuthUser) {
      return { success: false, error: ERROR_MESSAGES.USER_NOT_AUTHENTICATED };
    }

    if (fromUserIdStr !== currentAuthUser.uid) {
      return { success: false, error: ERROR_MESSAGES.USER_ID_MISMATCH };
    }

    await setDoc(connectionRef, connectionData);

    return { success: true, id: connectionId };
  } catch (error) {
    console.error("Error sending connection request:", error);
    return { success: false, error: error.message };
  }
};

// Accept connection request
export const acceptConnectionRequest = async (connectionId) => {
  try {
    await updateDoc(getConnectionRef(connectionId), {
      [CONNECTION_FIELDS.STATUS]: CONNECTION_STATUS.ACCEPTED,
      [CONNECTION_FIELDS.UPDATED_AT]: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Reject/Remove connection
export const removeConnection = async (connectionId) => {
  try {
    await deleteDoc(getConnectionRef(connectionId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all connections for a user
export const getUserConnections = async (userId) => {
  try {
    const { q1, q2 } = createConnectionQueries(
      userId,
      CONNECTION_STATUS.ACCEPTED
    );

    // Execute both queries in parallel
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    const connections = [];
    const processedIds = new Set(); // To avoid duplicates

    // Process query 1 results (user is user1)
    snapshot1.forEach((doc) => {
      if (!processedIds.has(doc.id)) {
        const data = doc.data();
        const otherUser = getOtherUserData(data, userId);
        connections.push({
          id: doc.id,
          userId: otherUser.userId,
          role: otherUser.role,
          ...data,
        });
        processedIds.add(doc.id);
      }
    });

    // Process query 2 results (user is user2)
    snapshot2.forEach((doc) => {
      if (!processedIds.has(doc.id)) {
        const data = doc.data();
        const otherUser = getOtherUserData(data, userId);
        connections.push({
          id: doc.id,
          userId: otherUser.userId,
          role: otherUser.role,
          ...data,
        });
        processedIds.add(doc.id);
      }
    });

    return { success: true, data: connections };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get pending connection requests for a user
export const getPendingRequests = async (userId) => {
  try {
    const userIdStr = normalizeUserId(userId);
    const { q1, q2 } = createConnectionQueries(
      userId,
      CONNECTION_STATUS.PENDING
    );

    // Execute both queries in parallel
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    const requests = [];
    const processedIds = new Set(); // To avoid duplicates

    const processSnapshot = (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        const requestedByStr = normalizeUserId(
          data[CONNECTION_FIELDS.REQUESTED_BY] || ""
        );
        const isRequester = requestedByStr === userIdStr;

        // Get requests sent TO the user (not by the user)
        if (!isRequester && !processedIds.has(doc.id)) {
          const otherUser = getOtherUserData(data, userId);
          requests.push({
            id: doc.id,
            fromUserId: otherUser.userId,
            fromUserRole: otherUser.role,
            ...data,
          });
          processedIds.add(doc.id);
        }
      });
    };

    // Process both snapshots
    processSnapshot(snapshot1);
    processSnapshot(snapshot2);

    return { success: true, data: requests };
  } catch (error) {
    console.error("getPendingRequests - error:", error);
    return { success: false, error: error.message };
  }
};

// Get sent connection requests
export const getSentRequests = async (userId) => {
  try {
    const userIdStr = normalizeUserId(userId);
    const q = query(
      collection(db, COLLECTIONS.CONNECTIONS),
      where(CONNECTION_FIELDS.STATUS, "==", CONNECTION_STATUS.PENDING),
      where(CONNECTION_FIELDS.REQUESTED_BY, "==", userIdStr)
    );
    const querySnapshot = await getDocs(q);

    const requests = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const otherUser = getOtherUserData(data, userId);
      return {
        id: doc.id,
        toUserId: otherUser.userId,
        toUserRole: otherUser.role,
        ...data,
      };
    });

    return { success: true, data: requests };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check if users are connected
export const checkConnection = async (userId1, userId2) => {
  try {
    const connectionId = generateConnectionId(userId1, userId2);
    const connectionDoc = await getDoc(getConnectionRef(connectionId));

    if (connectionDoc.exists()) {
      return {
        success: true,
        data: { id: connectionDoc.id, ...connectionDoc.data() },
      };
    }
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Subscribe to connections for a user (real-time)
export const subscribeToConnections = (userId, callback) => {
  const { q1, q2 } = createConnectionQueries(
    userId,
    CONNECTION_STATUS.ACCEPTED
  );

  const allConnections = new Map();

  const updateCallback = () => {
    const connections = Array.from(allConnections.values());
    callback({ success: true, data: connections });
  };

  let q1Ids = new Set();
  let q2Ids = new Set();

  const processSnapshot = (snapshot, isUser1, idsSet) => {
    idsSet.clear();
    snapshot.forEach((doc) => {
      idsSet.add(doc.id);
      const data = doc.data();
      const otherUser = getOtherUserData(data, userId);
      allConnections.set(doc.id, {
        id: doc.id,
        userId: otherUser.userId,
        role: otherUser.role,
        ...data,
      });
    });

    // Remove connections that are no longer in this query and not in the other
    const otherIds = isUser1 ? q2Ids : q1Ids;
    allConnections.forEach((conn, id) => {
      if (!idsSet.has(id) && !otherIds.has(id)) {
        allConnections.delete(id);
      }
    });

    updateCallback();
  };

  const unsubscribe1 = onSnapshot(
    q1,
    (snapshot) => processSnapshot(snapshot, true, q1Ids),
    (error) => callback({ success: false, error: error.message })
  );

  const unsubscribe2 = onSnapshot(
    q2,
    (snapshot) => processSnapshot(snapshot, false, q2Ids),
    (error) => callback({ success: false, error: error.message })
  );

  return () => {
    unsubscribe1();
    unsubscribe2();
  };
};

// Subscribe to pending requests for a user (real-time)
export const subscribeToPendingRequests = (userId, callback) => {
  const userIdStr = normalizeUserId(userId);
  const { q1, q2 } = createConnectionQueries(userId, CONNECTION_STATUS.PENDING);

  const allRequests = new Map();

  const updateCallback = () => {
    const requests = Array.from(allRequests.values());
    callback({ success: true, data: requests });
  };

  let q1Ids = new Set();
  let q2Ids = new Set();

  const processSnapshot = (snapshot, idsSet) => {
    idsSet.clear();
    snapshot.forEach((doc) => {
      const data = doc.data();
      const requestedByStr = normalizeUserId(
        data[CONNECTION_FIELDS.REQUESTED_BY] || ""
      );
      const isRequester = requestedByStr === userIdStr;

      // Get requests sent TO the user (not by the user)
      if (!isRequester) {
        idsSet.add(doc.id);
        const otherUser = getOtherUserData(data, userId);
        allRequests.set(doc.id, {
          id: doc.id,
          fromUserId: otherUser.userId,
          fromUserRole: otherUser.role,
          ...data,
        });
      }
    });

    // Remove requests that are no longer in this query and not in the other
    const otherIds = idsSet === q1Ids ? q2Ids : q1Ids;
    allRequests.forEach((req, id) => {
      if (!idsSet.has(id) && !otherIds.has(id)) {
        allRequests.delete(id);
      }
    });

    updateCallback();
  };

  const unsubscribe1 = onSnapshot(
    q1,
    (snapshot) => processSnapshot(snapshot, q1Ids),
    (error) => callback({ success: false, error: error.message })
  );

  const unsubscribe2 = onSnapshot(
    q2,
    (snapshot) => processSnapshot(snapshot, q2Ids),
    (error) => callback({ success: false, error: error.message })
  );

  return () => {
    unsubscribe1();
    unsubscribe2();
  };
};

// Subscribe to sent requests for a user (real-time)
export const subscribeToSentRequests = (userId, callback) => {
  const userIdStr = normalizeUserId(userId);
  const q = query(
    collection(db, COLLECTIONS.CONNECTIONS),
    where(CONNECTION_FIELDS.STATUS, "==", CONNECTION_STATUS.PENDING),
    where(CONNECTION_FIELDS.REQUESTED_BY, "==", userIdStr)
  );

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const requests = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const otherUser = getOtherUserData(data, userId);
        return {
          id: doc.id,
          toUserId: otherUser.userId,
          toUserRole: otherUser.role,
          ...data,
        };
      });
      callback({ success: true, data: requests });
    },
    (error) => {
      callback({ success: false, error: error.message });
    }
  );

  return unsubscribe;
};

// Subscribe to a specific connection (real-time)
export const subscribeToConnection = (userId1, userId2, callback) => {
  const connectionId = generateConnectionId(userId1, userId2);
  const connectionRef = getConnectionRef(connectionId);

  const unsubscribe = onSnapshot(
    connectionRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback({
          success: true,
          data: { id: docSnapshot.id, ...docSnapshot.data() },
        });
      } else {
        callback({ success: true, data: null });
      }
    },
    (error) => {
      callback({ success: false, error: error.message });
    }
  );

  return unsubscribe;
};
