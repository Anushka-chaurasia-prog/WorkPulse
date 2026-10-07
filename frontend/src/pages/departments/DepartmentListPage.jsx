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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  AddRounded as AddIcon,
  EditOutlined as EditIcon,
  DeleteOutlineRounded as DeleteIcon,
  ApartmentRounded as BusinessIcon,
  PeopleAltOutlined as PeopleIcon,
  TableRowsRounded as TableViewIcon,
  GridViewRounded as GridViewIcon,
  CalendarTodayOutlined as CalendarIcon,
} from '@mui/icons-material';
import departmentApi from '../../api/departmentApi';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import NotificationSnackbar from '../../components/NotificationSnackbar';
import DepartmentBadge from '../../components/DepartmentBadge';

export const DepartmentListPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

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
        setNotification({
          open: true,
          message:
            err.response?.data?.message ||
            'This department cannot be deleted because it still has employees assigned.',
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
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
            Department Directory
          </Typography>
          <Typography variant="body2" color="#64748B" fontWeight={500}>
            {departments.length} active business units & allocations
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
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
            <ToggleButton value="grid" aria-label="grid view">
              <GridViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <TableViewIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              py: 1.2,
              px: 3,
              fontSize: '0.9rem',
              boxShadow: '0 6px 18px rgba(255, 107, 74, 0.3)',
              flexGrow: { xs: 1, sm: 0 },
            }}
          >
            Create Department
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }} action={<Button color="inherit" size="small" onClick={fetchDepartments}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingState message="Loading departments..." />
      ) : departments.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: '24px', bgcolor: '#FFFFFF' }}>
          <EmptyState
            title="No departments found"
            description="Your organization currently has no established departments. Click 'Create Department' to create your first unit."
            actionText="Create Department"
            onAction={handleOpenCreate}
          />
        </Paper>
      ) : viewMode === 'grid' ? (
        /* Grid Card View */
        <Grid container spacing={2.5}>
          {departments.map((dept) => (
            <Grid item xs={12} sm={6} md={4} key={dept.id}>
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
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        bgcolor: 'rgba(255, 107, 74, 0.12)',
                        color: '#FF6B4A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BusinessIcon />
                    </Box>
                    <DepartmentBadge name={dept.name} />
                  </Box>

                  <Typography variant="h6" fontWeight={800} color="#18202F" sx={{ mb: 1 }}>
                    {dept.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B', mb: 2 }}>
                    <PeopleIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2" fontWeight={600}>
                      {dept.employeeCount} assigned {dept.employeeCount === 1 ? 'member' : 'members'}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94A3B8' }}>
                      <CalendarIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption" fontWeight={600}>
                        {formatDate(dept.createdAt)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit Department">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(dept)}
                          sx={{ color: '#64748B', '&:hover': { color: '#FF6B4A', bgcolor: '#FFF1F2' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Department">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDelete(dept)}
                          sx={{ color: '#64748B', '&:hover': { color: '#F43F5E', bgcolor: '#FFF1F2' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* Table View */
        <Paper sx={{ borderRadius: '24px', overflow: 'hidden', bgcolor: '#FFFFFF', border: '1px solid #F1F5F9' }}>
          <TableContainer>
            <Table aria-label="departments table">
              <TableHead>
                <TableRow>
                  <TableCell>Department</TableCell>
                  <TableCell>Staff Allocation</TableCell>
                  <TableCell>Established Date</TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow
                    key={dept.id}
                    hover
                    sx={{
                      transition: 'background-color 0.15s',
                      '&:hover': { bgcolor: '#F8FAFC' },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <DepartmentBadge name={dept.name} />
                        <Typography variant="subtitle2" fontWeight={800} color="#18202F">
                          {dept.name}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#18202F">
                        {dept.employeeCount} {dept.employeeCount === 1 ? 'member' : 'members'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="#64748B" fontWeight={600}>
                        {formatDate(dept.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ pr: 2 }}>
                      <Tooltip title="Edit Department">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(dept)}
                          sx={{ color: '#64748B', '&:hover': { color: '#FF6B4A', bgcolor: '#FFF1F2' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Department">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDelete(dept)}
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
        </Paper>
      )}

      {/* Create / Edit Modal Dialog */}
      <Dialog
        open={formDialog.open}
        onClose={handleCloseFormDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <Box component="form" onSubmit={handleFormSubmit} noValidate>
          <DialogTitle fontWeight={800} color="#18202F">
            {formDialog.isEdit ? 'Edit Department' : 'Create New Department'}
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            {formDialog.serverError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                {formDialog.serverError}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Department Name"
              placeholder="e.g. Platform Engineering"
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
              helperText={formDialog.nameError || `${formDialog.name.length}/100 characters`}
              disabled={formDialog.submitting}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={handleCloseFormDialog}
              disabled={formDialog.submitting}
              sx={{ color: '#64748B' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formDialog.submitting}
              sx={{ px: 3, boxShadow: '0 4px 14px rgba(255, 107, 74, 0.3)' }}
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
            ? `Warning: Department "${deleteDialog.departmentName}" has ${deleteDialog.employeeCount} active assigned staff. Deleting it will be rejected by the server.`
            : `Are you sure you want to delete the department "${deleteDialog.departmentName}"? This action cannot be undone.`
        }
        confirmText="Delete Department"
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
