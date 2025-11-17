import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Chip } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import UserAvatar from '../common/UserAvatar'
import ActionsMenu from '../common/ActionsMenu'

/**
 * DoctorsTable component for displaying doctors in a table format
 * @param {Object} props
 * @param {Array} props.doctors - Array of doctor objects
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 */
export default function DoctorsTable({ doctors, onEdit, onDelete }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Specialty</TableCell>
            <TableCell>Experience</TableCell>
            <TableCell>Qualification</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <UserAvatar user={doctor} size={40} />
                  <Typography variant="body2" fontWeight={600}>
                    {doctor.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{doctor.email}</TableCell>
              <TableCell>
                {doctor.phone || (
                  <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.6 }}>
                    Not set
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {doctor.specialty ? (
                  <Chip label={doctor.specialty} size="small" />
                ) : (
                  <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.6 }}>
                    Not set
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {doctor.experience ? (
                  `${doctor.experience} years`
                ) : (
                  <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.6 }}>
                    Not specified
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {doctor.qualification || (
                  <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.6 }}>
                    Not set
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <ActionsMenu
                  actions={[
                    {
                      icon: <Edit />,
                      label: 'Edit',
                      onClick: () => onEdit(doctor),
                      color: 'primary',
                    },
                    {
                      icon: <Delete />,
                      label: 'Delete',
                      onClick: () => onDelete(doctor),
                      color: 'error',
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

