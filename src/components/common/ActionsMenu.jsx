import { useState } from 'react'
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { MoreVert } from '@mui/icons-material'

/**
 * ActionsMenu component for displaying actions in a dropdown menu
 * @param {Object} props
 * @param {Array} props.actions - Array of action objects with { icon, label, onClick, color, disabled }
 * @param {string} [props.size] - Size of the icon button ('small' | 'medium' | 'large')
 */
export default function ActionsMenu({ actions = [], size = 'small' }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleAction = (action) => {
    if (action.onClick) {
      action.onClick()
    }
    handleClose()
  }

  if (actions.length === 0) {
    return null
  }

  const getColorValue = (color) => {
    const colorMap = {
      primary: '#6366f1',
      secondary: '#ec4899',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
    }
    return colorMap[color] || color || '#ffffff'
  }

  return (
    <>
      <IconButton
        size={size}
        onClick={handleClick}
        aria-label="more actions"
        aria-controls={open ? 'actions-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{
          color: 'text.secondary',
          padding: '4px',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: 'primary.main',
            background: 'rgba(99, 102, 241, 0.1)',
          },
        }}
      >
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 1.5,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            minWidth: 160,
            mt: 0.5,
            py: 0.5,
            '& .MuiMenuItem-root': {
              px: 1.5,
              py: 0.75,
              borderRadius: 0.75,
              mx: 0.5,
              my: 0.125,
              minHeight: 36,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.08)',
              },
              '&.Mui-disabled': {
                opacity: 0.5,
              },
            },
          },
        }}
      >
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => handleAction(action)}
            disabled={action.disabled}
            sx={{
              '&:hover': {
                background: `linear-gradient(90deg, ${getColorValue(action.color)}15 0%, transparent 100%)`,
                borderLeft: `3px solid ${getColorValue(action.color)}`,
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: action.color ? getColorValue(action.color) : 'text.secondary',
                minWidth: 28,
                '& svg': {
                  fontSize: 18,
                },
              }}
            >
              {action.icon}
            </ListItemIcon>
            <ListItemText
              primary={action.label}
              primaryTypographyProps={{
                variant: 'body2',
                sx: {
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  color: action.disabled ? 'text.disabled' : 'text.primary',
                },
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

