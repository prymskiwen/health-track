import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Button,
} from '@mui/material'
import { LocalHospital, Person, AdminPanelSettings, Chat, Close, PersonAdd, Check } from '@mui/icons-material'
import UserAvatar from '../common/UserAvatar'
import ActionsMenu from '../common/ActionsMenu'

/**
 * ConnectionsTable component for displaying connections in a table format
 * @param {Object} props
 * @param {Array} props.connections - Array of connection/user objects
 * @param {Function} props.onChat - Callback when chat is clicked
 * @param {Function} props.onRemove - Callback when remove connection is clicked
 * @param {Function} props.onConnect - Callback when connect is clicked
 * @param {Function} props.onAccept - Callback when accept request is clicked (for pending requests)
 * @param {Function} props.onReject - Callback when reject request is clicked (for pending requests)
 * @param {boolean} props.showActions - Whether to show action buttons
 */
export default function ConnectionsTable({
  connections,
  onChat,
  onRemove,
  onConnect,
  onAccept,
  onReject,
  showActions = true,
}) {
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

  const getActions = (user) => {
    const actions = []

    if (user.connectionStatus === 'accepted') {
      if (onChat) {
        actions.push({
          icon: <Chat />,
          label: 'Chat',
          onClick: () => onChat(user.uid || user.id || user.userId),
          color: 'primary',
        })
      }
      if (onRemove) {
        actions.push({
          icon: <Close />,
          label: 'Remove Connection',
          onClick: () => onRemove(user.connectionId),
          color: 'error',
        })
      }
    } else if (user.connectionStatus === 'pending') {
      // No actions for pending connections in menu (handled separately)
    } else {
      if (onConnect) {
        actions.push({
          icon: <PersonAdd />,
          label: 'Connect',
          onClick: () => onConnect(user),
          color: 'primary',
        })
      }
    }

    return actions
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Specialty</TableCell>
            <TableCell>Status</TableCell>
            {showActions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {connections.map((connection) => {
            const userId = connection.uid || connection.id || connection.userId
            const userName = connection.displayName || connection.name || 'Unknown User'
            const userEmail = connection.email || ''
            const userRole = connection.role || 'patient'
            const actions = getActions(connection)

            return (
              <TableRow key={connection.id || userId} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <UserAvatar
                      user={{
                        displayName: userName,
                        email: userEmail,
                        photoURL: connection.photoURL || connection.avatar,
                      }}
                      size={40}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {userName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{userEmail}</TableCell>
                <TableCell>
                  <Chip
                    icon={getRoleIcon(userRole)}
                    label={userRole}
                    color={getRoleColor(userRole)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {connection.specialty ? (
                    <Chip label={connection.specialty} size="small" variant="outlined" />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {connection.connectionStatus === 'accepted' ? (
                    <Chip label="Connected" color="success" size="small" />
                  ) : connection.connectionStatus === 'pending' ? (
                    <Chip label="Pending" color="warning" size="small" />
                  ) : (
                    <Chip label="Not Connected" color="default" size="small" />
                  )}
                </TableCell>
                {showActions && (
                  <TableCell align="right">
                    {connection.connectionStatus === 'pending' && onAccept && onReject ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<Check />}
                          onClick={() => onAccept(connection.connectionId)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Close />}
                          onClick={() => onReject(connection.connectionId)}
                        >
                          Reject
                        </Button>
                      </Box>
                    ) : actions.length > 0 ? (
                      <ActionsMenu actions={actions} />
                    ) : null}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

