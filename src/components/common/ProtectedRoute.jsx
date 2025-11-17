import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Box, CircularProgress } from '@mui/material'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, userRole, loading } = useAuth()

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

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

