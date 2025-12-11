import React, { useState, useEffect } from 'react';
import API from '../api';

function TaskList({ onEditTask, refreshKey }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [refreshKey]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.get('/tasks');
      setTasks(response.data.data || []);
      
    } catch (err) {
      console.error('Error fetching tasks:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load tasks');
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating task status');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await API.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting task');
      }
    }
  };

  if (loading) return <div className="loading">Loading tasks...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3>Task List</h3>
        <button onClick={fetchTasks} className="refresh-btn">🔄 Refresh</button>
      </div>

      {tasks.length === 0 ? (
        <p className="no-data">No tasks found. Create your first task!</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task._id} className="task-item">
              <div className="task-header">
                <h4>{task.title}</h4>
                <span className={`priority-badge ${task.priority}`}>
                  {task.priority}
                </span>
              </div>
              
              <p className="task-description">{task.description || 'No description'}</p>
              
              <div className="task-meta">
                <p><strong>Assigned to:</strong> {task.assignedTo?.name || 'Unknown'}</p>
                <p><strong>Status:</strong> 
                  <select 
                    value={task.status}
                    onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </p>
                <p><strong>Due Date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
                <p><strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="task-actions">
                <button 
                  onClick={() => onEditTask(task)}
                  className="edit-btn"
                >
                  ✏️ Edit
                </button>
                
                <button 
                  onClick={() => handleDelete(task._id)}
                  className="delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;