import React, { useState, useEffect } from 'react';
import API from '../api';

function TaskForm({ taskToEdit, onTaskUpdated, onCancelEdit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: ''
  });
  const [subAgents, setSubAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    console.log('🔧 TaskForm mounted - Starting to fetch user data...');
    fetchUserData();
  }, []);

  useEffect(() => {
    if (taskToEdit) {
      setForm({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        assignedTo: taskToEdit.assignedTo?._id || '',
        priority: taskToEdit.priority || 'medium',
        dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : ''
      });
      setIsEditing(true);
    }
  }, [taskToEdit]);

  const fetchUserData = async () => {
    try {
      setError('');
      
      // Get current user from localStorage
      const agentData = localStorage.getItem('agent');
      if (!agentData) {
        setError('No user data found. Please login again.');
        return;
      }

      const parsed = JSON.parse(agentData);
      setCurrentUser(parsed.data);

      // If user is an agent, fetch their sub-agents
      if (parsed.data.userType === 'agent') {
        console.log('🔍 Fetching sub-agents for agent...');
        const response = await API.get('/sub-agents');
        console.log('✅ Sub-agents fetched:', response.data.data?.length || 0);
        setSubAgents(response.data.data || []);
      } else {
        // For sub-agents, they can only assign to themselves
        console.log('👤 User is sub-agent, can only assign to self');
        setSubAgents([parsed.data]); // Add themselves as the only option
      }
      
    } catch (err) {
      console.error('❌ Error fetching user data:', err);
      setError(err.response?.data?.message || 'Failed to load user data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('📤 Submitting task form...');
      
      if (isEditing) {
        await API.put(`/tasks/${taskToEdit._id}`, form);
        alert('Task updated successfully!');
      } else {
        await API.post('/tasks', form);
        alert('Task created successfully!');
      }
      
      setForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: ''
      });
      setIsEditing(false);
      if (onTaskUpdated) onTaskUpdated();
      
    } catch (err) {
      console.error('❌ Error saving task:', err);
      setError(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: ''
    });
    setIsEditing(false);
    setError('');
    if (onCancelEdit) onCancelEdit();
  };

  // If user is sub-agent, auto-assign to themselves
  useEffect(() => {
    if (currentUser && currentUser.userType === 'sub-agent' && !isEditing) {
      setForm(prev => ({ ...prev, assignedTo: currentUser.id }));
    }
  }, [currentUser, isEditing]);

  return (
    <div className="card">
      <h3>{isEditing ? '✏️ Edit Task' : '✅ Create New Task'}</h3>
      
      {error && (
        <div className="error-message" style={{color: 'red', marginBottom: '15px', padding: '10px', background: '#ffe6e6'}}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input 
            type="text"
            placeholder="Enter task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea 
            placeholder="Enter task description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
            rows="3"
          />
        </div>

        {currentUser && currentUser.userType === 'agent' && (
          <div className="form-group">
            <label>Assign to Sub-Agent *</label>
            <select 
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              required
              disabled={subAgents.length === 0}
            >
              <option value="">Select a sub-agent</option>
              {subAgents.map(agent => (
                <option key={agent._id} value={agent._id}>
                  {agent.name} ({agent.email})
                </option>
              ))}
            </select>
            {subAgents.length === 0 && !error && (
              <p style={{color: '#666', fontSize: '12px', marginTop: '5px'}}>
                No sub-agents found. Create a sub-agent first.
              </p>
            )}
          </div>
        )}

        {currentUser && currentUser.userType === 'sub-agent' && (
          <div className="form-group">
            <label>Assigned To</label>
            <input 
              type="text"
              value={currentUser.name}
              disabled
              style={{background: '#f5f5f5'}}
            />
            <small>Sub-agents can only create tasks for themselves</small>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Priority</label>
            <select 
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input 
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" disabled={loading || (currentUser?.userType === 'agent' && subAgents.length === 0)}>
            {loading ? '⏳ Processing...' : (isEditing ? 'Update Task' : 'Create Task')}
          </button>
          {isEditing && (
            <button type="button" onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TaskForm;