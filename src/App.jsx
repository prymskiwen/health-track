import { Box, CircularProgress } from '@mui/material'

import { useAuth } from './context/AuthContext'
import AppRoutes from './routes'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return <AppRoutes />
}

export default App

