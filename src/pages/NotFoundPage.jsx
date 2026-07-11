import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1.5,
        px: 2,
      }}
    >
      <Typography
        component="div"
        sx={{
          fontSize: { xs: '5rem', md: '7rem' },
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: 'text.disabled',
          userSelect: 'none',
        }}
      >
        404
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        The page you are looking for doesn't exist or may have been moved.
        Let's get you back on track.
      </Typography>
      <Button
        component={RouterLink}
        to="/dashboard"
        variant="contained"
        startIcon={<HomeRoundedIcon />}
        sx={{ mt: 1.5 }}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
}
