import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link, Skeleton, Alert, Stack } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import assetApi from '../api/assetApi';
import { formatDateTime } from '../utils/format';

// Infer a dot color from the action text; neutral grey when unclear.
function actionColor(action = '') {
  const a = action.toLowerCase();
  if (/creat|registr|add/.test(a)) return 'primary';
  if (/resolv|complet|servic|repair|maintenance/.test(a)) return 'success';
  if (/assign|inspect|updat|status|chang/.test(a)) return 'info';
  if (/reopen|issue|report|fault|fail/.test(a)) return 'warning';
  if (/retir|delet|decommis|out of service/.test(a)) return 'error';
  return 'grey';
}

function pickTimestamp(e) {
  return e.timestamp ?? e.date ?? e.createdAt ?? e.at ?? null;
}

function pickActor(e) {
  const actor = e.actor ?? e.user ?? e.performedBy ?? e.by;
  if (actor && typeof actor === 'object') return actor.name ?? actor.email ?? 'System';
  return actor ?? e.actorName ?? 'System';
}

function pickAction(e) {
  return e.action ?? e.description ?? e.event ?? e.type ?? 'Activity';
}

function pickRelatedIssue(e) {
  const ri = e.relatedIssue ?? e.issue;
  if (!ri) return null;
  if (typeof ri === 'object') {
    return { id: ri.id ?? ri._id, label: ri.issueNumber ?? ri.title ?? 'issue' };
  }
  return { id: ri, label: 'issue' };
}

export default function AssetHistory({ assetId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      setLoading(true);
      setError('');
      try {
        const { data } = await assetApi.getHistory(assetId);
        if (!active) return;
        // Backend envelope: { success, data: { history: [...] } }.
        const list = data?.data?.history ?? (Array.isArray(data?.data) ? data.data : []);
        // Newest first.
        const sorted = [...list].sort((a, b) => {
          const ta = new Date(pickTimestamp(a) || 0).getTime();
          const tb = new Date(pickTimestamp(b) || 0).getTime();
          return tb - ta;
        });
        setEntries(sorted);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Failed to load history.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      active = false;
    };
  }, [assetId]);

  if (loading) {
    return (
      <Stack spacing={2} sx={{ px: 1 }}>
        {[0, 1, 2, 3].map((i) => (
          <Stack key={i} direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={16} height={16} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="70%" />
            </Box>
          </Stack>
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No history recorded for this asset yet.
      </Typography>
    );
  }

  return (
    <Timeline
      sx={{
        px: 0,
        m: 0,
        // Drop the empty opposite-content column so entries use full width
        // (important on narrow phone screens).
        [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 },
      }}
    >
      {entries.map((e, idx) => {
        const ts = pickTimestamp(e);
        const actor = pickActor(e);
        const action = pickAction(e);
        const related = pickRelatedIssue(e);
        return (
          <TimelineItem key={e.id ?? e._id ?? idx}>
            <TimelineSeparator>
              <TimelineDot color={actionColor(action)} />
              {idx < entries.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ pb: 3 }}>
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(ts)} · {actor}
              </Typography>
              <Typography variant="body2">{action}</Typography>
              {related?.id && (
                <Link component={RouterLink} to={`/issues/${related.id}`} variant="caption">
                  View issue {related.label ? `(${related.label})` : ''}
                </Link>
              )}
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
