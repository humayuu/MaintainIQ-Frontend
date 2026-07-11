import { Box, Typography } from '@mui/material';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';

/**
 * MaintainIQ logo lockup: a gradient badge + wordmark. `compact` shows the
 * badge only (used when the sidebar is collapsed / on tight bars).
 */
export default function Brand({ compact = false, color = 'text.primary', sx }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, ...sx }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          background: 'linear-gradient(135deg, #1565C0 0%, #0EA5A5 100%)',
          boxShadow: '0 6px 16px -6px rgba(21,101,192,0.6)',
          flexShrink: 0,
        }}
      >
        <BuildRoundedIcon sx={{ fontSize: 22 }} />
      </Box>
      {!compact && (
        <Box sx={{ lineHeight: 1 }}>
          <Typography
            component="span"
            sx={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color }}
          >
            Maintain
            <Box component="span" sx={{ color: 'primary.main' }}>
              IQ
            </Box>
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: 'block', color: 'text.secondary', fontWeight: 600, mt: 0.25 }}
          >
            Asset Maintenance
          </Typography>
        </Box>
      )}
    </Box>
  );
}
