import { useState } from 'react'
import { Box } from '@mui/material'
import { useAuth } from '../../../context/AuthContext'
import AppHeader from './AppHeader'
import Sidebar from './Sidebar'
import MainContent from './MainContent'

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentUser, userRole } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppHeader
        onMenuClick={handleDrawerToggle}
        user={currentUser}
        userRole={userRole}
      />
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />
      <MainContent>{children}</MainContent>
    </Box>
  )
}

