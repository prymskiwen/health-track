import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material'
import { Logout } from '@mui/icons-material'
import { logoutUser } from '../../services/authService'
import UserAvatar from './UserAvatar'

export default function UserMenu({ user, userRole }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const navigate = useNavigate()

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
    handleMenuClose()
  }

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        sx={{
          p: 0,
        }}
      >
        <UserAvatar user={user} size={40} showBorder />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="body2">
            {user?.displayName || user?.email}
          </Typography>
        </MenuItem>
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            Role: {userRole}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

