import { useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/authApi';
import uploadApi from '../api/uploadApi';
import PageHeader from '../components/PageHeader';
import PasswordField from '../components/PasswordField';

const ROLE_COLOR = { admin: 'primary', supervisor: 'warning', technician: 'secondary' };

/**
 * "My profile" — lets the signed-in user edit their own name, change their
 * avatar (uploaded to Cloudinary via /api/uploads), and change their password.
 * Email and role are read-only here (role changes are an admin concern).
 */
export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);

  // --- Profile (name + avatar) ---
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type, text }

  // --- Password ---
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const displayName = user?.name || user?.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const roleColor = ROLE_COLOR[user?.role] || 'default';

  const nameChanged = name.trim() !== '' && name.trim() !== (user?.name || '');

  // Upload the picked image, then persist its URL as the avatar.
  const handleAvatarPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setProfileMsg(null);
    setAvatarBusy(true);
    try {
      const { data } = await uploadApi.upload([file]);
      const url = data?.data?.urls?.[0];
      if (!url) throw new Error('Upload did not return a URL.');

      const { data: saved } = await authApi.updateProfile({ avatarUrl: url });
      updateUser(saved?.data?.user);
      setProfileMsg({ type: 'success', text: 'Profile photo updated.' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Could not update photo. Please try again.',
      });
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleSaveName = async () => {
    setProfileMsg(null);
    setSavingName(true);
    try {
      const { data } = await authApi.updateProfile({ name: name.trim() });
      updateUser(data?.data?.user);
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Could not save your profile.',
      });
    } finally {
      setSavingName(false);
    }
  };

  const pwMismatch = pw.confirm !== '' && pw.next !== pw.confirm;
  const canChangePw =
    pw.current !== '' && pw.next.length >= 6 && pw.next === pw.confirm && !savingPw;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.next !== pw.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setSavingPw(true);
    try {
      await authApi.changePassword({ currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: '', next: '', confirm: '' });
      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
    } catch (err) {
      setPwMsg({
        type: 'error',
        text: err.response?.data?.message || 'Could not change password.',
      });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <PageHeader title="My profile" subtitle="Manage your account details and password." />

      {/* Profile card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
            <Box sx={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
              <Avatar
                src={user?.avatarUrl || undefined}
                sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: '2rem' }}
              >
                {initial}
              </Avatar>
              <IconButton
                aria-label="Change photo"
                onClick={() => fileRef.current?.click()}
                disabled={avatarBusy}
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'background.paper' },
                }}
                size="small"
              >
                {avatarBusy ? (
                  <CircularProgress size={18} />
                ) : (
                  <PhotoCameraRoundedIcon fontSize="small" color="primary" />
                )}
              </IconButton>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarPick}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" noWrap>
                {displayName}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
                {user?.role && (
                  <Chip
                    label={user.role}
                    size="small"
                    color={roleColor}
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                Click the camera icon to change your photo.
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {profileMsg && (
            <Alert severity={profileMsg.type} sx={{ mb: 2 }}>
              {profileMsg.text}
            </Alert>
          )}

          <Stack spacing={2} sx={{ maxWidth: 420 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Email"
              value={user?.email || ''}
              fullWidth
              disabled
              helperText="Email can't be changed."
            />
            <Box>
              <Button
                variant="contained"
                onClick={handleSaveName}
                disabled={!nameChanged || savingName}
                startIcon={savingName ? <CircularProgress size={18} color="inherit" /> : <BadgeRoundedIcon />}
              >
                {savingName ? 'Saving…' : 'Save changes'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Password card */}
      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
              }}
            >
              <LockResetRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Change password
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Enter your current password to set a new one.
              </Typography>
            </Box>
          </Stack>

          {pwMsg && (
            <Alert severity={pwMsg.type} sx={{ mb: 2 }}>
              {pwMsg.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleChangePassword} noValidate>
            <Stack spacing={2} sx={{ maxWidth: 420 }}>
              <PasswordField
                label="Current password"
                value={pw.current}
                onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                fullWidth
                required
                autoComplete="current-password"
              />
              <PasswordField
                label="New password"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                fullWidth
                required
                autoComplete="new-password"
                helperText="At least 6 characters."
              />
              <PasswordField
                label="Confirm new password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                fullWidth
                required
                autoComplete="new-password"
                error={pwMismatch}
                helperText={pwMismatch ? 'Passwords do not match.' : ' '}
              />
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!canChangePw}
                  startIcon={savingPw ? <CircularProgress size={18} color="inherit" /> : <LockResetRoundedIcon />}
                >
                  {savingPw ? 'Updating…' : 'Update password'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
