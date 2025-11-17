import { Box } from '@mui/material'
import { DRAWER_WIDTH } from '../../../config'

export default function MainContent({ children }) {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: { xs: 2, sm: 3, md: 4 },
        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        mt: { xs: 7, sm: 8 },
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      }}
    >
      {children}
    </Box>
  )
}

