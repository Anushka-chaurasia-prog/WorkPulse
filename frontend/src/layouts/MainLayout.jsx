import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Employees', path: '/employees', icon: <PeopleIcon /> },
  { label: 'Departments', path: '/departments', icon: <BusinessIcon /> },
];

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const isCurrentPath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <AppBar position="sticky" elevation={2} sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
              aria-label="open navigation drawer"
            >
              <MenuIcon />
            </IconButton>
          )}

          <BadgeIcon sx={{ mr: 1.5, display: { xs: 'none', sm: 'inline-block' } }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: { xs: 1, md: 0 },
              fontWeight: 700,
              letterSpacing: 0.5,
              cursor: 'pointer',
              mr: { md: 4 },
            }}
            onClick={() => navigate('/')}
          >
            WorkPulse
          </Typography>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {navItems.map((item) => {
                const active = isCurrentPath(item.path);
                return (
                  <Button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: '#ffffff',
                      textTransform: 'none',
                      fontWeight: active ? 700 : 500,
                      bgcolor: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      borderRadius: 1.5,
                      px: 2,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* User info & Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<AccountCircleIcon style={{ color: '#fff' }} />}
              label={user?.username || 'User'}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                fontWeight: 500,
                display: { xs: 'none', sm: 'inline-flex' },
              }}
              variant="outlined"
            />
            <Button
              variant="contained"
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 260 } }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BadgeIcon color="primary" />
          <Typography variant="h6" fontWeight={700} color="primary">
            WorkPulse
          </Typography>
        </Box>
        <Divider />
        <List sx={{ pt: 1 }}>
          {navItems.map((item) => {
            const active = isCurrentPath(item.path);
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={active}
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                      '&:hover': { bgcolor: 'primary.main' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: active ? 'inherit' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 600 : 500 }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Container */}
      <Container component="main" sx={{ flexGrow: 1, py: 4 }} maxWidth="lg">
        <Outlet />
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          bgcolor: '#ffffff',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} WorkPulse Employee Management System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;
