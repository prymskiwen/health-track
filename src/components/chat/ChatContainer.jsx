import { Box, Card } from '@mui/material'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import ChatTypingIndicator from './ChatTypingIndicator'

/**
 * ChatContainer component - main chat container with messages, input, and typing indicator
 * @param {Object} props
 * @param {Array} props.messages - Array of message objects
 * @param {string} props.currentUserId - Current user's ID
 * @param {Object} props.messagesEndRef - Ref for scrolling to bottom
 * @param {Object} props.currentUser - Current user object
 * @param {Object} props.selectedUserData - Selected user data object
 * @param {Object} props.otherUserPresence - Other user's presence status
 * @param {boolean} props.isTyping - Whether the other user is typing
 * @param {string} props.newMessage - Current message input value
 * @param {Function} props.onMessageChange - Callback when message changes
 * @param {Function} props.onSend - Callback when send button is clicked
 * @param {Function} props.onKeyDown - Callback when key is pressed
 */
export default function ChatContainer({
  messages,
  currentUserId,
  messagesEndRef,
  currentUser,
  selectedUserData,
  otherUserPresence,
  isTyping,
  newMessage,
  onMessageChange,
  onSend,
  onKeyDown,
}) {
  return (
    <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <ChatHeader selectedUserData={selectedUserData} presence={otherUserPresence} />
      
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: 'background.default',
        }}
      >
        <ChatMessages
          messages={messages}
          currentUserId={currentUserId}
          messagesEndRef={messagesEndRef}
          currentUser={currentUser}
          otherUser={selectedUserData}
        />
      </Box>

      <ChatTypingIndicator isTyping={isTyping} userData={selectedUserData} />

      <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <ChatInput
          value={newMessage}
          onChange={onMessageChange}
          onSend={onSend}
          onKeyDown={onKeyDown}
        />
      </Box>
    </Card>
  )
}

