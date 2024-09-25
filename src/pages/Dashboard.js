// src/pages/Dashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Box,
  CircularProgress
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  ShoppingCart as OrderIcon,
  LocalGasStation as FuelIcon,
  Person as ClientIcon
} from '@mui/icons-material';

// API base URL
const API_BASE_URL = 'http://localhost:3000/api'; // Adjust this to match your backend URL

const MetricCard = ({ title, value, icon }) => (
  <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      <Typography variant="h4" component="p">
        {value}
      </Typography>
    </Box>
    {icon}
  </Paper>
);

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersResponse, trucksResponse, clientsResponse, productsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/orders`),
          axios.get(`${API_BASE_URL}/trucks`),
          axios.get(`${API_BASE_URL}/clients`),
          axios.get(`${API_BASE_URL}/products`)
        ]);

        const totalOrders = ordersResponse.data.length;
        const activeTrucks = trucksResponse.data.length;
        const totalClients = clientsResponse.data.length;
        const totalProducts = productsResponse.data.length;

        // Calculate total fuel delivered (assuming Order Qty is in liters)
        const fuelDelivered = ordersResponse.data.reduce((total, order) => total + parseFloat(order["Order Qty"] || 0), 0);

        // Get recent activity (using last 5 orders as an example)
        const recentActivity = ordersResponse.data
          .slice(-5)
          .reverse()
          .map(order => ({
            id: order.id,
            action: `Order #${order["Sales Order"]} placed for ${order["Customer Name"]}`,
            timestamp: new Date(order["Requested delivery date"]).toLocaleString()
          }));

        setDashboardData({
          totalOrders,
          activeTrucks,
          fuelDelivered,
          totalClients,
          totalProducts,
          recentActivity
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Total Orders" 
            value={dashboardData.totalOrders} 
            icon={<OrderIcon fontSize="large" color="primary" />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Active Trucks" 
            value={dashboardData.activeTrucks} 
            icon={<TruckIcon fontSize="large" color="primary" />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Fuel Delivered (L)" 
            value={dashboardData.fuelDelivered.toLocaleString(undefined, { maximumFractionDigits: 2 })} 
            icon={<FuelIcon fontSize="large" color="primary" />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Total Clients" 
            value={dashboardData.totalClients} 
            icon={<ClientIcon fontSize="large" color="primary" />} 
          />
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {dashboardData.recentActivity.map((activity) => (
                <ListItem key={activity.id}>
                  <ListItemText 
                    primary={activity.action} 
                    secondary={activity.timestamp} 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;