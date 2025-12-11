📋 MERN Task Distributor

A full-stack task management system with hierarchical user roles and automated task distribution.

🚀 Features

3-Tier User Hierarchy: Admin → Agents → Sub-agents

Role-Based Access Control: Granular permissions

CSV/XLSX Bulk Upload: Auto task distribution

Real-time Dashboards: System monitoring & tracking

Duplicate Detection: Prevents duplicate tasks

Secure Authentication: JWT + bcrypt

🏗️ Architecture
Frontend (React) → Backend (Node.js/Express) → Database (MongoDB)
       ↓                     ↓                       ↓
  Dashboard UI           RESTful APIs          Data Persistence
  Role-based UI          Authentication        Task Distribution
  File Upload            Authorization         User Management

📁 Project Structure
backend/
├── controllers/     # Business logic
├── models/          # Database schemas
├── routes/          # API endpoints
├── middleware/      # Authentication & authorization
└── server.js        # Entry point

frontend/src/
├── components/      # React components
├── api.js           # API configuration
└── App.js           # Main application

🛠️ Tech Stack

Frontend: React.js, JavaScript, HTML5, CSS3
Backend: Node.js, Express.js, MongoDB, Mongoose
Auth: JWT, bcrypt
File Processing: Multer, csv-parser, xlsx
Database: MongoDB Atlas

🔧 Installation
1. Clone the Repository
git clone https://github.com/dk9480/mern-task-distributor.git
cd mern-task-distributor

2. Backend Setup
cd backend
npm install


Create .env inside backend/:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000

3. Frontend Setup
cd frontend
npm install

4. Database Initialization
cd backend
node scripts/createAdmin.js

5. Run the Application
# Backend
cd backend
npm start

# Frontend
cd frontend
npm start

🎯 Usage
Default Login Credentials

Admin Panel
http://localhost:3000

Email: admin@example.com

Password: admin123

Agent Panel
http://localhost:3000/agent-login

Email: agent@test.com

Password: agent123

🔄 Workflow

Admin creates Agents

Agents create Sub-agents

Agents upload CSV/XLSX with tasks

System auto-distributes tasks

Sub-agents update task statuses

Admin monitors everything in real time

📂 CSV Format Example
Title,Description,Priority,DueDate
"Client Meeting","Discuss project requirements","high","2024-12-31"
"Documentation","Complete API documentation","medium","2024-12-25"
"Testing","Perform unit tests","low",""

📊 API Endpoints
Authentication
POST /api/auth/login              # Admin login
POST /api/agent-auth/login        # Agent/Sub-agent login

User Management
POST /api/agents                  # Create agent (Admin)
GET  /api/agents                  # Get agents (Admin)

POST /api/sub-agents              # Create sub-agent (Agent)
GET  /api/sub-agents              # Get sub-agents (Agent)

Task Management
POST /api/tasks                   # Create task
POST /api/tasks/upload            # Upload CSV tasks
GET  /api/tasks                   # Get tasks (role-based)
PUT  /api/tasks/:id/status        # Update task status

Admin Features
GET  /api/admin/tasks             # All tasks
POST /api/admin/duplicates/detect # Detect duplicates
POST /api/admin/duplicates/remove # Remove duplicates

🧪 Testing the Application
Admin

Login

Create agents

Monitor dashboards

Agent

Login

Create sub-agents

Upload CSV

Verify distribution

Sub-Agent

Login

View assigned tasks

Update status

🔒 Security Features

JWT authentication

Role-based access control

bcrypt password hashing

Input sanitization

Protected API routes

📈 Scalability Features

Modular architecture

RESTful API

MongoDB Atlas ready

Stateless authentication

Efficient queries
