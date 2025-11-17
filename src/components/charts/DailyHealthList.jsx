import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material'
import { format } from 'date-fns'

export default function DailyHealthList({ healthData }) {
  if (!healthData || healthData.length === 0) {
    return null
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Daily Health History
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2, background: 'transparent' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Date</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Blood Pressure
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Heart Rate
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Temperature
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Weight
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {healthData.map((entry) => (
                <TableRow
                  key={entry.id}
                  sx={{
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(entry.date), 'HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {entry.bloodPressure ? (
                      <Chip
                        label={`${entry.bloodPressure} mmHg`}
                        size="small"
                        sx={{ bgcolor: 'rgba(136, 132, 216, 0.2)' }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {entry.heartRate ? (
                      <Chip
                        label={`${entry.heartRate} bpm`}
                        size="small"
                        sx={{ bgcolor: 'rgba(130, 202, 157, 0.2)' }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {entry.temperature ? (
                      <Chip
                        label={`${entry.temperature} °F`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255, 198, 88, 0.2)' }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {entry.weight ? (
                      <Chip
                        label={`${entry.weight} kg`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255, 115, 0, 0.2)' }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {entry.notes || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

