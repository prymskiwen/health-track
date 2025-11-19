import { useState, useEffect, useCallback, useRef } from "react";
import { onValue, ref } from "firebase/database";
import { useAuth } from "../context/AuthContext";
import {
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
  setTypingStatus,
  subscribeToTyping,
  setUserPresence,
  subscribeToUserPresence,
  getUnreadCount,
} from "../services/chatService";
import {
  getAllPatients,
  getPatientByEmail,
  getDoctor,
  getAllUsers,
} from "../services/userService";
import { getUserConnections } from "../services/connectionService";
import { realtimeDb } from "../services/firebase";

/**
 * Custom hook for managing chat functionality
 * @param {Object} options - Configuration options
 * @param {string} options.initialUserId - Initial user ID to chat with (from URL params)
 * @returns {Object} Chat state and operations
 */
export const useChat = ({ initialUserId = "" } = {}) => {
  const { currentUser, userRole } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(initialUserId);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserPresence, setOtherUserPresence] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [usersPresence, setUsersPresence] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const previousMessagesLengthRef = useRef(0);
  const messageCountsRef = useRef({});
  const typingIndicatorTimeoutRef = useRef(null);

  // Load users (connections or assigned relationships)
  const loadUsers = useCallback(async () => {
    if (!currentUser?.uid) return;

    setLoading(true);
    try {
      // Load connections - chat is available for all connected users
      const connectionsResult = await getUserConnections(currentUser.uid);
      if (connectionsResult.success && connectionsResult.data.length > 0) {
        // Fetch all users to enrich connection data with user details
        const allUsersResult = await getAllUsers();
        const allUsers = allUsersResult.success ? allUsersResult.data : [];

        // Map connections to user format with enriched user details
        const connectionUsers = connectionsResult.data
          .map((conn) => {
            const userId = conn.userId;
            const userDetails = allUsers.find((u) => u.uid === userId);

            // Get name from multiple sources
            const name =
              userDetails?.displayName ||
              userDetails?.name ||
              conn.userDetails?.displayName ||
              conn.userDetails?.name ||
              conn.name ||
              userDetails?.email?.split("@")[0] ||
              "Unknown User";

            return {
              id: userId,
              uid: userId,
              name,
              email:
                userDetails?.email ||
                conn.userDetails?.email ||
                conn.email ||
                "",
              role: userDetails?.role || conn.role || "patient",
              photoURL:
                userDetails?.photoURL ||
                conn.userDetails?.photoURL ||
                conn.photoURL ||
                null,
              avatar:
                userDetails?.avatar ||
                conn.userDetails?.avatar ||
                conn.avatar ||
                null,
            };
          })
          .filter((user) => user.name !== "Unknown User" || user.email); // Filter out truly unknown users

        setUsers(connectionUsers);
        if (connectionUsers.length > 0 && !selectedUser) {
          setSelectedUser(connectionUsers[0].id || connectionUsers[0].uid);
        }
        return;
      }

      // Fallback: For backward compatibility, also include assigned doctor/patient relationships
      // This ensures existing doctor-patient chats still work
      if (userRole === "patient") {
        // Patients can chat with their assigned doctor
        const patientResult = await getPatientByEmail(currentUser.email);
        if (patientResult.success && patientResult.data.assignedDoctor) {
          const doctorResult = await getDoctor(
            patientResult.data.assignedDoctor
          );
          if (doctorResult.success) {
            const allUsersResult = await getAllUsers();
            if (allUsersResult.success) {
              const doctorUser = allUsersResult.data.find(
                (u) =>
                  u.email === doctorResult.data.email && u.role === "doctor"
              );
              if (doctorUser) {
                setUsers([
                  {
                    ...doctorUser,
                    name: doctorResult.data.name,
                    photoURL: doctorUser.photoURL || null,
                    avatar: doctorUser.avatar || null,
                  },
                ]);
                if (!selectedUser) {
                  setSelectedUser(doctorUser.uid);
                }
                return;
              }
            }
          }
        }
      } else if (userRole === "doctor") {
        // Doctors can chat with their assigned patients
        const allPatientsResult = await getAllPatients();
        if (allPatientsResult.success) {
          const assignedPatients = allPatientsResult.data.filter(
            (patient) => patient.assignedDoctor === currentUser.email
          );
          if (assignedPatients.length > 0) {
            const allUsersResult = await getAllUsers();
            if (allUsersResult.success) {
              const patientUsers = assignedPatients
                .map((patient) => {
                  const user = allUsersResult.data.find(
                    (u) => u.email === patient.email && u.role === "patient"
                  );
                  return user
                    ? {
                        ...user,
                        name: patient.name,
                        photoURL: user.photoURL || null,
                        avatar: user.avatar || null,
                      }
                    : null;
                })
                .filter(Boolean);
              if (patientUsers.length > 0) {
                setUsers(patientUsers);
                if (!selectedUser) {
                  setSelectedUser(patientUsers[0].uid);
                }
                return;
              }
            }
          }
        }
      }

      // If no connections or assigned relationships, show empty state
      setUsers([]);
    } catch (error) {
      console.error("Error loading chat users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, currentUser?.email, userRole, selectedUser]);

  // Load users on mount and when dependencies change
  useEffect(() => {
    if (currentUser?.uid) {
      loadUsers();
    }
  }, [currentUser?.uid, userRole, loadUsers]);

  // Set user presence on mount and request notification permission
  useEffect(() => {
    let presenceCleanup = null;

    if (currentUser?.uid) {
      presenceCleanup = setUserPresence(currentUser.uid);
    }

    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Cleanup presence on unmount
    return () => {
      if (presenceCleanup) {
        presenceCleanup();
      }
    };
  }, [currentUser?.uid]);

  // Debounce mark as read to prevent too many calls
  const markAsReadTimeoutRef = useRef(null);

  // Show browser notification with navigation
  const showNotification = useCallback(
    (message, senderId) => {
      console.log("showNotification called:", {
        message,
        senderId,
        permission: Notification.permission,
      });

      if (!("Notification" in window)) {
        console.log("Notifications not supported in this browser");
        return;
      }

      if (Notification.permission === "granted") {
        const senderName =
          users.find((u) => u.id === senderId || u.uid === senderId)?.name ||
          "Someone";

        const messageText =
          typeof message === "string"
            ? message
            : message?.message || message?.text || "New message";

        console.log("Creating notification:", { senderName, messageText });

        try {
          const notification = new Notification(
            `${senderName} sent a message`,
            {
              body: messageText,
              icon: "/favicon.ico",
              tag: `chat-${senderId}`,
              requireInteraction: false,
              badge: "/favicon.ico",
            }
          );

          // Navigate to chat when notification is clicked
          notification.onclick = () => {
            window.focus();
            // Navigate to chat page with sender's userId
            window.location.href = `/chat?userId=${senderId}`;
            notification.close();
          };

          // Auto-close notification after 5 seconds
          setTimeout(() => {
            notification.close();
          }, 5000);
        } catch (error) {
          console.error("Error creating notification:", error);
        }
      } else if (Notification.permission === "default") {
        // Request permission if not yet requested
        Notification.requestPermission().then((permission) => {
          console.log("Notification permission:", permission);
          if (permission === "granted") {
            showNotification(message, senderId);
          }
        });
      } else {
        console.log("Notification permission denied");
      }
    },
    [users]
  );

  // Subscribe to messages when selected user changes
  useEffect(() => {
    if (selectedUser && currentUser?.uid) {
      // Mark messages as read when opening a chat (with a small delay to ensure UI is ready)
      const markAsReadTimer = setTimeout(() => {
        markMessagesAsRead(currentUser.uid, selectedUser);
      }, 300);

      const unsubscribe = subscribeToMessages(
        currentUser.uid,
        selectedUser,
        (msgs) => {
          const previousLength = previousMessagesLengthRef.current;
          setMessages(msgs);

          // Check for new messages and show notifications
          if (msgs.length > previousLength && previousLength > 0) {
            const newMessages = msgs.slice(previousLength);
            const incomingMessages = newMessages.filter(
              (msg) => msg.senderId !== currentUser.uid
            );

            if (incomingMessages.length > 0) {
              // Show notification if chat is not active or message is from different user
              const isChatActive =
                selectedUser === incomingMessages[0].senderId;
              if (!isChatActive || document.hidden) {
                showNotification(
                  incomingMessages[0].message,
                  incomingMessages[0].senderId
                );
              }
            }
          }

          previousMessagesLengthRef.current = msgs.length;

          // Mark received messages as read if chat is active and visible
          // Use debounce to prevent too many calls
          if (selectedUser && !document.hidden) {
            // Only mark messages from the selected user as read
            const hasUnreadMessages = msgs.some(
              (msg) =>
                msg.senderId === selectedUser &&
                msg.receiverId === currentUser.uid &&
                !msg.read
            );
            if (hasUnreadMessages) {
              // Clear existing timeout
              if (markAsReadTimeoutRef.current) {
                clearTimeout(markAsReadTimeoutRef.current);
              }
              // Debounce mark as read to avoid too many calls
              markAsReadTimeoutRef.current = setTimeout(() => {
                markMessagesAsRead(currentUser.uid, selectedUser);
              }, 500);
            }
          }
        }
      );
      return () => {
        unsubscribe();
        clearTimeout(markAsReadTimer);
        if (markAsReadTimeoutRef.current) {
          clearTimeout(markAsReadTimeoutRef.current);
        }
      };
    } else {
      setMessages([]);
      previousMessagesLengthRef.current = 0;
    }
  }, [selectedUser, currentUser?.uid, showNotification]);

  // Subscribe to typing status with debounce to prevent flickering
  useEffect(() => {
    if (selectedUser && currentUser?.uid) {
      const unsubscribe = subscribeToTyping(
        currentUser.uid,
        selectedUser,
        (typing) => {
          // Clear any existing timeout
          if (typingIndicatorTimeoutRef.current) {
            clearTimeout(typingIndicatorTimeoutRef.current);
          }

          if (typing) {
            // Show typing indicator immediately when user starts typing
            setIsTyping(true);
          } else {
            // Delay hiding typing indicator by 1.5 seconds when user stops typing
            typingIndicatorTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
            }, 1500);
          }
        }
      );
      return () => {
        unsubscribe();
        if (typingIndicatorTimeoutRef.current) {
          clearTimeout(typingIndicatorTimeoutRef.current);
        }
      };
    } else {
      setIsTyping(false);
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
      }
    }
  }, [selectedUser, currentUser?.uid]);

  // Subscribe to other user's presence
  useEffect(() => {
    if (selectedUser) {
      const unsubscribe = subscribeToUserPresence(selectedUser, (presence) => {
        console.log("Presence update for user:", selectedUser, presence);
        setOtherUserPresence(presence);
      });
      return () => unsubscribe();
    } else {
      setOtherUserPresence(null);
    }
  }, [selectedUser]);

  // Subscribe to presence for all users in the sidebar
  useEffect(() => {
    if (users.length > 0) {
      const unsubscribes = users.map((user) => {
        const userId = user.id || user.uid;
        return subscribeToUserPresence(userId, (presence) => {
          setUsersPresence((prev) => ({
            ...prev,
            [userId]: presence,
          }));
        });
      });

      return () => {
        unsubscribes.forEach((unsub) => unsub());
      };
    }
  }, [users]);

  // Load and subscribe to unread counts for all users
  useEffect(() => {
    if (currentUser?.uid && users.length > 0) {
      const loadUnreadCounts = async () => {
        const counts = {};
        for (const user of users) {
          const userId = user.id || user.uid;
          const result = await getUnreadCount(currentUser.uid, userId);
          if (result.success) {
            counts[userId] = result.count;
          }
        }
        setUnreadCounts(counts);
      };

      loadUnreadCounts();

      // Subscribe to message updates to refresh unread counts and show notifications
      const unsubscribes = users.map((user) => {
        const userId = user.id || user.uid;
        const chatId = [currentUser.uid, userId].sort().join("_");
        const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
        let isInitialized = false;

        return onValue(messagesRef, (snapshot) => {
          if (snapshot.exists()) {
            const messages = Object.values(snapshot.val());
            const currentCount = messages.length;

            // Initialize message count on first load
            if (!isInitialized) {
              messageCountsRef.current[userId] = currentCount;
              isInitialized = true;
              // Reload unread count
              getUnreadCount(currentUser.uid, userId).then((result) => {
                if (result.success) {
                  setUnreadCounts((prev) => ({
                    ...prev,
                    [userId]: result.count,
                  }));
                }
              });
              return; // Don't show notification on initial load
            }

            const lastCount = messageCountsRef.current[userId] || 0;

            // Check if there are new messages (incoming messages from this user)
            if (currentCount > lastCount) {
              const newMessages = messages.slice(-(currentCount - lastCount));
              const incomingMessages = newMessages.filter(
                (msg) =>
                  msg.senderId === userId && msg.receiverId === currentUser.uid
              );

              // Show notification for new incoming messages (even if not on chat page)
              if (incomingMessages.length > 0) {
                const latestMessage =
                  incomingMessages[incomingMessages.length - 1];
                // Show notification if:
                // 1. Not currently viewing this chat, OR
                // 2. Page is hidden/not focused, OR
                // 3. User is on a different page (not on chat page at all)
                const isViewingThisChat = selectedUser === userId;
                const isOnChatPage = window.location.pathname === "/chat";

                if (!isViewingThisChat || document.hidden || !isOnChatPage) {
                  console.log("Showing notification for message from:", userId);
                  showNotification(
                    latestMessage.message ||
                      latestMessage.text ||
                      "New message",
                    userId
                  );
                }
              }
            }

            messageCountsRef.current[userId] = currentCount;
          } else {
            // No messages exist, reset count
            messageCountsRef.current[userId] = 0;
            isInitialized = true;
          }

          // Reload unread count when messages change
          getUnreadCount(currentUser.uid, userId).then((result) => {
            if (result.success) {
              setUnreadCounts((prev) => ({
                ...prev,
                [userId]: result.count,
              }));
            }
          });
        });
      });

      return () => {
        unsubscribes.forEach((unsub) => unsub());
      };
    }
  }, [currentUser?.uid, users, selectedUser, showNotification]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle selected user change
  const handleSelectedUserChange = useCallback(
    (userId) => {
      setSelectedUser(userId);
      // Mark messages as read when switching to a chat
      if (userId && currentUser?.uid) {
        markMessagesAsRead(currentUser.uid, userId);
      }
    },
    [currentUser?.uid]
  );

  // Handle new message input change
  const handleNewMessageChange = useCallback(
    (value) => {
      setNewMessage(value);

      // Set typing status
      if (selectedUser && currentUser?.uid) {
        if (value.trim().length > 0) {
          setTypingStatus(currentUser.uid, selectedUser, true);

          // Clear existing timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          // Set typing to false after 3 seconds of no typing
          typingTimeoutRef.current = setTimeout(() => {
            setTypingStatus(currentUser.uid, selectedUser, false);
          }, 3000);
        } else {
          setTypingStatus(currentUser.uid, selectedUser, false);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
        }
      }
    },
    [selectedUser, currentUser?.uid]
  );

  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedUser || !currentUser?.uid) return;

    try {
      // Clear typing status
      setTypingStatus(currentUser.uid, selectedUser, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      const result = await sendMessage(
        currentUser.uid,
        selectedUser,
        newMessage,
        userRole
      );
      if (result.success) {
        setNewMessage("");
        // Mark messages as read after sending
        markMessagesAsRead(currentUser.uid, selectedUser);
      }
      return result;
    } catch (error) {
      console.error("Error sending message:", error);
      return { success: false, error: error.message };
    }
  }, [newMessage, selectedUser, currentUser?.uid, userRole]);

  // Handle key down (Enter to send)
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Get selected user data
  const selectedUserData = users.find(
    (u) => u.id === selectedUser || u.uid === selectedUser
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    messages,
    newMessage,
    selectedUser,
    users,
    loading,
    selectedUserData,
    messagesEndRef,
    isTyping,
    otherUserPresence,
    unreadCounts,
    usersPresence,

    // Handlers
    handleSelectedUserChange,
    handleNewMessageChange,
    handleSendMessage,
    handleKeyDown,
    scrollToBottom,

    // Actions
    setSelectedUser,
    loadUsers,
  };
};
