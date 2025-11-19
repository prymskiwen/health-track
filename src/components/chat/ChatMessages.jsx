import { Typography, List, ListItem, Paper, Box } from '@mui/material'
import { Done, DoneAll } from '@mui/icons-material'
import { format } from 'date-fns'
import UserAvatar from '../common/UserAvatar'

/**
 * ChatMessages component - displays chat messages
 * @param {Object} props
 * @param {Array} props.messages - Array of message objects
 * @param {string} props.currentUserId - Current user's ID
 * @param {Object} props.messagesEndRef - Ref for scrolling to bottom
 * @param {Object} props.currentUser - Current user object with avatar info
 * @param {Object} props.otherUser - Other user object with avatar info
 */
export default function ChatMessages({ 
  messages, 
  currentUserId, 
  messagesEndRef,
  currentUser,
  otherUser,
}) {
  if (messages.length === 0) {
    return (
      <Typography color="text.secondary" align="center">
        No messages yet. Start a conversation!
      </Typography>
    )
  }

  return (
    <List>
      {messages.map((message) => {
        const isOwn = message.senderId === currentUserId
        const messageUser = isOwn ? currentUser : otherUser
        // Read status logic:
        // - For messages you sent: read === true means the recipient read it
        // - For messages you received: read === true means you read it
        // The read field is always set by the receiver, so:
        // - If you sent it: check if read === true (recipient marked it as read)
        // - If you received it: check if read === true (you marked it as read)
        // Handle both boolean and string values from Firebase
        const isRead = message.read === true || message.read === 'true'
        
        return (
          <ListItem
            key={message.id}
            sx={{
              justifyContent: isOwn ? 'flex-end' : 'flex-start',
              alignItems: 'flex-end',
              gap: 1,
            }}
          >
            {!isOwn && (
              <UserAvatar
                user={{
                  displayName: messageUser?.name || messageUser?.displayName,
                  photoURL: messageUser?.photoURL || messageUser?.avatar,
                }}
                size={32}
              />
            )}
            <Paper
              sx={{
                p: 1.5,
                maxWidth: '70%',
                bgcolor: isOwn 
                  ? 'primary.main' 
                  : (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'grey.200',
                color: isOwn ? 'white' : 'text.primary',
                border: isOwn ? 'none' : '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.12)',
              }}
            >
              <Typography variant="body1">{message.message}</Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                  }}
                >
                  {format(new Date(message.timestamp), 'MMM dd, HH:mm')}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    ml: 0.5,
                  }}
                >
                  {isRead ? (
                    <DoneAll
                      sx={{
                        fontSize: 16,
                        color: isOwn 
                          ? 'rgba(255, 255, 255, 0.9)' 
                          : 'primary.main',
                      }}
                    />
                  ) : (
                    <Done
                      sx={{
                        fontSize: 16,
                        color: isOwn 
                          ? 'rgba(255, 255, 255, 0.6)' 
                          : 'text.secondary',
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Paper>
            {isOwn && (
              <UserAvatar
                user={{
                  displayName: messageUser?.name || messageUser?.displayName,
                  photoURL: messageUser?.photoURL || messageUser?.avatar,
                }}
                size={32}
              />
            )}
          </ListItem>
        )
      })}
      <div ref={messagesEndRef} />
    </List>
  )
}

