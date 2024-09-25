// src/components/Orders/OrderList.js

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import orderService from '../../services/orderService';

const OrderList = ({ onEdit, onView }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    clientName: '',
    orderType: '',
    status: '',
    dateFrom: null,
    dateTo: null,
  });
  const [sortConfig, setSortConfig] = useState({ key: 'Sales Order', direction: 'asc' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const fetchedOrders = await orderService.getOrders(filters);
      setOrders(fetchedOrders);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleDateChange = (name) => (date) => {
    setFilters(prevFilters => ({ ...prevFilters, [name]: date }));
  };

  const applyFilters = () => {
    fetchOrders();
  };

  const resetFilters = () => {
    setFilters({
      clientName: '',
      orderType: '',
      status: '',
      dateFrom: null,
      dateTo: null,
    });
    fetchOrders();
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = React.useMemo(() => {
    let sortableOrders = [...orders];
    if (sortConfig.key) {
      sortableOrders.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [orders, sortConfig]);

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      try {
        await orderService.deleteOrder(orderToDelete['Sales Order']);
        setOrders(orders.filter(order => order['Sales Order'] !== orderToDelete['Sales Order']));
        setDeleteDialogOpen(false);
      } catch (err) {
        setError('Failed to delete order. Please try again.');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Orders
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Client Name"
            name="clientName"
            value={filters.clientName}
            onChange={handleFilterChange}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Order Type</InputLabel>
            <Select
              name="orderType"
              value={filters.orderType}
              onChange={handleFilterChange}
              label="Order Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ZOR">ZOR</MenuItem>
              <MenuItem value="ZCON">ZCON</MenuItem>
              <MenuItem value="ZOC">ZOC</MenuItem>
              <MenuItem value="SUR1">SUR1</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Created">Created</MenuItem>
              <MenuItem value="Trip and Route Planning">Trip and Route Planning</MenuItem>
              <MenuItem value="Loading Confirmation">Loading Confirmation</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <DatePicker
            label="From Date"
            value={filters.dateFrom}
            onChange={handleDateChange('dateFrom')}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="To Date"
            value={filters.dateTo}
            onChange={handleDateChange('dateTo')}
            renderInput={(params) => <TextField {...params} />}
          />
          <Button variant="contained" onClick={applyFilters}>Apply Filters</Button>
          <Button variant="outlined" onClick={resetFilters}>Reset Filters</Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('Sales Order')}>
                Sales Order {sortConfig.key === 'Sales Order' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </TableCell>
              <TableCell onClick={() => handleSort('Customer Name')}>
                Customer {sortConfig.key === 'Customer Name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </TableCell>
              <TableCell onClick={() => handleSort('Order Type')}>
                Order Type {sortConfig.key === 'Order Type' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </TableCell>
              <TableCell onClick={() => handleSort('Requested delivery date')}>
                Delivery Date {sortConfig.key === 'Requested delivery date' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </TableCell>
              <TableCell onClick={() => handleSort('Status')}>
                Status {sortConfig.key === 'Status' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow key={order['Sales Order']}>
                <TableCell>{order['Sales Order']}</TableCell>
                <TableCell>{order['Customer Name']}</TableCell>
                <TableCell>{order['Order Type']}</TableCell>
                <TableCell>{new Date(order['Requested delivery date']).toLocaleDateString()}</TableCell>
                <TableCell>{order.Status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onView(order['Sales Order'])} size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton onClick={() => onEdit(order['Sales Order'])} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(order)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default OrderList;