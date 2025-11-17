import { Grid } from '@mui/material'
import PatientCard from './PatientCard'

/**
 * PatientsGrid component for displaying patients in a grid layout
 * @param {Object} props
 * @param {Array} props.patients - Array of patient objects
 * @param {Array} props.doctors - Array of doctor objects (for assigned doctor lookup)
 * @param {string} props.userRole - Current user's role
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 * @param {Function} props.onAssign - Callback when assign doctor is clicked
 */
export default function PatientsGrid({
  patients,
  doctors = [],
  userRole,
  onEdit,
  onDelete,
  onAssign,
}) {
  return (
    <Grid container spacing={3}>
      {patients.map((patient) => (
        <Grid item xs={12} sm={6} md={4} key={patient.id}>
          <PatientCard
            patient={patient}
            doctors={doctors}
            userRole={userRole}
            onEdit={onEdit}
            onDelete={onDelete}
            onAssign={onAssign}
          />
        </Grid>
      ))}
    </Grid>
  )
}

