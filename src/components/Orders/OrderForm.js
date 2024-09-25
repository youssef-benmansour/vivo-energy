// src/components/Orders/OrderForm.js

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Typography,
  Snackbar,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Alert } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import orderService from '../../services/orderService';
import { getDepots, getClients, getProducts, getOrderById, createOrder, updateOrder } from '../../services/api';

const OrderForm = ({ orderId, onSubmit, onCancel }) => {
  const [order, setOrder] = useState({
    depotSource: '',
    orderType: '',
    clientReference: '',
    operationDate: null,
    commandeType: '',
    clientFacturationSoldTo: '',
    codeAdresseLivraisonShipTo: '',
    nomClientLivraisonShipTo: '',
    statutDroit: '',
    adresseLivraison: '',
    origine: '',
    products: [{ code: '', label: '', regime: '', quantity: '', uom: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // These would be populated from your imported data
  const [depots, setDepots] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchFormData();
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchFormData = async () => {
    try {
      // These would be calls to your actual services
      const depotsData = await orderService.getDepots();
      const clientsData = await orderService.getClients();
      const productsData = await orderService.getProducts();
      setDepots(depotsData);
      setClients(clientsData);
      setProducts(productsData);
    } catch (err) {
      setError('Failed to fetch form data. Please try again.');
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch order details. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setOrder(prevOrder => ({
      ...prevOrder,
      [name]: value
    }));

    // Auto-fill logic
    if (name === 'clientFacturationSoldTo') {
      const selectedClient = clients.find(client => client.id === value);
      if (selectedClient) {
        setOrder(prevOrder => ({
          ...prevOrder,
          statutDroit: selectedClient.statutDroit,
          codeAdresseLivraisonShipTo: selectedClient.defaultShipTo,
          nomClientLivraisonShipTo: selectedClient.shipToName,
          adresseLivraison: selectedClient.shipToAddress
        }));
      }
    }

    if (name === 'codeAdresseLivraisonShipTo') {
      const selectedClient = clients.find(client => client.id === order.clientFacturationSoldTo);
      const selectedAddress = selectedClient.shipToAddresses.find(address => address.code === value);
      if (selectedAddress) {
        setOrder(prevOrder => ({
          ...prevOrder,
          nomClientLivraisonShipTo: selectedAddress.name,
          adresseLivraison: selectedAddress.address
        }));
      }
    }
  };

  const handleProductChange = (index, event) => {
    const { name, value } = event.target;
    const updatedProducts = [...order.products];
    updatedProducts[index] = { ...updatedProducts[index], [name]: value };

    if (name === 'code') {
      const selectedProduct = products.find(product => product.code === value);
      if (selectedProduct) {
        updatedProducts[index].label = selectedProduct.label;
        updatedProducts[index].uom = selectedProduct.uom;
      }
    }

    setOrder(prevOrder => ({
      ...prevOrder,
      products: updatedProducts
    }));
  };

  const addProduct = () => {
    setOrder(prevOrder => ({
      ...prevOrder,
      products: [...prevOrder.products, { code: '', label: '', regime: '', quantity: '', uom: '' }]
    }));
  };

  const removeProduct = (index) => {
    setOrder(prevOrder => ({
      ...prevOrder,
      products: prevOrder.products.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Validation
      if (!validateOrder()) {
        setLoading(false);
        return;
      }

      let result;
      if (orderId) {
        result = await orderService.updateOrder(orderId, order);
      } else {
        result = await orderService.createOrder(order);
      }
      setSnackbar({ open: true, message: `Order ${orderId ? 'updated' : 'created'} successfully`, severity: 'success' });
      if (onSubmit) onSubmit(result);
    } catch (err) {
      setError(`Failed to ${orderId ? 'update' : 'create'} order. ${err.message}`);
      setSnackbar({ open: true, message: `Failed to ${orderId ? 'update' : 'create'} order`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const validateOrder = () => {
    // Check if VRAC and PACK are mixed
    const productTypes = order.products.map(product => {
      const productData = products.find(p => p.code === product.code);
      return productData ? productData.type : null;
    });
    if (productTypes.includes('VRAC') && productTypes.includes('PACK')) {
      setError('VRAC and PACK product types cannot be mixed in a single order.');
      return false;
    }

    // Check if products have pre-defined prices
    const productsWithoutPrices = order.products.filter(product => {
      const productData = products.find(p => p.code === product.code);
      return productData && !productData.hasPrice;
    });
    if (productsWithoutPrices.length > 0) {
      setError('All selected products must have pre-defined prices.');
      return false;
    }

    return true;
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3, m: 2 }}>
        <Typography variant="h5" gutterBottom>
          {orderId ? 'Edit Order' : 'Create New Order'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Dépôt source</InputLabel>
                <Select
                  name="depotSource"
                  value={order.depotSource}
                  onChange={handleChange}
                  required
                >
                  {depots.map(depot => (
                    <MenuItem key={depot.id} value={depot.id}>{depot.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type de commande</InputLabel>
                <Select
                  name="orderType"
                  value={order.orderType}
                  onChange={handleChange}
                  required
                >
                  {['ZOR', 'ZCON', 'ZOC', 'SUR1'].map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Référence client</InputLabel>
                <Select
                  name="clientReference"
                  value={order.clientReference}
                  onChange={handleChange}
                  required
                >
                  {clients.map(client => (
                    <MenuItem key={client.id} value={client.id}>{client.reference}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date d'opération"
                value={order.operationDate}
                onChange={(newValue) => setOrder(prev => ({ ...prev, operationDate: newValue }))}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography variant="subtitle1">Commande Type</Typography>
                <RadioGroup
                  name="commandeType"
                  value={order.commandeType}
                  onChange={handleChange}
                  row
                >
                  <FormControlLabel value="Vrac" control={<Radio />} label="Vrac (Bulk)" />
                  <FormControlLabel value="Pack" control={<Radio />} label="Pack (Packaged)" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Nom du client de facturation Sold To</InputLabel>
                <Select
                  name="clientFacturationSoldTo"
                  value={order.clientFacturationSoldTo}
                  onChange={handleChange}
                  required
                >
                  {clients.map(client => (
                    <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Code adresse de livraison Ship To</InputLabel>
                <Select
                  name="codeAdresseLivraisonShipTo"
                  value={order.codeAdresseLivraisonShipTo}
                  onChange={handleChange}
                  required
                >
                  {clients.find(c => c.id === order.clientFacturationSoldTo)?.shipToAddresses.map(address => (
                    <MenuItem key={address.code} value={address.code}>{address.code}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom du client de livraison Ship To"
                name="nomClientLivraisonShipTo"
                value={order.nomClientLivraisonShipTo}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Statut de droit"
                name="statutDroit"
                value={order.statutDroit}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse de livraison"
                name="adresseLivraison"
                value={order.adresseLivraison}
                InputProps={{ readOnly: true }}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Origine"
                name="origine"
                value={order.origine}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Products</Typography>
              {order.products.map((product, index) => (
                <Grid container spacing={2} key={index} alignItems="center">
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth>
                      <InputLabel>Code produit</InputLabel>
                      <Select
                        name="code"
                        value={product.code}
                        onChange={(e) => handleProductChange(index, e)}
                        required
                      >
                        {products.map(p => (
                          <MenuItem key={p.code} value={p.code}>{p.code}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Libellé produit"
                      name="label"
                      value={product.label}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth>
                      <InputLabel>Régime douanier</InputLabel>
                      <Select
                        name="regime"
                        value={product.regime}
                        onChange={(e) => handleProductChange(index, e)}
                        required
                      >
                        {['Dédouané', 'Sous-douane', 'Pêche', 'Saharien'].map(regime => (
                          <MenuItem key={regime} value={regime}>{regime}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Quantité"
                      name="quantity"
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, e)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Unité de mesure UoM"
                      name="uom"
                      value={product.uom}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton onClick={() => removeProduct(index)} color="secondary">
                      <RemoveIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addProduct}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Add Product
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mr: 1 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : (orderId ? 'Update Order' : 'Create Order')}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default OrderForm;