// src/pages/OrderManagement.js

import React, { useState } from 'react';
import { useNavigate, useLocation, Routes, Route, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Tabs,
  Tab,
  Snackbar,
} from '@mui/material';
import { Alert } from '@mui/material';
import OrderList from '../components/Orders/OrderList';
import OrderForm from '../components/Orders/OrderForm';
import OrderImport from '../components/Orders/OrderImport';

const OrderManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateOrder = (order) => {
    // Here you would typically save the order using your API
    console.log('Creating order:', order);
    showSnackbar('Order created successfully');
    navigate('/order-management');
  };

  const handleEditOrder = (orderId) => {
    navigate(`/order-management/edit/${orderId}`);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/order-management/view/${orderId}`);
  };

  const handleImportComplete = (result) => {
    showSnackbar(`Import completed. ${result.successCount} orders imported successfully.`);
    navigate('/order-management');
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Order Management
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={location.pathname}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Order List" value="/order-management" component={RouterLink} to="/order-management" />
          <Tab label="Create Order" value="/order-management/create" component={RouterLink} to="/order-management/create" />
          <Tab label="Import Orders" value="/order-management/import" component={RouterLink} to="/order-management/import" />
        </Tabs>
      </Paper>

      <Routes>
        <Route 
          path="/" 
          element={
            <Box>
              <OrderList onEdit={handleEditOrder} onView={handleViewOrder} />
              <Box mt={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={RouterLink} 
                  to="/order-management/create"
                >
                  Create New Order
                </Button>
              </Box>
            </Box>
          } 
        />
        <Route 
          path="/create" 
          element={<OrderForm onSubmit={handleCreateOrder} onCancel={() => navigate('/order-management')} />} 
        />
        <Route 
          path="/edit/:orderId" 
          element={<OrderForm onSubmit={handleCreateOrder} onCancel={() => navigate('/order-management')} />} 
        />
        <Route 
          path="/import" 
          element={<OrderImport onImportComplete={handleImportComplete} />} 
        />
      </Routes>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderManagement;