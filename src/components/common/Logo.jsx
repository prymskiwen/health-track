import { Box, Typography } from '@mui/material'
import { APP_NAME } from '../../config'

export default function Logo({ size = 40, showText = true }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: size === 40 ? '1.2rem' : '1rem',
        }}
      >
        H
      </Box>
      {showText && (
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {APP_NAME}
        </Typography>
      )}
    </Box>
  )
}

