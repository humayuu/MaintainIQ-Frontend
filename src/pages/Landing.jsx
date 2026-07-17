import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Stack, Typography, Button, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: QrCode2RoundedIcon, title: 'QR asset tracking', desc: 'Scan any asset to pull up its full maintenance history in seconds.' },
  { icon: ReportProblemRoundedIcon, title: 'Issue management', desc: 'Log, assign and resolve faults before they turn into downtime.' },
  { icon: GroupsRoundedIcon, title: 'Technician roster', desc: 'Keep the right people on the right jobs across your whole team.' },
  { icon: InsightsRoundedIcon, title: 'Live dashboard', desc: 'A real-time view of asset health, open issues and workload.' },
  { icon: QrCodeScannerRoundedIcon, title: 'Printable QR labels', desc: 'Generate and print a scannable label for every asset you own.' },
  { icon: NotificationsActiveRoundedIcon, title: 'Service scheduling', desc: 'Track condition and next-service dates so nothing is overdue.' },
];

const STEPS = [
  { icon: Inventory2RoundedIcon, title: 'Add your assets', desc: 'Register equipment with category, location, condition and service dates.' },
  { icon: QrCodeScannerRoundedIcon, title: 'Print & scan QR labels', desc: 'Stick a QR label on each asset — scan it to report or review on the spot.' },
  { icon: TaskAltRoundedIcon, title: 'Track & resolve', desc: 'Assign issues to technicians and watch them through to completion.' },
];

/**
 * Screenshots. Drop the matching files into `public/screenshots/` (see the
 * README there). Leave `src` null to render a styled placeholder instead.
 */
const HERO_SHOT = { src: '/screenshots/dashboard.png', title: 'Dashboard overview' };

const SHOWCASE = [
  {
    src: '/screenshots/assets-list.png',
    tag: 'Asset register',
    title: 'Every asset in one place',
    desc: 'Browse, search and filter your whole fleet by status, category or location — with technician and condition at a glance.',
  },
  {
    src: '/screenshots/asset-details.png',
    tag: 'Asset records',
    title: 'Every asset, fully documented',
    desc: 'Condition, service schedule, manufacturer, model and a printable QR label — all on a single, clean asset page.',
  },
  {
    src: '/screenshots/register.png',
    tag: 'Onboarding',
    title: 'Get set up in minutes',
    desc: 'Create your workspace and invite your team with a simple, guided sign-up. No lengthy setup, no clutter.',
  },
  {
    src: '/screenshots/login.png',
    tag: 'Access',
    title: 'Secure sign-in for every role',
    desc: 'Admins, supervisors and technicians each get the right level of access from a fast, modern sign-in screen.',
  },
];

function BrandMark() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #1565C0 0%, #0EA5A5 100%)',
          boxShadow: '0 6px 16px -6px rgba(21,101,192,0.6)',
        }}
      >
        <BuildRoundedIcon sx={{ fontSize: 22 }} />
      </Box>
      <Typography component="span" sx={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
        Maintain
        <Box component="span" sx={{ color: 'primary.main' }}>IQ</Box>
      </Typography>
    </Box>
  );
}

/**
 * A browser-style frame that shows a screenshot, or a labelled placeholder
 * until a real image is provided. The image itself never overflows the frame.
 */
