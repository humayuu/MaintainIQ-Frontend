import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Stack,
  Avatar,
  Typography,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import authApi from '../api/authApi';
import AuthShell from '../components/AuthShell';

// status: 'verifying' | 'success' | 'error'
export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Missing-token is knowable at first render, so seed state from it rather than
  // flipping it inside the effect (avoids a cascading re-render).
  const [status, setStatus] = useState(token ? 'verifying' : 'error');
  const [message, setMessage] = useState(
    token ? '' : 'This verification link is missing its token.',
  );
  const ran = useRef(false); // guard against React StrictMode double-invoke

  useEffect(() => {
    if (ran.current || !token) return;
    ran.current = true;

    authApi
      .verifyEmail({ token })
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified. You can now sign in.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err.response?.data?.message ||
            'This verification link is invalid or has expired.',
        );
      });
  }, [token]);

  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <AuthShell>
      <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', py: 2 }}>
        {status === 'verifying' ? (
          <>
            <CircularProgress />
            <Typography variant="h6">Verifying your email…</Typography>
            <Typography variant="body2" color="text.secondary">
              This will only take a moment.
            </Typography>
          </>
        ) : (
          <>
            <Avatar
              variant="rounded"
              sx={{
                width: 52,
                height: 52,
                bgcolor: (t) =>
                  alpha(isSuccess ? t.palette.success.main : t.palette.error.main, 0.12),
                color: isSuccess ? 'success.main' : 'error.main',
              }}
            >
              {isSuccess ? <MarkEmailReadRoundedIcon /> : <ErrorOutlineRoundedIcon />}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {isSuccess ? 'Email verified' : 'Verification failed'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340 }}>
              {message}
            </Typography>
            <Box sx={{ pt: 1, width: '100%' }}>
              {isSuccess ? (
                <Button component={RouterLink} to="/login" variant="contained" fullWidth size="large">
                  Go to sign in
                </Button>
              ) : (
                <Stack spacing={1.5}>
                  <Button component={RouterLink} to="/login" variant="contained" fullWidth size="large">
                    Back to sign in
                  </Button>
                  {isError && (
                    <Typography variant="caption" color="text.secondary">
                      Signed in? You can resend the link from your dashboard.
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          </>
        )}
      </Stack>
    </AuthShell>
  );
}
