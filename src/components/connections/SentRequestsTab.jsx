import { Box, Typography, CircularProgress } from '@mui/material'
import ConnectionsGrid from './ConnectionsGrid'

/**
 * SentRequestsTab component - displays sent connection requests
 * @param {Object} props
 * @param {Array} props.sentRequests - Array of sent request objects
 * @param {boolean} props.loading - Loading state
 */
export default function SentRequestsTab({
  sentRequests,
  loading,
}) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (sentRequests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No sent requests</Typography>
      </Box>
    )
  }

  return (
    <ConnectionsGrid
      connections={sentRequests}
      showActions={false}
    />
  )
}

