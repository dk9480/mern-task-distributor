import React, { useState } from 'react';
import API from '../api';

function UploadCSV() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await API.post('/upload/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('File uploaded and data distributed successfully!');
      setFile(null);
    } catch (err) {
      alert(err.response?.data?.msg || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h3>Upload File</h3>
      <form onSubmit={handleUpload}>
        <input 
          type="file" 
          accept=".csv,.xlsx,.xls" 
          onChange={(e) => setFile(e.target.files[0])} 
          required 
        />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}

export default UploadCSV;
