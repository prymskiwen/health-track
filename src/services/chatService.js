import { ref, push, onValue, off, query, orderByChild, limitToLast } from 'firebase/database'
import { realtimeDb } from './firebase'

export const sendMessage = async (senderId, receiverId, message, senderRole) => {
  try {
    const chatId = [senderId, receiverId].sort().join('_')
    const messageRef = ref(realtimeDb, `chats/${chatId}/messages`)
    
    await push(messageRef, {
      senderId,
      receiverId,
      message,
      senderRole,
      timestamp: new Date().toISOString(),
    })
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const subscribeToMessages = (userId, otherUserId, callback) => {
  const chatId = [userId, otherUserId].sort().join('_')
  const messagesRef = query(
    ref(realtimeDb, `chats/${chatId}/messages`),
    orderByChild('timestamp'),
    limitToLast(100)
  )

  onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const messages = Object.entries(snapshot.val())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      callback(messages)
    } else {
      callback([])
    }
  })

  // Return unsubscribe function
  return () => {
    off(messagesRef)
  }
}

export const getChatList = async (userId) => {
  try {
    const chatsRef = ref(realtimeDb, 'chats')
    return new Promise((resolve) => {
      onValue(chatsRef, (snapshot) => {
        if (snapshot.exists()) {
          const chats = []
          snapshot.forEach((chatSnapshot) => {
            const chatId = chatSnapshot.key
            const [user1, user2] = chatId.split('_')
            if (user1 === userId || user2 === userId) {
              const messages = chatSnapshot.val().messages
              if (messages) {
                const lastMessage = Object.values(messages).pop()
                chats.push({
                  chatId,
                  otherUserId: user1 === userId ? user2 : user1,
                  lastMessage: lastMessage.message,
                  timestamp: lastMessage.timestamp,
                })
              }
            }
          })
          resolve({ success: true, data: chats })
        } else {
          resolve({ success: true, data: [] })
        }
      })
    })
  } catch (error) {
    return { success: false, error: error.message }
  }
}

