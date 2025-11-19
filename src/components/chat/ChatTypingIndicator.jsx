import { Box, Typography } from '@mui/material'

/**
 * ChatTypingIndicator component - displays typing indicator in fixed position
 * @param {Object} props
 * @param {boolean} props.isTyping - Whether the user is typing
 * @param {Object} props.userData - User data object with name
 */
export default function ChatTypingIndicator({ isTyping, userData }) {
  if (!isTyping || !userData) return null

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 73,
        left: 0,
        right: 0,
        px: 2,
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        zIndex: 10,
        minHeight: 28,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 0.375,
          alignItems: 'center',
        }}
      >
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
            animation: 'pulse 1.4s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.4 },
              '50%': { opacity: 1 },
            },
          }}
        />
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
            animation: 'pulse 1.4s ease-in-out infinite 0.2s',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.4 },
              '50%': { opacity: 1 },
            },
          }}
        />
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
            animation: 'pulse 1.4s ease-in-out infinite 0.4s',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.4 },
              '50%': { opacity: 1 },
            },
          }}
        />
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontStyle: 'italic',
          fontSize: '0.75rem',
          lineHeight: 1.2,
        }}
      >
        {userData?.name || 'User'} is typing...
      </Typography>
    </Box>
  )
}

