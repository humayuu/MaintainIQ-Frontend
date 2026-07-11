// Shared enums used across asset/issue screens. These mirror the backend
// Mongoose schema enums exactly (see Asset.js / Issue.js).

// Asset.status enum — NOTE: 'Waiting for Parts' is an ISSUE status, not an
// asset status, so it must not appear here (the backend would reject it).
export const ASSET_STATUSES = [
  'Operational',
  'Issue Reported',
  'Under Inspection',
  'Under Maintenance',
  'Out of Service',
  'Retired',
];

// Issue.status enum.
export const ISSUE_STATUSES = [
  'Reported',
  'Assigned',
  'Inspection Started',
  'Maintenance In Progress',
  'Waiting for Parts',
  'Resolved',
  'Closed',
  'Reopened',
];

export const ISSUE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
