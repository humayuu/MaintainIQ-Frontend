import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import PasswordField from '../components/PasswordField';
import { registerSchema } from '../validation/authSchemas';
import { applyServerErrors } from '../utils/formErrors';

const ROLES = ['admin', 'technician', 'supervisor'];

export default function Register() {
  const navigate = useNavigate();

  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'technician',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (values) => {
    setFormError('');
    try {
      // confirmPassword is a client-side check only — never sent to the API.
      const payload = { ...values };
      delete payload.confirmPassword;
      await authApi.register(payload);
      setSuccess(true);
    } catch (err) {
      const general = applyServerErrors(err, setError, ['name', 'email', 'password', 'role']);
      setFormError(general);
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

      {formError && (
        <Alert severity="error" sx={{ mt: 2.5 }}>
          {formError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2.5 }}>
        <Stack spacing={1}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                autoComplete="name"
                autoFocus
                error={!!errors.name}
                helperText={errors.name?.message ?? ' '}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                autoComplete="email"
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
                autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password?.message ?? ' '}
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <PasswordField
                {...field}
                label="Confirm password"
                fullWidth
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message ?? ' '}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required size="small" error={!!errors.role}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select {...field} labelId="role-label" label="Role">
                  {ROLES.map((role) => (
                    <MenuItem key={role} value={role} sx={{ textTransform: 'capitalize' }}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.role?.message ?? 'Role selection is for demo purposes only.'}
                </FormHelperText>
              </FormControl>
            )}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 1 }}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
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
          Account created! Check your email to verify, then sign in.
        </Alert>
      </Snackbar>
    </AuthShell>
  );
}
