import { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Autocomplete,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';

import issueApi from '../api/issueApi';
import uploadApi from '../api/uploadApi';
import { useNotify } from '../context/NotifyContext';
import { formatDate } from '../utils/format';
import SectionCard from './SectionCard';
import EvidenceUploader from './EvidenceUploader';
import EvidenceGallery from './EvidenceGallery';

// Allowed forward transitions per current status. Only these are offered as
// buttons — the tech never free-picks an arbitrary status.
const NEXT_STATUS = {
  Reported: [], // must be assigned first (separate action)
  Assigned: ['Inspection Started'],
  'Inspection Started': ['Maintenance In Progress'],
  'Maintenance In Progress': ['Waiting for Parts', 'Resolved'],
  'Waiting for Parts': ['Maintenance In Progress'],
  Resolved: ['Closed'],
  Closed: [],
  // From 'Reopened' the backend graph only allows → 'Assigned', which happens
  // via admin re-assignment (the Assign Technician card), not a status button.
  Reopened: [],
};

const INITIAL_RECORD = {
  inspectionNotes: '',
  workPerformed: '',
  partsUsed: [],
  cost: '',
  timeSpent: '',
  finalCondition: '',
  evidence: [],
};

// Pull a human name off whatever technician-ish field the record carries.
function recordTechnician(r) {
  const t = r.technician ?? r.performedBy ?? r.createdBy ?? r.technicianName;
  if (!t) return null;
  return typeof t === 'string' ? t : t.name ?? t.fullName ?? null;
}

function formatCost(cost) {
  if (typeof cost !== 'number' || Number.isNaN(cost)) return null;
  return cost.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
}

// Compact meta chip used under each maintenance record.
function MetaItem({ icon: Icon, children }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
      <Icon sx={{ fontSize: 15 }} />
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {children}
      </Typography>
    </Stack>
  );
}

