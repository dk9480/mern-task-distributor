import React, { useState, useEffect } from 'react';
import API from '../api';

function SubAgentForm({ subAgentToEdit, onSubAgentUpdated, onCancelEdit }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subAgentToEdit) {
      setForm({
        name: subAgentToEdit.name || '',
        email: subAgentToEdit.email || '',
        mobile: subAgentToEdit.mobile || '',
        password: ''
      });
      setIsEditing(true);
    }
  }, [subAgentToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await API.put(`/sub-agents/${subAgentToEdit._id}`, form);
        alert('Sub-agent updated successfully!');
      } else {
        await API.post('/sub-agents', form);
        alert('Sub-agent created successfully!');
      }
      
      setForm({ name: '', email: '', mobile: '', password: '' });
      setIsEditing(false);
      if (onSubAgentUpdated) onSubAgentUpdated();
      
    } catch (err) {
      console.error('Error saving sub-agent:', err);
      alert(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: '', email: '', mobile: '', password: '' });
    setIsEditing(false);
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <div className="card">
      <h3>{isEditing ? '✏️ Edit Sub-Agent' : '👥 Create Sub-Agent'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input 
            type="text"
            placeholder="Enter sub-agent name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input 
            type="email"
            placeholder="Enter email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            required 
            disabled={isEditing}
          />
        </div>

        <div className="form-group">
          <label>Mobile *</label>
          <input 
            type="text"
            placeholder="Enter mobile number"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })} 
            required 
          />
        </div>

        <div className="form-group">
          <label>{isEditing ? 'New Password' : 'Password *'}</label>
          <input 
            type="password" 
            placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'} 
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
            required={!isEditing}
          />
        </div>

        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? '⏳ Processing...' : (isEditing ? 'Update Sub-Agent' : 'Create Sub-Agent')}
          </button>
          {isEditing && (
            <button type="button" onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default SubAgentForm;