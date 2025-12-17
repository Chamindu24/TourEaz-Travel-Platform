import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CssBaseline,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Hotel as HotelIcon,
  KingBed as RoomIcon,
  Bookmark as BookingIcon,
  LocalOffer as DiscountIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  TourOutlined,
  LocalActivity as LocalActivityIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAdminLayout } from '../hooks/useAdminLayout';

const AdminLayout = ({ children, title = 'Admin Management' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const {
    isMobile,
    mobileOpen,
    layoutKey,
    drawerWidth,
    handleDrawerToggle,
    getMainContentStyles,
    getAppBarStyles
  } = useAdminLayout();

  const handleNavigation = (item) => {
    if (item.id === 'activities') {
      navigate('/admin/activities');
    } else {
      // For all other sections, go to main admin panel
      navigate('/admin');
    }
    // Close mobile drawer after navigation
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const openProfileMenu = (e) => setAnchorEl(e.currentTarget);
  const closeProfileMenu = () => setAnchorEl(null);
  const goTo = (path) => { navigate(path); closeProfileMenu(); };
  const handleLogout = () => axios.post('/auth/logout', {}, { withCredentials: true }).finally(() => goTo('/login'));

  const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { id: 'hotels', text: 'Hotel Management', icon: <HotelIcon />, section: 'hotels' },
    { id: 'rooms', text: 'Room Management', icon: <RoomIcon />, section: 'rooms' },
    { id: 'activities', text: 'Activity Management', icon: <LocalActivityIcon />, path: '/admin/activities' },
    { id: 'bookings', text: 'Booking Oversight', icon: <BookingIcon />, section: 'bookings' },
    { id: 'discounts', text: 'Discount Management', icon: <DiscountIcon />, section: 'discounts' },
    { id: 'tours', text: 'Tour Management', icon: <TourOutlined/>, section: 'tours' },
    { id: 'contacts', text: 'Contact Submissions', icon: <EmailIcon />, section: 'contacts' },
  ];

  const isActiveItem = (item) => {
    if (item.id === 'activities') {
      return location.pathname.startsWith('/admin/activities');
    }
    if (item.id === 'dashboard') {
      return location.pathname === '/admin';
    }
    return false;
  };

  const drawer = (
    <>
      <Toolbar />
      <Divider sx={{ bgcolor: '#374151' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.id} 
            onClick={() => handleNavigation(item)}
            sx={{ 
              '&:hover': { bgcolor: '#374151' }, 
              bgcolor: isActiveItem(item) ? '#374151' : 'transparent' 
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box key={layoutKey} sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={getAppBarStyles()}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6">{title}</Typography>
          <Box sx={{ ml: 'auto' }}>
            <IconButton color="inherit" onClick={openProfileMenu}>
              <PersonIcon />
            </IconButton>
            <Menu 
              anchorEl={anchorEl} 
              open={Boolean(anchorEl)} 
              onClose={closeProfileMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => goTo('/profile')}>My Profile</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            bgcolor: '#1e293b', 
            color: 'white' 
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer 
        variant="permanent" 
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            bgcolor: '#1e293b', 
            color: 'white' 
          } 
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={getMainContentStyles()}>
        <Box sx={{ width: '100%', maxWidth: 'none' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
