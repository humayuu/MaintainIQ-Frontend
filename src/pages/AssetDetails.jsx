import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Stack,
  Typography,
  Button,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
  Skeleton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import assetApi from '../api/assetApi';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotifyContext';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusChip from '../components/StatusChip';
import AssetHistory from '../components/AssetHistory';
import { ASSET_STATUSES } from '../utils/constants';
import { formatDate } from '../utils/format';

function Field({ label, children }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.25 }}>
        {children ?? '—'}
      </Typography>
    </Box>
  );
}

const EDITABLE_FIELDS = ['name', 'assetCode', 'category', 'location', 'status'];

export default function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notify = useNotify();
  const isAdmin = user?.role === 'admin';

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState(0);

  const [qrSrc, setQrSrc] = useState('');
  const [labelLoading, setLabelLoading] = useState(false);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadAsset() {
      setLoading(true);
      setLoadError('');
      try {
        const { data } = await assetApi.getById(id);
        if (!active) return;
        // Backend envelope: { success, data: { asset } }.
        setAsset(data?.data?.asset ?? null);
      } catch (err) {
        if (!active) return;
        setLoadError(err.response?.data?.message || 'Failed to load asset.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAsset();
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  // QR image (best-effort — doesn't block the page). The QR is a base64
  // data-URL string at data.data.qr.
  useEffect(() => {
    let active = true;
    assetApi
      .getQr(id)
      .then(({ data }) => {
        if (!active) return;
        setQrSrc(typeof data?.data?.qr === 'string' ? data.data.qr : '');
      })
      .catch(() => {
        if (active) setQrSrc('');
      });
    return () => {
      active = false;
    };
  }, [id]);

  // The label endpoint returns JSON ({ org, assetName, assetCode, location, qr,
  // scanInstruction }) where `qr` is a base64 PNG data-URL — NOT a binary blob.
  // Render it into a print-ready window the user can print or save as PDF.
  const handleDownloadLabel = async () => {
    setLabelLoading(true);
    try {
      const { data } = await assetApi.getLabel(id);
      const label = data?.data ?? {};
      const win = window.open('', '_blank', 'width=460,height=640');
      if (!win) {
        notify.warning('Please allow pop-ups to print the label.');
        return;
      }
      const esc = (s) =>
        String(s ?? '').replace(
          /[&<>"]/g,
          (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]),
        );
      const qrTag =
        typeof label.qr === 'string' && label.qr.startsWith('data:')
          ? `<img src="${label.qr}" alt="QR code" />`
          : '<div class="noqr">QR unavailable</div>';

      win.document.write(`<!doctype html><html><head><meta charset="utf-8" />
        <title>${esc(label.assetName || asset?.name || 'Asset')} — Label</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; font-family: 'Inter', 'Segoe UI', Roboto, Arial, sans-serif; color: #0F172A;
                 display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #F5F7FA; }
          .label { width: 340px; padding: 24px; border: 1px solid #E3E9F0; border-radius: 16px; background: #fff;
                   text-align: center; box-shadow: 0 8px 28px -12px rgba(15,23,42,.25); }
          .org { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #1565C0; font-weight: 800; }
          .name { font-size: 22px; font-weight: 800; margin: 6px 0 2px; }
          .code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 14px; color: #334155; }
          .loc { font-size: 13px; color: #64748B; margin-top: 4px; }
          img { width: 220px; height: 220px; margin: 16px auto 8px; display: block; }
          .noqr { width: 220px; height: 220px; margin: 16px auto; display: grid; place-items: center;
                  border: 1px dashed #CFD8E3; border-radius: 12px; color: #64748B; font-size: 13px; }
          .scan { font-size: 12px; color: #64748B; }
          @media print { body { background: #fff; min-height: auto; } .label { border: none; box-shadow: none; } }
        </style></head>
        <body>
          <div class="label">
            <div class="org">${esc(label.org || 'MaintainIQ')}</div>
            <div class="name">${esc(label.assetName || asset?.name || 'Asset')}</div>
            <div class="code">${esc(label.assetCode || asset?.assetCode || '')}</div>
            ${label.location ? `<div class="loc">${esc(label.location)}</div>` : ''}
            ${qrTag}
            <div class="scan">${esc(label.scanInstruction || 'Scan to report an issue or view this asset.')}</div>
          </div>
          <script>window.onload=function(){window.focus();setTimeout(function(){window.print();},250);};</script>
        </body></html>`);
      win.document.close();
    } catch {
      notify.error('Could not generate label.');
    } finally {
      setLabelLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const slug = asset?.slug || asset?.publicSlug;
    if (!slug) {
      notify.warning('No public link available for this asset.');
      return;
    }
    const link = `${window.location.origin}/asset/${slug}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard API unavailable (e.g. non-secure context) — still confirm.
    }
    notify.success('Link copied');
  };

  const openEdit = () => {
    const initial = {};
    EDITABLE_FIELDS.forEach((f) => {
      const v = asset?.[f];
      initial[f] = v && typeof v === 'object' ? v.name ?? '' : v ?? '';
    });
    setEditForm(initial);
    setEditError('');
    setEditOpen(true);
  };

  const handleEditChange = (e) =>
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setEditError('');
    try {
      await assetApi.update(id, editForm);
      setEditOpen(false);
      notify.success('Asset updated');
      setReloadKey((k) => k + 1); // trigger a refetch
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update asset.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Skeleton variant="text" width={150} height={28} sx={{ mb: 1.5 }} />
        <Skeleton variant="text" width={280} height={44} />
        <Skeleton variant="text" width={160} height={24} sx={{ mb: 3 }} />
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <PageHeader
          title="Asset"
          onBack={() => navigate('/assets')}
          backLabel="Back to assets"
        />
        <Alert severity="error">{loadError}</Alert>
      </Box>
    );
  }

  const technicianName =
    asset?.assignedTechnician && typeof asset.assignedTechnician === 'object'
      ? asset.assignedTechnician.name
      : asset?.assignedTechnician;

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <PageHeader
        title={asset?.name || 'Asset'}
        subtitle={asset?.assetCode}
        onBack={() => navigate('/assets')}
        backLabel="Back to assets"
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Copy public link">
              <IconButton
                onClick={handleCopyLink}
                sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
              >
                <ContentCopyRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {isAdmin && (
              <Button variant="contained" startIcon={<EditRoundedIcon />} onClick={openEdit}>
                Edit
              </Button>
            )}
          </Stack>
        }
      />

      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Details" />
        <Tab label="History" />
      </Tabs>

      {tab === 1 ? (
        <SectionCard title="Activity History" icon={HistoryRoundedIcon} iconColor="info">
          <AssetHistory assetId={id} />
        </SectionCard>
      ) : (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <SectionCard title="Asset Information" icon={Inventory2RoundedIcon}>
              <Box sx={{ mb: 2.5 }}>
                <StatusChip status={asset?.status} />
              </Box>
              <Grid container spacing={2.5}>
                <Grid size={6}>
                  <Field label="Category">{asset?.category}</Field>
                </Grid>
                <Grid size={6}>
                  <Field label="Location">{asset?.location}</Field>
                </Grid>
                <Grid size={6}>
                  <Field label="Assigned Technician">{technicianName}</Field>
                </Grid>
                <Grid size={6}>
                  <Field label="Condition">{asset?.condition}</Field>
                </Grid>
                <Grid size={6}>
                  <Field label="Manufacturer">{asset?.manufacturer}</Field>
                </Grid>
                <Grid size={6}>
                  <Field label="Model">{asset?.model}</Field>
                </Grid>
                <Grid size={6}>
                  <Field label="Serial Number">{asset?.serialNumber}</Field>
                </Grid>
                <Grid size={6}>
                  <Field label="Last Serviced">{formatDate(asset?.lastServiceDate)}</Field>
                </Grid>
                <Grid size={6}>
                  <Field label="Next Service">{formatDate(asset?.nextServiceDate)}</Field>
                </Grid>
                <Grid size={12}>
                  <Field label="Description">{asset?.description}</Field>
                </Grid>
              </Grid>
            </SectionCard>
          </Grid>

          {/* QR / label panel */}
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionCard title="QR & Label" icon={QrCode2RoundedIcon} iconColor="secondary">
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200,
                  bgcolor: 'background.default',
                }}
              >
                {qrSrc ? (
                  <Box
                    component="img"
                    src={qrSrc}
                    alt="Asset QR code"
                    sx={{ maxWidth: '100%', height: 'auto' }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    QR code unavailable
                  </Typography>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Button
                variant="outlined"
                fullWidth
                startIcon={labelLoading ? <CircularProgress size={18} /> : <PrintRoundedIcon />}
                onClick={handleDownloadLabel}
                disabled={labelLoading}
              >
                Print Label
              </Button>
            </SectionCard>
          </Grid>
        </Grid>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => !saving && setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Asset</DialogTitle>
        <DialogContent dividers>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={editForm.name || ''}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              label="Asset Code"
              name="assetCode"
              value={editForm.assetCode || ''}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              label="Category"
              name="category"
              value={editForm.category || ''}
              onChange={handleEditChange}
              fullWidth
            />
            <TextField
              label="Location"
              name="location"
              value={editForm.location || ''}
              onChange={handleEditChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="edit-status">Status</InputLabel>
              <Select
                labelId="edit-status"
                label="Status"
                name="status"
                value={editForm.status || ''}
                onChange={handleEditChange}
              >
                {ASSET_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
