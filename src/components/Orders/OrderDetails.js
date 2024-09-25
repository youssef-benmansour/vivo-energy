// src/components/Orders/OrderDetails.js

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  CircularProgress, 
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Alert } from '@mui/material';
import orderService from '../../services/orderService';

const OrderDetails = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);
      setStatus(orderData.status);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch order details. Please try again.');
      setLoading(false);
    }
  };

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setStatus(newStatus);
      setSnackbar({ open: true, message: 'Order status updated successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update order status', severity: 'error' });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!order) {
    return <Typography>No order details available.</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Order Details - {order['Sales Order']}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography><strong>Customer:</strong> {order['Customer Name']}</Typography>
          <Typography><strong>Plant:</strong> {order['Plant Name']}</Typography>
          <Typography><strong>Requested Delivery Date:</strong> {order.formattedDeliveryDate}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography><strong>Total Value:</strong> ${order.totalValue.toFixed(2)}</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="Created">Created</MenuItem>
              <MenuItem value="Trip and Route Planning">Trip and Route Planning</MenuItem>
              <MenuItem value="Loading Confirmation">Loading Confirmation</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Material</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{order['Material Name']}</TableCell>
              <TableCell align="right">{order['Order Qty']}</TableCell>
              <TableCell align="right">{order['Sls.UOM']}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" color="primary" onClick={onClose} sx={{ mt: 3 }}>
        Close
      </Button>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default OrderDetails;