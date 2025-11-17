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
import DailyHealthStatus from '../components/charts/DailyHealthStatus'
import DailyHealthList from '../components/charts/DailyHealthList'
import HealthDataForm from '../components/charts/HealthDataForm'
import {
  getAllPatients,
  getPatientHealthData,
  addPatientHealthData,
  getPatientByEmail,
} from '../services/userService'
import { useAuth } from '../context/AuthContext'

export default function Charts() {
  const { patientId: urlPatientId } = useParams()
  const navigate = useNavigate()
  const { currentUser, userRole } = useAuth()
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
      // Verify patient can only access their own data
      if (userRole === 'patient') {
        const patient = patients.find((p) => p.id === selectedPatientId)
        if (patient && patient.email !== currentUser.email) {
          // Patient trying to access another patient's data - redirect
          navigate('/charts')
          return
        }
      }
      loadHealthData()
    }
  }, [selectedPatientId, userRole, currentUser, patients, navigate])

  const loadPatients = async () => {
    if (userRole === 'patient') {
      // Patients can only see their own data
      const result = await getPatientByEmail(currentUser.email)
      if (result.success) {
        setSelectedPatientId(result.data.id)
        setPatients([result.data])
      }
    } else {
      // Doctors and admins can see all patients
      const result = await getAllPatients()
      if (result.success) {
        setPatients(result.data)
        if (urlPatientId && !selectedPatientId) {
          setSelectedPatientId(urlPatientId)
        }
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
          {userRole !== 'patient' && (
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/patients')}
            >
              Back
            </Button>
          )}
          <Typography variant="h4">
            {userRole === 'patient' ? 'My Health Charts' : 'Patient Health Charts'}
          </Typography>
        </Box>
        {(userRole === 'doctor' || userRole === 'admin') && selectedPatientId && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
          >
            Add Health Data
          </Button>
        )}
      </Box>

      {(userRole === 'doctor' || userRole === 'admin') && (
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
              {userRole === 'patient' ? 'My Health Data' : `Patient: ${selectedPatient.name}`}
            </Typography>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Daily Status Card - Show for patients prominently */}
              {userRole === 'patient' && (
                <DailyHealthStatus healthData={healthData} />
              )}
              
              {/* Historical Chart */}
              <Box sx={{ mt: userRole === 'patient' ? 3 : 0 }}>
                <PatientHealthChart
                  data={healthData}
                  title={userRole === 'patient' ? 'Health Trends Over Time' : 'Health Metrics Over Time'}
                />
              </Box>

              {/* Daily History Table */}
              {userRole === 'patient' && (
                <DailyHealthList healthData={healthData} />
              )}
            </>
          )}
        </>
      ) : (
        <Typography color="text.secondary">
          {userRole === 'patient'
            ? 'Loading your health data...'
            : 'Please select a patient to view health charts'}
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

