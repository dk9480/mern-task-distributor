import React, { useState } from 'react';
import API from '../api';

function AgentLogin() {
  const [formData, setFormData] = useState({
    email: 'agent@test.com',
    password: 'agent123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting agent login...');
      
      const res = await API.post('/agent-auth/login', formData);
      console.log('Login response:', res.data);
      
      if (res.data.success && res.data.token) {
        // Store agent data with token at root level
        localStorage.setItem('agent', JSON.stringify({
          token: res.data.token,
          data: res.data.data
        }));
        
        console.log('Agent data stored, redirecting...');
        window.location.href = '/agent-dashboard';
      } else {
        setError('Login failed: Invalid response from server');
      }
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMsg);
      console.error('Login error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="container">
      <div className="login-card">
        <h2>Agent Login</h2>
        
        {error && (
          <div className="error-message" style={{color: 'red', marginBottom: '15px'}}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            name="email"
            placeholder="Agent Email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Agent Login'}
          </button>
        </form>
        
        <div className="login-links">
          <p>Admin? <a href="/">Go to Admin Login</a></p>
          <p><strong>Test Credentials:</strong> agent@test.com / agent123</p>
        </div>
      </div>
    </div>
  );
}

export default AgentLogin;