import { Box } from '@mui/material'

export default function UserAvatar({ user, size = 40, showBorder = false }) {
  const initial = user?.displayName?.[0]?.toUpperCase() || 'U'
  const fontSize = size === 40 ? '1rem' : '0.9rem'

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        border: showBorder ? '2px solid rgba(255, 255, 255, 0.2)' : 'none',
        fontWeight: 600,
        fontSize,
        ...(showBorder && {
          '&:hover': {
            transform: 'scale(1.05)',
          },
          transition: 'transform 0.2s',
        }),
      }}
    >
      {initial}
    </Box>
  )
}

