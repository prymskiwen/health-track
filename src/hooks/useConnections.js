import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllUsers } from "../services/userService";
import {
  sendConnectionRequest,
  getUserConnections,
  getPendingRequests,
  getSentRequests,
  acceptConnectionRequest,
  removeConnection,
  checkConnection,
  subscribeToConnections,
  subscribeToPendingRequests,
  subscribeToSentRequests,
} from "../services/connectionService";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useSnackbar } from "./useSnackbar";

// Tab indices constants
const TABS = {
  ALL_USERS: 0,
  MY_CONNECTIONS: 1,
  PENDING_REQUESTS: 2,
  SENT_REQUESTS: 3,
};

/**
 * Custom hook for managing connections
 * @returns {Object} Connections state and operations
 */
export const useConnections = () => {
  const { currentUser, userRole } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(TABS.ALL_USERS);

  // Helper function to filter out current user
  const filterCurrentUser = useCallback(
    (userList) => {
      if (!currentUser) return userList;
      return userList.filter(
        (u) =>
          u.uid !== currentUser.uid &&
          u.id !== currentUser.uid &&
          u.email !== currentUser.email
      );
    },
    [currentUser]
  );

  // Helper function to enrich items with user details
  const enrichWithUserDetails = useCallback((items, userIdKey, allUsers) => {
    if (!items || items.length === 0) {
      return [];
    }

    return items.map((item) => {
      const userId = item[userIdKey];
      const userDetails = allUsers?.find((u) => u.uid === userId);

      return {
        ...item,
        userDetails,
        // Set uid and id for ConnectionCard compatibility
        uid: userId,
        id: userId,
        // Set role with fallback chain
        role:
          userDetails?.role ||
          item.role ||
          item.fromUserRole ||
          item.toUserRole ||
          item.user1Role ||
          item.user2Role ||
          "patient",
        // Set name fields
        name:
          userDetails?.displayName ||
          userDetails?.name ||
          item.name ||
          "Unknown User",
        displayName:
          userDetails?.displayName ||
          userDetails?.name ||
          item.name ||
          "Unknown User",
        // Set email
        email: userDetails?.email || item.email || "",
        // Set specialty if available
        specialty: userDetails?.specialty || item.specialty,
        // Set connection status and ID
        connectionStatus: item.status || item.connectionStatus || "pending",
        connectionId: item.id || item.connectionId,
      };
    });
  }, []);

  // Helper function to load users and enrich items
  const loadAndEnrichItems = useCallback(
    async (items, userIdKey) => {
      const usersResult = await getAllUsers();
      if (usersResult.success) {
        return enrichWithUserDetails(items, userIdKey, usersResult.data);
      }
      return items;
    },
    [enrichWithUserDetails]
  );

  const loadAllUsers = useCallback(async () => {
    try {
      // All users (doctors, patients, admins) can see and connect with all other users
      const result = await getAllUsers();

      if (!result.success) {
        console.error("Failed to load users:", result.error);
        return;
      }

      // Filter out current user
      const filteredUsers = filterCurrentUser(result.data);

      // Check connection status for each user in parallel
      const usersWithStatus = await Promise.all(
        filteredUsers.map(async (user) => {
          const userId = user.uid || user.id;
          const connectionResult = await checkConnection(
            currentUser.uid,
            userId
          );

          // Get connection data if it exists
          const connectionData = connectionResult.data;
          const connectionStatus = connectionData?.status || null;
          const connectionId = connectionData?.id || null;

          // Determine if the request was sent by current user
          const isSentByCurrentUser =
            connectionData?.requestedBy === currentUser.uid;

          return {
            ...user,
            id: userId,
            connectionStatus,
            connectionId,
            // Add flag to distinguish sent vs received pending requests
            isSentByCurrentUser:
              connectionStatus === "pending" ? isSentByCurrentUser : null,
          };
        })
      );

      setUsers(usersWithStatus);
    } catch (error) {
      console.error("Error loading all users:", error);
    }
  }, [currentUser, filterCurrentUser]);

  const loadConnections = useCallback(async () => {
    try {
      const result = await getUserConnections(currentUser.uid);
      if (result.success) {
        const enriched = await loadAndEnrichItems(result.data, "userId");
        setConnections(enriched);
      }
    } catch (error) {
      console.error("Error loading connections:", error);
    }
  }, [currentUser?.uid, loadAndEnrichItems]);

  const loadPendingRequests = useCallback(async () => {
    try {
      const result = await getPendingRequests(currentUser.uid);
      if (result.success) {
        const enriched = await loadAndEnrichItems(result.data, "fromUserId");
        setPendingRequests(enriched);
      } else {
        setPendingRequests([]);
      }
    } catch (error) {
      console.error("Error loading pending requests:", error);
      setPendingRequests([]);
    }
  }, [currentUser?.uid, loadAndEnrichItems]);

  const loadSentRequests = useCallback(async () => {
    try {
      const result = await getSentRequests(currentUser.uid);
      if (result.success) {
        const enriched = await loadAndEnrichItems(result.data, "toUserId");
        setSentRequests(enriched);
      }
    } catch (error) {
      console.error("Error loading sent requests:", error);
    }
  }, [currentUser?.uid, loadAndEnrichItems]);

  // Real-time listeners for connections (always active, not just when on specific tab)
  useEffect(() => {
    if (!currentUser?.uid) return;

    const handleConnectionsUpdate = async (result) => {
      if (result.success) {
        const enriched = await loadAndEnrichItems(result.data, "userId");
        setConnections(enriched);
      }
    };

    const handlePendingUpdate = async (result) => {
      if (result.success) {
        const enriched = await loadAndEnrichItems(result.data, "fromUserId");
        setPendingRequests(enriched);
      }
    };

    const handleSentUpdate = async (result) => {
      if (result.success) {
        const enriched = await loadAndEnrichItems(result.data, "toUserId");
        setSentRequests(enriched);
      }
    };

    const unsubscribeConnections = subscribeToConnections(
      currentUser.uid,
      handleConnectionsUpdate
    );
    const unsubscribePending = subscribeToPendingRequests(
      currentUser.uid,
      handlePendingUpdate
    );
    const unsubscribeSent = subscribeToSentRequests(
      currentUser.uid,
      handleSentUpdate
    );

    return () => {
      unsubscribeConnections();
      unsubscribePending();
      unsubscribeSent();
    };
  }, [currentUser?.uid, loadAndEnrichItems]);

  // Real-time listener for all users connection status (All Users tab)
  useEffect(() => {
    if (!currentUser?.uid || currentTab !== TABS.ALL_USERS) return;

    // Subscribe to connections where current user is user1
    const q1 = query(
      collection(db, "connections"),
      where("user1", "==", currentUser.uid)
    );

    // Subscribe to connections where current user is user2
    const q2 = query(
      collection(db, "connections"),
      where("user2", "==", currentUser.uid)
    );

    // Combine results from both queries
    const allConnections = new Map();
    const q1Connections = new Map();
    const q2Connections = new Map();

    const updateUsers = () => {
      // Merge connections from both queries
      allConnections.clear();
      q1Connections.forEach((value, key) => allConnections.set(key, value));
      q2Connections.forEach((value, key) => allConnections.set(key, value));

      setUsers((prevUsers) => {
        // If users haven't loaded yet, don't update
        if (prevUsers.length === 0) return prevUsers;

        return prevUsers.map((user) => {
          const userId = user.uid || user.id;
          const connection = allConnections.get(userId);

          if (connection) {
            return {
              ...user,
              connectionStatus: connection.status,
              connectionId: connection.id,
              isSentByCurrentUser:
                connection.status === "pending"
                  ? connection.requestedBy === currentUser.uid
                  : null,
            };
          } else {
            // No connection exists
            return {
              ...user,
              connectionStatus: null,
              connectionId: null,
              isSentByCurrentUser: null,
            };
          }
        });
      });
    };

    const unsubscribe1 = onSnapshot(
      q1,
      (snapshot) => {
        // Clear all connections from q1 first
        q1Connections.clear();

        // Add all current connections from q1
        snapshot.forEach((doc) => {
          const data = doc.data();
          const otherUserId = data.user2;
          q1Connections.set(otherUserId, {
            id: doc.id,
            status: data.status,
            requestedBy: data.requestedBy,
          });
        });

        updateUsers();
      },
      (error) => {
        console.error("Error in real-time connection listener (q1):", error);
      }
    );

    const unsubscribe2 = onSnapshot(
      q2,
      (snapshot) => {
        // Clear all connections from q2 first
        q2Connections.clear();

        // Add all current connections from q2
        snapshot.forEach((doc) => {
          const data = doc.data();
          const otherUserId = data.user1;
          q2Connections.set(otherUserId, {
            id: doc.id,
            status: data.status,
            requestedBy: data.requestedBy,
          });
        });

        updateUsers();
      },
      (error) => {
        console.error("Error in real-time connection listener (q2):", error);
      }
    );

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [currentUser?.uid, currentTab]);

  const loadData = useCallback(
    async (tabValue = TABS.ALL_USERS) => {
      setLoading(true);
      setCurrentTab(tabValue);
      try {
        const loaders = {
          [TABS.ALL_USERS]: loadAllUsers,
          [TABS.MY_CONNECTIONS]: loadConnections,
          [TABS.PENDING_REQUESTS]: loadPendingRequests,
          [TABS.SENT_REQUESTS]: loadSentRequests,
        };
        const loader = loaders[tabValue];
        if (loader) await loader();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    },
    [loadAllUsers, loadConnections, loadPendingRequests, loadSentRequests]
  );

  // Helper function to reload multiple tabs
  const reloadTabs = useCallback(
    async (tabIndices) => {
      await Promise.all(tabIndices.map((tabIndex) => loadData(tabIndex)));
    },
    [loadData]
  );

  const sendRequest = useCallback(
    async (selectedUser) => {
      try {
        if (!selectedUser) return { success: false, error: "No user selected" };

        const userId = selectedUser.uid || selectedUser.id;
        // Ensure we get the role from the user object
        const toUserRole =
          selectedUser.role || selectedUser.userDetails?.role || "patient";

        const result = await sendConnectionRequest(
          currentUser.uid,
          userId,
          userRole,
          toUserRole
        );

        if (result.success) {
          showSuccess("Connection request sent successfully");
          await reloadTabs([TABS.ALL_USERS, currentTab, TABS.SENT_REQUESTS]);
          return { success: true };
        } else {
          const errorMessage =
            result.error || "Failed to send connection request";
          showError(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        showError(error.message || "Error sending connection request");
        console.error("Error sending connection request:", error);
        return { success: false, error: error.message };
      }
    },
    [currentUser, userRole, currentTab, reloadTabs, showSuccess, showError]
  );

  const acceptRequest = useCallback(
    async (connectionId) => {
      try {
        const result = await acceptConnectionRequest(connectionId);
        if (result.success) {
          showSuccess("Connection request accepted");
          await reloadTabs([
            TABS.ALL_USERS,
            TABS.MY_CONNECTIONS,
            currentTab,
            TABS.PENDING_REQUESTS,
          ]);
          return { success: true };
        } else {
          showError(result.error || "Failed to accept connection request");
          return { success: false, error: result.error };
        }
      } catch (error) {
        showError(error.message || "Error accepting connection request");
        console.error("Error accepting connection request:", error);
        return { success: false, error: error.message };
      }
    },
    [currentTab, reloadTabs, showSuccess, showError]
  );

  const rejectRequest = useCallback(
    async (connectionId) => {
      try {
        const result = await removeConnection(connectionId);
        if (result.success) {
          showSuccess("Connection request rejected");
          await reloadTabs([TABS.ALL_USERS, currentTab, TABS.PENDING_REQUESTS]);
          return { success: true };
        } else {
          showError(result.error || "Failed to reject connection request");
          return { success: false, error: result.error };
        }
      } catch (error) {
        showError(error.message || "Error rejecting connection request");
        console.error("Error rejecting connection request:", error);
        return { success: false, error: error.message };
      }
    },
    [currentTab, reloadTabs, showSuccess, showError]
  );

  const removeConnectionHandler = useCallback(
    async (connectionId) => {
      try {
        const result = await removeConnection(connectionId);
        if (result.success) {
          showSuccess("Connection removed successfully");
          await reloadTabs([TABS.ALL_USERS, TABS.MY_CONNECTIONS, currentTab]);
          return { success: true };
        } else {
          showError(result.error || "Failed to remove connection");
          return { success: false, error: result.error };
        }
      } catch (error) {
        showError(error.message || "Error removing connection");
        console.error("Error removing connection:", error);
        return { success: false, error: error.message };
      }
    },
    [currentTab, reloadTabs, showSuccess, showError]
  );

  return {
    // State
    users,
    connections,
    pendingRequests,
    sentRequests,
    loading,

    // Load functions
    loadAllUsers,
    loadConnections,
    loadPendingRequests,
    loadSentRequests,
    loadData,

    // Action handlers
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeConnection: removeConnectionHandler,
  };
};
