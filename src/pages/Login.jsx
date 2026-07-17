import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Stack,
  Avatar,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/authApi';
import AuthShell from '../components/AuthShell';
import PasswordField from '../components/PasswordField';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Keep the button disabled until the user has actually started filling
  // the form (both fields non-empty).
  const canSubmit = form.email.trim() !== '' && form.password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      // Backend envelope: { success, data: { token, user } }.
      const token = data?.data?.token ?? data?.token;
      const user = data?.data?.user ?? data?.user ?? null;
      if (!token) {
        throw new Error('No token returned by the server.');
      }
      login(token, user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <Stack spacing={1.25} sx={{ mb: 3 }}>
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
            color: 'primary.main',
            width: 44,
            height: 44,
          }}
        >
          <LoginRoundedIcon fontSize="small" />
        </Avatar>
        <Typography variant="h4">Welcome back</Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to your MaintainIQ account to continue.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          autoComplete="email"
          autoFocus
        />
        <PasswordField
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          autoComplete="current-password"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading || !canSubmit}
          sx={{ mt: 3 }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        Don&apos;t have an account?{' '}
        <Link component={RouterLink} to="/register">
          Create one
        </Link>
      </Typography>
    </AuthShell>
  );
}
