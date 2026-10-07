import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  ArrowBackRounded as ArrowBackIcon,
  EditOutlined as EditIcon,
  EmailOutlined as EmailIcon,
  PhoneOutlined as PhoneIcon,
  AttachMoneyRounded as MoneyIcon,
  CalendarTodayOutlined as CalendarIcon,
  ApartmentRounded as BusinessIcon,
  FingerprintRounded as IdIcon,
  AccessTimeRounded as TimeIcon,
} from '@mui/icons-material';
import employeeApi from '../../api/employeeApi';
import LoadingState from '../../components/LoadingState';
import UserAvatar from '../../components/UserAvatar';
import DepartmentBadge from '../../components/DepartmentBadge';

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
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDateTime = (dateStr) => {
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

  if (loading) {
    return <LoadingState message="Loading staff profile..." />;
  }

  if (error || !employee) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>
          {error || 'Employee record not found.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/employees')}
          sx={{ borderRadius: '999px', color: '#1E293B', borderColor: '#CBD5E1' }}
        >
          Back to Directory
        </Button>
      </Box>
    );
  }

  const monthlySalary = employee.salary ? Math.round(Number(employee.salary) / 12) : 0;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      {/* Top Profile Hero Card */}
      <Card sx={{ mb: 3.5, p: 1 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <UserAvatar
                name={`${employee.firstName} ${employee.lastName}`}
                size={84}
                sx={{ boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
              />
              <Box>
                <Typography variant="h4" fontWeight={800} color="#18202F" letterSpacing={-0.5}>
                  {employee.firstName} {employee.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
                  <DepartmentBadge name={employee.departmentName || 'Unassigned'} size="medium" />
                  <Typography variant="caption" color="#64748B" fontWeight={600}>
                    Joined {employee.joiningDate || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/employees')}
                sx={{
                  borderColor: '#CBD5E1',
                  color: '#1E293B',
                  flexGrow: { xs: 1, sm: 0 },
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/employees/${employee.id}/edit`)}
                sx={{
                  boxShadow: '0 6px 18px rgba(255, 107, 74, 0.3)',
                  flexGrow: { xs: 1, sm: 0 },
                }}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Bento Grid */}
      <Grid container spacing={3}>
        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} color="#18202F" gutterBottom>
                Contact & Communication
              </Typography>
              <Typography variant="caption" color="#64748B" fontWeight={500} sx={{ display: 'block', mb: 3 }}>
                Verified contact channels
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '14px',
                      bgcolor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EmailIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                      Email Address
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      color="#18202F"
                      component="a"
                      href={`mailto:${employee.email}`}
                      sx={{ textDecoration: 'none', '&:hover': { color: '#FF6B4A' } }}
                    >
                      {employee.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '14px',
                      bgcolor: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PhoneIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                      Phone Number
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="#18202F">
                      {employee.phone || 'No phone number provided'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Compensation & Tenure */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} color="#18202F" gutterBottom>
                Compensation & Tenure
              </Typography>
              <Typography variant="caption" color="#64748B" fontWeight={500} sx={{ display: 'block', mb: 3 }}>
                Salary allocation and start milestone
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '14px',
                      bgcolor: '#FEF3C7',
                      color: '#D97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MoneyIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                      Annual Compensation
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="#18202F">
                      {formatCurrency(employee.salary)}
                      <Typography variant="caption" color="#64748B" sx={{ ml: 1 }}>
                        (~${monthlySalary.toLocaleString()}/mo)
                      </Typography>
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '14px',
                      bgcolor: '#F3E8FF',
                      color: '#9333EA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CalendarIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                      Joining Date
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="#18202F">
                      {employee.joiningDate || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System & Metadata */}
        <Grid item xs={12}>
          <Card sx={{ p: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} color="#18202F" gutterBottom>
                Organizational Assignment & Record Metadata
              </Typography>
              <Typography variant="caption" color="#64748B" fontWeight={500} sx={{ display: 'block', mb: 3 }}>
                Internal database identifiers and timestamps
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <BusinessIcon sx={{ color: '#94A3B8' }} />
                    <Box>
                      <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                        Assigned Unit
                      </Typography>
                      <Typography variant="body2" fontWeight={800} color="#18202F">
                        {employee.departmentName || 'Unassigned'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IdIcon sx={{ color: '#94A3B8' }} />
                    <Box>
                      <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                        Unique Identifier
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="#64748B" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {employee.id}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TimeIcon sx={{ color: '#94A3B8' }} />
                    <Box>
                      <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                        Record Created
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="#18202F">
                        {formatDateTime(employee.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDetailsPage;
