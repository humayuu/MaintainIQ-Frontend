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
  Tooltip,
} from '@mui/material';
import Brand from './Brand';
import { NAV_ITEMS } from './navConfig';
import { useAuth } from '../context/AuthContext';

export const SIDEBAR_WIDTH = 264;
export const SIDEBAR_COLLAPSED_WIDTH = 76;

/**
 * The persistent navigation rail. Rendered inside a permanent Drawer on desktop
 * (where `collapsed` shrinks it to an icon-only rail) and a temporary Drawer on
 * mobile (always full width). See Layout.
 */
export default function Sidebar({ onNavigate, collapsed = false }) {
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
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ px: collapsed ? 0 : 2.5, py: 2.5, display: 'flex', justifyContent: 'center' }}>
        <Brand compact={collapsed} />
      </Box>

      {!collapsed && (
        <Typography
          variant="overline"
          sx={{ px: 3, color: 'text.secondary', fontSize: '0.68rem' }}
        >
          Menu
        </Typography>
      )}

      <List sx={{ px: 1.5, py: 1, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  selected={active}
                  onClick={() => go(item.to)}
                  sx={{ justifyContent: collapsed ? 'center' : 'flex-start', px: collapsed ? 1 : 2 }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 40,
                      justifyContent: 'center',
                      color: active ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: active ? 700 : 600,
                        color: active ? 'primary.main' : 'text.primary',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Account footer — opens the user's own profile page. */}
      <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Tooltip title={collapsed ? `${displayName} · View profile` : ''} placement="right">
          <ListItemButton
            selected={profileActive}
            onClick={() => go('/profile')}
            sx={{ borderRadius: 2, py: 1, justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <Avatar
              src={user?.avatarUrl || undefined}
              sx={{
                width: 34,
                height: 34,
                mr: collapsed ? 0 : 1.25,
                bgcolor: 'primary.main',
                fontSize: '0.9rem',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            {!collapsed && (
              <>
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
              </>
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
