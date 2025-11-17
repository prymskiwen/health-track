import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, Typography, Box } from '@mui/material'
import { format } from 'date-fns'

export default function PatientHealthChart({ data, title = 'Health Metrics' }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography color="text.secondary">
            No data available for visualization
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item) => ({
    date: format(new Date(item.date), 'MMM dd'),
    bloodPressure: item.bloodPressure || 0,
    heartRate: item.heartRate || 0,
    temperature: item.temperature || 0,
    weight: item.weight || 0,
  }))

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ width: '100%', height: 400, mt: 2 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="bloodPressure"
                stroke="#8884d8"
                name="Blood Pressure"
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="#82ca9d"
                name="Heart Rate"
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ffc658"
                name="Temperature (°F)"
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#ff7300"
                name="Weight (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

