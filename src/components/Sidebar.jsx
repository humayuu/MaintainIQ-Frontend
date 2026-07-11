import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Avatar,
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

  const go = (to) => {
    navigate(to);
    onNavigate?.();
  };

  const displayName = user?.name || user?.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();

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
        {NAV_ITEMS.map((item) => {
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

      {/* User card */}
      <Box sx={{ p: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            p: 1.25,
            borderRadius: 2,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.95rem' }}>
            {initial}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
              {displayName}
            </Typography>
            {user?.role && (
              <Chip
                label={user.role}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ height: 18, fontSize: '0.65rem', textTransform: 'capitalize', mt: 0.25 }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
