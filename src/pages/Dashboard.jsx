import { useEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material'
import {
  People,
  LocalHospital,
  Chat,
  Assessment,
  TrendingUp,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { getAllDoctors, getAllPatients } from '../services/userService'

export default function Dashboard() {
  const { userRole, currentUser } = useAuth()
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    const [doctorsResult, patientsResult] = await Promise.all([
      getAllDoctors(),
      getAllPatients(),
    ])

    setStats({
      doctors: doctorsResult.success ? doctorsResult.data.length : 0,
      patients: patientsResult.success ? patientsResult.data.length : 0,
    })
    setLoading(false)
  }

  const statCards = [
    {
      title: 'Doctors',
      value: stats.doctors,
      icon: <LocalHospital />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      iconBg: 'rgba(99, 102, 241, 0.2)',
      show: userRole === 'doctor',
    },
    {
      title: 'Patients',
      value: stats.patients,
      icon: <People />,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
      iconBg: 'rgba(236, 72, 153, 0.2)',
      show: true,
    },
    {
      title: 'Active Chats',
      value: 'Live',
      icon: <Chat />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      iconBg: 'rgba(16, 185, 129, 0.2)',
      show: true,
    },
    {
      title: 'Reports',
      value: 'View',
      icon: <Assessment />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      iconBg: 'rgba(245, 158, 11, 0.2)',
      show: true,
    },
  ]

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Welcome back, {currentUser?.displayName?.split(' ')[0] || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your hospital management system
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress sx={{ borderRadius: 2, mb: 3 }} />
      ) : (
        <Grid container spacing={3}>
          {statCards
            .filter((card) => card.show)
            .map((card, index) => (
              <Grid item xs={12} sm={6} md={6} lg={3} key={card.title}>
                <Card
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: card.gradient,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1, fontWeight: 500 }}
                        >
                          {card.title}
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 700,
                            background: card.gradient,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {card.value}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          background: card.iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        {card.icon}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp sx={{ fontSize: 16, color: '#10b981' }} />
                      <Typography variant="caption" color="text.secondary">
                        System operational
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </Box>
  )
}

