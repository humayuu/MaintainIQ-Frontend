import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { loginSchema } from '../validation/authSchemas';
import { applyServerErrors } from '../utils/formErrors';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  // Server/general error shown above the form (field-level errors render inline).
  const [formError, setFormError] = useState('');

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (values) => {
    setFormError('');
    try {
      const { data } = await authApi.login(values);
      // Backend envelope: { success, data: { token, user } }.
      const token = data?.data?.token ?? data?.token;
      const user = data?.data?.user ?? data?.user ?? null;
      if (!token) {
        throw new Error('No token returned by the server.');
      }
      login(token, user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // Map any server field errors inline; show the rest as a banner.
      const general = applyServerErrors(err, setError, ['email', 'password']);
      setFormError(general);
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

      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message ?? ' '}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordField
              {...field}
              label="Password"
              fullWidth
              margin="normal"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message ?? ' '}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isSubmitting}
          sx={{ mt: 2 }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
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
