import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Stack,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import assetApi from '../api/assetApi';
import { useAuth } from '../context/AuthContext';
import { ASSET_STATUSES } from '../utils/constants';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';

const INITIAL = {
  name: '',
  assetCode: '',
  category: '',
  location: '',
  status: 'Operational',
  condition: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  description: '',
};

export default function CreateAsset() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [assetCodeError, setAssetCodeError] = useState('');
  const [saving, setSaving] = useState(false);

  // Belt-and-suspenders: even though the route is protected, non-admins are
  // bounced from the create screen.
  if (user && user.role !== 'admin') {
    return <Navigate to="/assets" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'assetCode') setAssetCodeError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAssetCodeError('');
    setSaving(true);
    try {
      const { data } = await assetApi.create(form);
      // Backend envelope: { success, data: { asset } }.
      const created = data?.data?.asset ?? {};
      const newId = created.id ?? created._id;
      navigate(newId ? `/assets/${newId}` : '/assets');
    } catch (err) {
      if (err.response?.status === 409) {
        // Duplicate assetCode — surface it right under the field.
        setAssetCodeError(
          err.response?.data?.message || 'An asset with this code already exists.',
        );
      } else {
        setError(err.response?.data?.message || 'Failed to create asset.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <PageHeader
        onBack={() => navigate('/assets')}
        backLabel="Back to assets"
        title="Create Asset"
        subtitle="Register a new asset and generate its QR label."
      />

      <SectionCard
        title="Asset Details"
        subheader="Name and asset code are required — everything else is optional."
        icon={Inventory2RoundedIcon}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Asset Code"
                name="assetCode"
                value={form.assetCode}
                onChange={handleChange}
                fullWidth
                required
                error={Boolean(assetCodeError)}
                helperText={assetCodeError || 'Unique identifier for this asset.'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="create-status">Status</InputLabel>
                <Select
                  labelId="create-status"
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {ASSET_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Condition"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                fullWidth
                helperText="Optional — e.g. New, Good, Fair, Poor."
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Manufacturer"
                name="manufacturer"
                value={form.manufacturer}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Model"
                name="model"
                value={form.model}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Serial Number"
                name="serialNumber"
                value={form.serialNumber}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1.5}
            justifyContent="flex-end"
            sx={{ mt: 3 }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/assets')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving}
              startIcon={
                saving ? <CircularProgress size={18} color="inherit" /> : <AddRoundedIcon />
              }
            >
              {saving ? 'Creating…' : 'Create Asset'}
            </Button>
          </Stack>
        </Box>
      </SectionCard>
    </Box>
  );
}
