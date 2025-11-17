import { Card, CardContent, Typography, Box } from '@mui/material'
import { TrendingUp } from '@mui/icons-material'

/**
 * Reusable StatsCard component for displaying statistics
 * @param {Object} props
 * @param {string} props.title - The title of the stat card
 * @param {string|number} props.value - The value to display
 * @param {React.ReactNode} props.icon - The icon component to display
 * @param {string} props.gradient - CSS gradient string for the top border and value text
 * @param {string} props.iconBg - Background color for the icon container
 * @param {string} [props.footerText] - Optional footer text (default: "System operational")
 * @param {React.ReactNode} [props.footerIcon] - Optional footer icon (default: TrendingUp)
 */
export default function StatsCard({
  title,
  value,
  icon,
  gradient,
  iconBg,
  footerText = 'System operational',
  footerIcon = <TrendingUp sx={{ fontSize: 16, color: '#10b981' }} />,
}) {
  return (
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
          background: gradient,
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
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {footerIcon}
          <Typography variant="caption" color="text.secondary">
            {footerText}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

