import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Chip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Visibility, Edit, Delete, Assignment } from '@mui/icons-material'
import UserAvatar from '../common/UserAvatar'
import ActionsMenu from '../common/ActionsMenu'

/**
 * PatientsTable component for displaying patients in a table format
 * @param {Object} props
 * @param {Array} props.patients - Array of patient objects
 * @param {Array} props.doctors - Array of doctor objects (for assigned doctor lookup)
 * @param {string} props.userRole - Current user's role
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 * @param {Function} props.onAssign - Callback when assign doctor is clicked
 */
export default function PatientsTable({
  patients,
  doctors = [],
  userRole,
  onEdit,
  onDelete,
  onAssign,
}) {
  const navigate = useNavigate()

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Age</TableCell>
            <TableCell>Gender</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Assigned Doctor</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.map((patient) => {
            const actions = [
              {
                icon: <Visibility />,
                label: 'View Reports',
                onClick: () => navigate(`/reports/${patient.id}`),
                color: 'primary',
              },
              ...(userRole === 'doctor' || userRole === 'admin'
                ? [
                    ...(userRole === 'admin'
                      ? [
                          {
                            icon: <Assignment />,
                            label: 'Assign Doctor',
                            onClick: () => onAssign(patient),
                            color: 'secondary',
                          },
                        ]
                      : []),
                    {
                      icon: <Edit />,
                      label: 'Edit',
                      onClick: () => onEdit(patient),
                      color: 'success',
                    },
                    ...(userRole === 'admin'
                      ? [
                          {
                            icon: <Delete />,
                            label: 'Delete',
                            onClick: () => onDelete(patient),
                            color: 'error',
                          },
                        ]
                      : []),
                  ]
                : []),
            ]

            return (
              <TableRow key={patient.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <UserAvatar user={patient} size={40} />
                    <Typography variant="body2" fontWeight={600}>
                      {patient.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>
                  {patient.phone || (
                    <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.6 }}>
                      Not set
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {patient.age || (
                    <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.6 }}>
                      Not set
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {patient.gender ? (
                    <Chip label={patient.gender} size="small" />
                  ) : (
                    <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.6 }}>
                      Not set
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {patient.address || (
                    <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.6 }}>
                      Not set
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {patient.assignedDoctor ? (
                    doctors.find((d) => d.id === patient.assignedDoctor)?.name || 'Unknown'
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Not assigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <ActionsMenu actions={actions} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

