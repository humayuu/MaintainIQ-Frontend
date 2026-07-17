import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Button, Tooltip } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../theme/ColorModeProvider';
import { activeNavLabel } from './navConfig';

/**
 * Sticky top bar for the authenticated shell: sidebar toggles (collapse on
 * desktop, drawer on mobile), the current section label, a theme switch, and a
 * logout action. Profile details live in the sidebar.
 */
export default function Topbar({ onMenuClick, onToggleCollapse, collapsed }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const isDark = mode === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        bgcolor: (t) =>
          t.palette.mode === 'dark' ? 'rgba(17,27,46,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 0.5 }}>
        {/* Mobile: open the drawer */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' } }}
          aria-label="Open navigation"
        >
          <MenuRoundedIcon />
        </IconButton>

        {/* Desktop: collapse / expand the sidebar */}
        <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <IconButton
            edge="start"
            onClick={onToggleCollapse}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <MenuRoundedIcon /> : <MenuOpenRoundedIcon />}
          </IconButton>
        </Tooltip>

        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, ml: 0.5 }}>
          {activeNavLabel(pathname)}
        </Typography>

        {/* Theme switch */}
        <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={toggleColorMode} aria-label="Toggle theme" sx={{ color: 'text.secondary' }}>
            {isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Tooltip>

        {/* Logout — labelled on desktop, icon-only on mobile */}
        <Button
          onClick={handleLogout}
          color="inherit"
          startIcon={<LogoutRoundedIcon />}
          sx={{ display: { xs: 'none', sm: 'inline-flex' }, fontWeight: 600, color: 'text.secondary' }}
        >
          Log out
        </Button>
        <Tooltip title="Log out">
          <IconButton
            onClick={handleLogout}
            aria-label="Log out"
            sx={{ display: { xs: 'inline-flex', sm: 'none' }, color: 'text.secondary' }}
          >
            <LogoutRoundedIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
