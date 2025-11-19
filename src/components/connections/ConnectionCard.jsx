import { Box, Card, CardContent, Typography, Chip, Button, IconButton } from '@mui/material'
import { LocalHospital, Person, AdminPanelSettings, Chat, Close, PersonAdd, Check, Cancel } from '@mui/icons-material'
import UserAvatar from '../common/UserAvatar'

/**
 * ConnectionCard component for displaying a single connection/user in card format
 * @param {Object} props
 * @param {Object} props.user - User/connection object
 * @param {Function} props.onChat - Callback when chat is clicked
 * @param {Function} props.onRemove - Callback when remove connection is clicked
 * @param {Function} props.onConnect - Callback when connect is clicked
 * @param {Function} props.onAccept - Callback when accept request is clicked
 * @param {Function} props.onReject - Callback when reject request is clicked
 * @param {boolean} props.showActions - Whether to show action buttons
 */
export default function ConnectionCard({
  user,
  onChat,
  onRemove,
  onConnect,
  onAccept,
  onReject,
  showActions = true,
}) {
  const userId = user.uid || user.id
  const userName = user.displayName || user.name || 'Unknown User'
  const userEmail = user.email || ''
  const userRoleType = user.role || 'patient'

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

  const handleChatClick = () => {
    if (onChat) {
      onChat(userId)
    }
  }

  const handleRemoveClick = () => {
    if (onRemove) {
      onRemove(user.connectionId)
    }
  }

  const handleConnectClick = () => {
    if (onConnect) {
      onConnect(user)
    }
  }

  const handleAcceptClick = () => {
    if (onAccept && user.connectionId) {
      onAccept(user.connectionId)
    }
  }

  const handleRejectClick = () => {
    if (onReject && user.connectionId) {
      onReject(user.connectionId)
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <UserAvatar
            user={{
              displayName: userName,
              email: userEmail,
              photoURL: user.photoURL || user.avatar,
            }}
            size={56}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {userName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userEmail}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={getRoleIcon(userRoleType)}
            label={userRoleType}
            color={getRoleColor(userRoleType)}
            size="small"
          />
          {user.specialty && (
            <Chip label={user.specialty} size="small" variant="outlined" />
          )}
          {/* Connection Status Badge */}
          {user.connectionStatus === 'accepted' && (
            <Chip 
              label="Connected" 
              color="success" 
              size="small" 
              variant="outlined"
            />
          )}
          {user.connectionStatus === 'pending' && (
            <Chip 
              label={user.isSentByCurrentUser ? "Request Sent" : "Request Pending"} 
              color="warning" 
              size="small" 
              variant="outlined"
            />
          )}
        </Box>
        {showActions && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {user.connectionStatus === 'accepted' ? (
              <>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Chat />}
                  onClick={handleChatClick}
                >
                  Chat
                </Button>
                <IconButton color="error" onClick={handleRemoveClick}>
                  <Close />
                </IconButton>
              </>
            ) : user.connectionStatus === 'pending' ? (
              // If current user sent the request, show disabled "Pending" button
              // If current user received the request, show Accept/Reject buttons
              user.isSentByCurrentUser ? (
                <Button
                  fullWidth
                  variant="outlined"
                  disabled
                >
                  Pending
                </Button>
              ) : (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<Check />}
                    onClick={handleAcceptClick}
                  >
                    Accept
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={handleRejectClick}
                  >
                    Deny
                  </Button>
                </>
              )
            ) : (
              <Button
                fullWidth
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={handleConnectClick}
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

