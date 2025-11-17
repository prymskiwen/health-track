import { Card, CardContent, Typography, Box, Grid, Chip } from '@mui/material'
import {
  Favorite,
  MonitorHeart,
  Thermostat,
  Scale,
} from '@mui/icons-material'
import { format } from 'date-fns'

export default function DailyHealthStatus({ healthData }) {
  if (!healthData || healthData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Daily Health Status
          </Typography>
          <Typography color="text.secondary">
            No health data available yet
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Get the most recent entry
  const latestEntry = healthData[0] // Already sorted by date desc
  const entryDate = format(new Date(latestEntry.date), 'EEEE, MMMM dd, yyyy')

  const metrics = [
    {
      label: 'Blood Pressure',
      value: latestEntry.bloodPressure || 'N/A',
      unit: 'mmHg',
      icon: <MonitorHeart />,
      color: '#8884d8',
    },
    {
      label: 'Heart Rate',
      value: latestEntry.heartRate || 'N/A',
      unit: 'bpm',
      icon: <Favorite />,
      color: '#82ca9d',
    },
    {
      label: 'Temperature',
      value: latestEntry.temperature || 'N/A',
      unit: '°F',
      icon: <Thermostat />,
      color: '#ffc658',
    },
    {
      label: 'Weight',
      value: latestEntry.weight || 'N/A',
      unit: 'kg',
      icon: <Scale />,
      color: '#ff7300',
    },
  ]

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Today's Health Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {entryDate}
            </Typography>
          </Box>
          <Chip
            label="Latest"
            color="primary"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Grid container spacing={3}>
          {metrics.map((metric) => (
            <Grid item xs={12} sm={6} md={3} key={metric.label}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    color: metric.color,
                    mb: 1,
                    '& svg': {
                      fontSize: 32,
                    },
                  }}
                >
                  {metric.icon}
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {metric.label}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${metric.color} 0%, ${metric.color}dd 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {metric.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {metric.unit}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        {latestEntry.notes && (
          <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="subtitle2" gutterBottom>
              Notes:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {latestEntry.notes}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

