import React, { useState } from 'react';
import API from '../api';

function AgentUploadCSV({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setUploading(true);
    setUploadResult(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await API.post('/tasks/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadResult({
        success: true,
        message: response.data.message,
        data: response.data.data
      });
      
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
      
    } catch (err) {
      setUploadResult({
        success: false,
        message: err.response?.data?.message || 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (['csv', 'xlsx', 'xls'].includes(ext)) {
        setFile(selectedFile);
        setUploadResult(null);
      } else {
        alert('Please select a CSV or Excel file');
        e.target.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        "Title": "Sample Task 1",
        "Description": "This is a sample task description",
        "Priority": "high",
        "DueDate": "2024-12-31"
      },
      {
        "Title": "Sample Task 2", 
        "Description": "Another sample task",
        "Priority": "medium",
        "DueDate": ""
      }
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Title,Description,Priority,DueDate\n"
      + templateData.map(row => 
          `"${row.Title}","${row.Description}","${row.Priority}","${row.DueDate}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "task_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card">
      <h3>📤 Upload Tasks from CSV/Excel</h3>
      
      <div className="upload-info">
        <h4>📋 File Format Requirements:</h4>
        <ul>
          <li>✅ <strong>Supported formats:</strong> CSV, XLSX, XLS</li>
          <li>✅ <strong>Required column:</strong> <strong>Title</strong> (or title, Task, task)</li>
          <li>✅ <strong>Optional columns:</strong> Description, Priority, DueDate</li>
          <li>✅ <strong>Automatic distribution:</strong> Tasks will be equally distributed among your sub-agents</li>
          <li>✅ <strong>Duplicate detection:</strong> Duplicate tasks will be automatically detected and skipped</li>
        </ul>
        
        <button type="button" onClick={downloadTemplate} className="template-btn">
          📥 Download CSV Template
        </button>
      </div>

      <form onSubmit={handleUpload}>
        <div className="file-input-group">
          <label>Select File:</label>
          <input 
            type="file" 
            accept=".csv,.xlsx,.xls" 
            onChange={handleFileChange}
            required 
          />
          <small>Max file size: 10MB</small>
        </div>
        
        <button type="submit" disabled={uploading || !file} className="upload-btn">
          {uploading ? '⏳ Uploading...' : '🚀 Upload & Distribute Tasks'}
        </button>
      </form>

      {uploadResult && (
        <div className={`upload-result ${uploadResult.success ? 'success' : 'error'}`}>
          <h4>{uploadResult.success ? '✅ Upload Successful' : '❌ Upload Failed'}</h4>
          <p>{uploadResult.message}</p>
          
          {uploadResult.success && uploadResult.data && (
            <div className="upload-stats">
              <h5>📊 Upload Statistics:</h5>
              <p><strong>Total Processed:</strong> {uploadResult.data.totalProcessed}</p>
              <p><strong>✅ Successful Tasks:</strong> {uploadResult.data.successful}</p>
              <p><strong>❌ Duplicates Skipped:</strong> {uploadResult.data.duplicates}</p>
              <p><strong>⚠️ Errors:</strong> {uploadResult.data.errors}</p>
              
              {uploadResult.data.distribution && (
                <div className="distribution-info">
                  <h6>👥 Distribution Among Sub-agents:</h6>
                  {uploadResult.data.distribution.map((dist, index) => (
                    <p key={index}><strong>{dist.agent}:</strong> {dist.tasksAssigned} tasks</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AgentUploadCSV;