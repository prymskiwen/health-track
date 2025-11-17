import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material'
import { ArrowBack, Add } from '@mui/icons-material'
import PatientHealthChart from '../components/charts/PatientHealthChart'
import HealthDataForm from '../components/charts/HealthDataForm'
import { getAllPatients, getPatientHealthData, addPatientHealthData } from '../services/userService'
import { useAuth } from '../context/AuthContext'

export default function Charts() {
  const { patientId: urlPatientId } = useParams()
  const navigate = useNavigate()
  const { userRole } = useAuth()
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState(urlPatientId || '')
  const [healthData, setHealthData] = useState([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (selectedPatientId) {
      loadHealthData()
    }
  }, [selectedPatientId])

  const loadPatients = async () => {
    const result = await getAllPatients()
    if (result.success) {
      setPatients(result.data)
      if (urlPatientId && !selectedPatientId) {
        setSelectedPatientId(urlPatientId)
      }
    }
  }

  const loadHealthData = async () => {
    if (!selectedPatientId) return
    setLoading(true)
    const result = await getPatientHealthData(selectedPatientId)
    if (result.success) {
      setHealthData(result.data)
    }
    setLoading(false)
  }

  const handleAddData = async (formData) => {
    const result = await addPatientHealthData(selectedPatientId, formData)
    if (result.success) {
      setFormOpen(false)
      loadHealthData()
    }
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/patients')}
          >
            Back
          </Button>
          <Typography variant="h4">Patient Health Charts</Typography>
        </Box>
        {userRole === 'doctor' && selectedPatientId && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
          >
            Add Health Data
          </Button>
        )}
      </Box>

      {userRole === 'doctor' && (
        <FormControl fullWidth sx={{ mb: 3, maxWidth: 400 }}>
          <InputLabel>Select Patient</InputLabel>
          <Select
            value={selectedPatientId}
            label="Select Patient"
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            {patients.map((patient) => (
              <MenuItem key={patient.id} value={patient.id}>
                {patient.name} - {patient.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedPatientId ? (
        <>
          {selectedPatient && (
            <Typography variant="h6" gutterBottom>
              Patient: {selectedPatient.name}
            </Typography>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <PatientHealthChart
              data={healthData}
              title="Health Metrics Over Time"
            />
          )}
        </>
      ) : (
        <Typography color="text.secondary">
          Please select a patient to view health charts
        </Typography>
      )}

      <HealthDataForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAddData}
      />
    </Box>
  )
}

