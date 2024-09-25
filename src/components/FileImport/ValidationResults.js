import React from 'react';

const ValidationResults = ({ results }) => {
  if (!results) return null;

  return (
    <div className="validation-results">
      <h3>Import Results</h3>
      <p>Status: {results.status}</p>
      <p>Records Imported: {results.recordsImported}</p>
      {results.errors && results.errors.length > 0 && (
        <div>
          <h4>Errors:</h4>
          <ul>
            {results.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValidationResults;