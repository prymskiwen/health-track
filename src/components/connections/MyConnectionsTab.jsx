import { Box, Typography, CircularProgress } from '@mui/material'
import ConnectionsGrid from './ConnectionsGrid'

/**
 * MyConnectionsTab component - displays accepted connections
 * @param {Object} props
 * @param {Array} props.connections - Array of connection objects
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onChat - Callback when chat is clicked
 * @param {Function} props.onRemove - Callback when remove connection is clicked
 */
export default function MyConnectionsTab({
  connections,
  loading,
  onChat,
  onRemove,
}) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (connections.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No connections yet</Typography>
      </Box>
    )
  }

  return (
    <ConnectionsGrid
      connections={connections.map((conn) => ({
        ...conn,
        // Ensure connectionId is set for remove action
        connectionId: conn.id || conn.connectionId,
        // Ensure connectionStatus is set
        connectionStatus: conn.status || conn.connectionStatus || 'accepted',
      }))}
      onChat={onChat}
      onRemove={onRemove}
    />
  )
}

