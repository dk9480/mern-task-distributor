import React, { useState, useEffect } from 'react';
import API from '../api';

function SubAgentList({ onEditSubAgent }) {
  const [subAgents, setSubAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubAgents();
  }, []);

  const fetchSubAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.get('/sub-agents');
      setSubAgents(response.data.data || []);
      
    } catch (err) {
      console.error('Error fetching sub-agents:', err);
      setError(err.response?.data?.message || 'Failed to load sub-agents');
      setSubAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sub-agent?')) {
      try {
        await API.delete(`/sub-agents/${id}`);
        fetchSubAgents();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting sub-agent');
      }
    }
  };

  if (loading) return <div className="loading">Loading sub-agents...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="card">
      <h3>My Sub-Agents</h3>
      {subAgents.length === 0 ? (
        <p className="no-data">No sub-agents found. Create your first sub-agent!</p>
      ) : (
        <table className="agent-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subAgents.map((subAgent) => (
              <tr key={subAgent._id}>
                <td>{subAgent.name}</td>
                <td>{subAgent.email}</td>
                <td>{subAgent.mobile}</td>
                <td>
                  <span className={`status ${subAgent.isActive ? 'active' : 'inactive'}`}>
                    {subAgent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="edit-btn"
                    onClick={() => onEditSubAgent(subAgent)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(subAgent._id)}
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

export default SubAgentList;