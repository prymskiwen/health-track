import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { Send } from '@mui/icons-material'
import { subscribeToMessages, sendMessage } from '../services/chatService'
import { getAllDoctors, getAllPatients } from '../services/userService'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

export default function Chat() {
  const { currentUser, userRole } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [users, setUsers] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      const unsubscribe = subscribeToMessages(
        currentUser.uid,
        selectedUser,
        (msgs) => {
          setMessages(msgs)
        }
      )
      return () => unsubscribe()
    }
  }, [selectedUser, currentUser.uid])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadUsers = async () => {
    let result
    if (userRole === 'doctor') {
      result = await getAllPatients()
    } else {
      result = await getAllDoctors()
    }
    if (result.success) {
      setUsers(result.data)
      if (result.data.length > 0 && !selectedUser) {
        setSelectedUser(result.data[0].id)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    const result = await sendMessage(
      currentUser.uid,
      selectedUser,
      newMessage,
      userRole
    )
    if (result.success) {
      setNewMessage('')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const selectedUserData = users.find((u) => u.id === selectedUser)

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Chat
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 200px)' }}>
        <Card sx={{ width: 300, height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {userRole === 'doctor' ? 'Patients' : 'Doctors'}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUser}
                label="Select User"
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedUserData && (
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                Chat with {selectedUserData.name}
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
              bgcolor: 'background.default',
            }}
          >
            {messages.length === 0 ? (
              <Typography color="text.secondary" align="center">
                No messages yet. Start a conversation!
              </Typography>
            ) : (
              <List>
                {messages.map((message) => {
                  const isOwn = message.senderId === currentUser.uid
                  return (
                    <ListItem
                      key={message.id}
                      sx={{
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          maxWidth: '70%',
                          bgcolor: isOwn ? 'primary.main' : 'grey.300',
                          color: isOwn ? 'white' : 'text.primary',
                        }}
                      >
                        <Typography variant="body1">{message.message}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.8,
                          }}
                        >
                          {format(new Date(message.timestamp), 'MMM dd, HH:mm')}
                        </Typography>
                      </Paper>
                    </ListItem>
                  )
                })}
                <div ref={messagesEndRef} />
              </List>
            )}
          </Box>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}