function ScreenshotFrame({ src, alt, aspect = '16 / 10' }) {
  // Fall back to the placeholder if there's no src or the image fails to load
  // (e.g. the file hasn't been added to public/screenshots/ yet).
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 8,
      }}
    >
      {/* Fake browser chrome */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.5,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (t) => alpha(t.palette.text.primary, 0.03),
        }}
      >
        {['#f87171', '#fbbf24', '#34d399'].map((c) => (
          <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
        ))}
      </Box>
      {showImage ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          sx={{ display: 'block', width: '100%', height: 'auto' }}
        />
      ) : (
        <Box
          sx={{
            aspect,
            width: '100%',
            display: 'grid',
            placeItems: 'center',
            color: 'text.secondary',
            background: (t) =>
              `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.06)} 0%, ${alpha(
                t.palette.secondary.main,
                0.08,
              )} 100%)`,
          }}
        >
          <Stack spacing={1} alignItems="center" sx={{ p: 2, textAlign: 'center' }}>
            <ImageRoundedIcon sx={{ fontSize: 40, opacity: 0.5 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {alt}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Screenshot coming soon
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const primaryTo = isAuthenticated ? '/dashboard' : '/register';
  const primaryLabel = isAuthenticated ? 'Go to dashboard' : 'Get started free';

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* ---- Top navigation ---- */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (t) => alpha(t.palette.background.paper, 0.85),
          backdropFilter: 'blur(8px)',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.5 }}>
            <BrandMark />
            <Stack direction="row" spacing={1.5} alignItems="center">
              {isAuthenticated ? (
                <Button component={RouterLink} to="/dashboard" variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
                  Go to dashboard
                </Button>
              ) : (
                <>
                  <Button component={RouterLink} to="/login" color="inherit" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                    Sign in
                  </Button>
                  <Button component={RouterLink} to="/register" variant="contained">
                    Get started
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ---- Hero ---- */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: (t) =>
            `radial-gradient(1200px 400px at 50% -10%, ${alpha(t.palette.primary.main, 0.14)} 0%, transparent 70%)`,
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 8 } }}>
          <Stack spacing={3} alignItems="center" textAlign="center" sx={{ maxWidth: 800, mx: 'auto' }}>
            <Chip
              label="Asset maintenance, simplified"
              color="primary"
              variant="outlined"
              sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.06), fontWeight: 600 }}
            />
            <Typography
              variant="h1"
              sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.4rem' }, lineHeight: 1.1 }}
            >
              Smarter upkeep for every asset you run.
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: { xs: '1rem', md: '1.15rem' }, maxWidth: 620 }}>
              MaintainIQ brings your equipment, issues and team into one clean, connected
              workspace — so nothing slips through the cracks.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button component={RouterLink} to={primaryTo} variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>
                {primaryLabel}
              </Button>
              {!isAuthenticated && (
                <Button component={RouterLink} to="/login" variant="outlined" size="large">
                  Sign in
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Hero screenshot */}
          <Box sx={{ mt: { xs: 5, md: 7 }, maxWidth: 980, mx: 'auto' }}>
            <ScreenshotFrame src={HERO_SHOT.src} alt={HERO_SHOT.title} />
          </Box>
        </Container>
      </Box>

      {/* ---- Features ---- */}
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 7 } }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
            Everything you need
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.7rem', md: '2.2rem' } }}>
            Built for the way maintenance teams work
          </Typography>
          <Typography sx={{ color: 'text.secondary', maxWidth: 560 }}>
            From the shop floor to the front office, every role gets the tools they need.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 2.5,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Box
              key={title}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'box-shadow .2s, transform .2s',
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  mb: 2,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                }}
              >
                <Icon />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      {/* ---- How it works ---- */}
      <Box sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.04), borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
          <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 7 } }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
              How it works
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.7rem', md: '2.2rem' } }}>
              Up and running in three steps
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            }}
          >
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <Box key={title} sx={{ textAlign: 'center', px: 2 }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #1565C0 0%, #0EA5A5 100%)',
                    boxShadow: '0 10px 24px -10px rgba(21,101,192,0.7)',
                  }}
                >
                  <Icon />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'background.paper',
                      color: 'primary.main',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      display: 'grid',
                      placeItems: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {i + 1}
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ---- Screenshot showcase ---- */}
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Stack spacing={{ xs: 6, md: 9 }}>
          {SHOWCASE.map((shot, i) => (
            <Box
              key={shot.title}
              sx={{
                display: 'grid',
                gap: { xs: 3, md: 5 },
                alignItems: 'center',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              }}
            >
              <Box sx={{ order: { md: i % 2 === 1 ? 2 : 1 } }}>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
                  {shot.tag}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                  {shot.title}
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '1.05rem' }}>
                  {shot.desc}
                </Typography>
              </Box>
              <Box sx={{ order: { md: i % 2 === 1 ? 1 : 2 } }}>
                <ScreenshotFrame src={shot.src} alt={shot.title} />
              </Box>
            </Box>
          ))}
        </Stack>
      </Container>

      {/* ---- Final CTA ---- */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            borderRadius: 4,
            px: { xs: 3, md: 8 },
            py: { xs: 6, md: 8 },
            textAlign: 'center',
            color: '#fff',
            background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #0EA5A5 100%)',
            boxShadow: 10,
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1.7rem', md: '2.3rem' } }}>
            Ready to get on top of maintenance?
          </Typography>
          <Typography sx={{ color: alpha('#fff', 0.85), mb: 4, maxWidth: 520, mx: 'auto' }}>
            Create your workspace in minutes and bring your whole team onto the same page.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            <Button
              component={RouterLink}
              to={primaryTo}
              size="large"
              sx={{ bgcolor: '#fff', color: 'primary.dark', fontWeight: 700, '&:hover': { bgcolor: alpha('#fff', 0.9) } }}
              endIcon={<ArrowForwardRoundedIcon />}
            >
              {primaryLabel}
            </Button>
            {!isAuthenticated && (
              <Button
                component={RouterLink}
                to="/login"
                size="large"
                variant="outlined"
                sx={{ color: '#fff', borderColor: alpha('#fff', 0.5), '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.1) } }}
              >
                Sign in
              </Button>
            )}
          </Stack>
        </Box>
      </Container>

      {/* ---- Footer ---- */}
      <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            sx={{ py: 3 }}
          >
            <BrandMark />
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} MaintainIQ. All rights reserved.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
