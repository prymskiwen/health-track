import {
  ref,
  push,
  onValue,
  off,
  query,
  orderByChild,
  limitToLast,
  set,
  onDisconnect,
  serverTimestamp,
  update,
} from "firebase/database";
import { realtimeDb } from "./firebase";

export const sendMessage = async (
  senderId,
  receiverId,
  message,
  senderRole
) => {
  try {
    const chatId = [senderId, receiverId].sort().join("_");
    const messageRef = ref(realtimeDb, `chats/${chatId}/messages`);

    const messageData = {
      senderId,
      receiverId,
      message,
      senderRole,
      timestamp: new Date().toISOString(),
      read: false, // New messages are unread by default
      readAt: null,
    };

    await push(messageRef, messageData);

    // Update last message timestamp for unread count tracking
    const chatRef = ref(realtimeDb, `chats/${chatId}`);
    await update(chatRef, {
      lastMessage: {
        senderId,
        message,
        timestamp: new Date().toISOString(),
      },
      [`unreadCount/${receiverId}`]: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const subscribeToMessages = (userId, otherUserId, callback) => {
  const chatId = [userId, otherUserId].sort().join("_");
  const messagesRef = query(
    ref(realtimeDb, `chats/${chatId}/messages`),
    orderByChild("timestamp"),
    limitToLast(100)
  );

  // Use onValue for real-time updates (not onlyOnce)
  // This ensures read status changes are reflected immediately
  onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const messages = Object.entries(snapshot.val())
        .map(([id, data]) => ({
          id,
          ...data,
          // Ensure read status is properly parsed (handle both boolean and string)
          read: data.read === true || data.read === "true",
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      callback(messages);
    } else {
      callback([]);
    }
  });

  // Return unsubscribe function
  return () => {
    off(messagesRef);
  };
};

// Mark messages as read
export const markMessagesAsRead = async (userId, otherUserId) => {
  try {
    const chatId = [userId, otherUserId].sort().join("_");
    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);

    return new Promise((resolve) => {
      onValue(
        messagesRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const updates = {};
            const messages = snapshot.val();

            Object.keys(messages).forEach((messageId) => {
              const message = messages[messageId];
              // Mark as read if:
              // 1. Message is sent TO the current user (receiverId === userId)
              // 2. Message is from the other user (senderId === otherUserId)
              // 3. Not already read
              if (
                message.receiverId === userId &&
                message.senderId === otherUserId &&
                !message.read
              ) {
                updates[`${messageId}/read`] = true;
                updates[`${messageId}/readAt`] = new Date().toISOString();
              }
            });

            if (Object.keys(updates).length > 0) {
              update(messagesRef, updates)
                .then(() => {
                  // Reset unread count
                  const chatRef = ref(
                    realtimeDb,
                    `chats/${chatId}/unreadCount/${userId}`
                  );
                  set(chatRef, null)
                    .then(() => {
                      resolve({ success: true });
                    })
                    .catch((err) => {
                      console.error("Error resetting unread count:", err);
                      resolve({ success: true }); // Still resolve as success
                    });
                })
                .catch((err) => {
                  console.error("Error updating messages:", err);
                  resolve({ success: false, error: err.message });
                });
            } else {
              resolve({ success: true });
            }
          } else {
            resolve({ success: true });
          }
        },
        { onlyOnce: true }
      );
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Set typing status
export const setTypingStatus = (userId, otherUserId, isTyping) => {
  try {
    const chatId = [userId, otherUserId].sort().join("_");
    const typingRef = ref(realtimeDb, `chats/${chatId}/typing/${userId}`);

    if (isTyping) {
      set(typingRef, true);
      // Auto-remove typing status after 3 seconds
      setTimeout(() => {
        set(typingRef, false);
      }, 3000);
    } else {
      set(typingRef, false);
    }
  } catch (error) {
    console.error("Error setting typing status:", error);
  }
};

// Subscribe to typing status
export const subscribeToTyping = (userId, otherUserId, callback) => {
  const chatId = [userId, otherUserId].sort().join("_");
  const typingRef = ref(realtimeDb, `chats/${chatId}/typing`);

  onValue(typingRef, (snapshot) => {
    if (snapshot.exists()) {
      const typingData = snapshot.val();
      const otherUserTyping = Object.keys(typingData)
        .filter((uid) => uid !== userId)
        .some((uid) => typingData[uid] === true);
      callback(otherUserTyping);
    } else {
      callback(false);
    }
  });

  return () => {
    off(typingRef);
  };
};

// Set user presence (online/offline)
export const setUserPresence = (userId) => {
  try {
    const presenceRef = ref(realtimeDb, `presence/${userId}`);
    const connectedRef = ref(realtimeDb, ".info/connected");

    // Set online status immediately (user is connected when this function is called)
    set(presenceRef, {
      status: "online",
      lastSeen: null,
    }).catch((err) => {
      console.error("Error setting initial online presence:", err);
    });

    // Set up presence tracking with .info/connected listener
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      const isConnected = snapshot.val() === true;
      if (isConnected) {
        // User is online - set presence immediately
        set(presenceRef, {
          status: "online",
          lastSeen: null,
        }).catch((err) => {
          console.error("Error setting online presence:", err);
        });

        // Set offline status when disconnected
        onDisconnect(presenceRef)
          .set({
            status: "offline",
            lastSeen: serverTimestamp(),
          })
          .catch((err) => {
            console.error("Error setting onDisconnect:", err);
          });
      } else {
        // If not connected, set offline
        set(presenceRef, {
          status: "offline",
          lastSeen: serverTimestamp(),
        }).catch((err) => {
          console.error("Error setting offline presence:", err);
        });
      }
    });

    // Return cleanup function
    return () => {
      if (unsubscribe) {
        off(connectedRef);
      }
      // Set offline when cleanup is called
      set(presenceRef, {
        status: "offline",
        lastSeen: serverTimestamp(),
      }).catch((err) => {
        console.error("Error setting offline on cleanup:", err);
      });
    };
  } catch (error) {
    console.error("Error setting user presence:", error);
    return () => {}; // Return empty cleanup function on error
  }
};

// Subscribe to user presence
export const subscribeToUserPresence = (userId, callback) => {
  const presenceRef = ref(realtimeDb, `presence/${userId}`);

  onValue(presenceRef, (snapshot) => {
    if (snapshot.exists()) {
      const presenceData = snapshot.val();
      // Ensure status is properly parsed (handle both string and boolean)
      const status = presenceData?.status || presenceData?.status === "online" ? "online" : "offline";
      callback({
        status: status,
        lastSeen: presenceData?.lastSeen || null,
      });
    } else {
      callback({ status: "offline", lastSeen: null });
    }
  });

  return () => {
    off(presenceRef);
  };
};

// Get unread message count
export const getUnreadCount = async (userId, otherUserId) => {
  try {
    const chatId = [userId, otherUserId].sort().join("_");
    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);

    return new Promise((resolve) => {
      onValue(
        messagesRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const messages = snapshot.val();
            const unreadCount = Object.values(messages).filter(
              (msg) => msg.receiverId === userId && !msg.read
            ).length;
            resolve({ success: true, count: unreadCount });
          } else {
            resolve({ success: true, count: 0 });
          }
        },
        { onlyOnce: true }
      );
    });
  } catch (error) {
    return { success: false, error: error.message, count: 0 };
  }
};

export const getChatList = async (userId) => {
  try {
    const chatsRef = ref(realtimeDb, "chats");
    return new Promise((resolve) => {
      onValue(chatsRef, (snapshot) => {
        if (snapshot.exists()) {
          const chats = [];
          snapshot.forEach((chatSnapshot) => {
            const chatId = chatSnapshot.key;
            const [user1, user2] = chatId.split("_");
            if (user1 === userId || user2 === userId) {
              const messages = chatSnapshot.val().messages;
              if (messages) {
                const lastMessage = Object.values(messages).pop();
                chats.push({
                  chatId,
                  otherUserId: user1 === userId ? user2 : user1,
                  lastMessage: lastMessage.message,
                  timestamp: lastMessage.timestamp,
                });
              }
            }
          });
          resolve({ success: true, data: chats });
        } else {
          resolve({ success: true, data: [] });
        }
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};
