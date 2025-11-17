import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import PatientForm from '../components/forms/PatientForm'
import ViewToggle from '../components/common/ViewToggle'
import PatientsGrid from '../components/patients/PatientsGrid'
import PatientsTable from '../components/patients/PatientsTable'
import { usePatients } from '../hooks/usePatients'
import { useDoctors } from '../hooks/useDoctors'
import { useAuth } from '../context/AuthContext'

export default function Patients() {
  const { userRole } = useAuth()
  const {
    patients,
    loading,
    createPatient,
    updatePatient,
    deletePatient,
    assignPatient,
  } = usePatients()
  const { doctors } = useDoctors({ autoLoad: userRole === 'admin' })
  const [viewMode, setViewMode] = useState('grid')
  const [formOpen, setFormOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [patientToAssign, setPatientToAssign] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState('')

  const handleAdd = () => {
    setSelectedPatient(null)
    setFormOpen(true)
  }

  const handleEdit = (patient) => {
    setSelectedPatient(patient)
    setFormOpen(true)
  }

  const handleDelete = (patient) => {
    setPatientToDelete(patient)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (patientToDelete) {
      await deletePatient(patientToDelete.id)
    }
    setDeleteDialogOpen(false)
    setPatientToDelete(null)
  }

  const handleSubmit = async (formData) => {
    let result
    if (selectedPatient) {
      result = await updatePatient(selectedPatient.id, formData)
    } else {
      result = await createPatient(formData)
    }

    if (result.success) {
      setFormOpen(false)
      setSelectedPatient(null)
    }
  }

  const handleAssign = (patient) => {
    setPatientToAssign(patient)
    setSelectedDoctor(patient.assignedDoctor || '')
    setAssignDialogOpen(true)
  }

  const handleAssignConfirm = async () => {
    if (patientToAssign) {
      const result = await assignPatient(
        patientToAssign.id,
        selectedDoctor || null
      )
      if (result.success) {
        setAssignDialogOpen(false)
        setPatientToAssign(null)
        setSelectedDoctor('')
      }
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setSelectedPatient(null)
  }

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false)
  }

  const handleAssignDialogClose = () => {
    setAssignDialogOpen(false)
  }

  const handleSelectedDoctorChange = (e) => {
    setSelectedDoctor(e.target.value)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Patients</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {userRole === 'admin' && (
            <>
              <ViewToggle view={viewMode} onChange={setViewMode} />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAdd}
              >
                Add Patient
              </Button>
            </>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : patients.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No patients found</Typography>
        </Box>
      ) : (
        viewMode === 'grid' ? (
          <PatientsGrid
            patients={patients}
            doctors={doctors}
            userRole={userRole}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAssign={handleAssign}
          />
        ) : (
          <PatientsTable
            patients={patients}
            doctors={doctors}
            userRole={userRole}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAssign={handleAssign}
          />
        )
      )}

      <PatientForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
        initialData={selectedPatient}
      />

      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Patient</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {patientToDelete?.name}? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignDialogOpen} onClose={handleAssignDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Patient to Doctor</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Select Doctor"
            value={selectedDoctor}
            onChange={handleSelectedDoctorChange}
            sx={{ mt: 2 }}
          >
            <MenuItem value="">None</MenuItem>
            {doctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialty}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignConfirm}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

