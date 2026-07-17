import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Snackbar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import authApi from '../api/authApi';
import AuthShell from '../components/AuthShell';

const ROLES = ['admin', 'technician', 'supervisor'];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'technician',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Keep the button disabled until the user has started filling the form
  // (name, email and password all non-empty; role has a default).
  const canSubmit =
    form.name.trim() !== '' &&
    form.email.trim() !== '' &&
    form.password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(form);
      setSuccess(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  // After the success Snackbar is shown, send the user to /login.
  const handleSnackbarClose = () => {
    setSuccess(false);
    navigate('/login', { replace: true });
  };

  return (
    <AuthShell>
      <Stack spacing={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            color: 'primary.main',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          }}
        >
          <PersonAddAltRoundedIcon />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Create your account
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Set up your MaintainIQ workspace access.
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mt: 2.5 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2.5 }}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            autoComplete="name"
            autoFocus
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            autoComplete="email"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            autoComplete="new-password"
          />
          <FormControl fullWidth required size="small">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              {ROLES.map((role) => (
                <MenuItem key={role} value={role} sx={{ textTransform: 'capitalize' }}>
                  {role}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Role selection is for demo purposes only.</FormHelperText>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !canSubmit}
            sx={{ mt: 0.5 }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </Stack>
      </Box>

      <Typography
        variant="body2"
        sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}
      >
        Already have an account?{' '}
        <Link component={RouterLink} to="/login">
          Sign in
        </Link>
      </Typography>

      <Snackbar
        open={success}
        autoHideDuration={1800}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          Account created successfully! Please sign in.
        </Alert>
      </Snackbar>
    </AuthShell>
  );
}
