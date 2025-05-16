import React, { useState } from 'react';
import API from '../api';

function UploadCSV() {
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
    //   await API.post('/tasks/upload', formData);
    await API.post('/upload/upload', formData);
      alert('CSV uploaded & tasks distributed!');
    } catch (err) {
      alert('Upload failed');
      console.error(err);  // Optional for debugging
    }
  };

  return (
    <div className="card">
      <h3>Upload CSV</h3>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default UploadCSV;
