import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import departmentApi from '../../api/departmentApi';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import NotificationSnackbar from '../../components/NotificationSnackbar';

export const DepartmentListPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Create/Edit Dialog state
  const [formDialog, setFormDialog] = useState({
    open: false,
    isEdit: false,
    departmentId: null,
    name: '',
    nameError: '',
    serverError: '',
    submitting: false,
  });

  // Delete Dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    departmentId: null,
    departmentName: '',
    employeeCount: 0,
    loading: false,
  });

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await departmentApi.getAllDepartments();
      setDepartments(data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load departments. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setFormDialog({
      open: true,
      isEdit: false,
      departmentId: null,
      name: '',
      nameError: '',
      serverError: '',
      submitting: false,
    });
  };

  // Open Edit Dialog
  const handleOpenEdit = (dept) => {
    setFormDialog({
      open: true,
      isEdit: true,
      departmentId: dept.id,
      name: dept.name,
      nameError: '',
      serverError: '',
      submitting: false,
    });
  };

  const handleCloseFormDialog = () => {
    if (!formDialog.submitting) {
      setFormDialog((prev) => ({ ...prev, open: false }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formDialog.name.trim();

    if (!trimmedName) {
      setFormDialog((prev) => ({ ...prev, nameError: 'Department name is required' }));
      return;
    }
    if (trimmedName.length > 100) {
      setFormDialog((prev) => ({
        ...prev,
        nameError: 'Department name cannot exceed 100 characters',
      }));
      return;
    }

    setFormDialog((prev) => ({ ...prev, submitting: true, serverError: '', nameError: '' }));

    try {
      if (formDialog.isEdit) {
        await departmentApi.updateDepartment(formDialog.departmentId, { name: trimmedName });
        setNotification({
          open: true,
          message: `Department "${trimmedName}" updated successfully.`,
          severity: 'success',
        });
      } else {
        await departmentApi.createDepartment({ name: trimmedName });
        setNotification({
          open: true,
          message: `Department "${trimmedName}" created successfully.`,
          severity: 'success',
        });
      }

      handleCloseFormDialog();
      fetchDepartments();
    } catch (err) {
      let msg = 'Failed to save department.';
      if (err.response) {
        const { status, data } = err.response;
        if (status === 409) {
          msg = data?.message || 'A department with this name already exists.';
        } else if (status === 400) {
          msg = data?.message || 'Invalid department name.';
        } else {
          msg = data?.message || 'Server error occurred.';
        }
      }
      setFormDialog((prev) => ({
        ...prev,
        submitting: false,
        serverError: msg,
      }));
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (dept) => {
    setDeleteDialog({
      open: true,
      departmentId: dept.id,
      departmentName: dept.name,
      employeeCount: dept.employeeCount || 0,
      loading: false,
    });
  };

  const handleCloseDelete = () => {
    if (!deleteDialog.loading) {
      setDeleteDialog((prev) => ({ ...prev, open: false }));
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await departmentApi.deleteDepartment(deleteDialog.departmentId);
      setNotification({
        open: true,
        message: `Department "${deleteDialog.departmentName}" deleted successfully.`,
        severity: 'success',
      });
      handleCloseDelete();
      fetchDepartments();
    } catch (err) {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
      if (err.response && err.response.status === 409) {
        // Business rule: department has employees
        setNotification({
          open: true,
          message:
            err.response?.data?.message ||
            'This department cannot be deleted because it still has employees.',
          severity: 'error',
        });
      } else {
        setNotification({
          open: true,
          message: err.response?.data?.message || 'Failed to delete department.',
          severity: 'error',
        });
      }
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Departments"
        subtitle="Manage organizational business units and staff allocations"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ textTransform: 'none', px: 2.5 }}
          >
            Create Department
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={fetchDepartments}>Retry</Button>}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <LoadingState message="Loading departments..." />
        ) : departments.length === 0 ? (
          <EmptyState
            icon={BusinessIcon}
            title="No departments found"
            description="No departments exist yet. Click 'Create Department' to establish your first business unit."
            actionText="Create Department"
            onAction={handleOpenCreate}
          />
        ) : (
          <TableContainer>
            <Table aria-label="departments table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Department Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assigned Employees</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, pr: 3 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{dept.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${dept.employeeCount} ${
                          dept.employeeCount === 1 ? 'employee' : 'employees'
                        }`}
                        size="small"
                        color={dept.employeeCount > 0 ? 'primary' : 'default'}
                        variant={dept.employeeCount > 0 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(dept.createdAt)}</TableCell>
                    <TableCell align="right" sx={{ pr: 2 }}>
                      <Tooltip title="Edit Department">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(dept)}
                          aria-label={`Edit ${dept.name}`}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Department">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDelete(dept)}
                          aria-label={`Delete ${dept.name}`}
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
        )}
      </Paper>

      {/* Create / Edit Modal Dialog */}
      <Dialog
        open={formDialog.open}
        onClose={handleCloseFormDialog}
        maxWidth="xs"
        fullWidth
      >
        <Box component="form" onSubmit={handleFormSubmit} noValidate>
          <DialogTitle fontWeight={600}>
            {formDialog.isEdit ? 'Edit Department' : 'Create Department'}
          </DialogTitle>
          <DialogContent>
            {formDialog.serverError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formDialog.serverError}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Department Name"
              type="text"
              fullWidth
              required
              value={formDialog.name}
              onChange={(e) =>
                setFormDialog((prev) => ({
                  ...prev,
                  name: e.target.value,
                  nameError: '',
                }))
              }
              error={Boolean(formDialog.nameError)}
              helperText={formDialog.nameError}
              disabled={formDialog.submitting}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseFormDialog}
              disabled={formDialog.submitting}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formDialog.submitting}
            >
              {formDialog.submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : formDialog.isEdit ? (
                'Save Changes'
              ) : (
                'Create'
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Department"
        content={
          deleteDialog.employeeCount > 0
            ? `Warning: Department "${deleteDialog.departmentName}" has ${deleteDialog.employeeCount} assigned employees. Deleting it may be rejected by the server.`
            : `Are you sure you want to delete the department "${deleteDialog.departmentName}"? This action cannot be undone.`
        }
        confirmText="Delete"
        confirmColor="error"
        loading={deleteDialog.loading}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDelete}
      />

      {/* Notification Toast */}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default DepartmentListPage;
