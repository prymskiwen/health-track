import { memo, useMemo, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material'
import UserAvatar from '../common/UserAvatar'

// Memoized user list item component to prevent unnecessary re-renders
const UserListItem = memo(({ user, isSelected, unreadCount, presence, onSelect }) => {
  const userId = user.id || user.uid
  
  const handleClick = useCallback(() => {
    onSelect(userId)
  }, [userId, onSelect])

  // Memoize user object to prevent UserAvatar re-renders
  const userAvatarProps = useMemo(
    () => ({
      displayName: user.name,
      email: user.email,
      photoURL: user.photoURL || user.avatar,
    }),
    [user.name, user.email, user.photoURL, user.avatar]
  )

  // Check if user is online
  const isOnline = useMemo(() => {
    if (!presence) return false
    return presence.status === 'online' || presence.status === true || presence.status === 'true'
  }, [presence])

  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={isSelected}
        onClick={handleClick}
        sx={{
          px: 2,
          py: 0,
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            '& .MuiListItemText-primary': {
              color: 'white',
              fontWeight: 600,
            },
            '& .MuiListItemText-secondary': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          },
        }}
      >
        <ListItemAvatar sx={{ minWidth: 48, position: 'relative' }}>
          <UserAvatar user={userAvatarProps} size={40} />
          {/* Presence indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 6,
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: isOnline ? '#4caf50' : '#9e9e9e',
              border: '2px solid',
              borderColor: 'background.paper',
              boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
            }}
          />
        </ListItemAvatar>
        <ListItemText
          primary={user.name}
          secondary={user.role}
          primaryTypographyProps={{
            variant: 'body1',
            fontWeight: isSelected ? 600 : 400,
            noWrap: true,
          }}
          secondaryTypographyProps={{
            variant: 'caption',
            textTransform: 'capitalize',
            noWrap: true,
          }}
        />
        {unreadCount > 0 && (
          <Box
            sx={{
              minWidth: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: 'error.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              ml: 1,
              flexShrink: 0,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Box>
        )}
      </ListItemButton>
    </ListItem>
  )
})

UserListItem.displayName = 'UserListItem'

/**
 * ChatSidebar component - displays list of users to chat with
 * @param {Object} props
 * @param {Array} props.users - Array of user objects
 * @param {string} props.selectedUser - Currently selected user ID
 * @param {Function} props.onUserChange - Callback when user selection changes
 * @param {Object} props.unreadCounts - Object mapping user IDs to unread message counts
 * @param {Object} props.usersPresence - Object mapping user IDs to presence status
 */
export default function ChatSidebar({ users, selectedUser, onUserChange, unreadCounts = {}, usersPresence = {} }) {
  // Memoize the callback to prevent re-renders
  const handleUserSelect = useCallback(
    (userId) => {
      onUserChange(userId)
    },
    [onUserChange]
  )

  // Memoize empty state check
  const isEmpty = useMemo(() => users.length === 0, [users.length])

  return (
    <Card sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2, pb: 1, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>
          Connections
        </Typography>
      </CardContent>
      <Divider />
      {isEmpty ? (
        <Box sx={{ p: 3, textAlign: 'center', flexShrink: 0 }}>
          <Typography variant="body2" color="text.secondary">
            No connections available. Connect with users to start chatting.
          </Typography>
        </Box>
      ) : (
        <List sx={{ flex: 1, overflow: 'auto', p: 0, overscrollBehavior: 'contain' }}>
          {users.map((user) => {
            const userId = user.id || user.uid
            return (
              <UserListItem
                key={userId}
                user={user}
                isSelected={selectedUser === userId}
                unreadCount={unreadCounts[userId] || 0}
                presence={usersPresence[userId]}
                onSelect={handleUserSelect}
              />
            )
          })}
        </List>
      )}
    </Card>
  )
}

