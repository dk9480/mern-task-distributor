import React, { useState, useEffect } from 'react';
import API from '../api';

function SubAgentForm({ subAgentToEdit, onSubAgentUpdated }) {
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
        name: subAgentToEdit.name,
        email: subAgentToEdit.email,
        mobile: subAgentToEdit.mobile,
        password: ''
      });
      setIsEditing(true);
    }
  }, [subAgentToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const agent = JSON.parse(localStorage.getItem('agent'));
      
      // Add agent ID to headers for authentication
      const config = {
        headers: { 'x-agent-id': agent.id }
      };

      if (isEditing) {
        await API.put(`/sub-agents/${subAgentToEdit._id}`, form, config);
        alert('Sub-agent updated successfully!');
      } else {
        await API.post('/sub-agents', form, config);
        alert('Sub-agent created successfully!');
      }
      
      setForm({ name: '', email: '', mobile: '', password: '' });
      setIsEditing(false);
      if (onSubAgentUpdated) onSubAgentUpdated();
      
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>{isEditing ? 'Edit Sub-Agent' : 'Create Sub-Agent'}</h3>
      <form onSubmit={handleSubmit}>
        <input 
          placeholder="Name" 
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} 
          required 
        />
        <input 
          placeholder="Email" 
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
          required 
          disabled={isEditing} // Email shouldn't be editable
        />
        <input 
          placeholder="Mobile" 
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })} 
          required 
        />
        <input 
          type="password" 
          placeholder={isEditing ? 'New Password (leave blank to keep current)' : 'Password'} 
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
          required={!isEditing}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : (isEditing ? 'Update Sub-Agent' : 'Create Sub-Agent')}
        </button>
        {isEditing && (
          <button 
            type="button"
            onClick={() => {
              setForm({ name: '', email: '', mobile: '', password: '' });
              setIsEditing(false);
            }}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

export default SubAgentForm;