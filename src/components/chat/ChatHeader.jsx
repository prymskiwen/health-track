import { Box, Typography, Chip } from '@mui/material'
import { Circle } from '@mui/icons-material'

/**
 * ChatHeader component - displays chat header with selected user
 * @param {Object} props
 * @param {Object} props.selectedUserData - Selected user data object
 * @param {Object} props.presence - User presence status (online/offline)
 */
export default function ChatHeader({ selectedUserData, presence }) {
  if (!selectedUserData) return null

  // Handle both string and boolean status values, and check for truthy values
  const isOnline = presence?.status === 'online' || presence?.status === true || presence?.status === 'true'

  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6">
          {selectedUserData.name}
        </Typography>
        {presence && (
          <Chip
            icon={
              <Circle
                sx={{
                  fontSize: 8,
                }}
              />
            }
            label={isOnline ? 'Online' : 'Offline'}
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              borderColor: isOnline ? '#4caf50' : undefined,
              color: isOnline ? '#4caf50' : undefined,
              '& .MuiChip-label': {
                fontSize: '0.75rem',
                px: 1,
                color: isOnline ? '#4caf50' : undefined,
              },
              '& .MuiChip-icon': {
                color: isOnline ? '#4caf50' : '#9e9e9e',
              },
            }}
          />
        )}
      </Box>
    </Box>
  )
}

