import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Card,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import userApi from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { formatDate, dateFromObjectId } from '../utils/format';

// Custom DataGrid empty-state overlay so zero-results looks intentional.
function NoRowsOverlay() {
  return (
    <EmptyState
      dense
      icon={EngineeringRoundedIcon}
      title="No technicians found"
      description="No technician accounts match your search. New technicians appear here once they register."
    />
  );
}

/**
 * Admin-only roster of every technician. The backend restricts GET /users to
 * admins; we also guard the route here so non-admins are bounced even if they
 * reach the URL directly.
 */
export default function TechnicianList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;

    async function fetchTechnicians() {
      setLoading(true);
      setError('');
      try {
        // High limit so the full roster comes back in one page.
        const { data } = await userApi.technicians({ limit: 100 });
        if (!active) return;
        // Backend envelope: { success, data: { users } }.
        const list = data?.data?.users ?? [];
        setRows(list.map((u) => ({ id: u.id ?? u._id, ...u })));
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Failed to load technicians.');
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchTechnicians();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const columns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => {
          const name = params.value || params.row.email || 'Technician';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, height: '100%' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.85rem' }}>
                {name.charAt(0).toUpperCase()}
              </Avatar>
              <Box component="span" sx={{ fontWeight: 600 }}>
                {name}
              </Box>
            </Box>
          );
        },
      },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
      {
        field: 'role',
        headerName: 'Role',
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <Chip
            label={params.value || 'technician'}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ textTransform: 'capitalize' }}
          />
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Joined',
        width: 140,
        // Prefer an explicit join date; if the API doesn't send one, fall back
        // to the timestamp encoded in the Mongo _id.
        valueGetter: (value, row) => {
          const raw =
            value ??
            row.joinedAt ??
            row.dateJoined ??
            dateFromObjectId(row._id ?? row.id);
          return formatDate(raw);
        },
      },
    ],
    [],
  );

  // Client-side search across name and email.
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q),
    );
  }, [rows, search]);

  // Belt-and-suspenders: non-admins never see this screen (also hidden in the
  // sidebar), so bounce them to the dashboard.
  if (user && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <PageHeader
        title="Technicians"
        subtitle={
          loading
            ? 'Loading technician roster…'
            : `${rows.length} technician${rows.length === 1 ? '' : 's'} registered.`
        }
      />

      <Box sx={{ mb: 2.5, maxWidth: 420 }}>
        <TextField
          label="Search technicians"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ overflow: 'hidden' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          slots={{ noRowsOverlay: NoRowsOverlay }}
          autoHeight
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
            '& .MuiDataGrid-cell': { borderColor: 'divider' },
            '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
            '& .MuiDataGrid-footerContainer': { borderColor: 'divider' },
          }}
        />
      </Card>
    </Box>
  );
}
