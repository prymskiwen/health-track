import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  PersonAdd,
  Check,
  Close,
  LocalHospital,
  Person,
  AdminPanelSettings,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import {
  getAllDoctors,
  getAllPatients,
  getAllUsers,
} from '../services/userService'
import {
  sendConnectionRequest,
  getUserConnections,
  getPendingRequests,
  getSentRequests,
  acceptConnectionRequest,
  removeConnection,
  checkConnection,
} from '../services/connectionService'
import { useNavigate } from 'react-router-dom'

export default function Connections() {
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  const [users, setUsers] = useState([])
  const [connections, setConnections] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [tabValue])

  const loadData = async () => {
    setLoading(true)
    try {
      if (tabValue === 0) {
        // All Users tab
        await loadAllUsers()
      } else if (tabValue === 1) {
        // Connections tab
        await loadConnections()
      } else if (tabValue === 2) {
        // Pending Requests tab
        await loadPendingRequests()
      } else if (tabValue === 3) {
        // Sent Requests tab
        await loadSentRequests()
      }
    } finally {
      setLoading(false)
    }
  }

  const loadAllUsers = async () => {
    let result
    if (userRole === 'admin') {
      result = await getAllUsers()
    } else if (userRole === 'doctor') {
      const [doctorsResult, patientsResult] = await Promise.all([
        getAllDoctors(),
        getAllPatients(),
      ])
      const allUsers = [
        ...(doctorsResult.success ? doctorsResult.data : []),
        ...(patientsResult.success ? patientsResult.data : []),
      ]
      setUsers(allUsers.filter((u) => u.id !== currentUser.uid))
      return
    } else {
      result = await getAllDoctors()
    }

    if (result.success) {
      // Filter out current user and get connection status
      const filteredUsers = result.data.filter((u) => {
        if (userRole === 'admin') {
          return u.uid !== currentUser.uid
        }
        return true
      })

      // Check connection status for each user
      const usersWithStatus = await Promise.all(
        filteredUsers.map(async (user) => {
          const userId = user.uid || user.id
          const connectionResult = await checkConnection(currentUser.uid, userId)
          return {
            ...user,
            id: userId,
            connectionStatus: connectionResult.data?.status || null,
            connectionId: connectionResult.data?.id || null,
          }
        })
      )

      setUsers(usersWithStatus)
    }
  }

  const loadConnections = async () => {
    const result = await getUserConnections(currentUser.uid)
    if (result.success) {
      // Fetch user details for each connection
      const connectionsWithDetails = await Promise.all(
        result.data.map(async (conn) => {
          // Try to get from users collection first
          const userResult = await getAllUsers()
          let userDetails = null
          if (userResult.success) {
            userDetails = userResult.data.find((u) => u.uid === conn.userId)
          }
          return {
            ...conn,
            userDetails,
          }
        })
      )
      setConnections(connectionsWithDetails)
    }
  }

  const loadPendingRequests = async () => {
    const result = await getPendingRequests(currentUser.uid)
    if (result.success) {
      setPendingRequests(result.data)
    }
  }

  const loadSentRequests = async () => {
    const result = await getSentRequests(currentUser.uid)
    if (result.success) {
      setSentRequests(result.data)
    }
  }

  const handleSendRequest = async () => {
    if (!selectedUser) return

    const userId = selectedUser.uid || selectedUser.id
    const result = await sendConnectionRequest(
      currentUser.uid,
      userId,
      userRole,
      selectedUser.role
    )

    if (result.success) {
      setRequestDialogOpen(false)
      setSelectedUser(null)
      setMessage('')
      loadData()
    }
  }

  const handleAcceptRequest = async (connectionId) => {
    const result = await acceptConnectionRequest(connectionId)
    if (result.success) {
      loadData()
    }
  }

  const handleRejectRequest = async (connectionId) => {
    const result = await removeConnection(connectionId)
    if (result.success) {
      loadData()
    }
  }

  const handleRemoveConnection = async (connectionId) => {
    const result = await removeConnection(connectionId)
    if (result.success) {
      loadData()
    }
  }

  const handleTabChange = (e, newValue) => {
    setTabValue(newValue)
  }

  const handleChatClick = (userId) => {
    navigate(`/chat?userId=${userId}`)
  }

  const handleConnectClick = (user) => {
    setSelectedUser(user)
    setRequestDialogOpen(true)
  }

  const handleRequestDialogClose = () => {
    setRequestDialogOpen(false)
    setSelectedUser(null)
    setMessage('')
  }

  const handleMessageChange = (e) => {
    setMessage(e.target.value)
  }

  const handleRequestDialogCancel = () => {
    setRequestDialogOpen(false)
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings />
      case 'doctor':
        return <LocalHospital />
      case 'patient':
        return <Person />
      default:
        return <Person />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error'
      case 'doctor':
        return 'primary'
      case 'patient':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const renderUserCard = (user, showActions = true) => {
    const userId = user.uid || user.id
    const userName = user.displayName || user.name || 'Unknown User'
    const userEmail = user.email || ''
    const userRoleType = user.role || 'patient'

    const handleChatButtonClick = () => {
      handleChatClick(userId)
    }

    const handleRemoveButtonClick = () => {
      handleRemoveConnection(user.connectionId)
    }

    const handleConnectButtonClick = () => {
      handleConnectClick(user)
    }

    return (
      <Card key={userId} sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
              }}
            >
              {userName[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                {userName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userEmail}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              icon={getRoleIcon(userRoleType)}
              label={userRoleType}
              color={getRoleColor(userRoleType)}
              size="small"
            />
            {user.specialty && (
              <Chip label={user.specialty} size="small" variant="outlined" />
            )}
          </Box>
          {showActions && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {user.connectionStatus === 'accepted' ? (
                <>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleChatButtonClick}
                  >
                    Chat
                  </Button>
                  <IconButton
                    color="error"
                    onClick={handleRemoveButtonClick}
                  >
                    <Close />
                  </IconButton>
                </>
              ) : user.connectionStatus === 'pending' ? (
                <Chip label="Request Pending" color="warning" size="small" />
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={handleConnectButtonClick}
                >
                  Connect
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Connections
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with doctors and patients in your hospital network
        </Typography>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab label="All Users" />
        <Tab label="My Connections" />
        <Tab label="Pending Requests" />
        <Tab label="Sent Requests" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {users.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">No users found</Alert>
                </Grid>
              ) : (
                users.map((user) => (
                  <Grid item xs={12} sm={6} md={4} key={user.id || user.uid}>
                    {renderUserCard(user)}
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={3}>
              {connections.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">No connections yet</Alert>
                </Grid>
              ) : (
                connections.map((conn) => (
                  <Grid item xs={12} sm={6} md={4} key={conn.id}>
                    {renderUserCard({
                      ...conn,
                      uid: conn.userId,
                      role: conn.role,
                      connectionStatus: 'accepted',
                      connectionId: conn.id,
                    })}
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {tabValue === 2 && (
            <Grid container spacing={3}>
              {pendingRequests.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">No pending requests</Alert>
                </Grid>
              ) : (
                pendingRequests.map((request) => {
                  const handleAcceptClick = () => {
                    handleAcceptRequest(request.id)
                  }

                  const handleRejectClick = () => {
                    handleRejectRequest(request.id)
                  }

                  return (
                    <Grid item xs={12} sm={6} md={4} key={request.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Connection Request
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            From: {request.fromUserId}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<Check />}
                              onClick={handleAcceptClick}
                              fullWidth
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<Close />}
                              onClick={handleRejectClick}
                              fullWidth
                            >
                              Reject
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })
              )}
            </Grid>
          )}

          {tabValue === 3 && (
            <Grid container spacing={3}>
              {sentRequests.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">No sent requests</Alert>
                </Grid>
              ) : (
                sentRequests.map((request) => (
                  <Grid item xs={12} sm={6} md={4} key={request.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Sent Request
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          To: {request.toUserId}
                        </Typography>
                        <Chip label="Pending" color="warning" sx={{ mt: 2 }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </>
      )}

      <Dialog
        open={requestDialogOpen}
        onClose={handleRequestDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Connection Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Send a connection request to {selectedUser?.name || selectedUser?.displayName}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Message (Optional)"
            value={message}
            onChange={handleMessageChange}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRequestDialogCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleSendRequest}>
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

