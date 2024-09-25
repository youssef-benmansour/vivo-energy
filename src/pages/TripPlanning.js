// src/pages/TripPlanning.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  IconButton,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust this to match your backend URL

function TripPlanning() {
  const [trips, setTrips] = useState([]);
  const [orders, setOrders] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);

  useEffect(() => {
    fetchTrips();
    fetchOrders();
    fetchTrucks();
    fetchDrivers();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trips`);
      setTrips(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to fetch trips. Please try again later.');
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`);
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trucks`);
      setTrucks(response.data);
    } catch (err) {
      console.error('Error fetching trucks:', err);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trucks`); // Assuming drivers are fetched from trucks
      setDrivers(response.data.map(truck => truck["Driver name"]).filter(Boolean));
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };

  const handleOpenDialog = (trip = null) => {
    setCurrentTrip(trip || {
      "Trip Num": "",
      "Tour Start Date": "",
      "Vehicle Id": "",
      "Driver Name": "",
      "Orders": []
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTrip(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentTrip({ ...currentTrip, [name]: value });
  };

  const handleOrderSelection = (event) => {
    const { value } = event.target;
    setCurrentTrip({ ...currentTrip, Orders: value });
  };

  const handleSubmit = async () => {
    try {
      if (currentTrip.id) {
        await axios.put(`${API_BASE_URL}/trips/${currentTrip.id}`, currentTrip);
      } else {
        await axios.post(`${API_BASE_URL}/trips`, currentTrip);
      }
      fetchTrips();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving trip:', err);
      setError('Failed to save trip. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await axios.delete(`${API_BASE_URL}/trips/${id}`);
        fetchTrips();
      } catch (err) {
        console.error('Error deleting trip:', err);
        setError('Failed to delete trip. Please try again.');
      }
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
        Trip Planning
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        style={{ marginBottom: '20px' }}
      >
        Create New Trip
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Trip Number</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell>{trip["Trip Num"]}</TableCell>
                <TableCell>{new Date(trip["Tour Start Date"]).toLocaleDateString()}</TableCell>
                <TableCell>{trip["Vehicle Id"]}</TableCell>
                <TableCell>{trip["Driver Name"]}</TableCell>
                <TableCell>{trip.Orders.length} orders</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(trip)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(trip.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentTrip && currentTrip.id ? 'Edit Trip' : 'Create New Trip'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Trip Number"
                name="Trip Num"
                value={currentTrip?.["Trip Num"] || ''}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Start Date"
                name="Tour Start Date"
                type="date"
                value={currentTrip?.["Tour Start Date"] || ''}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Vehicle</InputLabel>
                <Select
                  name="Vehicle Id"
                  value={currentTrip?.["Vehicle Id"] || ''}
                  onChange={handleInputChange}
                >
                  {trucks.map((truck) => (
                    <MenuItem key={truck.id} value={truck.Vehicle}>
                      {truck.Vehicle} - Capacity: {truck["Vehicule Capacity"]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Driver</InputLabel>
                <Select
                  name="Driver Name"
                  value={currentTrip?.["Driver Name"] || ''}
                  onChange={handleInputChange}
                >
                  {drivers.map((driver, index) => (
                    <MenuItem key={index} value={driver}>
                      {driver}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Orders</InputLabel>
                <Select
                  multiple
                  name="Orders"
                  value={currentTrip?.Orders || []}
                  onChange={handleOrderSelection}
                  input={<OutlinedInput label="Orders" />}
                  renderValue={(selected) => selected.length + " orders selected"}
                >
                  {orders.map((order) => (
                    <MenuItem key={order.id} value={order.id}>
                      <Checkbox checked={(currentTrip?.Orders || []).indexOf(order.id) > -1} />
                      <ListItemText primary={`${order["Sales Order"]} - ${order["Customer Name"]}`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TripPlanning;