export default function MaintenanceSection({ issue, canAct, onChanged }) {
  const notify = useNotify();
  const status = issue?.status;

  // Maintenance records already on the issue (support a few field names).
  const maintenanceRecords =
    issue?.maintenanceRecords ??
    issue?.maintenance ??
    issue?.maintenanceHistory ??
    [];
  const hasMaintenance = maintenanceRecords.length > 0;

  const [changingTo, setChangingTo] = useState('');
  const [reopening, setReopening] = useState(false);

  const [record, setRecord] = useState(INITIAL_RECORD);
  const [savingRecord, setSavingRecord] = useState(false);

  if (!canAct) return null;

  const nextStatuses = NEXT_STATUS[status] ?? [];
  const canReopen = status === 'Resolved' || status === 'Closed';

  const costNumber = record.cost === '' ? null : Number(record.cost);
  const costNegative = costNumber !== null && (Number.isNaN(costNumber) || costNumber < 0);

  const handleStatusChange = async (nextStatus) => {
    setChangingTo(nextStatus);
    try {
      await issueApi.updateStatus(issue.id ?? issue._id, { status: nextStatus });
      notify.success(`Status updated to "${nextStatus}"`);
      onChanged?.();
    } catch (err) {
      notify.error(err.response?.data?.message || `Failed to move to "${nextStatus}".`);
    } finally {
      setChangingTo('');
    }
  };

  const handleReopen = async () => {
    setReopening(true);
    try {
      await issueApi.reopen(issue.id ?? issue._id, {});
      notify.success('Issue reopened');
      onChanged?.();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to reopen issue.');
    } finally {
      setReopening(false);
    }
  };

  const handleRecordChange = (e) =>
    setRecord((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSaveRecord = async () => {
    if (costNegative) return;
    setSavingRecord(true);
    try {
      // Backend rejects `cost: null` — omit it unless a valid number was entered.
      const payload = {
        inspectionNotes: record.inspectionNotes,
        workPerformed: record.workPerformed,
        partsUsed: record.partsUsed,
        timeSpent: record.timeSpent,
        finalCondition: record.finalCondition,
        evidence: record.evidence,
      };
      if (record.cost !== '' && !costNegative) payload.cost = costNumber;
      await issueApi.addMaintenance(issue.id ?? issue._id, payload);
      setRecord(INITIAL_RECORD);
      notify.success('Maintenance record saved');
      onChanged?.();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to save maintenance record.');
    } finally {
      setSavingRecord(false);
    }
  };

  const busy = Boolean(changingTo) || reopening;

  return (
    <SectionCard
      title="Maintenance Workflow"
      subheader="Advance the issue and log the work performed"
      icon={PlaylistAddCheckRoundedIcon}
      iconColor="primary"
      sx={{ mb: 3 }}
    >
      {/* Status transitions */}
      <Typography
        variant="overline"
        sx={{ color: 'text.secondary', display: 'block', mb: 1.25 }}
      >
        Update status
      </Typography>
      {nextStatuses.length === 0 && !canReopen ? (
        <Typography variant="body2" color="text.secondary">
          No further status actions available for this issue.
        </Typography>
      ) : (
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {nextStatuses.map((next) => {
            const isResolve = next === 'Resolved';
            const blockedForResolve = isResolve && !hasMaintenance;
            const btn = (
              <Button
                variant="contained"
                color={isResolve ? 'success' : 'primary'}
                disabled={busy || blockedForResolve}
                onClick={() => handleStatusChange(next)}
                startIcon={
                  changingTo === next ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : isResolve ? (
                    <CheckCircleRoundedIcon />
                  ) : null
                }
              >
                {next === 'Resolved' ? 'Mark as Resolved' : next}
              </Button>
            );
            // Disabled buttons swallow hover events — wrap in a span so the
            // Tooltip explaining the block still works.
            return blockedForResolve ? (
              <Tooltip
                key={next}
                title="Add at least one maintenance record before resolving this issue."
              >
                <span>{btn}</span>
              </Tooltip>
            ) : (
              <Box key={next} component="span">
                {btn}
              </Box>
            );
          })}

          {canReopen && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={
                reopening ? <CircularProgress size={18} color="inherit" /> : <ReplayRoundedIcon />
              }
              disabled={busy}
              onClick={handleReopen}
            >
              Reopen
            </Button>
          )}
        </Stack>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Existing maintenance records */}
      {hasMaintenance && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Maintenance history
            </Typography>
            <Chip
              label={maintenanceRecords.length}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Stack>

          <Stack spacing={1.5}>
            {maintenanceRecords.map((r, idx) => {
              const primary =
                r.workPerformed || r.inspectionNotes || 'Maintenance record';
              const tech = recordTechnician(r);
              const cost = formatCost(r.cost);
              const date = r.date ?? r.performedAt ?? r.createdAt;
              return (
                <Box
                  key={r.id ?? r._id ?? idx}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <Box
                      sx={{
                        mt: 0.25,
                        width: 30,
                        height: 30,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        color: 'primary.main',
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      }}
                    >
                      <BuildRoundedIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {primary}
                      </Typography>
                      {r.finalCondition && (
                        <Typography variant="caption" color="text.secondary">
                          Final condition: {r.finalCondition}
                        </Typography>
                      )}
                      <Stack
                        direction="row"
                        spacing={2}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mt: 1 }}
                      >
                        {tech && <MetaItem icon={PersonRoundedIcon}>{tech}</MetaItem>}
                        {date && <MetaItem icon={EventRoundedIcon}>{formatDate(date)}</MetaItem>}
                        {cost && <MetaItem icon={PaymentsRoundedIcon}>{cost}</MetaItem>}
                        {r.timeSpent && (
                          <MetaItem icon={ScheduleRoundedIcon}>{r.timeSpent}</MetaItem>
                        )}
                      </Stack>
                      {Array.isArray(r.partsUsed) && r.partsUsed.length > 0 && (
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                          {r.partsUsed.map((part, i) => (
                            <Chip
                              key={`${part}-${i}`}
                              label={part}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22, fontSize: '0.7rem' }}
                            />
                          ))}
                        </Stack>
                      )}
                      {Array.isArray(r.evidence) && r.evidence.length > 0 && (
                        <Box sx={{ mt: 1.25 }}>
                          <EvidenceGallery items={r.evidence} size={56} />
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Add maintenance record */}
      <Accordion
        disableGutters
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.default',
          '&:before': { display: 'none' },
          overflow: 'hidden',
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AddRoundedIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2">Add Maintenance Record</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2.5}>
            <TextField
              label="Inspection notes"
              name="inspectionNotes"
              value={record.inspectionNotes}
              onChange={handleRecordChange}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Work performed"
              name="workPerformed"
              value={record.workPerformed}
              onChange={handleRecordChange}
              fullWidth
              multiline
              minRows={2}
            />
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={record.partsUsed}
              onChange={(_e, newValue) =>
                setRecord((prev) => ({ ...prev, partsUsed: newValue }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Parts used"
                  placeholder="Type a part and press Enter"
                />
              )}
            />
            <TextField
              label="Cost"
              name="cost"
              type="number"
              value={record.cost}
              onChange={handleRecordChange}
              fullWidth
              inputProps={{ min: 0 }}
              error={costNegative}
            />
            {costNegative && <Alert severity="error">Cost cannot be negative.</Alert>}
            <TextField
              label="Time spent"
              name="timeSpent"
              value={record.timeSpent}
              onChange={handleRecordChange}
              fullWidth
              placeholder="e.g. 2h 30m"
            />
            <TextField
              label="Final condition"
              name="finalCondition"
              value={record.finalCondition}
              onChange={handleRecordChange}
              fullWidth
            />
            <Box>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
              >
                Evidence
              </Typography>
              <EvidenceUploader
                value={record.evidence}
                onChange={(urls) => setRecord((prev) => ({ ...prev, evidence: urls }))}
                uploadFn={uploadApi.upload}
                onError={(msg) => notify.error(msg)}
                disabled={savingRecord}
              />
            </Box>
            <Box>
              <Button
                variant="contained"
                onClick={handleSaveRecord}
                disabled={savingRecord || costNegative}
                startIcon={
                  savingRecord ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AddRoundedIcon />
                  )
                }
              >
                {savingRecord ? 'Saving…' : 'Save Record'}
              </Button>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </SectionCard>
  );
}
