const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// Load env variables and connect to DB
dotenv.config();
connectDB();

const app = express();

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Import routes
const authRoutes = require('./routes/authRoutes');
const agentRoutes = require('./routes/agentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const agentAuthRoutes = require('./routes/agentAuthRoutes');
const subAgentRoutes = require('./routes/subAgentRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminTaskRoutes = require('./routes/adminTaskRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/agent-auth', agentAuthRoutes);
app.use('/api/sub-agents', subAgentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminTaskRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Task Distribution System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
