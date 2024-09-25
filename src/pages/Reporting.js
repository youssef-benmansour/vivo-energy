// src/pages/Reporting.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CloudDownload as DownloadIcon } from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust this to match your backend URL

function Reporting() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchOrders();
  }, [date]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/orders?date=${date}`);
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again later.');
      setLoading(false);
    }
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const exportToCSV = () => {
    const headers = [
      "Sales Order", "Order Type", "Customer", "Customer Name", "Plant", "Plant Name",
      "Ship To Party", "Ship To Name", "Valution Type", "City(Ship To)", "Item",
      "Material Code", "Material Name", "Order Qty", "Sls.UOM", "Requested delivery date",
      "Pat.Doc", "Trip Num", "Tour Start Date", "Org Name", "Driver Name", "Vehicle Id", "Status"
    ];

    const csvContent = [
      headers.join(','),
      ...orders.map(order => 
        headers.map(header => 
          JSON.stringify(order[header] || '')
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_report_${date}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Daily Orders Report
      </Typography>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Report Date"
            type="date"
            value={date}
            onChange={handleDateChange}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            fullWidth
          >
            Export to CSV
          </Button>
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sales Order</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Plant</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Delivery Date</TableCell>
              <TableCell>Trip Number</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order["Sales Order"]}</TableCell>
                <TableCell>{order["Customer Name"]}</TableCell>
                <TableCell>{order["Plant Name"]}</TableCell>
                <TableCell>{order["Material Name"]}</TableCell>
                <TableCell>{`${order["Order Qty"]} ${order["Sls.UOM"]}`}</TableCell>
                <TableCell>{new Date(order["Requested delivery date"]).toLocaleDateString()}</TableCell>
                <TableCell>{order["Trip Num"]}</TableCell>
                <TableCell>{order["Driver Name"]}</TableCell>
                <TableCell>{order["Vehicle Id"]}</TableCell>
                <TableCell>{order.Status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Reporting;