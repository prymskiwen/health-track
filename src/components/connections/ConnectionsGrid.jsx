import { Grid } from '@mui/material'
import ConnectionCard from './ConnectionCard'

/**
 * ConnectionsGrid component for displaying connections in a grid layout
 * @param {Object} props
 * @param {Array} props.connections - Array of connection/user objects
 * @param {Function} props.onChat - Callback when chat is clicked
 * @param {Function} props.onRemove - Callback when remove connection is clicked
 * @param {Function} props.onConnect - Callback when connect is clicked
 * @param {Function} props.onAccept - Callback when accept request is clicked
 * @param {Function} props.onReject - Callback when reject request is clicked
 * @param {boolean} props.showActions - Whether to show action buttons
 */
export default function ConnectionsGrid({
  connections,
  onChat,
  onRemove,
  onConnect,
  onAccept,
  onReject,
  showActions = true,
}) {
  return (
    <Grid container spacing={3}>
      {connections.map((connection) => (
        <Grid item xs={12} sm={6} md={4} key={connection.id || connection.uid || connection.userId}>
          <ConnectionCard
            user={connection}
            onChat={onChat}
            onRemove={onRemove}
            onConnect={onConnect}
            onAccept={onAccept}
            onReject={onReject}
            showActions={showActions}
          />
        </Grid>
      ))}
    </Grid>
  )
}

