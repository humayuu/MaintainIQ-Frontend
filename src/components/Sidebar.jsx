import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import Brand from './Brand';
import { NAV_ITEMS } from './navConfig';
import { useAuth } from '../context/AuthContext';

export const SIDEBAR_WIDTH = 264;

/**
 * The persistent navigation rail. Rendered inside a permanent Drawer on
 * desktop and a temporary Drawer on mobile (see Layout).
 */
export default function Sidebar({ onNavigate }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  // Hide admin-only items (e.g. Users) from non-admin users.
  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const go = (to) => {
    navigate(to);
    onNavigate?.();
  };

  const displayName = user?.name || user?.email || 'User';
  const profileActive = pathname.startsWith('/profile');

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Brand />
      </Box>

      <Typography
        variant="overline"
        sx={{ px: 3, color: 'text.secondary', fontSize: '0.68rem' }}
      >
        Menu
      </Typography>

      <List sx={{ px: 1.5, py: 1, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton selected={active} onClick={() => go(item.to)}>
                <ListItemIcon sx={{ minWidth: 40, color: active ? 'primary.main' : 'text.secondary' }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 700 : 600,
                    color: active ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Account footer — opens the user's own profile page. */}
      <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton
          selected={profileActive}
          onClick={() => go('/profile')}
          sx={{ borderRadius: 2, py: 1 }}
        >
          <Avatar
            src={user?.avatarUrl || undefined}
            sx={{ width: 34, height: 34, mr: 1.25, bgcolor: 'primary.main', fontSize: '0.9rem' }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              View profile
            </Typography>
          </Box>
          {user?.role && (
            <Chip
              label={user.role}
              size="small"
              variant="outlined"
              sx={{ textTransform: 'capitalize', height: 20, fontSize: '0.65rem' }}
            />
          )}
        </ListItemButton>
      </Box>
    </Box>
  );
}
