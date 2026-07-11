import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

/**
 * Friendly empty / zero-results placeholder used inside cards and tables.
 */
export default function EmptyState({
  icon: Icon = InboxRoundedIcon,
  title = 'Nothing here yet',
  description,
  action,
  dense = false,
}) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        px: 2,
        py: dense ? 4 : 7,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          mb: 0.5,
        }}
      >
        <Icon />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1.5 }}>{action}</Box>}
    </Box>
  );
}
