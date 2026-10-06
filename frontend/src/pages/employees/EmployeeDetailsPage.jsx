import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import employeeApi from '../../api/employeeApi';
import PageHeader from '../../components/PageHeader';
import LoadingState from '../../components/LoadingState';

export const EmployeeDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await employeeApi.getEmployeeById(id);
        setEmployee(data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Employee record not found or could not be loaded.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <LoadingState message="Loading employee details..." />;
  }

  if (error || !employee) {
    return (
      <Box>
        <PageHeader title="Employee Details" />
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Employee not found.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/employees')}
          sx={{ textTransform: 'none' }}
        >
          Back to Directory
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        subtitle="Detailed staff profile and organizational assignment"
        action={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/employees')}
              sx={{ textTransform: 'none' }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/employees/${employee.id}/edit`)}
              sx={{ textTransform: 'none' }}
            >
              Edit Employee
            </Button>
          </Box>
        }
      />

      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {employee.firstName} {employee.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={employee.departmentName || 'Unassigned'}
                color="primary"
                size="small"
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                ID: {employee.id}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <EmailIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email Address
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {employee.email}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <PhoneIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {employee.phone || 'Not provided'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <MoneyIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Annual Compensation
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatCurrency(employee.salary)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <EventIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Joining Date
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {employee.joiningDate}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <BusinessIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Assigned Department
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {employee.departmentName || 'Unassigned'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <AccessTimeIcon color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Record Created
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatDateTime(employee.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EmployeeDetailsPage;
