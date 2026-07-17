// Formatting helpers shared across pages.

// Format an ISO/date string into a friendly "Jan 5, 2026" style. Returns a
// dash when the value is missing or unparseable — never throws.
export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// A MongoDB ObjectId encodes its creation time in its first 4 bytes. When the
// API doesn't return an explicit `createdAt`, we can still recover the record's
// creation date from its _id. Returns a Date, or null if `id` isn't an ObjectId.
export function dateFromObjectId(id) {
  if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) return null;
  return new Date(parseInt(id.slice(0, 8), 16) * 1000);
}

// Like formatDate but includes the time — for activity/history timestamps.
export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Map an asset/issue status string to an MUI color for Chips.
export function statusColor(status) {
  switch (status) {
    // Asset statuses
    case 'Operational':
      return 'success';
    case 'Issue Reported':
    case 'Under Inspection':
    case 'Under Maintenance':
      return 'warning';
    case 'Out of Service':
    case 'Retired':
      return 'error';

    // Issue statuses
    case 'Resolved':
      return 'success';
    case 'Assigned':
    case 'Inspection Started':
      return 'info';
    case 'Reported':
    case 'Maintenance In Progress':
    case 'Waiting for Parts':
      return 'warning';
    case 'Reopened':
      return 'error';
    case 'Closed':
      return 'default';

    default:
      return 'default';
  }
}

// Map an issue priority to an MUI color for Chips.
export function priorityColor(priority) {
  switch (priority) {
    case 'Medium':
      return 'info';
    case 'High':
      return 'warning';
    case 'Critical':
      return 'error';
    case 'Low':
    default:
      return 'default';
  }
}
