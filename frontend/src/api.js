import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add token to all requests - SIMPLIFIED VERSION
API.interceptors.request.use((req) => {
  // Always check agent storage first for agent routes
  const agentData = localStorage.getItem('agent');
  
  if (agentData) {
    try {
      const parsed = JSON.parse(agentData);
      if (parsed.token) {
        req.headers['x-auth-token'] = parsed.token;
        console.log('✅ Agent token added to request:', req.url);
      }
    } catch (error) {
      console.error('Error parsing agent data:', error);
    }
  }
  
  return req;
});

// Handle response errors - PREVENT IMMEDIATE REDIRECT
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 Authentication failed for:', error.config?.url);
      // Don't redirect here - let the component handle it
    }
    return Promise.reject(error);
  }
);

export default API;
