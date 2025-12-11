import React, { useState, useEffect } from 'react';
// Remove the unused API import
import SubAgentForm from './SubAgentForm';
import SubAgentList from './SubAgentList';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import AgentUploadCSV from './AgentUploadCSV';

function AgentDashboard() {
  const [agent, setAgent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [subAgentToEdit, setSubAgentToEdit] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const agentData = localStorage.getItem('agent');
      if (!agentData) {
        window.location.href = '/agent-login';
        return;
      }

      const parsedData = JSON.parse(agentData);
      if (!parsedData.token || !parsedData.data) {
        localStorage.removeItem('agent');
        window.location.href = '/agent-login';
        return;
      }

      setAgent(parsedData.data);
      setLoading(false);
      
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('agent');
      window.location.href = '/agent-login';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agent');
    window.location.href = '/agent-login';
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleEditSubAgent = (subAgent) => {
    setSubAgentToEdit(subAgent);
    setActiveTab('sub-agents');
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setActiveTab('tasks');
  };

  const handleCancelEdit = () => {
    setSubAgentToEdit(null);
    setTaskToEdit(null);
  };

  if (loading) {
    return <div className="container">Loading agent dashboard...</div>;
  }

  if (!agent) {
    return <div className="container">Authentication failed. Redirecting...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>Agent Dashboard</h2>
        <div className="user-info">
          <span>Welcome, {agent.name} ({agent.userType})</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="agent-info-card">
        <h3>Agent Information</h3>
        <div className="agent-details">
          <p><strong>Name:</strong> {agent.name}</p>
          <p><strong>Email:</strong> {agent.email}</p>
          <p><strong>Type:</strong> {agent.userType}</p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => { setActiveTab('overview'); handleCancelEdit(); }}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'sub-agents' ? 'active' : ''}
          onClick={() => { setActiveTab('sub-agents'); handleCancelEdit(); }}
        >
          👥 Sub-Agents
        </button>
        <button 
          className={activeTab === 'tasks' ? 'active' : ''}
          onClick={() => { setActiveTab('tasks'); handleCancelEdit(); }}
        >
          ✅ Tasks
        </button>
        <button 
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => { setActiveTab('upload'); handleCancelEdit(); }}
        >
          📤 Bulk Upload
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="card">
          <h3>Quick Overview</h3>
          <p>Welcome to your agent dashboard! Here's what you can do:</p>
          <div className="features-list">
            <div className="feature-item">
              <h4>👥 Manage Sub-Agents</h4>
              <p>Create and manage your sub-agents who will handle tasks</p>
            </div>
            <div className="feature-item">
              <h4>✅ Task Management</h4>
              <p>Create individual tasks and assign them to sub-agents</p>
            </div>
            <div className="feature-item">
              <h4>📤 Bulk Upload</h4>
              <p>Upload CSV/Excel files to create multiple tasks at once</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sub-agents' && (
        <div className="tab-content">
          <SubAgentForm 
            subAgentToEdit={subAgentToEdit}
            onSubAgentUpdated={() => {
              handleRefresh();
              setSubAgentToEdit(null);
            }}
            onCancelEdit={handleCancelEdit}
          />
          <SubAgentList 
            key={refreshKey} 
            onEditSubAgent={handleEditSubAgent}
          />
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="tab-content">
          <TaskForm 
            taskToEdit={taskToEdit}
            onTaskUpdated={() => {
              handleRefresh();
              setTaskToEdit(null);
            }}
            onCancelEdit={handleCancelEdit}
          />
          <TaskList 
            key={refreshKey}
            onEditTask={handleEditTask}
          />
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="tab-content">
          <AgentUploadCSV onUploadSuccess={handleRefresh} />
        </div>
      )}
    </div>
  );
}

export default AgentDashboard;