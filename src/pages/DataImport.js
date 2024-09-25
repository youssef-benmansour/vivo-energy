// src/pages/DataImport.js
import React, { useState, useEffect } from 'react';
import ImportForm from '../components/FileImport/ImportForm';
import ValidationResults from '../components/FileImport/ValidationResults';
import { fetchImportHistory, processFile } from '../services/fileImport';

const DataImport = () => {
  const [importHistory, setImportHistory] = useState([]);
  const [selectedImport, setSelectedImport] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = async () => {
    try {
      const history = await fetchImportHistory();
      setImportHistory(history);
    } catch (error) {
      console.error('Error fetching import history:', error);
    }
  };

  const handleImport = async (file, importType) => {
    try {
        const data = await processFile(file, importType);
        const result = await fetchImportHistory(importType, data);
        setSelectedImport(result);
        loadImportHistory();
    } catch (error) {
      console.error('Error during import:', error);
    }
  };

  return (
    <div className="data-import-page">
      <h1>Data Import</h1>
      
      <section className="import-form-section">
        <h2>Import New Data</h2>
        <ImportForm onImport={handleImport} />
      </section>

      {validationErrors.length > 0 && (
        <section className="validation-errors-section">
          <h2>Validation Errors</h2>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </section>
      )}

      {selectedImport && (
        <section className="validation-results-section">
          <h2>Latest Import Results</h2>
          <ValidationResults results={selectedImport} />
        </section>
      )}

      <section className="import-history-section">
        <h2>Import History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Status</th>
              <th>Records Imported</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {importHistory.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleString()}</td>
                <td>{item.type}</td>
                <td>{item.status}</td>
                <td>{item.recordsImported}</td>
                <td>
                  <button onClick={() => setSelectedImport(item)}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default DataImport;