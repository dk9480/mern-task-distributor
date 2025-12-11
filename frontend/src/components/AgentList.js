import React, { useState, useEffect } from 'react';
import API from '../api';

function AgentList({ onEditAgent }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/agents');
      
      // Ensure we're working with an array
      const agentsData = Array.isArray(response.data) ? response.data : 
                        (response.data.data || []); // Handle different API response structures
      
      setAgents(agentsData);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err.response?.data?.message || 'Failed to load agents');
      setAgents([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await API.delete(`/agents/${id}`);
        fetchAgents(); // Refresh the list
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting agent');
      }
    }
  };

  if (loading) return <div className="loading">Loading agents...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="card">
      <h3>Agent List</h3>
      {agents.length === 0 && !loading ? (
        <p className="no-agents">No agents found</p>
      ) : (
        <table className="agent-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent._id || agent.id}>
                <td>{agent.name}</td>
                <td>{agent.email}</td>
                <td>{agent.mobile}</td>
                <td className="actions">
                  <button 
                    className="edit-btn"
                    onClick={() => onEditAgent(agent)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(agent._id || agent.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AgentList;