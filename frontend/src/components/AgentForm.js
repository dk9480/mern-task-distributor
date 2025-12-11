import React, { useState, useEffect } from 'react';
import API from '../api';

function AgentForm({ agentToEdit, onAgentUpdated }) {
  const [form, setForm] = useState({
    name: '', 
    email: '', 
    mobile: '', 
    password: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (agentToEdit) {
      setForm({
        name: agentToEdit.name,
        email: agentToEdit.email,
        mobile: agentToEdit.mobile,
        password: ''
      });
      setIsEditing(true);
    }
  }, [agentToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/agents/${agentToEdit._id}`, form);
        alert('Agent updated!');
      } else {
        await API.post('/agents', form);
        alert('Agent added!');
      }
      setForm({ name: '', email: '', mobile: '', password: '' });
      setIsEditing(false);
      if (onAgentUpdated) onAgentUpdated();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error processing request');
    }
  };

  return (
    <div className="card">
      <h3>{isEditing ? 'Edit Agent' : 'Create Agent'}</h3>
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
        <button type="submit">{isEditing ? 'Update Agent' : 'Add Agent'}</button>
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

export default AgentForm;
