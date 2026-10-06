import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  PersonAdd as PersonAddIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import employeeApi from '../api/employeeApi';
import departmentApi from '../api/departmentApi';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Parallel fetch for real stats from backend
      const [empRes, deptRes] = await Promise.all([
        employeeApi.getAllEmployees({ page: 0, size: 1 }),
        departmentApi.getAllDepartments(),
      ]);

      setTotalEmployees(empRes.totalElements || 0);
      setDepartments(deptRes || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load dashboard metrics. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading dashboard statistics..." />;
  }

  return (
    <Box>
      <PageHeader
        title="Organization Dashboard"
        subtitle="Real-time overview of employees and departmental distribution"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={fetchDashboardData}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {/* Summary KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              borderLeft: '6px solid #1976d2',
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                display: 'flex',
                mr: 2.5,
              }}
            >
              <PeopleIcon sx={{ fontSize: 36 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Total Employees
              </Typography>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {totalEmployees}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/employees')}
              endIcon={<ArrowForwardIcon />}
              sx={{ textTransform: 'none' }}
            >
              View
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              borderLeft: '6px solid #9c27b0',
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'secondary.light',
                color: 'secondary.contrastText',
                display: 'flex',
                mr: 2.5,
              }}
            >
              <BusinessIcon sx={{ fontSize: 36 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Total Departments
              </Typography>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {departments.length}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => navigate('/departments')}
              endIcon={<ArrowForwardIcon />}
              sx={{ textTransform: 'none' }}
            >
              View
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Action Navigation & Department Breakdown */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Department Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Live staff counts across active organizational departments.
              </Typography>
              <Divider sx={{ mb: 1 }} />

              {departments.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No departments created yet.
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    onClick={() => navigate('/departments')}
                    sx={{ mt: 1, textTransform: 'none' }}
                  >
                    Create a Department
                  </Button>
                </Box>
              ) : (
                <List dense>
                  {departments.map((dept) => (
                    <ListItem
                      key={dept.id}
                      sx={{
                        py: 1,
                        px: 1.5,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      secondaryAction={
                        <Chip
                          label={`${dept.employeeCount} ${
                            dept.employeeCount === 1 ? 'employee' : 'employees'
                          }`}
                          size="small"
                          color={dept.employeeCount > 0 ? 'primary' : 'default'}
                          variant={dept.employeeCount > 0 ? 'filled' : 'outlined'}
                        />
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={500}>
                            {dept.name}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Fast pathways to common administrative operations.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate('/employees/new')}
                  sx={{ py: 1.2, textTransform: 'none', justifyContent: 'flex-start', px: 2 }}
                >
                  Add New Employee
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/employees')}
                  sx={{ py: 1.2, textTransform: 'none', justifyContent: 'flex-start', px: 2 }}
                >
                  Browse All Employees
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  startIcon={<BusinessIcon />}
                  onClick={() => navigate('/departments')}
                  sx={{ py: 1.2, textTransform: 'none', justifyContent: 'flex-start', px: 2 }}
                >
                  Manage Departments
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
