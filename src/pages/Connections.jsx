import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material'
import { useConnections } from '../hooks/useConnections'
import AllUsersTab from '../components/connections/AllUsersTab'
import MyConnectionsTab from '../components/connections/MyConnectionsTab'
import PendingRequestsTab from '../components/connections/PendingRequestsTab'
import SentRequestsTab from '../components/connections/SentRequestsTab'

export default function Connections() {
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [message, setMessage] = useState('')

  const {
    users,
    connections,
    pendingRequests,
    sentRequests,
    loading,
    loadData,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeConnection,
  } = useConnections()

  // Load data when tab changes
  useEffect(() => {
    loadData(tabValue)
  }, [tabValue, loadData])


  const handleChatClick = (userId) => {
    try {
      navigate(`/chat?userId=${userId}`)
    } catch (error) {
      console.error('Error navigating to chat:', error)
    }
  }

  const handleConnectClick = (user) => {
    try {
      setSelectedUser(user)
      setRequestDialogOpen(true)
    } catch (error) {
      console.error('Error opening connection dialog:', error)
    }
  }

  const handleRemoveConnection = async (connectionId) => {
    await removeConnection(connectionId)
  }

  const handleSendRequest = async () => {
    if (!selectedUser) return

    const result = await sendRequest(selectedUser)
    if (result.success) {
      setRequestDialogOpen(false)
      setSelectedUser(null)
      setMessage('')
    }
  }

  const handleAcceptRequest = async (connectionId) => {
    await acceptRequest(connectionId)
  }

  const handleRejectRequest = async (connectionId) => {
    await rejectRequest(connectionId)
  }

  const handleTabChange = (e, newValue) => {
    try {
      setTabValue(newValue)
    } catch (error) {
      console.error('Error changing tab:', error)
    }
  }

  const handleRequestDialogClose = () => {
    try {
      setRequestDialogOpen(false)
      setSelectedUser(null)
      setMessage('')
    } catch (error) {
      console.error('Error closing dialog:', error)
    }
  }

  const handleMessageChange = (e) => {
    try {
      setMessage(e.target.value)
    } catch (error) {
      console.error('Error updating message:', error)
    }
  }

  const handleRequestDialogCancel = () => {
    try {
      setRequestDialogOpen(false)
    } catch (error) {
      console.error('Error canceling dialog:', error)
    }
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

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="All Users" />
        <Tab label="My Connections" />
        <Tab label="Pending Requests" />
        <Tab label="Sent Requests" />
      </Tabs>

      {tabValue === 0 && (
        <AllUsersTab
          users={users}
          loading={loading}
          onChat={handleChatClick}
          onRemove={handleRemoveConnection}
          onConnect={handleConnectClick}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
      )}

      {tabValue === 1 && (
        <MyConnectionsTab
          connections={connections}
          loading={loading}
          onChat={handleChatClick}
          onRemove={handleRemoveConnection}
        />
      )}

      {tabValue === 2 && (
        <PendingRequestsTab
          pendingRequests={pendingRequests}
          loading={loading}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
      )}

      {tabValue === 3 && (
        <SentRequestsTab
          sentRequests={sentRequests}
          loading={loading}
        />
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
