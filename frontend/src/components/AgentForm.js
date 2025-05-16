import React, { useState } from 'react';
import API from '../api';

function AgentForm() {
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/agents', form);
      alert('Agent added!');
      setForm({ name: '', email: '', mobile: '', password: '' });
    } catch (err) {
      alert('Error adding agent');
    }
  };

  return (
    <div className="card">
      <h3>Create Agent</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Mobile" value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
        <input type="password" placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit">Add Agent</button>
      </form>
    </div>
  );
}

export default AgentForm;
