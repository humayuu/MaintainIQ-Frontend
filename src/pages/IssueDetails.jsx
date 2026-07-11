import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Stack,
  Typography,
  Chip,
  Button,
  Link,
  Divider,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Alert,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import issueApi from '../api/issueApi';
import userApi from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotifyContext';
import { isSameTechnician } from '../utils/user';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusChip from '../components/StatusChip';
import PriorityChip from '../components/PriorityChip';
import EmptyState from '../components/EmptyState';
import MaintenanceSection from '../components/MaintenanceSection';
import EvidenceGallery from '../components/EvidenceGallery';

// Main linear workflow. Branch states (Waiting for Parts, Reopened) are noted
// below the Stepper rather than forced into the line.
const MAIN_FLOW = [
  'Reported',
  'Assigned',
  'Inspection Started',
  'Maintenance In Progress',
  'Resolved',
  'Closed',
];

// Where a branch status "sits" on the main flow for the active step highlight.
const BRANCH_ANCHOR = {
  'Waiting for Parts': 'Maintenance In Progress',
  Reopened: 'Assigned',
};

// Small "AI suggested" chip shown next to AI-populated fields.
function AiChip() {
  return (
    <Chip
      icon={<AutoAwesomeRoundedIcon />}
      label="AI suggested"
      size="small"
      color="secondary"
      variant="outlined"
    />
  );
}

// A single labelled field in the details panel, with an optional AI marker.
function Field({ label, ai, children }) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {label}
        </Typography>
        {ai && <AiChip />}
      </Stack>
      {children}
    </Box>
  );
}

