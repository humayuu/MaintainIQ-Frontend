import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';

import issueApi from '../api/issueApi';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusChip from '../components/StatusChip';
import PriorityChip from '../components/PriorityChip';
import EmptyState from '../components/EmptyState';
import { ISSUE_STATUSES, ISSUE_PRIORITIES } from '../utils/constants';

const ALL = '__all__';

// Custom empty state shown in the grid when no issues match the filters.
function NoIssuesOverlay() {
  return (
    <EmptyState
      dense
      icon={SearchOffRoundedIcon}
      title="No issues found"
      description="No issues match the current filters. Try adjusting the status or priority."
    />
  );
}

export default function IssueList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [status, setStatus] = useState(ALL);
  const [priority, setPriority] = useState(ALL);

  const columns = [
    { field: 'issueNumber', headerName: 'Issue #', width: 130 },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 130,
      sortable: false,
      renderCell: (params) => <PriorityChip priority={params.value} />,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 190,
      sortable: false,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: 'assignedTechnician',
      headerName: 'Technician',
      width: 170,
      valueGetter: (value) =>
        value && typeof value === 'object' ? value.name : value || '—',
    },
  ];

  useEffect(() => {
    let active = true;

    async function fetchIssues() {
      setLoading(true);
      setError('');
      try {
        const params = {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
        };
        if (status !== ALL) params.status = status;
        if (priority !== ALL) params.priority = priority;

        const { data } = await issueApi.list(params);
        if (!active) return;
        // Backend envelope: { success, data: { issues, pagination } }.
        const list = data?.data?.issues ?? [];
        const total = data?.data?.pagination?.total ?? list.length;

        setRows(list.map((i) => ({ id: i.id ?? i._id, ...i })));
        setRowCount(total);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Failed to load issues.');
        setRows([]);
        setRowCount(0);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchIssues();
    return () => {
      active = false;
    };
  }, [paginationModel, status, priority]);

  const resetToFirstPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <PageHeader
        title="Issues"
        subtitle="Track reported problems and their maintenance progress."
      />

      <SectionCard
        title="Filters"
        subheader="Narrow the list by status or priority"
        icon={FilterAltRoundedIcon}
        sx={{ mb: 2.5 }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 200 }} fullWidth>
            <InputLabel id="issue-status-filter">Status</InputLabel>
            <Select
              labelId="issue-status-filter"
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                resetToFirstPage();
              }}
            >
              <MenuItem value={ALL}>All statuses</MenuItem>
              {ISSUE_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }} fullWidth>
            <InputLabel id="issue-priority-filter">Priority</InputLabel>
            <Select
              labelId="issue-priority-filter"
              label="Priority"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                resetToFirstPage();
              }}
            >
              <MenuItem value={ALL}>All priorities</MenuItem>
              {ISSUE_PRIORITIES.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </SectionCard>

      {error && (
        <Alert severity="error" icon={<ReportProblemRoundedIcon />} sx={{ mb: 2.5 }}>
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
          onRowClick={(params) => navigate(`/issues/${params.id}`)}
          getRowClassName={(params) =>
            params.row.priority === 'Critical' ? 'critical-row' : ''
          }
          autoHeight
          slots={{ noRowsOverlay: NoIssuesOverlay }}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
            '& .MuiDataGrid-cell': { borderColor: 'divider' },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
            '& .MuiDataGrid-footerContainer': { borderColor: 'divider' },
            // Critical issues get a bold red left border so they stand out.
            '& .critical-row': {
              borderLeft: '4px solid',
              borderColor: 'error.main',
            },
          }}
        />
      </Card>
    </Box>
  );
}
