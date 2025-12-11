import React, { useState, useEffect } from 'react';
import API from '../api';
import './DistributedList.css';

function DistributedList({ agents = [] }) {  // Default to empty array
  const [lists, setLists] = useState([]);
  const [filteredLists, setFilteredLists] = useState([]);
  const [agentId, setAgentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (agentId) {
      fetchLists();
    } else {
      setLists([]);
      setFilteredLists([]);
    }
  }, [agentId]);

  useEffect(() => {
    const results = lists.filter(item => {
      const matchesSearch = searchTerm 
        ? (item.firstName && item.firstName.toLowerCase().includes(searchTerm.toLowerCase())) || 
          (item.phone && item.phone.toString().includes(searchTerm)) ||
          (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      return matchesSearch;
    });
    setFilteredLists(results);
  }, [searchTerm, lists]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await API.get('/upload/lists', { params: { agentId } });
      setLists(Array.isArray(res.data) ? res.data : []);
      setInitialLoad(false);
    } catch (err) {
      alert(err.response?.data?.msg || 'Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="section">
        <h2>Distributed Tasks</h2>
        <div className="filters">
          <select 
            value={agentId} 
            onChange={(e) => setAgentId(e.target.value)}
            className="filter-select"
          >
            <option value="">Select an agent to view tasks</option>
            {Array.isArray(agents) && agents.map(agent => (
              <option key={agent._id} value={agent._id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
        <div className="initial-message">
          <p>Please select an agent to view their assigned tasks</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="section">
      <h2>Distributed Tasks</h2>
      <div className="filters">
        <select 
          value={agentId} 
          onChange={(e) => setAgentId(e.target.value)}
          className="filter-select"
        >
          <option value="">Select an agent</option>
          {Array.isArray(agents) && agents.map(agent => (
            <option key={agent._id} value={agent._id}>
              {agent.name}
            </option>
          ))}
        </select>
        
        {agentId && (
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        )}
      </div>
      
      {agentId ? (
        <ul className="task-list">
          {filteredLists.length > 0 ? (
            filteredLists.map((item) => (
              <li key={item._id} className="task-item">
                <p><strong>Name:</strong> {item.firstName}</p>
                <p><strong>Phone:</strong> {item.phone}</p>
                <p><strong>Notes:</strong> {item.notes || 'N/A'}</p>
              </li>
            ))
          ) : (
            <li className="no-results">No tasks found for this agent</li>
          )}
        </ul>
      ) : (
        <div className="no-agent-selected">
          <p>No agent selected. Please choose an agent to view tasks.</p>
        </div>
      )}
    </div>
  );
}

export default DistributedList;


