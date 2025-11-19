import { Box, TextField, IconButton } from '@mui/material'
import { Send } from '@mui/icons-material'

/**
 * ChatInput component - input field for sending messages
 * @param {Object} props
 * @param {string} props.value - Current message value
 * @param {Function} props.onChange - Callback when message changes
 * @param {Function} props.onSend - Callback when send button is clicked
 * @param {Function} props.onKeyDown - Callback when key is pressed
 */
export default function ChatInput({ value, onChange, onSend, onKeyDown }) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <TextField
        fullWidth
        placeholder="Type a message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <IconButton
        color="primary"
        onClick={onSend}
        disabled={!value.trim()}
      >
        <Send />
      </IconButton>
    </Box>
  )
}

