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
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { Send } from '@mui/icons-material'
import { subscribeToMessages, sendMessage } from '../services/chatService'
import {
  getAllPatients,
  getPatientByEmail,
  getDoctor,
  getAllUsers,
} from '../services/userService'
import { getUserConnections } from '../services/connectionService'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import { useSearchParams } from 'react-router-dom'

export default function Chat() {
  const { currentUser, userRole } = useAuth()
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState(searchParams.get('userId') || '')
  const [users, setUsers] = useState([])
  const messagesEndRef = useRef(null)

  const loadUsers = async () => {
    // Load connections - chat is available for all connected users
    const connectionsResult = await getUserConnections(currentUser.uid)
    if (connectionsResult.success && connectionsResult.data.length > 0) {
      // Map connections to user format
      const connectionUsers = connectionsResult.data.map((conn) => ({
        id: conn.userId,
        uid: conn.userId,
        name: conn.userDetails?.displayName || conn.userDetails?.name || 'Unknown',
        email: conn.userDetails?.email || '',
        role: conn.role,
      }))
      setUsers(connectionUsers)
      if (connectionUsers.length > 0 && !selectedUser) {
        setSelectedUser(connectionUsers[0].id || connectionUsers[0].uid)
      }
      return
    }

    // Fallback: For backward compatibility, also include assigned doctor/patient relationships
    // This ensures existing doctor-patient chats still work
    if (userRole === 'patient') {
      // Patients can chat with their assigned doctor
      const patientResult = await getPatientByEmail(currentUser.email)
      if (patientResult.success && patientResult.data.assignedDoctor) {
        const doctorResult = await getDoctor(patientResult.data.assignedDoctor)
        if (doctorResult.success) {
          const allUsersResult = await getAllUsers()
          if (allUsersResult.success) {
            const doctorUser = allUsersResult.data.find(
              (u) => u.email === doctorResult.data.email && u.role === 'doctor'
            )
            if (doctorUser) {
              setUsers([{ ...doctorUser, name: doctorResult.data.name }])
              if (!selectedUser) {
                setSelectedUser(doctorUser.uid)
              }
              return
            }
          }
        }
      }
    } else if (userRole === 'doctor') {
      // Doctors can chat with their assigned patients
      const allPatientsResult = await getAllPatients()
      if (allPatientsResult.success) {
        const assignedPatients = allPatientsResult.data.filter(
          (patient) => patient.assignedDoctor === currentUser.email
        )
        if (assignedPatients.length > 0) {
          const allUsersResult = await getAllUsers()
          if (allUsersResult.success) {
            const patientUsers = assignedPatients
              .map((patient) => {
                const user = allUsersResult.data.find(
                  (u) => u.email === patient.email && u.role === 'patient'
                )
                return user ? { ...user, name: patient.name } : null
              })
              .filter(Boolean)
            if (patientUsers.length > 0) {
              setUsers(patientUsers)
              if (!selectedUser) {
                setSelectedUser(patientUsers[0].uid)
              }
              return
            }
          }
        }
      }
    }

    // If no connections or assigned relationships, show empty state
    setUsers([])
  }

  useEffect(() => {
    if (currentUser?.uid) {
      loadUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, userRole])

  useEffect(() => {
    const userId = searchParams.get('userId')
    if (userId) {
      setSelectedUser(userId)
    }
  }, [searchParams])

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

  const handleSelectedUserChange = (e) => {
    setSelectedUser(e.target.value)
  }

  const handleNewMessageChange = (e) => {
    setNewMessage(e.target.value)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
              Connections
            </Typography>
            {users.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No connections available. Connect with users to start chatting.
              </Typography>
            ) : (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select User</InputLabel>
                <Select
                  value={selectedUser}
                  label="Select User"
                  onChange={handleSelectedUserChange}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id || user.uid} value={user.id || user.uid}>
                      {user.name} ({user.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
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
                onChange={handleNewMessageChange}
                onKeyPress={handleKeyPress}
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

