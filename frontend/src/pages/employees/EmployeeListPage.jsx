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
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import employeeApi from '../../api/employeeApi';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import NotificationSnackbar from '../../components/NotificationSnackbar';

export const EmployeeListPage = () => {
  const navigate = useNavigate();

  // State
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notification Snackbar
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
      setPage(0); // Reset to page 0 when search term changes
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
      setTotalPages(data.totalPages || 0);
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

      // If deleting the last item on a page > 0, decrement page
      if (employees.length === 1 && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        fetchEmployees();
      }
    } catch (err) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
      const msg = err.response?.data?.message || 'Failed to delete employee.';
      setNotification({
        open: true,
        message: msg,
        severity: 'error',
      });
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  return (
    <Box>
      <PageHeader
        title="Employee Directory"
        subtitle="Manage, search, and organize staff records across your organization"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/employees/new')}
            sx={{ textTransform: 'none', px: 2.5 }}
          >
            Add Employee
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={fetchEmployees}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by first name, last name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
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
        </Box>
      </Paper>

      {/* Employees Table */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <LoadingState message="Loading employees..." />
        ) : employees.length === 0 ? (
          <EmptyState
            icon={PeopleIcon}
            title={debouncedSearch ? 'No matching employees' : 'No employees found'}
            description={
              debouncedSearch
                ? `No employee records match the search "${debouncedSearch}". Try a different keyword.`
                : 'Your organization currently has no employee records. Click "Add Employee" to create one.'
            }
            actionText={debouncedSearch ? 'Clear Search' : 'Add Employee'}
            onAction={
              debouncedSearch
                ? () => setSearchTerm('')
                : () => navigate('/employees/new')
            }
          />
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="employee table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Salary</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Joining Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, pr: 3 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {emp.firstName} {emp.lastName}
                      </TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.phone || '—'}</TableCell>
                      <TableCell>{formatCurrency(emp.salary)}</TableCell>
                      <TableCell>{emp.joiningDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={emp.departmentName || 'Unassigned'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 2 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => navigate(`/employees/${emp.id}`)}
                            aria-label={`View ${emp.firstName} ${emp.lastName}`}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Employee">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/employees/${emp.id}/edit`)}
                            aria-label={`Edit ${emp.firstName} ${emp.lastName}`}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Employee">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(emp)}
                            aria-label={`Delete ${emp.firstName} ${emp.lastName}`}
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
              sx={{ borderTop: '1px solid #e0e0e0' }}
            />
          </>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Employee"
        content={`Are you sure you want to delete "${deleteDialog.employeeName}"? This action cannot be undone.`}
        confirmText="Delete"
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
