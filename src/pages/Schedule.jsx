import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Stack,
  Typography,
  IconButton,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import assetApi from '../api/assetApi';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/format';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Local YYYY-MM-DD key (avoids UTC drift from toISOString).
const dayKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
};

const startOfDay = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

export default function Schedule() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await assetApi.schedule();
        if (!active) return;
        setAssets(data?.data?.assets ?? []);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Failed to load the schedule.');
        setAssets([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  // Group assets by their nextServiceDate day-key.
  const byDay = useMemo(() => {
    const map = new Map();
    for (const a of assets) {
      if (!a.nextServiceDate) continue;
      const key = dayKey(a.nextServiceDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    return map;
  }, [assets]);

  // Build the 6-week grid for the visible month.
  const weeks = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const gridStart = new Date(year, month, 1 - firstWeekday);
    const cells = [];
    for (let i = 0; i < 42; i += 1) {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      cells.push(date);
    }
    const rows = [];
    for (let i = 0; i < 6; i += 1) rows.push(cells.slice(i * 7, i * 7 + 7));
    return rows;
  }, [cursor]);

  // Upcoming list: from today onwards, soonest first.
  const upcoming = useMemo(
    () =>
      assets
        .filter((a) => a.nextServiceDate && startOfDay(a.nextServiceDate) >= today)
        .slice(0, 8),
    [assets, today],
  );
  const overdueCount = useMemo(
    () => assets.filter((a) => a.nextServiceDate && startOfDay(a.nextServiceDate) < today).length,
    [assets, today],
  );

  const goMonth = (delta) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  const goToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <PageHeader
        title="Maintenance schedule"
        subtitle="Upcoming service dates across your assets."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {overdueCount > 0 && (
        <Alert severity="warning" icon={<EventBusyRoundedIcon />} sx={{ mb: 2 }}>
          {overdueCount} asset{overdueCount === 1 ? ' is' : 's are'} overdue for service.
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} alignItems="flex-start">
        {/* Calendar */}
        <Card sx={{ flexGrow: 1, width: '100%', p: { xs: 1.5, sm: 2.5 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Button size="small" onClick={goToday} sx={{ mr: 0.5 }}>
                Today
              </Button>
              <IconButton size="small" onClick={() => goMonth(-1)} aria-label="Previous month">
                <ChevronLeftRoundedIcon />
              </IconButton>
              <IconButton size="small" onClick={() => goMonth(1)} aria-label="Next month">
                <ChevronRightRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>

          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
                {WEEKDAYS.map((w) => (
                  <Typography
                    key={w}
                    variant="caption"
                    sx={{ textAlign: 'center', fontWeight: 700, color: 'text.secondary', py: 0.5 }}
                  >
                    {isMobile ? w.charAt(0) : w}
                  </Typography>
                ))}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                {weeks.flat().map((date) => {
                  const inMonth = date.getMonth() === cursor.getMonth();
                  const isToday = dayKey(date) === dayKey(today);
                  const items = byDay.get(dayKey(date)) || [];
                  const isOverdue = startOfDay(date) < today && items.length > 0;

                  return (
                    <Box
                      key={dayKey(date)}
                      sx={{
                        minHeight: { xs: 52, sm: 84 },
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: isToday ? 'primary.main' : 'divider',
                        bgcolor: (t) =>
                          inMonth ? 'background.paper' : alpha(t.palette.text.primary, 0.03),
                        p: 0.5,
                        opacity: inMonth ? 1 : 0.55,
                        overflow: 'hidden',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: isToday ? 800 : 600,
                          color: isToday ? 'primary.main' : 'text.secondary',
                          display: 'block',
                          textAlign: 'right',
                          px: 0.25,
                        }}
                      >
                        {date.getDate()}
                      </Typography>

                      <Stack spacing={0.25} sx={{ mt: 0.25 }}>
                        {items.slice(0, isMobile ? 1 : 3).map((a) => (
                          <Tooltip key={a._id} title={`${a.name} — service due`}>
                            <Box
                              onClick={() => navigate(`/assets/${a._id}`)}
                              sx={{
                                cursor: 'pointer',
                                px: 0.5,
                                py: 0.125,
                                borderRadius: 0.75,
                                bgcolor: (t) =>
                                  alpha(
                                    isOverdue ? t.palette.error.main : t.palette.primary.main,
                                    0.14,
                                  ),
                                color: isOverdue ? 'error.main' : 'primary.main',
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {isMobile ? '•' : a.name}
                            </Box>
                          </Tooltip>
                        ))}
                        {items.length > (isMobile ? 1 : 3) && (
                          <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
                            +{items.length - (isMobile ? 1 : 3)} more
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </>
          )}
        </Card>

        {/* Upcoming list */}
        <Card sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            Upcoming services
          </Typography>
          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : upcoming.length === 0 ? (
            <EmptyState
              dense
              icon={EventBusyRoundedIcon}
              title="Nothing scheduled"
              description="No upcoming service dates. Set a next-service date on an asset to see it here."
            />
          ) : (
            <Stack spacing={1.25} divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />}>
              {upcoming.map((a) => (
                <Box
                  key={a._id}
                  onClick={() => navigate(`/assets/${a._id}`)}
                  sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {a.name}
                    </Typography>
                    <Chip label={formatDate(a.nextServiceDate)} size="small" variant="outlined" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {a.assetCode}
                    {a.location ? ` · ${a.location}` : ''}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Card>
      </Stack>
    </Box>
  );
}
