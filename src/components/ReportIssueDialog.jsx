import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Avatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import publicApi from '../api/publicApi';
import uploadApi from '../api/uploadApi';
import EvidenceUploader from './EvidenceUploader';

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const EMPTY_REVIEW = {
  title: '',
  category: '',
  priority: 'Medium',
  possibleCauses: '',
  initialChecks: '',
  recurringPatternWarning: null,
};

// Arrays <-> multiline text helper so lists stay editable as plain text.
const listToText = (value) => (Array.isArray(value) ? value.join('\n') : value || '');

export default function ReportIssueDialog({ open, onClose, slug, fullScreen }) {
  // step: 'form' | 'analyzing' | 'review' | 'success'
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ complaint: '', reporterName: '', reporterContact: '' });
  const [review, setReview] = useState(EMPTY_REVIEW);
  const [evidence, setEvidence] = useState([]);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [issueNumber, setIssueNumber] = useState('');

  const priorityOptions = PRIORITIES.includes(review.priority)
    ? PRIORITIES
    : [review.priority, ...PRIORITIES];

  const isSuccess = step === 'success';
  const busy = step === 'analyzing' || submitting;

  const resetAndClose = () => {
    onClose();
    // Reset after the dialog close transition so it doesn't flash mid-animation.
    setTimeout(() => {
      setStep('form');
      setForm({ complaint: '', reporterName: '', reporterContact: '' });
      setReview(EMPTY_REVIEW);
      setEvidence([]);
      setAiUnavailable(false);
      setSubmitting(false);
      setError('');
      setIssueNumber('');
    }, 300);
  };

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleReviewChange = (e) =>
    setReview((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Step 1 -> triage with AI, then move to the editable review step.
  const handleAnalyze = async () => {
    setError('');
    setAiUnavailable(false);
    setStep('analyzing');
    try {
      const { data } = await publicApi.triageIssue(slug, { complaint: form.complaint });
      const s = data?.data?.suggestion ?? {};
      setReview({
        title: s.title || '',
        category: s.category || '',
        priority: s.priority || 'Medium',
        possibleCauses: listToText(s.possibleCauses),
        initialChecks: listToText(s.initialChecks),
        recurringPatternWarning: s.recurringPatternWarning || null,
      });
      setStep('review');
    } catch {
      // Never block the reporter on AI failure — proceed with empty defaults.
      setAiUnavailable(true);
      setReview(EMPTY_REVIEW);
      setStep('review');
    }
  };

  // Step 2 -> persist the (possibly edited) issue. possibleCauses / initialChecks
  // remain review-only aids and are intentionally not part of the payload.
  const handleConfirm = async () => {
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        title: review.title,
        description: form.complaint,
        category: review.category,
        priority: review.priority,
        reporterName: form.reporterName,
        reporterContact: form.reporterContact,
        evidence,
        aiSuggested: {
          title: !aiUnavailable,
          category: !aiUnavailable,
          priority: !aiUnavailable,
        },
      };
      const { data } = await publicApi.submitIssue(slug, payload);
      const result = data?.data?.issue ?? {};
      setIssueNumber(result.issueNumber || '');
      setStep('success');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Could not submit your report.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : resetAndClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: fullScreen ? 0 : 3 } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 1.5, py: 2 }}>
        <Avatar
          variant="rounded"
          sx={{
            width: 40,
            height: 40,
            bgcolor: (t) =>
              alpha(isSuccess ? t.palette.success.main : t.palette.primary.main, 0.12),
            color: isSuccess ? 'success.main' : 'primary.main',
          }}
        >
          {isSuccess ? (
            <CheckCircleRoundedIcon fontSize="small" />
          ) : (
            <ReportProblemRoundedIcon fontSize="small" />
          )}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
            {isSuccess ? 'Report submitted' : 'Report an Issue'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isSuccess ? 'Thanks for letting us know' : 'AI-assisted maintenance triage'}
          </Typography>
        </Box>
        {!busy && (
          <IconButton onClick={resetAndClose} edge="end" aria-label="close">
            <CloseRoundedIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {/* STEP: initial complaint form */}
        {step === 'form' && (
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Describe the problem and we&apos;ll help route it to the right team.
            </Typography>
            <TextField
              label="What's the issue?"
              name="complaint"
              value={form.complaint}
              onChange={handleFormChange}
              multiline
              minRows={4}
              fullWidth
              required
              placeholder="e.g. The machine is making a loud grinding noise and won't start."
            />
            <TextField
              label="Your name"
              name="reporterName"
              value={form.reporterName}
              onChange={handleFormChange}
              fullWidth
            />
            <TextField
              label="Contact (phone or email)"
              name="reporterContact"
              value={form.reporterContact}
              onChange={handleFormChange}
              fullWidth
            />
          </Stack>
        )}

        {/* STEP: analyzing spinner */}
        {step === 'analyzing' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: 6,
            }}
          >
            <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
              <CircularProgress size={56} thickness={4} />
              <AutoAwesomeRoundedIcon
                color="primary"
                sx={{ position: 'absolute', fontSize: 22 }}
              />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Analyzing your report…
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This can take a few seconds.
            </Typography>
          </Box>
        )}

        {/* STEP: editable review */}
        {step === 'review' && (
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {aiUnavailable ? (
              <Alert severity="warning">
                AI suggestion unavailable — please fill in the details manually.
              </Alert>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                <AutoAwesomeRoundedIcon fontSize="small" color="secondary" />
                <Typography variant="body2" color="text.secondary">
                  Review and edit the suggested details before submitting.
                </Typography>
              </Stack>
            )}

            {review.recurringPatternWarning && (
              <Alert severity="info">{review.recurringPatternWarning}</Alert>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Title"
              name="title"
              value={review.title}
              onChange={handleReviewChange}
              fullWidth
              required
            />
            <TextField
              label="Category"
              name="category"
              value={review.category}
              onChange={handleReviewChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                label="Priority"
                name="priority"
                value={review.priority}
                onChange={handleReviewChange}
              >
                {priorityOptions.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">
                Possible causes (one per line)
              </Typography>
            </Divider>
            <TextField
              name="possibleCauses"
              value={review.possibleCauses}
              onChange={handleReviewChange}
              multiline
              minRows={3}
              fullWidth
              placeholder="One cause per line"
            />

            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">
                Initial checks (one per line)
              </Typography>
            </Divider>
            <TextField
              name="initialChecks"
              value={review.initialChecks}
              onChange={handleReviewChange}
              multiline
              minRows={3}
              fullWidth
              placeholder="One check per line"
            />

            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">
                Evidence (optional)
              </Typography>
            </Divider>
            <EvidenceUploader
              value={evidence}
              onChange={setEvidence}
              uploadFn={uploadApi.uploadPublic}
              onError={(msg) => setError(msg)}
              disabled={submitting}
            />
          </Stack>
        )}

        {/* STEP: success */}
        {step === 'success' && (
          <Stack spacing={2.5} sx={{ py: 2, alignItems: 'center', textAlign: 'center' }}>
            <Alert severity="success" sx={{ width: '100%' }}>
              Thanks! Your issue has been logged and the maintenance team has been notified.
            </Alert>
            {issueNumber && (
              <Box
                sx={{
                  width: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
                  py: 3,
                  px: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <ConfirmationNumberRoundedIcon fontSize="small" color="primary" />
                  <Typography variant="overline" color="text.secondary">
                    Your issue number
                  </Typography>
                </Stack>
                <Typography
                  variant="h3"
                  color="primary"
                  sx={{ fontWeight: 800, letterSpacing: '-0.02em', mt: 0.5 }}
                >
                  {issueNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Keep this number to follow up.
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {step === 'form' && (
          <>
            <Button onClick={resetAndClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={!form.complaint.trim()}
            >
              Continue
            </Button>
          </>
        )}

        {step === 'review' && (
          <>
            <Button onClick={() => setStep('form')} disabled={submitting}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={submitting || !review.title.trim()}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {submitting ? 'Submitting…' : 'Confirm and Submit'}
            </Button>
          </>
        )}

        {step === 'success' && (
          <Button variant="contained" onClick={resetAndClose} fullWidth={fullScreen}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
