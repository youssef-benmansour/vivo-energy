// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Import pages
import Dashboard from './pages/Dashboard';
import DataImport from './pages/DataImport';
import OrderManagement from './pages/OrderManagement';
import TripPlanning from './pages/TripPlanning';
import LoadingConfirmation from './pages/LoadingConfirmation';
import DocumentGeneration from './pages/DocumentGeneration';
import Reporting from './pages/Reporting';

// Import theme
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Box sx={{ display: 'flex', flex: 1 }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/import" element={<DataImport />} />
                <Route path="/orders" element={<OrderManagement />} />
                <Route path="/trips" element={<TripPlanning />} />
                <Route path="/loading" element={<LoadingConfirmation />} />
                <Route path="/documents" element={<DocumentGeneration />} />
                <Route path="/reports" element={<Reporting />} />
              </Routes>
            </Box>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;