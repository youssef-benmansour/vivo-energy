// src/services/fileImport.js
import api from './api';

export const processFile = async (formData, importType) => {
  return api.post(`/import/${importType}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const fetchImportHistory = async () => {
  try {
    const response = await api.get('/import/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching import history:', error);
    throw error;
  }
};