import { Chip } from '@mui/material';
import { statusColor } from '../utils/format';

/**
 * Single source of truth for rendering a status as a colored MUI Chip.
 * Used in the DataGrid, AssetDetails, IssueList, etc. so the color mapping
 * lives in exactly one place (utils/format.statusColor).
 */
export default function StatusChip({ status, size = 'small', ...rest }) {
  if (!status) return null;
  return <Chip label={status} color={statusColor(status)} size={size} {...rest} />;
}
