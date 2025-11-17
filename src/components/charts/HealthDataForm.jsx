import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from '@mui/material'

export default function HealthDataForm({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    notes: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      bloodPressure: parseFloat(formData.bloodPressure),
      heartRate: parseFloat(formData.heartRate),
      temperature: parseFloat(formData.temperature),
      weight: parseFloat(formData.weight),
    })
    setFormData({
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      notes: '',
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Health Data</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Blood Pressure"
                name="bloodPressure"
                type="number"
                value={formData.bloodPressure}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Heart Rate (bpm)"
                name="heartRate"
                type="number"
                value={formData.heartRate}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Temperature (°F)"
                name="temperature"
                type="number"
                value={formData.temperature}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Add
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

