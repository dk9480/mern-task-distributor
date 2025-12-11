import React, { useState, useEffect } from 'react';
import AgentForm from './AgentForm';
import AgentList from './AgentList';
import UploadCSV from './UploadCSV';
import DistributedList from './DistributedList';
import API from '../api';

function Dashboard() {
  const [agentToEdit, setAgentToEdit] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setAgentsLoading(true);
        const res = await API.get('/agents');
        
        // Ensure we always set an array, even if response structure changes
        const agentsData = Array.isArray(res.data) ? res.data : 
                         (res.data?.data || []); // Handle different API response structures
        
        setAgents(agentsData);
      } catch (err) {
        console.error('Error fetching agents:', err);
        setAgents([]); // Reset to empty array on error
        alert(err.response?.data?.msg || 'Error fetching agents');
      } finally {
        setAgentsLoading(false);
      }
    };
    fetchAgents();
  }, [refreshKey]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleAgentUpdated = () => {
    setAgentToEdit(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
      
      <AgentForm 
        agentToEdit={agentToEdit} 
        onAgentUpdated={handleAgentUpdated} 
      />
      
      <AgentList 
        key={refreshKey}
        onEditAgent={setAgentToEdit} 
      />
      
      <UploadCSV />
      {!agentsLoading && <DistributedList agents={agents} />}
    </div>
  );
}

export default Dashboard;
