import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  Button,
  Card,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import assetApi from '../api/assetApi';
import { useAuth } from '../context/AuthContext';
import StatusChip from '../components/StatusChip';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import { ASSET_STATUSES } from '../utils/constants';

const ALL = '__all__';

// Custom DataGrid empty-state overlay so zero-results looks intentional.
function NoRowsOverlay() {
  return (
    <EmptyState
      dense
      icon={Inventory2RoundedIcon}
      title="No assets found"
      description="Try adjusting your search or filters to find what you're looking for."
    />
  );
}

export default function AssetList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [location, setLocation] = useState(ALL);

  // Distinct category/location values accumulated from fetched pages so the
  // filter dropdowns have real options (no dedicated options endpoint).
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const columns = useMemo(
    () => [
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
      { field: 'assetCode', headerName: 'Asset Code', width: 140 },
      { field: 'category', headerName: 'Category', width: 150 },
      { field: 'location', headerName: 'Location', width: 150 },
      {
        field: 'status',
        headerName: 'Status',
        width: 170,
        sortable: false,
        renderCell: (params) => <StatusChip status={params.value} />,
      },
      {
        field: 'assignedTechnician',
        headerName: 'Technician',
        width: 160,
        valueGetter: (value) =>
          value && typeof value === 'object' ? value.name : value || '—',
      },
    ],
    [],
  );

  useEffect(() => {
    let active = true;

    async function fetchAssets() {
      setLoading(true);
      setError('');
      try {
        const params = {
          page: paginationModel.page + 1, // backend is 1-indexed
          limit: paginationModel.pageSize,
        };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (status !== ALL) params.status = status;
        if (category !== ALL) params.category = category;
        if (location !== ALL) params.location = location;

        const { data } = await assetApi.list(params);
        if (!active) return;
        // Backend envelope: { success, data: { assets, pagination } }.
        const list = data?.data?.assets ?? [];
        const total = data?.data?.pagination?.total ?? list.length;

        setRows(list.map((a) => ({ id: a.id ?? a._id, ...a })));
        setRowCount(total);

        // Grow the filter option sets from whatever we've seen.
        setCategoryOptions((prev) =>
          Array.from(new Set([...prev, ...list.map((a) => a.category).filter(Boolean)])).sort(),
        );
        setLocationOptions((prev) =>
          Array.from(new Set([...prev, ...list.map((a) => a.location).filter(Boolean)])).sort(),
        );
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Failed to load assets.');
        setRows([]);
        setRowCount(0);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAssets();
    return () => {
      active = false;
    };
  }, [paginationModel, debouncedSearch, status, category, location]);

  // Any filter/search change should return to the first page.
  const resetToFirstPage = () =>
    setPaginationModel((prev) => ({ ...prev, page: 0 }));

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <PageHeader
        title="Assets"
        subtitle="Browse and manage every tracked asset."
        action={
          isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => navigate('/assets/new')}
            >
              Create Asset
            </Button>
          )
        }
      />

      {/* Search + filter toolbar */}
      <SectionCard
        title="Filter Assets"
        subheader="Search and narrow the list by status, category or location."
        icon={FilterListRoundedIcon}
        sx={{ mb: 2.5 }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetToFirstPage();
              }}
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
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="status-filter">Status</InputLabel>
              <Select
                labelId="status-filter"
                label="Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  resetToFirstPage();
                }}
              >
                <MenuItem value={ALL}>All statuses</MenuItem>
                {ASSET_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="category-filter">Category</InputLabel>
              <Select
                labelId="category-filter"
                label="Category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  resetToFirstPage();
                }}
              >
                <MenuItem value={ALL}>All categories</MenuItem>
                {categoryOptions.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="location-filter">Location</InputLabel>
              <Select
                labelId="location-filter"
                label="Location"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  resetToFirstPage();
                }}
              >
                <MenuItem value={ALL}>All locations</MenuItem>
                {locationOptions.map((l) => (
                  <MenuItem key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </SectionCard>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={rowCount}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          onRowClick={(params) => navigate(`/assets/${params.id}`)}
          slots={{ noRowsOverlay: NoRowsOverlay }}
          autoHeight
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
            '& .MuiDataGrid-cell': { borderColor: 'divider' },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
            '& .MuiDataGrid-footerContainer': { borderColor: 'divider' },
          }}
        />
      </Card>
    </Box>
  );
}
