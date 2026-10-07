import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  InputBase,
  Paper,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  DashboardRounded as DashboardIcon,
  PeopleAltRounded as PeopleIcon,
  ApartmentRounded as BusinessIcon,
  PersonAddAlt1Rounded as AddPersonIcon,
  LogoutRounded as LogoutIcon,
  MenuRounded as MenuIcon,
  SearchRounded as SearchIcon,
  SettingsOutlined as SettingsIcon,
  NotificationsNoneRounded as NotificationIcon,
  HubRounded as BrandIcon,
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';
import UserAvatar from '../components/UserAvatar';

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon sx={{ fontSize: 24 }} /> },
  { label: 'Employees', path: '/employees', icon: <PeopleIcon sx={{ fontSize: 24 }} /> },
  { label: 'Departments', path: '/departments', icon: <BusinessIcon sx={{ fontSize: 24 }} /> },
  { label: 'Add Employee', path: '/employees/new', icon: <AddPersonIcon sx={{ fontSize: 24 }} /> },
];

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleLogout = () => {
    setUserMenuAnchor(null);
    logout();
    navigate('/login');
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const isCurrentPath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/') return 'Dashboard';
    if (p === '/employees/new') return 'Add Employee';
    if (p.includes('/edit')) return 'Edit Employee';
    if (p.startsWith('/employees/')) return 'Employee Profile';
    if (p === '/employees') return 'Staff Directory';
    if (p === '/departments') return 'Departments';
    return 'WorkPulse';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#EFF2F7' }}>
      {/* Desktop Dark Navy Sidebar */}
      {!isMobile && (
        <Box
          component="aside"
          sx={{
            width: 84,
            bgcolor: '#18202F',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 3,
            px: 1.5,
            zIndex: 1200,
            flexShrink: 0,
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Logo / Brand Icon */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              width: 50,
              height: 50,
              borderRadius: '16px',
              bgcolor: 'rgba(255, 107, 74, 0.15)',
              color: '#FF6B4A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              mb: 5,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.06)' },
            }}
          >
            <BrandIcon sx={{ fontSize: 30 }} />
          </Box>

          {/* Navigation Icon List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
            {navItems.map((item) => {
              const active = isCurrentPath(item.path);
              return (
                <Tooltip key={item.path} title={item.label} placement="right" arrow>
                  <IconButton
                    onClick={() => handleNavClick(item.path)}
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '16px',
                      color: active ? '#FFFFFF' : '#8E9BAE',
                      bgcolor: active ? '#FF6B4A' : 'transparent',
                      boxShadow: active ? '0 8px 18px rgba(255, 107, 74, 0.35)' : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: active ? '#FF6B4A' : 'rgba(255, 255, 255, 0.08)',
                        color: '#FFFFFF',
                      },
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Tooltip>
              );
            })}
          </Box>

          {/* Bottom Settings & Logout */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Tooltip title="Log Out" placement="right" arrow>
              <IconButton
                onClick={handleLogout}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  color: '#8E9BAE',
                  '&:hover': {
                    bgcolor: 'rgba(244, 63, 94, 0.15)',
                    color: '#F43F5E',
                  },
                }}
              >
                <LogoutIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Mobile Slide Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: '#18202F',
            color: '#FFFFFF',
            p: 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, mb: 1 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: 'rgba(255, 107, 74, 0.2)',
              color: '#FF6B4A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BrandIcon />
          </Box>
          <Typography variant="h6" fontWeight={800} letterSpacing={-0.5}>
            WorkPulse
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navItems.map((item) => {
            const active = isCurrentPath(item.path);
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={active}
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    borderRadius: '12px',
                    py: 1.2,
                    px: 2,
                    bgcolor: active ? '#FF6B4A !important' : 'transparent',
                    color: active ? '#FFFFFF' : '#8E9BAE',
                    '&:hover': {
                      bgcolor: active ? '#FF6B4A' : 'rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: '0.95rem' }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Box sx={{ mt: 'auto', p: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: '12px',
              color: '#F43F5E',
              '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.15)' },
            }}
          >
            <ListItemIcon sx={{ color: '#F43F5E', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Log Out" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <Box
          sx={{
            py: 2.5,
            px: { xs: 2.5, sm: 4, md: 5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Left: Mobile hamburger or Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#18202F',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  '&:hover': { bgcolor: '#F8FAFC' },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h5"
              fontWeight={800}
              color="#1E293B"
              sx={{ display: { xs: 'none', sm: 'block' }, letterSpacing: '-0.02em' }}
            >
              {getPageTitle()}
            </Typography>
          </Box>

          {/* Right: Search Pill & User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.5 } }}>
            {/* Search Pill Input */}
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 0.6,
                borderRadius: '999px',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                width: { xs: 160, sm: 240, md: 300 },
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              }}
            >
              <SearchIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} />
              <InputBase
                placeholder="Search anything..."
                sx={{ fontSize: '0.875rem', width: '100%', color: '#1E293B' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate('/employees');
                  }
                }}
              />
            </Paper>

            {/* Notification Icon */}
            <IconButton
              sx={{
                bgcolor: '#FFFFFF',
                color: '#64748B',
                width: 44,
                height: 44,
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                display: { xs: 'none', sm: 'inline-flex' },
                '&:hover': { bgcolor: '#F8FAFC', color: '#1E293B' },
              }}
            >
              <NotificationIcon sx={{ fontSize: 20 }} />
            </IconButton>

            {/* User Profile Avatar with Menu */}
            <Box
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: '#FFFFFF',
                py: 0.6,
                px: 1.2,
                borderRadius: '999px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#CBD5E1' },
              }}
            >
              <UserAvatar name={user?.username || 'Admin'} size={34} />
              <Box sx={{ display: { xs: 'none', md: 'block' }, pr: 1 }}>
                <Typography variant="body2" fontWeight={700} color="#1E293B" lineHeight={1.2}>
                  {user?.username || 'Admin'}
                </Typography>
                <Typography variant="caption" color="#94A3B8" fontWeight={600}>
                  Administrator
                </Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: '16px',
                  minWidth: 180,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  p: 0.5,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/employees'); }}>
                Staff Directory
              </MenuItem>
              <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/departments'); }}>
                Departments
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout} sx={{ color: '#F43F5E', fontWeight: 600 }}>
                Log Out
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Page Container */}
        <Box component="main" sx={{ flexGrow: 1, px: { xs: 2, sm: 4, md: 5 }, pb: 5 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
