import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

// Selling points shown on the branded panel.
const FEATURES = [
  {
    icon: QrCode2RoundedIcon,
    title: 'QR asset tracking',
    desc: 'Scan any asset to see its full maintenance history in seconds.',
  },
  {
    icon: ReportProblemRoundedIcon,
    title: 'Issue management',
    desc: 'Log, assign and resolve faults before they cause downtime.',
  },
  {
    icon: GroupsRoundedIcon,
    title: 'Technician roster',
    desc: 'Keep the right people on the right jobs across your team.',
  },
  {
    icon: InsightsRoundedIcon,
    title: 'Live insights',
    desc: 'A real-time dashboard of asset health and open work.',
  },
];

/**
 * Split-screen shell for the auth pages: a branded, gradient marketing panel
 * on the left (desktop only) and the form (children) on the right.
 *
 * The panel is scroll-safe: it never clips its content on short viewports and
 * collapses gracefully to a single column on tablet / mobile.
 */
export default function AuthShell({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left: brand + product highlights (hidden below md) */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: { md: 4, lg: 5 },
          width: { md: '45%', lg: '42%' },
          flexShrink: 0,
          px: { md: 4, lg: 7 },
          py: { md: 4, lg: 6 },
          color: '#fff',
          position: 'relative',
          // Clip the decorative glow horizontally, but let content scroll
          // vertically on short screens instead of being cut off.
          overflowX: 'hidden',
          overflowY: 'auto',
          background: 'linear-gradient(150deg, #0D47A1 0%, #1565C0 45%, #0EA5A5 100%)',
        }}
      >
        {/* Soft decorative glow */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: alpha('#fff', 0.12),
            filter: 'blur(8px)',
            pointerEvents: 'none',
          }}
        />

        {/* Brand lockup */}
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              bgcolor: alpha('#fff', 0.16),
            }}
          >
            <BuildRoundedIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box sx={{ lineHeight: 1 }}>
            <Typography component="span" sx={{ fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
              Maintain
              <Box component="span" sx={{ color: '#B9F5F2' }}>
                IQ
              </Box>
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: alpha('#fff', 0.75), mt: 0.25 }}>
              Asset Maintenance
            </Typography>
          </Box>
        </Box>

        {/* Headline + features */}
        <Box sx={{ position: 'relative' }}>
          <Typography
            sx={{
              fontWeight: 800,
              mb: 1.5,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              fontSize: { md: '1.9rem', lg: '2.4rem' },
            }}
          >
            Smarter upkeep for every asset you run.
          </Typography>
          <Typography sx={{ color: alpha('#fff', 0.8), mb: { md: 3, lg: 4 }, maxWidth: 420 }}>
            Track equipment, resolve issues and coordinate your team — all from one
            clean, connected workspace.
          </Typography>

          <Stack spacing={{ md: 1.75, lg: 2.5 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <Stack key={title} direction="row" spacing={1.75} alignItems="flex-start">
                <Box
                  sx={{
                    mt: 0.25,
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: alpha('#fff', 0.14),
                  }}
                >
                  <Icon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: alpha('#fff', 0.75) }}>
                    {desc}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography sx={{ position: 'relative', fontSize: '0.8rem', color: alpha('#fff', 0.6) }}>
          © {new Date().getFullYear()} MaintainIQ. All rights reserved.
        </Typography>
      </Box>

      {/* Right: the form */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          px: { xs: 2.5, sm: 4 },
          py: { xs: 4, sm: 5 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Compact brand — mobile / tablet only (left panel is hidden there) */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              gap: 1.25,
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
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
            <Typography component="span" sx={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
              Maintain
              <Box component="span" sx={{ color: 'primary.main' }}>
                IQ
              </Box>
            </Typography>
          </Box>

          {children}
        </Box>
      </Box>
    </Box>
  );
}
