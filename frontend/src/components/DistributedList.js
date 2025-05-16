import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DistributedList.css';

const DistributedList = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/agents', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAgents(res.data);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    fetchAgents();
  }, []);

  const handleAgentChange = async (e) => {
    const agentId = e.target.value;
    setSelectedAgent(agentId);

    try {
      const res = await axios.get(`http://localhost:5000/api/upload/lists?agentId=${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

//   const filteredTasks = tasks.filter(task =>
//     (task.firstName && task.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (task.phone && task.phone.includes(searchTerm))
//   );
const filteredTasks = tasks.filter(task =>
  (task.firstName && task.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
  (task.phone && task.phone.toString().includes(searchTerm))
);


  return (
    <div className="section">
      <h2>Distributed Tasks</h2>

      <div className="filters">
        <select value={selectedAgent} onChange={handleAgentChange}>
          <option value="">Select Agent</option>
          {agents.map(agent => (
            <option key={agent._id} value={agent._id}>
              {agent.name}
            </option>
          ))}
        </select>

        {selectedAgent && (
          <input
            type="text"
            placeholder="Search by name or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
      </div>

      {filteredTasks.length > 0 ? (
        <ul className="task-list">
          {filteredTasks.map((task, idx) => (
            <li key={idx}>
              <strong>Name:</strong> {task.firstName || 'N/A'} |{' '}
              <strong>Phone:</strong> {task.phone || 'N/A'} |{' '}
              <strong>Notes:</strong> {task.notes || 'N/A'}
            </li>
          ))}
        </ul>
      ) : selectedAgent ? (
        <p>No tasks found for this agent or matching search term.</p>
      ) : null}
    </div>
  );
};

export default DistributedList;
