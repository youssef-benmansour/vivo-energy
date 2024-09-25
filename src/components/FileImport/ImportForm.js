// src/components/FileImport/ImportForm.js
import React, { useState } from 'react';
import { processFile } from '../../services/fileImport';

const ImportForm = () => {
  const [importType, setImportType] = useState('clients');
  const [file, setFile] = useState(null);
  const [importStatus, setImportStatus] = useState('');
  const [importErrors, setImportErrors] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImportTypeChange = (e) => {
    setImportType(e.target.value);
  };

  const handleImport = async () => {
    if (!file) {
      setImportStatus('Please select a file to import.');
      return;
    }

    setImportStatus('Importing data...');
    setImportErrors([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await processFile(formData, importType);
      setImportStatus(response.data.message);
      if (response.data.details && response.data.details.errors) {
        setImportErrors(response.data.details.errors);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus(`Import failed: ${error.message}`);
      if (error.response && error.response.data && error.response.data.details) {
        setImportErrors(error.response.data.details.errors || []);
      }
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
      {importErrors.length > 0 && (
        <div>
          <h3>Import Errors:</h3>
          <ul>
            {importErrors.map((error, index) => (
              <li key={index}>
                Error: {error.error}
                <br />
                Data: {JSON.stringify(error.data)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImportForm;