import { Box, Card, CardContent, Typography, Chip } from '@mui/material'
import { Email, Phone, Person, LocationOn, LocalHospital } from '@mui/icons-material'
import { Visibility, Edit, Delete, Assignment } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import UserAvatar from '../common/UserAvatar'
import ActionsMenu from '../common/ActionsMenu'

/**
 * PatientCard component for displaying a single patient in card format
 * @param {Object} props
 * @param {Object} props.patient - Patient object
 * @param {Array} props.doctors - Array of doctor objects (for assigned doctor lookup)
 * @param {string} props.userRole - Current user's role
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 * @param {Function} props.onAssign - Callback when assign doctor is clicked
 */
export default function PatientCard({
  patient,
  doctors = [],
  userRole,
  onEdit,
  onDelete,
  onAssign,
}) {
  const navigate = useNavigate()

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
    <Card
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(236, 72, 153, 0.2)',
        boxShadow: 'none',
      }}
    >
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
        <ActionsMenu actions={actions} />
      </Box>
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <UserAvatar user={patient} size={64} showBorder />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {patient.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {patient.age ? (
                <Chip
                  icon={<Person sx={{ fontSize: 14 }} />}
                  label={`Age: ${patient.age}`}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(244, 114, 182, 0.2) 100%)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    color: '#f472b6',
                    fontWeight: 600,
                  }}
                />
              ) : (
                <Chip
                  label="Age: Not set"
                  size="small"
                  variant="outlined"
                  sx={{ opacity: 0.6 }}
                />
              )}
              {patient.gender ? (
                <Chip
                  label={patient.gender}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(244, 114, 182, 0.2) 100%)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    color: '#f472b6',
                    fontWeight: 600,
                  }}
                />
              ) : (
                <Chip
                  label="Gender: Not set"
                  size="small"
                  variant="outlined"
                  sx={{ opacity: 0.6 }}
                />
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Email sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {patient.email}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Phone sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {patient.phone || (
                <Typography component="span" sx={{ fontStyle: 'italic', opacity: 0.6 }}>
                  Phone not set
                </Typography>
              )}
            </Typography>
          </Box>

          {patient.address && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
              <LocationOn sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.7, mt: 0.25 }} />
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {patient.address}
              </Typography>
            </Box>
          )}

          {patient.assignedDoctor && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mt: 2,
                pt: 2,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <LocalHospital sx={{ fontSize: 18, color: 'primary.main', opacity: 0.8 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                  Assigned Doctor
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.light' }}>
                  {doctors.find((d) => d.id === patient.assignedDoctor)?.name || 'Unknown'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

