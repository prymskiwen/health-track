import { Box, Typography } from '@mui/material'

/**
 * ChatPageHeader component - displays page header with title and description
 */
export default function ChatPageHeader() {
  return (
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
        Chat
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Connect and communicate with your connections
      </Typography>
    </Box>
  )
}

