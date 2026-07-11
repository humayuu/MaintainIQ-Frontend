import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  Box,
  Stack,
  Typography,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

import publicApi from '../api/publicApi';
import ReportIssueDialog from '../components/ReportIssueDialog';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/format';

// A single labelled attribute row: tinted icon badge + caption label + value.
function InfoRow({ icon: Icon, label, value, color = 'primary' }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          color: `${color}.main`,
          bgcolor: (t) => alpha(t.palette[color].main, 0.12),
          flexShrink: 0,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="overline"
          sx={{ display: 'block', color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1.4 }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

// Shared centered shell so loading / error / content stay visually aligned.
function PageShell({ children }) {
  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', width: '100%', px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 5 } }}>
      {children}
    </Box>
  );
}

export default function PublicAssetPage() {
  const { slug } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setNotFound(false);
      setLoadError(false);
      try {
        const { data } = await publicApi.getAsset(slug);
        if (!active) return;
        // Backend envelope: { success, data: { asset } }.
        setAsset(data?.data?.asset ?? null);
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <PageShell>
        <Card sx={{ boxShadow: 3, overflow: 'hidden' }}>
          <Box sx={{ height: 6, background: 'linear-gradient(90deg, #1565C0 0%, #0EA5A5 100%)' }} />
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack direction="row" spacing={1.75} alignItems="center">
              <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="rounded" width={100} height={24} sx={{ mt: 1 }} />
              </Box>
            </Stack>
            <Stack spacing={2} sx={{ mt: 3 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                  <Skeleton variant="rounded" width={38} height={38} sx={{ borderRadius: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="35%" height={14} />
                    <Skeleton variant="text" width="55%" />
                  </Box>
                </Stack>
              ))}
            </Stack>
            <Skeleton variant="rounded" height={48} sx={{ mt: 3, borderRadius: 2.5 }} />
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  if (notFound || loadError) {
    return (
      <PageShell>
        <Card sx={{ boxShadow: 3 }}>
          <EmptyState
            icon={notFound ? SearchOffRoundedIcon : ErrorOutlineRoundedIcon}
            title={notFound ? 'Asset not found' : 'Unable to load this asset'}
            description={
              notFound
                ? "We couldn't find an asset for this code. Please check the QR label and try again."
                : 'Something went wrong loading this asset. Please try again in a moment.'
            }
          />
        </Card>
      </PageShell>
    );
  }

  // Recent activity summary from the envelope; items carry { action, date }.
  const activity = asset?.activitySummary ?? [];

  return (
    <PageShell>
      <Card sx={{ boxShadow: 3, overflow: 'hidden' }}>
        <Box sx={{ height: 6, background: 'linear-gradient(90deg, #1565C0 0%, #0EA5A5 100%)' }} />
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {/* Header: asset badge + name + code + status */}
          <Stack direction="row" spacing={1.75} alignItems="flex-start">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                background: 'linear-gradient(135deg, #1565C0 0%, #0EA5A5 100%)',
                boxShadow: '0 6px 16px -6px rgba(21,101,192,0.6)',
                flexShrink: 0,
              }}
            >
              <Inventory2RoundedIcon />
            </Box>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {asset?.name || 'Unnamed asset'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                {asset?.assetCode && (
                  <Chip label={asset.assetCode} size="small" variant="outlined" />
                )}
                {asset?.status && <StatusChip status={asset.status} />}
              </Stack>
            </Box>
          </Stack>

          <Divider sx={{ my: 2.5 }} />

          {/* Attributes */}
          <Stack spacing={2}>
            {asset?.category && (
              <InfoRow icon={CategoryRoundedIcon} label="Category" value={asset.category} color="primary" />
            )}
            {asset?.location && (
              <InfoRow icon={LocationOnRoundedIcon} label="Location" value={asset.location} color="secondary" />
            )}
            <InfoRow
              icon={EventAvailableRoundedIcon}
              label="Last serviced"
              value={formatDate(asset?.lastServiceDate)}
              color="success"
            />
            <InfoRow
              icon={EventRoundedIcon}
              label="Next service"
              value={formatDate(asset?.nextServiceDate)}
              color="info"
            />
          </Stack>

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<ReportProblemRoundedIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ mt: 3 }}
          >
            Report an Issue
          </Button>

          {activity.length > 0 && (
            <>
              <Divider sx={{ my: 2.5 }} />
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <HistoryRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="subtitle2">Recent activity</Typography>
              </Stack>
              <List dense disablePadding>
                {activity.slice(0, 5).map((item, idx) => (
                  <ListItem
                    key={item.id ?? item._id ?? idx}
                    disableGutters
                    sx={{ alignItems: 'flex-start', py: 0.75 }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        mt: '7px',
                        mr: 1.5,
                        flexShrink: 0,
                      }}
                    />
                    <ListItemText
                      primary={item.action || 'Activity'}
                      secondary={formatDate(item.date)}
                      slotProps={{
                        primary: { variant: 'body2', sx: { fontWeight: 600 } },
                        secondary: { variant: 'caption' },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </CardContent>
      </Card>

      <ReportIssueDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        slug={slug}
        fullScreen={isMobile}
      />
    </PageShell>
  );
}
