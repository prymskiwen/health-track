import { Box, Typography, CircularProgress } from '@mui/material'
import ConnectionsGrid from './ConnectionsGrid'

/**
 * AllUsersTab component - displays all users that can be connected with
 * @param {Object} props
 * @param {Array} props.users - Array of user objects
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onChat - Callback when chat is clicked
 * @param {Function} props.onRemove - Callback when remove connection is clicked
 * @param {Function} props.onConnect - Callback when connect is clicked
 * @param {Function} props.onAccept - Callback when accept request is clicked
 * @param {Function} props.onReject - Callback when reject request is clicked
 */
export default function AllUsersTab({
  users,
  loading,
  onChat,
  onRemove,
  onConnect,
  onAccept,
  onReject,
}) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (users.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No users found</Typography>
      </Box>
    )
  }

  return (
    <ConnectionsGrid
      connections={users}
      onChat={onChat}
      onRemove={onRemove}
      onConnect={onConnect}
      onAccept={onAccept}
      onReject={onReject}
    />
  )
}

