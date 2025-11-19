import { Box, Typography, CircularProgress } from '@mui/material'
import ConnectionsGrid from './ConnectionsGrid'

/**
 * PendingRequestsTab component - displays pending connection requests
 * @param {Object} props
 * @param {Array} props.pendingRequests - Array of pending request objects
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onAccept - Callback when accept is clicked
 * @param {Function} props.onReject - Callback when reject is clicked
 */
export default function PendingRequestsTab({
  pendingRequests,
  loading,
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

  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No pending requests</Typography>
      </Box>
    )
  }

  return (
    <ConnectionsGrid
      connections={pendingRequests}
      onAccept={onAccept}
      onReject={onReject}
      showActions={true}
    />
  )
}

