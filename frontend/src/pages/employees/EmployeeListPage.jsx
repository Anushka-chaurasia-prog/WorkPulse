import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  AddRounded as AddIcon,
  SearchRounded as SearchIcon,
  ClearRounded as ClearIcon,
  VisibilityOutlined as ViewIcon,
  EditOutlined as EditIcon,
  DeleteOutlineRounded as DeleteIcon,
  TableRowsRounded as TableViewIcon,
  GridViewRounded as GridViewIcon,
  EmailOutlined as EmailIcon,
  PhoneOutlined as PhoneIcon,
  AttachMoneyRounded as MoneyIcon,
  EventOutlined as EventIcon,
} from '@mui/icons-material';
import employeeApi from '../../api/employeeApi';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import NotificationSnackbar from '../../components/NotificationSnackbar';
import UserAvatar from '../../components/UserAvatar';
import DepartmentBadge from '../../components/DepartmentBadge';

export const EmployeeListPage = () => {
  const navigate = useNavigate();

  // State
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notification Toast
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Delete Dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    employeeId: null,
    employeeName: '',
    loading: false,
  });

  // Search debounce: 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size,
        sort: 'createdAt,desc',
      };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const data = await employeeApi.getAllEmployees(params);
      setEmployees(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch employees. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, size, debouncedSearch]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDeleteDialog = (employee) => {
    setDeleteDialog({
      open: true,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      loading: false,
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog((prev) => ({ ...prev, open: false }));
  };

  const handleConfirmDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await employeeApi.deleteEmployee(deleteDialog.employeeId);
      setNotification({
        open: true,
        message: `Employee "${deleteDialog.employeeName}" deleted successfully.`,
        severity: 'success',
      });
      handleCloseDeleteDialog();

      if (employees.length === 1 && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        fetchEmployees();
      }
    } catch (err) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to delete employee.',
        severity: 'error',
      });
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Box>
      {/* Header Toolbar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} color="#18202F" letterSpacing={-0.5}>
            Staff Directory
          </Typography>
          <Typography variant="body2" color="#64748B" fontWeight={500}>
            {totalElements} total staff members registered
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, next) => next && setViewMode(next)}
            size="small"
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '999px',
              border: '1px solid #E2E8F0',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '999px',
                px: 1.5,
                color: '#64748B',
                '&.Mui-selected': {
                  bgcolor: '#18202F',
                  color: '#FFFFFF',
                },
              },
            }}
          >
            <ToggleButton value="table" aria-label="table view">
              <TableViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              <GridViewIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Add Employee CTA Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/employees/new')}
            sx={{
              py: 1.2,
              px: 3,
              fontSize: '0.9rem',
              boxShadow: '0 6px 18px rgba(255, 107, 74, 0.3)',
              flexGrow: { xs: 1, sm: 0 },
            }}
          >
            Add Employee
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }} action={<Button color="inherit" size="small" onClick={fetchEmployees}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 3,
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search by first name, last name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '999px',
              bgcolor: '#F8FAFC',
              fieldset: { border: 'none' },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94A3B8' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Paper>

      {/* Content Section: Table or Grid */}
      {loading ? (
        <LoadingState message="Loading staff directory..." />
      ) : employees.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: '24px', bgcolor: '#FFFFFF' }}>
          <EmptyState
            title={debouncedSearch ? 'No matching staff members' : 'No staff members registered'}
            description={
              debouncedSearch
                ? `No staff records match "${debouncedSearch}". Try searching with a different term.`
                : 'Your organization directory is currently empty. Click "Add Employee" to register staff.'
            }
            actionText={debouncedSearch ? 'Clear Filter' : 'Add Employee'}
            onAction={debouncedSearch ? () => setSearchTerm('') : () => navigate('/employees/new')}
          />
        </Paper>
      ) : viewMode === 'grid' ? (
        /* Grid Card View */
        <Box>
          <Grid container spacing={2.5}>
            {employees.map((emp) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={emp.id}>
                <Card
                  sx={{
                    p: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <UserAvatar name={`${emp.firstName} ${emp.lastName}`} size={64} sx={{ mb: 2 }} />
                    <Typography variant="h6" fontWeight={800} color="#18202F" lineHeight={1.2}>
                      {emp.firstName} {emp.lastName}
                    </Typography>
                    <Typography variant="caption" color="#64748B" fontWeight={500} sx={{ mb: 1.5 }}>
                      {emp.email}
                    </Typography>
                    <DepartmentBadge name={emp.departmentName || 'Unassigned'} />

                    <Box sx={{ width: '100%', my: 2, pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-around' }}>
                      <Box>
                        <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                          Salary
                        </Typography>
                        <Typography variant="body2" fontWeight={800} color="#18202F">
                          {formatCurrency(emp.salary)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                          Joined
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="#18202F">
                          {emp.joiningDate || '—'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 1 }}>
                      <Tooltip title="View Profile">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          sx={{ bgcolor: '#F1F5F9', color: '#18202F', '&:hover': { bgcolor: '#E2E8F0' } }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/employees/${emp.id}/edit`)}
                          sx={{ bgcolor: '#F1F5F9', color: '#FF6B4A', '&:hover': { bgcolor: '#FFE4E6' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(emp)}
                          sx={{ bgcolor: '#F1F5F9', color: '#F43F5E', '&:hover': { bgcolor: '#FFE4E6' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <TablePagination
              rowsPerPageOptions={[6, 12, 24, 48]}
              component="div"
              count={totalElements}
              rowsPerPage={size}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ bgcolor: '#FFFFFF', borderRadius: '999px', px: 2, border: '1px solid #E2E8F0' }}
            />
          </Box>
        </Box>
      ) : (
        /* Table View */
        <Paper sx={{ borderRadius: '24px', overflow: 'hidden', bgcolor: '#FFFFFF', border: '1px solid #F1F5F9' }}>
          <TableContainer>
            <Table aria-label="employee table">
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Joining Date</TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    hover
                    sx={{
                      transition: 'background-color 0.15s',
                      '&:hover': { bgcolor: '#F8FAFC' },
                    }}
                  >
                    {/* Member Name + Avatar */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <UserAvatar name={`${emp.firstName} ${emp.lastName}`} size={42} />
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={800}
                            color="#18202F"
                            sx={{ cursor: 'pointer', '&:hover': { color: '#FF6B4A' } }}
                            onClick={() => navigate(`/employees/${emp.id}`)}
                          >
                            {emp.firstName} {emp.lastName}
                          </Typography>
                          <Typography variant="caption" color="#64748B" fontWeight={500}>
                            {emp.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      <DepartmentBadge name={emp.departmentName || 'Unassigned'} />
                    </TableCell>

                    {/* Contact (Phone) */}
                    <TableCell>
                      <Typography variant="body2" color="#334155" fontWeight={600}>
                        {emp.phone || '—'}
                      </Typography>
                    </TableCell>

                    {/* Salary */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={800} color="#0F172A" sx={{ fontFamily: 'monospace' }}>
                        {formatCurrency(emp.salary)}
                      </Typography>
                    </TableCell>

                    {/* Joining Date */}
                    <TableCell>
                      <Typography variant="body2" color="#64748B" fontWeight={600}>
                        {emp.joiningDate || '—'}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ pr: 2 }}>
                      <Tooltip title="View Profile">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          sx={{ color: '#64748B', '&:hover': { color: '#18202F', bgcolor: '#F1F5F9' } }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Profile">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/employees/${emp.id}/edit`)}
                          sx={{ color: '#64748B', '&:hover': { color: '#FF6B4A', bgcolor: '#FFF1F2' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(emp)}
                          sx={{ color: '#64748B', '&:hover': { color: '#F43F5E', bgcolor: '#FFF1F2' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalElements}
            rowsPerPage={size}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: '1px solid #F1F5F9' }}
          />
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Staff Member"
        content={`Are you sure you want to delete "${deleteDialog.employeeName}"? This action cannot be undone.`}
        confirmText="Delete Member"
        confirmColor="error"
        loading={deleteDialog.loading}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDeleteDialog}
      />

      {/* Notifications */}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default EmployeeListPage;
