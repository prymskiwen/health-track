import { Box, Card, CardContent, Typography, Chip } from '@mui/material'
import { Email, Phone, School, AccessTime } from '@mui/icons-material'
import UserAvatar from '../common/UserAvatar'
import ActionsMenu from '../common/ActionsMenu'
import { getDoctorActions } from '../../utils/actions'

/**
 * DoctorCard component for displaying a single doctor in card format
 * @param {Object} props
 * @param {Object} props.doctor - Doctor object
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 */
export default function DoctorCard({ doctor, onEdit, onDelete }) {
  return (
    <Card
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        boxShadow: 'none',
      }}
    >
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
        <ActionsMenu
          actions={getDoctorActions(doctor, { onEdit, onDelete })}
        />
      </Box>
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <UserAvatar user={doctor} size={64} showBorder />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {doctor.name}
            </Typography>
            {doctor.specialty ? (
              <Chip
                label={doctor.specialty}
                size="small"
                sx={{
                  mt: 0.5,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#818cf8',
                  fontWeight: 600,
                }}
              />
            ) : (
              <Chip
                label="Specialty not set"
                size="small"
                variant="outlined"
                sx={{ mt: 0.5, opacity: 0.6 }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Email sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {doctor.email}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Phone sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {doctor.phone || (
                <Typography component="span" sx={{ fontStyle: 'italic', opacity: 0.6 }}>
                  Phone not set
                </Typography>
              )}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <AccessTime sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {doctor.experience ? (
                <>
                  <Typography component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {doctor.experience}
                  </Typography>
                  {' years experience'}
                </>
              ) : (
                <Typography component="span" sx={{ fontStyle: 'italic', opacity: 0.6 }}>
                  Experience not specified
                </Typography>
              )}
            </Typography>
          </Box>

          {doctor.qualification && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
              <School sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.7, mt: 0.25 }} />
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {doctor.qualification}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

