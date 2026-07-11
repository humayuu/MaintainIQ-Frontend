import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';

/**
 * Primary sidebar navigation. `match` decides the active item for a given
 * pathname (so /assets/123 still highlights "Assets").
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
];

export function activeNavLabel(pathname) {
  return NAV_ITEMS.find((i) => i.match(pathname))?.label ?? 'MaintainIQ';
}
