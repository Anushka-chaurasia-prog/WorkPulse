import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
  Grid,
} from '@mui/material';
import {
  LockOutlined as LockIcon,
  PersonOutlineRounded as PersonIcon,
  VisibilityOutlined as VisibilityIcon,
  VisibilityOffOutlined as VisibilityOffIcon,
  HubRounded as BrandIcon,
  CheckCircleRounded as CheckIcon,
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        username: formData.username.trim(),
        password: formData.password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 401 || status === 400) {
          setErrorMessage(data?.message || 'Invalid username or password.');
        } else if (status === 403) {
          setErrorMessage('Access denied. Please check your credentials.');
        } else {
          setErrorMessage(data?.message || 'Login failed. Please try again.');
        }
      } else {
        setErrorMessage('Unable to connect to the backend server. Please verify the service is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#EFF2F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          maxWidth: 960,
          borderRadius: '28px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Left Hero Branded Banner */}
        <Box
          sx={{
            width: { xs: '100%', md: '45%' },
            bgcolor: '#18202F',
            color: '#FFFFFF',
            p: { xs: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background subtle glow */}
          <Box
            sx={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 107, 74, 0.15)',
              filter: 'blur(40px)',
            }}
          />

          <Box sx={{ zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  bgcolor: 'rgba(255, 107, 74, 0.2)',
                  color: '#FF6B4A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BrandIcon sx={{ fontSize: 26 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>
                WorkPulse
              </Typography>
            </Box>

            <Typography variant="h4" fontWeight={800} letterSpacing={-0.5} lineHeight={1.2} sx={{ mb: 2 }}>
              Modern Staff & Organization Management
            </Typography>
            <Typography variant="body2" color="#94A3B8" sx={{ mb: 4, lineHeight: 1.6 }}>
              A centralized hub for employee records, department allocations, and enterprise organizational data.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckIcon sx={{ color: '#FF6B4A', fontSize: 20 }} />
                <Typography variant="body2" fontWeight={600} color="#E2E8F0">
                  Real-time Staff Directory & Filtering
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckIcon sx={{ color: '#FF6B4A', fontSize: 20 }} />
                <Typography variant="body2" fontWeight={600} color="#E2E8F0">
                  Department Headcount Distribution
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckIcon sx={{ color: '#FF6B4A', fontSize: 20 }} />
                <Typography variant="body2" fontWeight={600} color="#E2E8F0">
                  Stateless JWT Role-Protected Security
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography variant="caption" color="#64748B" sx={{ mt: 4, zIndex: 1 }}>
            &copy; {new Date().getFullYear()} WorkPulse. All rights reserved.
          </Typography>
        </Box>

        {/* Right Form Card */}
        <Box
          sx={{
            width: { xs: '100%', md: '55%' },
            p: { xs: 4, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography variant="h4" fontWeight={800} color="#18202F" letterSpacing={-0.5} gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mb: 4 }}>
            Enter your administrative credentials to access your dashboard
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '14px' }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              placeholder="e.g. demo_admin"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={Boolean(formErrors.username)}
              helperText={formErrors.username}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={Boolean(formErrors.password)}
              helperText={formErrors.password}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2.5,
                py: 1.5,
                fontSize: '1rem',
                boxShadow: '0 8px 20px rgba(255, 107, 74, 0.35)',
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In to Workspace'}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2" color="#64748B">
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  underline="hover"
                  sx={{ color: '#FF6B4A', fontWeight: 700 }}
                >
                  Create an account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
