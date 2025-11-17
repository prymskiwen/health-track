import { useEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import {
  People,
  LocalHospital,
  Chat,
  Assessment,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { getAllDoctors, getAllPatients } from '../services/userService'

export default function Dashboard() {
  const { userRole } = useAuth()
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const [doctorsResult, patientsResult] = await Promise.all([
      getAllDoctors(),
      getAllPatients(),
    ])

    setStats({
      doctors: doctorsResult.success ? doctorsResult.data.length : 0,
      patients: patientsResult.success ? patientsResult.data.length : 0,
    })
  }

  const statCards = [
    {
      title: 'Doctors',
      value: stats.doctors,
      icon: <LocalHospital sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      show: userRole === 'doctor',
    },
    {
      title: 'Patients',
      value: stats.patients,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#dc004e',
      show: true,
    },
    {
      title: 'Chats',
      value: 'Active',
      icon: <Chat sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      show: true,
    },
    {
      title: 'Reports',
      value: 'View',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      show: true,
    },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Welcome to HealthTrack Hospital Management System
      </Typography>
      <Grid container spacing={3}>
        {statCards
          .filter((card) => card.show)
          .map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        {card.title}
                      </Typography>
                      <Typography variant="h4">{card.value}</Typography>
                    </Box>
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Box>
  )
}

