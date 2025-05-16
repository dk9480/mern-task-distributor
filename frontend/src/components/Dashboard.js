import React from 'react';
import AgentForm from './AgentForm';
import UploadCSV from './UploadCSV';
// import DistributedList from './DistributedList';
import DistributedList from '../components/DistributedList';


function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
      <AgentForm />
      <UploadCSV />
      <DistributedList />
    </div>
  );
}

export default Dashboard;
