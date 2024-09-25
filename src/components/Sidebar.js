import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import BarChartIcon from '@mui/icons-material/BarChart';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Data Import', icon: <CloudUploadIcon />, path: '/import' },
  { text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
  { text: 'Trips', icon: <LocalShippingIcon />, path: '/trips' },
  { text: 'Loading', icon: <AssignmentIcon />, path: '/loading' },
  { text: 'Documents', icon: <DescriptionIcon />, path: '/documents' },
  { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
];

function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px', // Ensures the sidebar starts below the header (AppBar height is 64px)
        },
      }}
      variant="temporary" // Set to temporary for toggle functionality
      anchor="left"
      open={isOpen} // Open or close the drawer based on state
      onClose={toggleSidebar} // Close sidebar when clicking outside
    >
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} component={RouterLink} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
