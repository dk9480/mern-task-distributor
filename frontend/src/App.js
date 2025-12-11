import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AgentLogin from './components/AgentLogin';
import Dashboard from './components/Dashboard';
import AgentDashboard from './components/AgentDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  // Check authentication
  const getAuthData = () => {
    try {
      const user = localStorage.getItem('user');
      const agent = localStorage.getItem('agent');
      
      if (user) {
        const userData = JSON.parse(user);
        return { type: 'user', data: userData, token: userData.token };
      }
      
      if (agent) {
        const agentData = JSON.parse(agent);
        return { type: 'agent', data: agentData, token: agentData.token };
      }
      
      return null;
    } catch (error) {
      console.error('Auth parsing error:', error);
      return null;
    }
  };

  const authData = getAuthData();

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={authData ? <Navigate to={authData.type === 'user' ? '/admin-dashboard' : '/agent-dashboard'} /> : <Login />} 
          />
          <Route 
            path="/agent-login" 
            element={authData?.type === 'agent' ? <Navigate to="/agent-dashboard" /> : <AgentLogin />} 
          />
          
          {/* Protected admin routes */}
          <Route 
            path="/admin-dashboard" 
            element={authData?.type === 'user' ? <AdminDashboard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/dashboard" 
            element={authData?.type === 'user' ? <Dashboard /> : <Navigate to="/" />} 
          />
          
          {/* Protected agent routes */}
          <Route 
            path="/agent-dashboard" 
            element={authData?.type === 'agent' ? <AgentDashboard /> : <Navigate to="/agent-login" />} 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
