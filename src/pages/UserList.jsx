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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import userApi from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { formatDate, dateFromObjectId } from '../utils/format';

// Per-role chip colour so admins and technicians are easy to tell apart.
const ROLE_COLOR = { admin: 'primary', supervisor: 'warning', technician: 'secondary' };

// Custom DataGrid empty-state overlay so zero-results looks intentional.
function NoRowsOverlay() {
  return (
    <EmptyState
      dense
      icon={GroupRoundedIcon}
      title="No users found"
      description="No accounts match your filters. New users appear here once they register."
    />
  );
}

/**
 * Admin-only roster of every user (admins + technicians). The backend restricts
 * GET /users to admins; we also guard the route here so non-admins are bounced
 * even if they reach the URL directly. Supports role filtering, text search and
 * column sorting.
 */
export default function UserList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'technician'

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;

    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        // No role filter → the full roster; high limit so it comes in one page.
        const { data } = await userApi.list({ limit: 100 });
        if (!active) return;
        // Backend envelope: { success, data: { users } }.
        const list = data?.data?.users ?? [];
        setRows(list.map((u) => ({ id: u.id ?? u._id, ...u })));
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Failed to load users.');
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchUsers();
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
          const name = params.value || params.row.email || 'User';
          const color = ROLE_COLOR[params.row.role] || 'primary';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, height: '100%' }}>
              <Avatar sx={{ bgcolor: `${color}.main`, width: 32, height: 32, fontSize: '0.85rem' }}>
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
        renderCell: (params) => (
          <Chip
            label={params.value || 'technician'}
            size="small"
            color={ROLE_COLOR[params.value] || 'default'}
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

  // Role filter + client-side search across name and email.
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (roleFilter !== 'all' && r.role !== roleFilter) return false;
      if (!q) return true;
      return (
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q)
      );
    });
  }, [rows, search, roleFilter]);

  // Belt-and-suspenders: non-admins never see this screen (also hidden in the
  // sidebar), so bounce them to the dashboard.
  if (user && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <PageHeader
        title="Users"
        subtitle={
          loading
            ? 'Loading users…'
            : `${rows.length} user${rows.length === 1 ? '' : 's'} registered.`
        }
      />

      <Box
        sx={{
          mb: 2.5,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        <TextField
          label="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: 420, flexGrow: 1 }}
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
        <ToggleButtonGroup
          value={roleFilter}
          exclusive
          size="small"
          onChange={(_, v) => v && setRoleFilter(v)}
          aria-label="Filter by role"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="admin">Admins</ToggleButton>
          <ToggleButton value="supervisor">Supervisors</ToggleButton>
          <ToggleButton value="technician">Technicians</ToggleButton>
        </ToggleButtonGroup>
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
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
            sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
          }}
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