// Bulleted list used for AI possible-causes / initial-checks.
function DotList({ items }) {
  return (
    <Stack spacing={0.75} sx={{ mt: 0.25 }}>
      {items.map((c, idx) => (
        <Stack key={idx} direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'secondary.main', mt: '7px', flexShrink: 0 }}
          />
          <Typography variant="body2">{c}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notify = useNotify();
  const isAdmin = user?.role === 'admin';

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Assign-technician state
  const [technicians, setTechnicians] = useState([]);
  const [manualMode, setManualMode] = useState(false);
  const [selectedTech, setSelectedTech] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  // Load the issue via GET /issues/:id, falling back to scanning the list if
  // the direct fetch isn't available.
  useEffect(() => {
    let active = true;

    async function loadIssue() {
      setLoading(true);
      setLoadError('');
      try {
        let found = null;
        try {
          const { data } = await issueApi.getById(id);
          found = data?.data?.issue ?? null;
        } catch {
          const { data } = await issueApi.list({ limit: 200 });
          const list = data?.data?.issues ?? [];
          found = list.find((i) => String(i.id ?? i._id) === String(id)) ?? null;
        }
        if (!active) return;
        if (!found) {
          setLoadError('Issue not found.');
        } else {
          setIssue(found);
        }
      } catch (err) {
        if (!active) return;
        setLoadError(err.response?.data?.message || 'Failed to load issue.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadIssue();
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  // Load the technician roster from GET /users?role=technician. Falls back to a
  // manual technicianId input if the list is empty or the request fails.
  useEffect(() => {
    if (!isAdmin) return;
    let active = true;

    async function loadTechnicians() {
      try {
        const { data } = await userApi.technicians();
        const list = data?.data?.users ?? [];
        if (!active) return;
        const options = list.map((u) => ({
          id: u.id ?? u._id,
          name: u.name || u.email || 'Technician',
        }));
        setTechnicians(options);
        setManualMode(options.length === 0);
      } catch {
        if (active) setManualMode(true);
      }
    }

    loadTechnicians();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const handleAssign = async () => {
    if (!selectedTech) return;
    setAssigning(true);
    setAssignError('');
    try {
      await issueApi.assign(id, { technicianId: selectedTech });
      notify.success('Technician assigned');
      setSelectedTech('');
      setReloadKey((k) => k + 1);
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to assign technician.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Skeleton variant="text" width={130} height={28} sx={{ mb: 1.5 }} />
        <Skeleton variant="rounded" height={72} sx={{ mb: 3, borderRadius: 4 }} />
        <Skeleton variant="rounded" height={132} sx={{ mb: 2.5, borderRadius: 4 }} />
        <Skeleton variant="rounded" height={180} sx={{ mb: 2.5, borderRadius: 4 }} />
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <PageHeader
          onBack={() => navigate('/issues')}
          backLabel="Back to issues"
          title="Issue"
        />
        <SectionCard>
          <EmptyState
            icon={ReportProblemRoundedIcon}
            title="Couldn't load this issue"
            description={loadError}
            action={
              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => setReloadKey((k) => k + 1)}
              >
                Try again
              </Button>
            }
          />
        </SectionCard>
      </Box>
    );
  }

  // AI-suggested flag lookup — supports both an object map and an array.
  const aiSuggested = issue?.aiSuggested;
  const isAi = (field) =>
    Array.isArray(aiSuggested)
      ? aiSuggested.includes(field)
      : Boolean(aiSuggested?.[field]);

  // Asset link resolution.
  const assetObj =
    issue?.asset && typeof issue.asset === 'object' ? issue.asset : null;
  const assetId = assetObj?.id ?? assetObj?._id ?? issue?.assetId ?? issue?.asset;
  const assetName = assetObj?.name ?? issue?.assetName ?? 'View asset';

  // Stepper active step.
  const status = issue?.status;
  const anchoredStatus = MAIN_FLOW.includes(status)
    ? status
    : BRANCH_ANCHOR[status];
  const activeStep = anchoredStatus ? MAIN_FLOW.indexOf(anchoredStatus) : 0;
  const isBranch = Boolean(status) && !MAIN_FLOW.includes(status);

  const technicianName =
    issue?.assignedTechnician && typeof issue.assignedTechnician === 'object'
      ? issue.assignedTechnician.name
      : issue?.assignedTechnician;
  const techInitials = technicianName
    ? technicianName
        .split(' ')
        .map((s) => s[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  // The maintenance workflow is available to admins and the issue's own
  // assigned technician. (The backend also enforces technicianOwnsIssue.)
  const canAct = isAdmin || isSameTechnician(issue?.assignedTechnician, user);

  const possibleCauses = issue?.possibleCauses ?? [];
  const initialChecks = issue?.initialChecks ?? [];
  const evidence = Array.isArray(issue?.evidence) ? issue.evidence : [];

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <PageHeader
        onBack={() => navigate('/issues')}
        backLabel="Back to issues"
        title={
          <Box
            component="span"
            sx={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
          >
            {issue?.title || 'Issue'}
            {isAi('title') && <AiChip />}
          </Box>
        }
        subtitle={issue?.issueNumber}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <PriorityChip priority={issue?.priority} />
            <StatusChip status={issue?.status} />
          </Stack>
        }
      />

      {/* Workflow stepper */}
      <SectionCard
        title="Workflow"
        subheader="Issue lifecycle"
        icon={RouteRoundedIcon}
        sx={{ mb: 2.5 }}
      >
        {/* Scroll horizontally on narrow phones instead of squashing labels. */}
        <Box sx={{ overflowX: 'auto' }}>
          <Stepper activeStep={activeStep} alternativeLabel nonLinear sx={{ minWidth: 560 }}>
            {MAIN_FLOW.map((label) => (
              <Step key={label} completed={MAIN_FLOW.indexOf(label) < activeStep}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        {isBranch && (
          <Alert severity="info" sx={{ mt: 2 }}>
            This issue is currently <strong>{status}</strong>
            {BRANCH_ANCHOR[status] ? ` (a branch of "${BRANCH_ANCHOR[status]}")` : ''}.
          </Alert>
        )}
      </SectionCard>

      {/* Technician / admin maintenance workflow */}
      <MaintenanceSection
        issue={issue}
        canAct={canAct}
        onChanged={() => setReloadKey((k) => k + 1)}
      />

      <Grid container spacing={2.5}>
        {/* Issue info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title="Issue Details" icon={DescriptionRoundedIcon}>
            <Stack spacing={2.5}>
              <Field label="Priority" ai={isAi('priority')}>
                <PriorityChip priority={issue?.priority} />
              </Field>

              <Field label="Category" ai={isAi('category')}>
                <Typography variant="body1">{issue?.category || '—'}</Typography>
              </Field>

              <Field label="Description" ai={isAi('description')}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {issue?.description || issue?.complaint || '—'}
                </Typography>
              </Field>

              {possibleCauses.length > 0 && (
                <Field label="Possible causes" ai={isAi('possibleCauses')}>
                  <DotList items={possibleCauses} />
                </Field>
              )}

              {initialChecks.length > 0 && (
                <Field label="Initial checks" ai={isAi('initialChecks')}>
                  <DotList items={initialChecks} />
                </Field>
              )}

              {evidence.length > 0 && (
                <Field label="Evidence">
                  <EvidenceGallery items={evidence} />
                </Field>
              )}
            </Stack>
          </SectionCard>
        </Grid>

        {/* Side panel: asset + assign */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2.5}>
            <SectionCard title="Asset" icon={Inventory2RoundedIcon} iconColor="secondary">
              {assetId ? (
                <Link component={RouterLink} to={`/assets/${assetId}`} variant="body1">
                  {assetName}
                </Link>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No linked asset
                </Typography>
              )}
              {assetObj?.assetCode && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {assetObj.assetCode}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Assigned technician
              </Typography>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'secondary.main',
                    bgcolor: (t) => alpha(t.palette.secondary.main, 0.14),
                  }}
                >
                  {techInitials || <PersonRoundedIcon fontSize="small" />}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {technicianName || 'Unassigned'}
                </Typography>
              </Stack>
            </SectionCard>

            {isAdmin && (
              <SectionCard title="Assign Technician" icon={AssignmentIndRoundedIcon} iconColor="info">
                {assignError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {assignError}
                  </Alert>
                )}
                <Stack spacing={2}>
                  {manualMode ? (
                    <TextField
                      label="Technician ID"
                      value={selectedTech}
                      onChange={(e) => setSelectedTech(e.target.value)}
                      fullWidth
                      size="small"
                      helperText="No technician list available — enter an ID."
                    />
                  ) : (
                    <FormControl fullWidth size="small">
                      <InputLabel id="tech-select">Technician</InputLabel>
                      <Select
                        labelId="tech-select"
                        label="Technician"
                        value={selectedTech}
                        onChange={(e) => setSelectedTech(e.target.value)}
                      >
                        {technicians.map((t) => (
                          <MenuItem key={t.id} value={t.id}>
                            {t.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <Button
                    variant="contained"
                    onClick={handleAssign}
                    disabled={assigning || !selectedTech}
                    startIcon={assigning ? <CircularProgress size={18} color="inherit" /> : null}
                  >
                    {assigning ? 'Assigning…' : 'Assign'}
                  </Button>
                </Stack>
              </SectionCard>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
