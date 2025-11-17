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
import {
  getAllDoctors,
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState(searchParams.get('userId') || '')
  const [users, setUsers] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadUsers()
  }, [])

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

  const loadUsers = async () => {
    // First try to load connections
    const connectionsResult = await getUserConnections(currentUser.uid)
    if (connectionsResult.success && connectionsResult.data.length > 0) {
      // Map connections to user format
      const connectionUsers = connectionsResult.data.map((conn) => ({
        id: conn.userId,
        name: conn.userDetails?.displayName || conn.userDetails?.name || 'Unknown',
        email: conn.userDetails?.email || '',
        role: conn.role,
      }))
      setUsers(connectionUsers)
      if (connectionUsers.length > 0 && !selectedUser) {
        setSelectedUser(connectionUsers[0].id)
      }
      return
    }

    // Fallback to role-based loading if no connections
    let result
    if (userRole === 'doctor') {
      result = await getAllPatients()
    } else if (userRole === 'patient') {
      // Patients should only see their assigned doctor
      const patientResult = await getPatientByEmail(currentUser.email)
      if (patientResult.success && patientResult.data.assignedDoctor) {
        const doctorResult = await getDoctor(patientResult.data.assignedDoctor)
        if (doctorResult.success) {
          // Find the doctor's user ID by matching email
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
      // If no assigned doctor, show all doctors (fallback)
      result = await getAllDoctors()
      if (result.success) {
        // Map doctors to user format by matching emails
        const allUsersResult = await getAllUsers()
        if (allUsersResult.success) {
          const doctorUsers = result.data
            .map((doctor) => {
              const user = allUsersResult.data.find(
                (u) => u.email === doctor.email && u.role === 'doctor'
              )
              return user ? { ...user, name: doctor.name } : null
            })
            .filter(Boolean)
          setUsers(doctorUsers)
          if (doctorUsers.length > 0 && !selectedUser) {
            setSelectedUser(doctorUsers[0].uid)
          }
          return
        }
      }
    } else {
      // Admin can see all
      const [doctorsResult, patientsResult] = await Promise.all([
        getAllDoctors(),
        getAllPatients(),
      ])
      const allUsers = [
        ...(doctorsResult.success ? doctorsResult.data : []),
        ...(patientsResult.success ? patientsResult.data : []),
      ]
      setUsers(allUsers)
      if (allUsers.length > 0 && !selectedUser) {
        setSelectedUser(allUsers[0].id)
      }
      return
    }

    if (result.success) {
      setUsers(result.data)
      if (result.data.length > 0 && !selectedUser) {
        setSelectedUser(result.data[0].id)
      }
    }
  }

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
              {userRole === 'doctor' ? 'Patients' : 'Doctors'}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUser}
                label="Select User"
                onChange={handleSelectedUserChange}
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

