// src/components/FileImport.js
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import api from '../services/api';

const FileImport = () => {
  const [importType, setImportType] = useState('clients');
  const [file, setFile] = useState(null);
  const [importStatus, setImportStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImportTypeChange = (e) => {
    setImportType(e.target.value);
  };

  const processExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(sheet);
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const processCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          resolve(results.data);
        },
        header: true,
        error: (error) => reject(error),
      });
    });
  };

  const handleImport = async () => {
    if (!file) {
      setImportStatus('Please select a file to import.');
      return;
    }

    setImportStatus('Importing data...');

    try {
      let parsedData;
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parsedData = await processExcel(file);
      } else if (file.name.endsWith('.csv')) {
        parsedData = await processCSV(file);
      } else {
        throw new Error('Unsupported file format. Please use Excel (.xlsx, .xls) or CSV (.csv) files.');
      }

      // Send the parsed data to the backend
      const response = await api.post(`/import/${importType}`, parsedData);
      setImportStatus(`Import successful: ${response.data.message}`);
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus(`Import failed: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Import Data</h2>
      <select value={importType} onChange={handleImportTypeChange}>
        <option value="clients">Clients</option>
        <option value="products">Products</option>
        <option value="tanks">Tanks</option>
        <option value="trucks">Trucks</option>
        <option value="plants">Plants (Depots)</option>
        <option value="prices">Prices</option>
      </select>
      <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
      <button onClick={handleImport}>Import</button>
      <p>{importStatus}</p>
    </div>
  );
};

export default FileImport;