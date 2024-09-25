// src/pages/DocumentGeneration.js

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
  Checkbox,
  FormControlLabel,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust this to match your backend URL

function DocumentGeneration() {
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState([]);

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders?status=Completed`);
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching completed orders:', err);
      setError('Failed to fetch completed orders. Please try again later.');
      setLoading(false);
    }
  };

  const handleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleGenerateDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-documents`, { orderIds: selectedOrders });
      setGeneratedDocuments(response.data);
      setOpenDialog(true);
    } catch (err) {
      console.error('Error generating documents:', err);
      setError('Failed to generate documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentUrl, documentName) => {
    try {
      const response = await axios.get(documentUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document. Please try again.');
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
        Document Generation
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedOrders.length === orders.length}
              onChange={handleSelectAll}
              indeterminate={selectedOrders.length > 0 && selectedOrders.length < orders.length}
            />
          }
          label="Select All"
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<PdfIcon />}
          onClick={handleGenerateDocuments}
          disabled={selectedOrders.length === 0}
          sx={{ ml: 2 }}
        >
          Generate Documents
        </Button>
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedOrders.length === orders.length}
                  onChange={handleSelectAll}
                  indeterminate={selectedOrders.length > 0 && selectedOrders.length < orders.length}
                />
              </TableCell>
              <TableCell>Order Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Delivery Date</TableCell>
              <TableCell>Total Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => handleOrderSelection(order.id)}
                  />
                </TableCell>
                <TableCell>{order["Sales Order"]}</TableCell>
                <TableCell>{order["Customer Name"]}</TableCell>
                <TableCell>{new Date(order["Requested delivery date"]).toLocaleDateString()}</TableCell>
                <TableCell>{`$${order.total_amount?.toFixed(2) || 'N/A'}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generated Documents</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {generatedDocuments.map((doc, index) => (
              <Grid item xs={12} key={index}>
                <Paper elevation={2} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>{doc.name}</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PdfIcon />}
                    onClick={() => handleDownload(doc.url, doc.name)}
                  >
                    Download
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default DocumentGeneration;