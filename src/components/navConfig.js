import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';

/**
 * Primary sidebar navigation. `match` decides the active item for a given
 * pathname (so /assets/123 still highlights "Assets"). Items flagged
 * `adminOnly` are only rendered for users with the admin role (see Sidebar).
 */
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: SpaceDashboardRoundedIcon,
    match: (p) => p === '/' || p.startsWith('/dashboard'),
  },
  {
    label: 'Assets',
    to: '/assets',
    icon: Inventory2RoundedIcon,
    match: (p) => p.startsWith('/assets'),
  },
  {
    label: 'Issues',
    to: '/issues',
    icon: ReportProblemRoundedIcon,
    match: (p) => p.startsWith('/issues'),
  },
  {
    label: 'Users',
    to: '/users',
    icon: GroupRoundedIcon,
    match: (p) => p.startsWith('/users') || p.startsWith('/technicians'),
    adminOnly: true,
  },
];

export function activeNavLabel(pathname) {
  return NAV_ITEMS.find((i) => i.match(pathname))?.label ?? 'MaintainIQ';
}
