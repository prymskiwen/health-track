import { useState } from 'react'
import { Box, Avatar } from '@mui/material'

/**
 * UserAvatar component that displays user avatar image or initials
 * @param {Object} props
 * @param {Object} props.user - User object with displayName, photoURL, or name
 * @param {number} props.size - Size of the avatar (default: 40)
 * @param {boolean} props.showBorder - Whether to show border (default: false)
 */
export default function UserAvatar({ user, size = 40, showBorder = false }) {
  const [imageError, setImageError] = useState(false)
  
  // Get user name from different possible fields
  const userName = user?.displayName || user?.name || ''
  const initial = userName?.[0]?.toUpperCase() || 'U'
  const avatarUrl = user?.photoURL || user?.avatar || null
  
  // Use image if available and no error, otherwise show initials
  const showImage = avatarUrl && !imageError

  if (showImage) {
    return (
      <Avatar
        src={avatarUrl}
        alt={userName}
        onError={() => setImageError(true)}
        sx={{
          width: size,
          height: size,
          border: showBorder ? '2px solid rgba(255, 255, 255, 0.2)' : 'none',
          ...(showBorder && {
            '&:hover': {
              transform: 'scale(1.05)',
            },
            transition: 'transform 0.2s',
          }),
        }}
      >
        {initial}
      </Avatar>
    )
  }

  const fontSize = size === 40 ? '1rem' : size > 40 ? '1.2rem' : '0.9rem'

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

