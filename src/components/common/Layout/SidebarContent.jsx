import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { useAuth } from '../../../context/AuthContext'
import { MENU_ITEMS } from '../../../config'
import Logo from '../Logo'
import UserAvatar from '../UserAvatar'

export default function SidebarContent({ onItemClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, userRole } = useAuth()

  const handleItemClick = (path) => {
    navigate(path)
    if (onItemClick) onItemClick()
  }

  const filteredMenuItems = MENU_ITEMS.filter((item) => {
    if (item.roles && !item.roles.includes(userRole)) return false
    return true
  })

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ minHeight: '80px !important', px: 3 }}>
        <Logo />
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {filteredMenuItems.map((item) => {
          const isSelected = location.pathname === item.path
          const IconComponent = item.icon
          // Use patientLabel if user is a patient and patientLabel exists
          const displayText = userRole === 'patient' && item.patientLabel ? item.patientLabel : item.text

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleItemClick(item.path)}
                sx={{
                  '& .MuiListItemIcon-root': {
                    color: isSelected ? '#818cf8' : 'rgba(255, 255, 255, 0.7)',
                    minWidth: 40,
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: isSelected ? 600 : 400,
                  },
                }}
              >
                <ListItemIcon>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={displayText} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            background: 'rgba(99, 102, 241, 0.1)',
          }}
        >
          <UserAvatar user={currentUser} size={36} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentUser?.displayName || 'User'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                textTransform: 'capitalize',
              }}
            >
              {userRole}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

