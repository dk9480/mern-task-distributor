import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [duplicates, setDuplicates] = useState([]);
  const [uploadBatches, setUploadBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    agentId: '',
    status: '',
    priority: '',
    hasDuplicates: '',
    search: ''
  });
  const [uploadFilterDate, setUploadFilterDate] = useState('');
  const [uploadFilterAgent, setUploadFilterAgent] = useState('');

  // Wrap functions with useCallback to prevent infinite re-renders
  const fetchAgents = useCallback(async () => {
    try {
      const response = await API.get('/agents');
      setAgents(response.data.data || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await API.get(`/admin/tasks?${params}`);
      setTasks(response.data.data || []);
      setStatistics(response.data.statistics || {});
    } catch (err) {
      console.error('Error fetching tasks:', err);
      alert('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await API.get('/admin/tasks?limit=1');
      setStatistics(response.data.statistics || {});
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  }, []);

  const fetchDuplicateReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/duplicates/report');
      setDuplicates(response.data.data || []);
    } catch (err) {
      console.error('Error fetching duplicates:', err);
      alert('Failed to load duplicate report');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUploadBatches = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (uploadFilterDate) params.append('date', uploadFilterDate);
      if (uploadFilterAgent) params.append('agentId', uploadFilterAgent);

      const response = await API.get(`/admin/upload-batches?${params}`);
      setUploadBatches(response.data.data || []);
    } catch (err) {
      console.error('Error fetching upload batches:', err);
      alert('Failed to load upload history');
    } finally {
      setLoading(false);
    }
  }, [uploadFilterDate, uploadFilterAgent]);

  useEffect(() => {
    fetchAgents();
    fetchStatistics();
  }, [fetchAgents, fetchStatistics]);

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks();
    } else if (activeTab === 'duplicates') {
      fetchDuplicateReport();
    } else if (activeTab === 'uploads') {
      fetchUploadBatches();
    }
  }, [activeTab, filters, uploadFilterDate, uploadFilterAgent, fetchTasks, fetchDuplicateReport, fetchUploadBatches]);

  const handleDetectDuplicates = async () => {
    if (!window.confirm('This will scan all tasks for duplicates. Continue?')) return;

    try {
      setLoading(true);
      const response = await API.post('/admin/duplicates/detect');
      alert(response.data.message);
      fetchStatistics();
      if (activeTab === 'duplicates') fetchDuplicateReport();
    } catch (err) {
      alert(err.response?.data?.message || 'Error detecting duplicates');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!window.confirm('WARNING: This will permanently delete all duplicate tasks. This action cannot be undone. Continue?')) return;

    try {
      setLoading(true);
      const response = await API.post('/admin/duplicates/remove', { confirm: true });
      alert(response.data.message);
      fetchStatistics();
      if (activeTab === 'duplicates') fetchDuplicateReport();
      if (activeTab === 'tasks') fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing duplicates');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>Admin Dashboard - System Oversight</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* Statistics Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{statistics.totalTasks || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number pending">{statistics.pending || 0}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number in-progress">{statistics.inProgress || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number completed">{statistics.completed || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Duplicates</h3>
          <p className="stat-number duplicates">{statistics.duplicates || 0}</p>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          System Overview
        </button>
        <button 
          className={activeTab === 'tasks' ? 'active' : ''}
          onClick={() => setActiveTab('tasks')}
        >
          All Tasks
        </button>
        <button 
          className={activeTab === 'uploads' ? 'active' : ''}
          onClick={() => setActiveTab('uploads')}
        >
          CSV Uploads
        </button>
        <button 
          className={activeTab === 'duplicates' ? 'active' : ''}
          onClick={() => setActiveTab('duplicates')}
        >
          Duplicate Management
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="card">
          <h3>System Overview</h3>
          <p>Monitor the entire task distribution system and maintain data quality.</p>
          
          <div className="admin-actions">
            <button onClick={handleDetectDuplicates} className="btn-primary">
              Scan for Duplicates
            </button>
            <button 
              onClick={handleRemoveDuplicates} 
              className="btn-danger"
              disabled={!statistics.duplicates}
            >
              Remove All Duplicates
            </button>
          </div>

          {statistics.uploadDistribution && (
            <div className="upload-distribution">
              <h4>📊 Task Distribution by Agent:</h4>
              {statistics.uploadDistribution.map((dist, index) => (
                <div key={index} className="distribution-item">
                  <strong>{dist.agentName}</strong> ({dist.userType}): {dist.taskCount} tasks
                </div>
              ))}
            </div>
          )}

          <div className="system-info">
            <h4>Quick Actions:</h4>
            <ul>
              <li>View all tasks across the system</li>
              <li>Monitor CSV uploads and distribution</li>
              <li>Detect duplicate tasks automatically</li>
              <li>Remove duplicates to clean up the system</li>
              <li>Monitor agent and sub-agent activity</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="card">
          <div className="card-header">
            <h3>All System Tasks</h3>
            <button onClick={fetchTasks} className="refresh-btn">Refresh</button>
          </div>

          {/* Filters */}
          <div className="filters">
            <select 
              value={filters.agentId}
              onChange={(e) => handleFilterChange('agentId', e.target.value)}
            >
              <option value="">All Agents</option>
              {agents.map(agent => (
                <option key={agent._id} value={agent._id}>
                  {agent.name} ({agent.userType})
                </option>
              ))}
            </select>

            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select 
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select 
              value={filters.hasDuplicates}
              onChange={(e) => handleFilterChange('hasDuplicates', e.target.value)}
            >
              <option value="">All Tasks</option>
              <option value="true">Duplicates Only</option>
            </select>

            <input 
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : (
            <div className="task-list-admin">
              {tasks.map(task => (
                <div key={task._id} className={`task-item-admin ${task.isDuplicate ? 'duplicate' : ''}`}>
                  <div className="task-header-admin">
                    <h4>{task.title}</h4>
                    <div className="task-meta-admin">
                      <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                      <span className={`status-badge ${task.status}`}>{task.status}</span>
                      {task.isDuplicate && <span className="duplicate-badge">DUPLICATE</span>}
                    </div>
                  </div>
                  
                  <div className="task-details-admin">
                    <p><strong>Created by:</strong> {task.createdBy?.name} ({task.createdBy?.userType})</p>
                    <p><strong>Assigned to:</strong> {task.assignedTo?.name} ({task.assignedTo?.userType})</p>
                    <p><strong>Description:</strong> {task.description || 'No description'}</p>
                    <p><strong>Due Date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
                    <p><strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              
              {tasks.length === 0 && <p className="no-data">No tasks found</p>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'uploads' && (
        <div className="card">
          <div className="card-header">
            <h3>📊 CSV Upload History & Distribution</h3>
            <button onClick={fetchUploadBatches} className="refresh-btn">🔄 Refresh</button>
          </div>

          <div className="filters">
            <input 
              type="date"
              value={uploadFilterDate}
              onChange={(e) => setUploadFilterDate(e.target.value)}
              placeholder="Filter by date"
            />
            <select 
              value={uploadFilterAgent}
              onChange={(e) => setUploadFilterAgent(e.target.value)}
            >
              <option value="">All Agents</option>
              {agents.map(agent => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading upload history...</div>
          ) : (
            <div className="upload-batches">
              {uploadBatches.map(batch => (
                <div key={batch.batchId} className="upload-batch">
                  <div className="batch-header">
                    <h4>📦 Upload Batch: {batch.batchId}</h4>
                    <span className="batch-info">
                      By: {batch.creator.name} | 
                      Tasks: {batch.taskCount} | 
                      Time: {new Date(batch.uploadTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="batch-tasks">
                    {batch.tasks.slice(0, 5).map(task => (
                      <div key={task._id} className="batch-task">
                        <strong>{task.title}</strong> → 
                        Assigned to: {task.assignedTo.name} | 
                        Status: <span className={`status-${task.status}`}>{task.status}</span>
                      </div>
                    ))}
                    {batch.taskCount > 5 && (
                      <p>... and {batch.taskCount - 5} more tasks</p>
                    )}
                  </div>
                </div>
              ))}
              
              {uploadBatches.length === 0 && (
                <p className="no-data">No upload batches found</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'duplicates' && (
        <div className="card">
          <div className="card-header">
            <h3>Duplicate Tasks Management</h3>
            <div className="duplicate-actions">
              <button onClick={handleDetectDuplicates} className="btn-primary">
                Scan for Duplicates
              </button>
              <button 
                onClick={handleRemoveDuplicates} 
                className="btn-danger"
                disabled={duplicates.length === 0}
              >
                Remove All Duplicates
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading duplicate report...</div>
          ) : (
            <>
              <div className="duplicate-stats">
                <p><strong>Found {duplicates.length} duplicate tasks</strong></p>
              </div>

              <div className="duplicate-list">
                {duplicates.map(dup => (
                  <div key={dup._id} className="duplicate-item">
                    <div className="duplicate-header">
                      <h4>{dup.title}</h4>
                      <span className="duplicate-badge">DUPLICATE</span>
                    </div>
                    <div className="duplicate-details">
                      <p><strong>Assigned to:</strong> {dup.assignedTo}</p>
                      <p><strong>Created:</strong> {new Date(dup.createdAt).toLocaleString()}</p>
                      <p><strong>Original Task:</strong> {dup.originalTitle}</p>
                      <p><strong>Original Created:</strong> {new Date(dup.originalCreatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                
                {duplicates.length === 0 && (
                  <p className="no-data">No duplicates found. Run a duplicate scan to detect duplicates.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;




















