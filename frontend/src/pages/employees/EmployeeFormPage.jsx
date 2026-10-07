import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import {
  SaveRounded as SaveIcon,
  ArrowBackRounded as ArrowBackIcon,
  PersonOutlineRounded as PersonIcon,
  EmailOutlined as EmailIcon,
  PhoneOutlined as PhoneIcon,
  AttachMoneyRounded as MoneyIcon,
  CalendarTodayOutlined as CalendarIcon,
  ApartmentRounded as DepartmentIcon,
} from '@mui/icons-material';
import employeeApi from '../../api/employeeApi';
import departmentApi from '../../api/departmentApi';
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
    joiningDate: new Date().toISOString().split('T')[0],
    departmentId: '',
  });

  const [departments, setDepartments] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

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
        } else {
          setServerError(data?.message || 'Operation failed. Please try again.');
        }
      } else {
        setServerError('Cannot connect to backend server. Check your network connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message={isEditMode ? 'Loading employee profile...' : 'Preparing form...'} />;
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#18202F" letterSpacing={-0.5}>
            {isEditMode ? 'Edit Staff Profile' : 'Add New Staff Member'}
          </Typography>
          <Typography variant="body2" color="#64748B" fontWeight={500}>
            {isEditMode
              ? 'Modify employee personal information and organizational assignment'
              : 'Register a new employee profile in the organizational directory'}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/employees')}
          sx={{
            borderColor: '#CBD5E1',
            color: '#1E293B',
            '&:hover': { borderColor: '#18202F', bgcolor: '#FFFFFF' },
          }}
        >
          Back
        </Button>
      </Box>

      {serverError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>
          {serverError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* Section 1: Personal & Contact */}
        <Card sx={{ mb: 3, p: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={800} color="#18202F" gutterBottom>
              Personal & Contact Information
            </Typography>
            <Typography variant="caption" color="#64748B" fontWeight={500} sx={{ display: 'block', mb: 3 }}>
              Basic identification and communication details
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  placeholder="e.g. Dana"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={Boolean(formErrors.firstName)}
                  helperText={formErrors.firstName}
                  disabled={submitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  placeholder="e.g. Vance"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={Boolean(formErrors.lastName)}
                  helperText={formErrors.lastName}
                  disabled={submitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  }}
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
                  placeholder="e.g. dana.vance@workpulse.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(formErrors.email)}
                  helperText={formErrors.email}
                  disabled={submitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  placeholder="+1 (555) 019-2834"
                  value={formData.phone}
                  onChange={handleChange}
                  error={Boolean(formErrors.phone)}
                  helperText={formErrors.phone}
                  disabled={submitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 2: Compensation & Assignment */}
        <Card sx={{ mb: 4, p: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={800} color="#18202F" gutterBottom>
              Employment & Assignment
            </Typography>
            <Typography variant="caption" color="#64748B" fontWeight={500} sx={{ display: 'block', mb: 3 }}>
              Compensation rate, start tenure, and department allocation
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="salary"
                  name="salary"
                  label="Annual Salary ($)"
                  type="number"
                  placeholder="95000"
                  inputProps={{ min: 0, step: '100' }}
                  value={formData.salary}
                  onChange={handleChange}
                  error={Boolean(formErrors.salary)}
                  helperText={formErrors.salary || 'Annual USD compensation'}
                  disabled={submitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  }}
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  }}
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DepartmentIcon sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  }}
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
          </CardContent>
        </Card>

        {/* Action Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/employees')}
            disabled={submitting}
            sx={{ px: 3, py: 1.2, borderColor: '#CBD5E1', color: '#1E293B' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
              px: 4,
              py: 1.2,
              fontSize: '0.95rem',
              boxShadow: '0 6px 20px rgba(255, 107, 74, 0.3)',
            }}
          >
            {submitting ? 'Saving...' : isEditMode ? 'Update Profile' : 'Save Employee'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeFormPage;
