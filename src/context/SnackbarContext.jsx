import { useState } from 'react'
import { Snackbar, Alert } from '@mui/material'
import { SnackbarContext } from './snackbarContext'

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  })

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    })
  }

  const showSuccess = (message) => {
    showSnackbar(message, 'success')
  }

  const showError = (message) => {
    showSnackbar(message, 'error')
  }

  const showWarning = (message) => {
    showSnackbar(message, 'warning')
  }

  const showInfo = (message) => {
    showSnackbar(message, 'info')
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbar({ ...snackbar, open: false })
  }

  const value = {
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

