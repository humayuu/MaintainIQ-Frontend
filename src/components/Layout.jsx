import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Drawer } from '@mui/material';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Topbar from './Topbar';
import Brand from './Brand';

// Routes that render WITHOUT the authenticated dashboard shell.
const isAuthRoute = (p) => p === '/login' || p === '/register';
const isPublicAsset = (p) => p.startsWith('/asset/');

/**
 * Minimal chrome for unauthenticated / public pages: a slim brand bar over a
 * soft canvas. Used for login, register and the public QR asset page.
 */
function BareLayout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Brand />
      </Box>
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
    </Box>
  );
}

/**
 * Authenticated dashboard shell: fixed sidebar (permanent on desktop, a
 * temporary drawer on mobile) + sticky top bar + scrolling content.
 */
function DashboardShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile: temporary drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', border: 0 },
          }}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </Drawer>

        {/* Desktop: fixed permanent drawer */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              border: 0,
            },
          }}
        >
          <Sidebar />
        </Drawer>
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5, md: 3.5 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const bare = isAuthRoute(pathname) || isPublicAsset(pathname);
  return bare ? <BareLayout /> : <DashboardShell />;
}
