import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import employeeApi from '../../api/employeeApi';
import departmentApi from '../../api/departmentApi';
import PageHeader from '../../components/PageHeader';
import LoadingState from '../../components/LoadingState';

export const EmployeeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0], // Default today: YYYY-MM-DD
    departmentId: '',
  });

  const [departments, setDepartments] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Fetch departments and optionally employee data on mount
  useEffect(() => {
    const initForm = async () => {
      try {
        const deptList = await departmentApi.getAllDepartments();
        setDepartments(deptList || []);

        if (isEditMode) {
          const emp = await employeeApi.getEmployeeById(id);
          setFormData({
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            email: emp.email || '',
            phone: emp.phone || '',
            salary: emp.salary !== null && emp.salary !== undefined ? String(emp.salary) : '',
            joiningDate: emp.joiningDate || new Date().toISOString().split('T')[0],
            departmentId: emp.departmentId || '',
          });
        }
      } catch (err) {
        setServerError(
          err.response?.data?.message || 'Failed to initialize form data. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    initForm();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please provide a valid email address';
      }
    }

    if (formData.phone && formData.phone.trim().length > 20) {
      errors.phone = 'Phone number cannot exceed 20 characters';
    }

    if (formData.salary !== '' && formData.salary !== null && formData.salary !== undefined) {
      const numSalary = Number(formData.salary);
      if (isNaN(numSalary) || numSalary < 0) {
        errors.salary = 'Salary must be a non-negative number';
      }
    }

    if (!formData.joiningDate) {
      errors.joiningDate = 'Joining date is required';
    }

    if (!formData.departmentId) {
      errors.departmentId = 'Please select a department';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      salary: formData.salary !== '' ? Number(formData.salary) : 0,
      joiningDate: formData.joiningDate,
      departmentId: formData.departmentId,
    };

    try {
      if (isEditMode) {
        await employeeApi.updateEmployee(id, payload);
      } else {
        await employeeApi.createEmployee(payload);
      }

      navigate('/employees');
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 409) {
          setServerError(data?.message || 'An employee with this email already exists.');
        } else if (status === 400) {
          if (data?.validationErrors && typeof data.validationErrors === 'object') {
            const validationList = Object.entries(data.validationErrors)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(', ');
            setServerError(validationList || data?.message || 'Validation failed.');
          } else {
            setServerError(data?.message || 'Invalid input data.');
          }
        } else if (status === 404) {
          setServerError(data?.message || 'Employee or Department not found.');
        } else if (status >= 500) {
          setServerError('Something went wrong on the server. Please try again.');
        } else {
          setServerError(data?.message || 'Operation failed. Please try again.');
        }
      } else if (err.request) {
        setServerError('Cannot connect to backend server. Check your network connection.');
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message={isEditMode ? 'Loading employee data...' : 'Loading form...'} />;
  }

  return (
    <Box>
      <PageHeader
        title={isEditMode ? 'Edit Employee' : 'Add New Employee'}
        subtitle={
          isEditMode
            ? 'Update the employee information and department assignment below'
            : 'Fill in the information to register a new employee in the system'
        }
        action={
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/employees')}
            sx={{ textTransform: 'none' }}
          >
            Back to Employees
          </Button>
        }
      />

      {serverError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {serverError}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Personal & Contact Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                error={Boolean(formErrors.firstName)}
                helperText={formErrors.firstName}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                error={Boolean(formErrors.lastName)}
                helperText={formErrors.lastName}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(formErrors.email)}
                helperText={formErrors.email}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone Number (Optional)"
                value={formData.phone}
                onChange={handleChange}
                error={Boolean(formErrors.phone)}
                helperText={formErrors.phone}
                disabled={submitting}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" fontWeight={600} sx={{ mt: 4 }} gutterBottom>
            Employment & Compensation
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="salary"
                name="salary"
                label="Annual Salary ($)"
                type="number"
                inputProps={{ min: 0, step: '100' }}
                value={formData.salary}
                onChange={handleChange}
                error={Boolean(formErrors.salary)}
                helperText={formErrors.salary || 'e.g. 75000'}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                id="joiningDate"
                name="joiningDate"
                label="Joining Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.joiningDate}
                onChange={handleChange}
                error={Boolean(formErrors.joiningDate)}
                helperText={formErrors.joiningDate}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                select
                id="departmentId"
                name="departmentId"
                label="Department"
                value={formData.departmentId}
                onChange={handleChange}
                error={Boolean(formErrors.departmentId)}
                helperText={formErrors.departmentId}
                disabled={submitting || departments.length === 0}
              >
                {departments.length === 0 ? (
                  <MenuItem value="" disabled>
                    No departments available
                  </MenuItem>
                ) : (
                  departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/employees')}
              disabled={submitting}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{ textTransform: 'none', px: 3 }}
            >
              {submitting ? 'Saving...' : isEditMode ? 'Update Employee' : 'Create Employee'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmployeeFormPage;
