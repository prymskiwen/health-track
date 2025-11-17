import { Grid } from '@mui/material'
import DoctorCard from './DoctorCard'

/**
 * DoctorsGrid component for displaying doctors in a grid layout
 * @param {Object} props
 * @param {Array} props.doctors - Array of doctor objects
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 */
export default function DoctorsGrid({ doctors, onEdit, onDelete }) {
  return (
    <Grid container spacing={3}>
      {doctors.map((doctor) => (
        <Grid item xs={12} sm={6} md={4} key={doctor.id}>
          <DoctorCard doctor={doctor} onEdit={onEdit} onDelete={onDelete} />
        </Grid>
      ))}
    </Grid>
  )
}

