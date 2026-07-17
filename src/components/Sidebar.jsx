import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
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
  // Hide admin-only items (e.g. Technicians) from non-admin users.
  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const go = (to) => {
    navigate(to);
    onNavigate?.();
  };

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
    </Box>
  );
}
