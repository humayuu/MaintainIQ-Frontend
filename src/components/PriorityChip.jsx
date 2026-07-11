import { Chip } from '@mui/material';
import { priorityColor } from '../utils/format';

/**
 * Colored MUI Chip for an issue priority. Single source of truth for the
 * priority color mapping (Low=default, Medium=info, High=warning, Critical=error).
 */
export default function PriorityChip({ priority, size = 'small', ...rest }) {
  if (!priority) return null;
  return <Chip label={priority} color={priorityColor(priority)} size={size} {...rest} />;
}
