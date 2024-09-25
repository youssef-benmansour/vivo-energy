// src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Update this to match your backend URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchClients = () => apiClient.get('/clients');
export const fetchPlants = () => apiClient.get('/plants');
export const fetchProducts = () => apiClient.get('/products');
export const fetchPrices = () => apiClient.get('/prices');
export const fetchTanks = () => apiClient.get('/tanks');
export const fetchTrucks = () => apiClient.get('/trucks');
export const fetchOrders = () => apiClient.get('/orders');

// Trucks
export const getTrucks = () => apiClient.get('/trucks');
export const getTruck = (id) => apiClient.get(`/trucks/${id}`);
export const createTruck = (truckData) => apiClient.post('/trucks', truckData);
export const updateTruck = (id, truckData) => apiClient.put(`/trucks/${id}`, truckData);
export const deleteTruck = (id) => apiClient.delete(`/trucks/${id}`);

// Plants (Depots)
export const getPlants = () => apiClient.get('/plants');
export const getPlant = (id) => apiClient.get(`/plants/${id}`);
export const createPlant = (plantData) => apiClient.post('/plants', plantData);
export const updatePlant = (id, plantData) => apiClient.put(`/plants/${id}`, plantData);
export const deletePlant = (id) => apiClient.delete(`/plants/${id}`);

// Prices
export const getPrices = () => apiClient.get('/prices');
export const getPrice = (id) => apiClient.get(`/prices/${id}`);
export const createPrice = (priceData) => apiClient.post('/prices', priceData);
export const updatePrice = (id, priceData) => apiClient.put(`/prices/${id}`, priceData);
export const deletePrice = (id) => apiClient.delete(`/prices/${id}`);

// Products
export const getProducts = () => apiClient.get('/products');
export const getProduct = (id) => apiClient.get(`/products/${id}`);
export const createProduct = (productData) => apiClient.post('/products', productData);
export const updateProduct = (id, productData) => apiClient.put(`/products/${id}`, productData);
export const deleteProduct = (id) => apiClient.delete(`/products/${id}`);

// Bacs (Tanks)
export const getBacs = () => apiClient.get('/bacs');
export const getBac = (id) => apiClient.get(`/bacs/${id}`);
export const createBac = (bacData) => apiClient.post('/bacs', bacData);
export const updateBac = (id, bacData) => apiClient.put(`/bacs/${id}`, bacData);
export const deleteBac = (id) => apiClient.delete(`/bacs/${id}`);

// Clients
export const getClients = () => apiClient.get('/clients');
export const getClient = (id) => apiClient.get(`/clients/${id}`);
export const createClient = (clientData) => apiClient.post('/clients', clientData);
export const updateClient = (id, clientData) => apiClient.put(`/clients/${id}`, clientData);
export const deleteClient = (id) => apiClient.delete(`/clients/${id}`);

// Orders
export const getOrders = (params) => apiClient.get('/orders', { params });
export const getOrder = (id) => apiClient.get(`/orders/${id}`);
export const createOrder = (orderData) => apiClient.post('/orders', orderData);
export const updateOrder = (id, orderData) => apiClient.put(`/orders/${id}`, orderData);
export const deleteOrder = (id) => apiClient.delete(`/orders/${id}`);

// Trips
export const getTrips = (params) => apiClient.get('/trips', { params });
export const getTrip = (id) => apiClient.get(`/trips/${id}`);
export const createTrip = (tripData) => apiClient.post('/trips', tripData);
export const updateTrip = (id, tripData) => apiClient.put(`/trips/${id}`, tripData);
export const deleteTrip = (id) => apiClient.delete(`/trips/${id}`);

// Loading Confirmation
export const confirmLoading = (tripId, loadingData) => apiClient.post(`/trips/${tripId}/confirm-loading`, loadingData);

// File Import
export const importData = (type, data) => apiClient.post(`/import/${type}`, data);

// Document Generation
export const generateDeliveryNote = (orderId) => apiClient.post(`/documents/delivery-note/${orderId}`);
export const generateInvoice = (orderId) => apiClient.post(`/documents/invoice/${orderId}`);

// Reporting
export const getDailyOrderReport = (date) => apiClient.get('/reports/daily-orders', { params: { date } });

// Error handling middleware
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API call error:', error.response);
    // You can add global error handling here, such as showing a notification
    return Promise.reject(error);
  }
);

export default apiClient;