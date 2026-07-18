import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  Stack,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Button,
  Chip,
} from '@mui/material';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import assetApi from '../api/assetApi';
import issueApi from '../api/issueApi';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotifyContext';
import { statusColor } from '../utils/format';
import { ASSET_STATUSES } from '../utils/constants';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import StatusChip from '../components/StatusChip';
import PriorityChip from '../components/PriorityChip';
import EmptyState from '../components/EmptyState';

// Proportion bar for the "Assets by status" panel.
function StatusBar({ label, count, total }) {
  const c = statusColor(label);
  const barColor = c === 'default' ? 'grey.400' : `${c}.main`;
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: barColor }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {count}
        </Typography>
      </Stack>
      <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.100', overflow: 'hidden' }}>
        <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 4, bgcolor: barColor, transition: 'width .4s' }} />
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const notify = useNotify();
  const isTechnician = user?.role === 'technician';
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [assetStats, setAssetStats] = useState({ total: 0, byStatus: {} });
  const [issueStats, setIssueStats] = useState({ open: 0, critical: 0, assignedToMe: 0 });
  const [recentIssues, setRecentIssues] = useState([]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const [assetRes, issueRes, recentRes] = await Promise.all([
          assetApi.stats(),
          issueApi.stats(),
          issueApi.list({ limit: 6 }),
        ]);
        if (!active) return;
        setAssetStats(assetRes.data?.data ?? { total: 0, byStatus: {} });
        setIssueStats(issueRes.data?.data ?? { open: 0, critical: 0, assignedToMe: 0 });
        setRecentIssues(recentRes.data?.data?.issues ?? []);
      } catch (err) {
        if (active) notify.error(err.response?.data?.message || 'Failed to load dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [notify]);

  const totalAssets = assetStats.total ?? 0;
  const operational = assetStats.byStatus?.Operational ?? 0;
  const operationalPct = totalAssets ? Math.round((operational / totalAssets) * 100) : 0;

  const kpis = [
    {
      label: 'Total Assets',
      value: totalAssets,
      icon: Inventory2RoundedIcon,
      color: 'primary',
      onClick: () => navigate('/assets'),
    },
    {
      label: 'Operational',
      value: operational,
      icon: CheckCircleRoundedIcon,
      color: 'success',
      hint: `${operationalPct}% of fleet`,
    },
    {
      label: 'Open Issues',
      value: issueStats.open ?? 0,
      icon: ReportProblemRoundedIcon,
      color: 'info',
      onClick: () => navigate('/issues'),
    },
    {
      label: 'Critical Open',
      value: issueStats.critical ?? 0,
      icon: PriorityHighRoundedIcon,
      color: (issueStats.critical ?? 0) > 0 ? 'error' : 'secondary',
      onClick: () => navigate('/issues'),
    },
  ];
  if (isTechnician) {
    kpis.push({
      label: 'Assigned to Me',
      value: issueStats.assignedToMe ?? 0,
      icon: AssignmentIndRoundedIcon,
      color: 'secondary',
      onClick: () => navigate('/issues'),
    });
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋`}
        subtitle="Here's what's happening across your assets and maintenance today."
        action={
          isAdmin && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/assets/new')}>
              New Asset
            </Button>
          )
        }
      />

      {/* KPI row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {loading
          ? Array.from({ length: isTechnician ? 5 : 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 6, md: 3 }}>
                <Skeleton variant="rounded" height={132} sx={{ borderRadius: 4 }} />
              </Grid>
            ))
          : kpis.map((k) => (
              <Grid key={k.label} size={{ xs: 6, md: 3 }}>
                <StatCard {...k} />
              </Grid>
            ))}
      </Grid>

      {/* Detail panels */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard
            title="Assets by Status"
            subheader={`${totalAssets} assets tracked`}
            icon={Inventory2RoundedIcon}
          >
            {loading ? (
              <Stack spacing={2.5}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={28} />
                ))}
              </Stack>
            ) : totalAssets === 0 ? (
              <EmptyState
                dense
                icon={Inventory2RoundedIcon}
                title="No assets yet"
                description="Create your first asset to start tracking maintenance."
                action={
                  isAdmin && (
                    <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => navigate('/assets/new')}>
                      New Asset
                    </Button>
                  )
                }
              />
            ) : (
              <Stack spacing={2.25}>
                {ASSET_STATUSES.map((s) => (
                  <StatusBar key={s} label={s} count={assetStats.byStatus?.[s] ?? 0} total={totalAssets} />
                ))}
              </Stack>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard
            title="Recent Issues"
            icon={ReportProblemRoundedIcon}
            iconColor="warning"
            disableContentPadding
            action={
              <Button size="small" endIcon={<ChevronRightRoundedIcon />} onClick={() => navigate('/issues')}>
                View all
              </Button>
            }
          >
            {loading ? (
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} variant="rounded" height={44} />
                  ))}
                </Stack>
              </Box>
            ) : recentIssues.length === 0 ? (
              <EmptyState
                dense
                icon={CheckCircleRoundedIcon}
                title="No issues reported"
                description="You're all caught up — nothing needs attention right now."
              />
            ) : (
              <List disablePadding>
                {recentIssues.map((issue, idx) => (
                  <ListItemButton
                    key={issue.id ?? issue._id}
                    onClick={() => navigate(`/issues/${issue.id ?? issue._id}`)}
                    divider={idx < recentIssues.length - 1}
                    sx={{ px: 2, py: 1.25 }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {issue.title || 'Untitled issue'}
                        </Typography>
                      }
                      secondary={
                        <Chip
                          label={issue.issueNumber || '—'}
                          size="small"
                          variant="outlined"
                          sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
                        />
                      }
                      slotProps={{ secondary: { component: 'div' } }}
                    />
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ ml: 1, flexShrink: 0 }}>
                      <PriorityChip priority={issue.priority} />
                      <StatusChip status={issue.status} />
                    </Stack>
                  </ListItemButton>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
