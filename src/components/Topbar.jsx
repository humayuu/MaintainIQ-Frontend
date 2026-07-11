import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useAuth } from '../context/AuthContext';
import { activeNavLabel } from './navConfig';

/**
 * Sticky top bar for the authenticated shell: mobile menu toggle, the current
 * section label, and the account menu.
 */
export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchor, setAnchor] = useState(null);

  const displayName = user?.name || user?.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    setAnchor(null);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        bgcolor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' } }}
          aria-label="Open navigation"
        >
          <MenuRoundedIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          {activeNavLabel(pathname)}
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, mr: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {displayName}
          </Typography>
          {user?.role && (
            <Chip
              label={user.role}
              size="small"
              color="secondary"
              sx={{ textTransform: 'capitalize', height: 22 }}
            />
          )}
        </Box>

        <Tooltip title="Account">
          <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small" sx={{ p: 0.25 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.95rem' }}>
              {initial}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: 2 } } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" noWrap>
              {displayName}
            </Typography>
            {user?.email && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            )}
          </Box>
          <Divider />
          <MenuItem disabled sx={{ opacity: '1 !important' }}>
            <ListItemIcon>
              <PersonRoundedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
              {user?.role || 'Member'}
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">Log out</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
