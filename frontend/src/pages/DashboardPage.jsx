import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  PeopleAltRounded as PeopleIcon,
  ApartmentRounded as BusinessIcon,
  PersonAddAlt1Rounded as PersonAddIcon,
  ArrowForwardRounded as ArrowForwardIcon,
  TrendingUpRounded as TrendingUpIcon,
  CheckCircleOutlineRounded as CheckIcon,
  MoreHorizRounded as MoreIcon,
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';
import employeeApi from '../api/employeeApi';
import departmentApi from '../api/departmentApi';
import StatCard from '../components/StatCard';
import UserAvatar from '../components/UserAvatar';
import DepartmentBadge from '../components/DepartmentBadge';
import MiniCalendar from '../components/MiniCalendar';
import LoadingState from '../components/LoadingState';

const pastelGradients = [
  { bg: '#F3E8FF', bar: '#A855F7', text: '#7E22CE' }, // Lavender
  { bg: '#E6FBF2', bar: '#10B981', text: '#0D9488' }, // Mint
  { bg: '#FEF9C3', bar: '#F59E0B', text: '#B45309' }, // Amber
  { bg: '#E0F2FE', bar: '#0284C7', text: '#0369A1' }, // Sky
  { bg: '#FFE4E6', bar: '#F43F5E', text: '#E11D48' }, // Rose
];

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [empRes, deptRes] = await Promise.all([
        employeeApi.getAllEmployees({ page: 0, size: 8, sort: 'createdAt,desc' }),
        departmentApi.getAllDepartments(),
      ]);

      setTotalEmployees(empRes.totalElements || 0);
      setRecentEmployees(empRes.content || []);
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
    return <LoadingState message="Loading organization metrics..." />;
  }

  return (
    <Box>
      {/* Welcome Banner */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={800} color="#18202F" letterSpacing={-1}>
          Welcome, {user?.username || 'Team Lead'}!
        </Typography>
        <Typography variant="body1" color="#64748B" fontWeight={500} sx={{ mt: 0.5 }}>
          Here is your organization directory and headcount distribution for today
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }} action={<Button color="inherit" size="small" onClick={fetchDashboardData}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {/* Top Grid: Calendar + KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Mini Calendar Widget */}
        <Grid item xs={12} md={4}>
          <MiniCalendar />
        </Grid>

        {/* Stats & Department Progress */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid item xs={12} sm={6}>
              <StatCard
                title="Total Staff Members"
                value={totalEmployees}
                subtitle="Active registered employees"
                icon={PeopleIcon}
                accentColor="#FF6B4A"
                onClick={() => navigate('/employees')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatCard
                title="Active Departments"
                value={departments.length}
                subtitle="Organized business units"
                icon={BusinessIcon}
                accentColor="#0284C7"
                onClick={() => navigate('/departments')}
              />
            </Grid>
          </Grid>

          {/* Department Headcount Allocation Card */}
          <Card sx={{ p: 1 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#18202F">
                    Department Headcount Breakdown
                  </Typography>
                  <Typography variant="caption" color="#64748B" fontWeight={500}>
                    Real-time staff allocation by unit
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate('/departments')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ color: '#FF6B4A', fontWeight: 700 }}
                >
                  Manage
                </Button>
              </Box>

              {departments.length === 0 ? (
                <Typography variant="body2" color="#94A3B8" sx={{ py: 2, textAlign: 'center' }}>
                  No departments found. Create your first department to see distribution.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {departments.slice(0, 4).map((dept, idx) => {
                    const percentage = totalEmployees > 0
                      ? Math.round((dept.employeeCount / totalEmployees) * 100)
                      : 0;
                    const palette = pastelGradients[idx % pastelGradients.length];

                    return (
                      <Grid item xs={12} sm={6} key={dept.id}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: '16px',
                            bgcolor: palette.bg,
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-2px)' },
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" fontWeight={700} color={palette.text}>
                              #{dept.name}
                            </Typography>
                            <Typography variant="caption" fontWeight={800} color={palette.text}>
                              {dept.employeeCount} staff ({percentage}%)
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              height: 6,
                              borderRadius: 999,
                              bgcolor: 'rgba(255,255,255,0.6)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: palette.bar,
                                borderRadius: 999,
                              },
                            }}
                          />
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Grid: Team Directory + Quick Actions */}
      <Grid container spacing={3}>
        {/* Team Directory Grid */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#18202F">
                    Team Directory
                  </Typography>
                  <Typography variant="caption" color="#64748B" fontWeight={500}>
                    Recently joined staff members
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate('/employees')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ color: '#FF6B4A', fontWeight: 700 }}
                >
                  See all ({totalEmployees})
                </Button>
              </Box>

              {recentEmployees.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="#94A3B8" sx={{ mb: 2 }}>
                    No staff records created yet.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate('/employees/new')}
                  >
                    Add First Employee
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {recentEmployees.slice(0, 4).map((emp) => (
                    <Grid item xs={12} sm={6} key={emp.id}>
                      <Box
                        onClick={() => navigate(`/employees/${emp.id}`)}
                        sx={{
                          p: 2.5,
                          borderRadius: '20px',
                          bgcolor: '#F8FAFC',
                          border: '1px solid #F1F5F9',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: '#FFFFFF',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <UserAvatar name={`${emp.firstName} ${emp.lastName}`} size={54} sx={{ mb: 1.5 }} />
                        <Typography variant="subtitle2" fontWeight={800} color="#18202F">
                          {emp.firstName} {emp.lastName}
                        </Typography>
                        <Typography variant="caption" color="#64748B" fontWeight={500} sx={{ mb: 1.5 }}>
                          {emp.email}
                        </Typography>
                        <DepartmentBadge name={emp.departmentName || 'Unassigned'} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions Hub */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 1, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={800} color="#18202F" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="caption" color="#64748B" fontWeight={500} sx={{ display: 'block', mb: 3 }}>
                Fast administrative shortcuts
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate('/employees/new')}
                  sx={{
                    py: 1.6,
                    fontSize: '0.95rem',
                    boxShadow: '0 8px 20px rgba(255, 107, 74, 0.3)',
                  }}
                >
                  Add New Employee
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/employees')}
                  sx={{
                    py: 1.6,
                    fontSize: '0.95rem',
                    bgcolor: '#18202F',
                    '&:hover': { bgcolor: '#243046' },
                  }}
                >
                  Staff Directory
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<BusinessIcon />}
                  onClick={() => navigate('/departments')}
                  sx={{
                    py: 1.6,
                    fontSize: '0.95rem',
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    '&:hover': { borderColor: '#18202F', bgcolor: '#F8FAFC' },
                  }}
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
