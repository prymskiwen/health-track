import { Box } from '@mui/material'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../hooks/useChat'
import ChatPageHeader from '../components/chat/ChatPageHeader'
import ChatSidebar from '../components/chat/ChatSidebar'
import ChatContainer from '../components/chat/ChatContainer'

/**
 * Chat page component - main chat interface with sidebar and chat container
 */
export default function Chat() {
  const { currentUser } = useAuth()
  const [searchParams] = useSearchParams()
  const initialUserId = searchParams.get('userId') || ''

  const {
    messages,
    newMessage,
    selectedUser,
    users,
    selectedUserData,
    messagesEndRef,
    isTyping,
    otherUserPresence,
    unreadCounts,
    usersPresence,
    handleSelectedUserChange,
    handleNewMessageChange,
    handleSendMessage,
    handleKeyDown,
    setSelectedUser,
  } = useChat({ initialUserId })

  // Update selected user when URL param changes
  useEffect(() => {
    const userId = searchParams.get('userId')
    if (userId) {
      setSelectedUser(userId)
    }
  }, [searchParams, setSelectedUser])

  return (
    <Box>
      <ChatPageHeader />

      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 200px)' }}>
        <ChatSidebar
          users={users}
          selectedUser={selectedUser}
          onUserChange={handleSelectedUserChange}
          unreadCounts={unreadCounts}
          usersPresence={usersPresence}
        />

        <ChatContainer
          messages={messages}
          currentUserId={currentUser.uid}
          messagesEndRef={messagesEndRef}
          currentUser={currentUser}
          selectedUserData={selectedUserData}
          otherUserPresence={otherUserPresence}
          isTyping={isTyping}
          newMessage={newMessage}
          onMessageChange={handleNewMessageChange}
          onSend={handleSendMessage}
          onKeyDown={handleKeyDown}
        />
      </Box>
    </Box>
  )
}

