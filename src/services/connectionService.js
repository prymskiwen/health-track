import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'

// Send connection request
export const sendConnectionRequest = async (fromUserId, toUserId, fromUserRole, toUserRole) => {
  try {
    const connectionId = [fromUserId, toUserId].sort().join('_')
    const connectionRef = doc(db, 'connections', connectionId)
    
    // Check if connection already exists
    const existingConnection = await getDoc(connectionRef)
    
    if (existingConnection.exists()) {
      return { success: false, error: 'Connection request already exists' }
    }

    await setDoc(connectionRef, {
      user1: fromUserId < toUserId ? fromUserId : toUserId,
      user2: fromUserId < toUserId ? toUserId : fromUserId,
      user1Role: fromUserId < toUserId ? fromUserRole : toUserRole,
      user2Role: fromUserId < toUserId ? toUserRole : fromUserRole,
      requestedBy: fromUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return { success: true, id: connectionId }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Accept connection request
export const acceptConnectionRequest = async (connectionId) => {
  try {
    await updateDoc(doc(db, 'connections', connectionId), {
      status: 'accepted',
      updatedAt: new Date().toISOString(),
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Reject/Remove connection
export const removeConnection = async (connectionId) => {
  try {
    await deleteDoc(doc(db, 'connections', connectionId))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Get all connections for a user
export const getUserConnections = async (userId) => {
  try {
    const q = query(
      collection(db, 'connections'),
      where('status', '==', 'accepted')
    )
    const querySnapshot = await getDocs(q)
    
    const connections = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.user1 === userId || data.user2 === userId) {
        const otherUserId = data.user1 === userId ? data.user2 : data.user1
        const otherUserRole = data.user1 === userId ? data.user2Role : data.user1Role
        connections.push({
          id: doc.id,
          userId: otherUserId,
          role: otherUserRole,
          ...data,
        })
      }
    })

    return { success: true, data: connections }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Get pending connection requests for a user
export const getPendingRequests = async (userId) => {
  try {
    const q = query(
      collection(db, 'connections'),
      where('status', '==', 'pending')
    )
    const querySnapshot = await getDocs(q)
    
    const requests = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // Get requests sent TO the user (not by the user)
      if (data.user2 === userId && data.requestedBy !== userId) {
        requests.push({
          id: doc.id,
          fromUserId: data.user1,
          fromUserRole: data.user1Role,
          ...data,
        })
      }
    })

    return { success: true, data: requests }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Get sent connection requests
export const getSentRequests = async (userId) => {
  try {
    const q = query(
      collection(db, 'connections'),
      where('status', '==', 'pending'),
      where('requestedBy', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    
    const requests = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      const toUserId = data.user1 === userId ? data.user2 : data.user1
      const toUserRole = data.user1 === userId ? data.user2Role : data.user1Role
      return {
        id: doc.id,
        toUserId,
        toUserRole,
        ...data,
      }
    })

    return { success: true, data: requests }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Check if users are connected
export const checkConnection = async (userId1, userId2) => {
  try {
    const connectionId = [userId1, userId2].sort().join('_')
    const connectionDoc = await getDoc(doc(db, 'connections', connectionId))
    
    if (connectionDoc.exists()) {
      return { success: true, data: { id: connectionDoc.id, ...connectionDoc.data() } }
    }
    return { success: true, data: null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

