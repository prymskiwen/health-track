import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'
import { ViewModule, TableChart } from '@mui/icons-material'

/**
 * ViewToggle component for switching between Grid and Table views
 * @param {Object} props
 * @param {string} props.view - Current view mode ('grid' or 'table')
 * @param {Function} props.onChange - Callback when view changes
 */
export default function ViewToggle({ view, onChange }) {
  const handleChange = (event, newView) => {
    if (newView !== null) {
      onChange(newView)
    }
  }

  return (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={handleChange}
      aria-label="view mode"
      size="small"
    >
      <ToggleButton value="grid" aria-label="grid view">
        <Tooltip title="Grid View">
          <ViewModule />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="table" aria-label="table view">
        <Tooltip title="Table View">
          <TableChart />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

