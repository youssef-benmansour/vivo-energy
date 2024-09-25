// src/pages/LoadingConfirmation.js

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust this to match your backend URL

function LoadingConfirmation() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [sealNumbers, setSealNumbers] = useState({});

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trips?status=Trip and Route Planning`);
      setTrips(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to fetch trips. Please try again later.');
      setLoading(false);
    }
  };

  const handleOpenDialog = (trip) => {
    setCurrentTrip(trip);
    // Initialize seal numbers for each compartment
    const initialSealNumbers = {};
    for (let i = 1; i <= 9; i++) {
      if (trip.truck[`Comp${i}`] > 0) {
        initialSealNumbers[`Comp${i}`] = '';
      }
    }
    setSealNumbers(initialSealNumbers);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTrip(null);
    setSealNumbers({});
  };

  const handleSealNumberChange = (compartment, value) => {
    setSealNumbers({ ...sealNumbers, [compartment]: value });
  };

  const handleConfirmLoading = async () => {
    try {
      await axios.post(`${API_BASE_URL}/trips/${currentTrip.id}/confirm-loading`, {
        sealNumbers,
        status: 'Loading Confirmed'
      });
      fetchTrips();
      handleCloseDialog();
    } catch (err) {
      console.error('Error confirming loading:', err);
      setError('Failed to confirm loading. Please try again.');
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
        Loading Confirmation
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Trip Number</TableCell>
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
                <TableCell>{trip["Vehicle Id"]}</TableCell>
                <TableCell>{trip["Driver Name"]}</TableCell>
                <TableCell>{trip.Orders.length} orders</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog(trip)}
                  >
                    Confirm Loading
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Confirm Loading for Trip {currentTrip?.["Trip Num"]}</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Vehicle: {currentTrip?.["Vehicle Id"]}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Driver: {currentTrip?.["Driver Name"]}
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(sealNumbers).map((compartment) => (
              <Grid item xs={12} sm={6} key={compartment}>
                <TextField
                  fullWidth
                  label={`Seal Number for ${compartment}`}
                  value={sealNumbers[compartment]}
                  onChange={(e) => handleSealNumberChange(compartment, e.target.value)}
                  margin="normal"
                />
              </Grid>
            ))}
          </Grid>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>View Orders</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order Number</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentTrip?.Orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order["Sales Order"]}</TableCell>
                        <TableCell>{order["Customer Name"]}</TableCell>
                        <TableCell>{order["Material Name"]}</TableCell>
                        <TableCell>{`${order["Order Qty"]} ${order["Sls.UOM"]}`}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmLoading} color="primary">
            Confirm Loading
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default LoadingConfirmation;