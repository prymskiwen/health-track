import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  MenuItem,
} from '@mui/material'
import { Add, Edit, Delete, Visibility, Assignment } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import PatientForm from '../components/forms/PatientForm'
import {
  getAllPatients,
  getPatientsByDoctor,
  addPatient,
  updatePatient,
  deletePatient,
  assignPatientToDoctor,
  getAllDoctors,
} from '../services/userService'
import { useAuth } from '../context/AuthContext'

export default function Patients() {
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [patientToAssign, setPatientToAssign] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [doctors, setDoctors] = useState([])

  useEffect(() => {
    loadPatients()
    if (userRole === 'admin') {
      loadDoctors()
    }
  }, [])

  const loadDoctors = async () => {
    const result = await getAllDoctors()
    if (result.success) {
      setDoctors(result.data)
    }
  }

  const loadPatients = async () => {
    setLoading(true)
    let result
    if (userRole === 'doctor') {
      result = await getPatientsByDoctor(currentUser.uid)
    } else {
      result = await getAllPatients()
    }
    if (result.success) {
      setPatients(result.data)
    }
    setLoading(false)
  }

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
      const result = await deletePatient(patientToDelete.id)
      if (result.success) {
        loadPatients()
      }
    }
    setDeleteDialogOpen(false)
    setPatientToDelete(null)
  }

  const handleSubmit = async (formData) => {
    let result
    if (selectedPatient) {
      result = await updatePatient(selectedPatient.id, formData)
    } else {
      result = await addPatient(formData)
    }

    if (result.success) {
      setFormOpen(false)
      setSelectedPatient(null)
      loadPatients()
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Patients</Typography>
        {(userRole === 'doctor' || userRole === 'admin') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
          >
            Add Patient
          </Button>
        )}
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3}>
          {patients.map((patient) => (
            <Grid item xs={12} sm={6} md={4} key={patient.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {patient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {patient.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {patient.phone}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
                    <Chip label={`Age: ${patient.age}`} size="small" />
                    <Chip label={patient.gender} size="small" />
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    {patient.address}
                  </Typography>
                  {patient.assignedDoctor && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Assigned Doctor: {doctors.find(d => d.id === patient.assignedDoctor)?.name || 'Unknown'}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/charts/${patient.id}`)}
                    >
                      <Visibility />
                    </IconButton>
                    {(userRole === 'doctor' || userRole === 'admin') && (
                      <>
                        {userRole === 'admin' && (
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => {
                              setPatientToAssign(patient)
                              setSelectedDoctor(patient.assignedDoctor || '')
                              setAssignDialogOpen(true)
                            }}
                          >
                            <Assignment />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(patient)}
                        >
                          <Edit />
                        </IconButton>
                        {userRole === 'admin' && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(patient)}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <PatientForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedPatient(null)
        }}
        onSubmit={handleSubmit}
        initialData={selectedPatient}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Patient</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {patientToDelete?.name}? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Patient to Doctor</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Select Doctor"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
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
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (patientToAssign) {
                const result = await assignPatientToDoctor(
                  patientToAssign.id,
                  selectedDoctor || null
                )
                if (result.success) {
                  setAssignDialogOpen(false)
                  setPatientToAssign(null)
                  setSelectedDoctor('')
                  loadPatients()
                }
              }
            }}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

