# 📋 MERN Task Distributor

A full-stack task management system with hierarchical user roles and automated task distribution.

---

## 🚀 Features

- **3-Tier User Hierarchy:** Admin → Agents → Sub-agents  
- **Role-Based Access Control:** Granular permission system  
- **CSV/XLSX Bulk Upload:** Automated task distribution  
- **Real-time Dashboards:** Task tracking & system monitoring  
- **Duplicate Detection:** Prevents repeated entries  
- **Secure Authentication:** JWT + bcrypt hashing  

---

## 🏗️ Architecture
<img width="625" height="164" alt="image" src="https://github.com/user-attachments/assets/523b8ee6-99ec-4832-bd72-4a0cd0b84ab7" />




---

## 📁 Project Structure


<img width="748" height="310" alt="image" src="https://github.com/user-attachments/assets/9e459026-e241-4f74-9e5c-7951d858b365" />




---

## 🛠️ Tech Stack

**Frontend:** React.js, JavaScript, HTML5, CSS3  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Authentication:** JWT, bcrypt  
**File Processing:** Multer, csv-parser, xlsx  
**Database:** MongoDB Atlas  

---

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/dk9480/mern-task-distributor.git
cd mern-task-distributor

```
### 2. Backend Setup
```
cd backend
npm install
```

Create a .env file inside the backend/ folder:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000

```

### 3. Frontend Setup
```
cd frontend
npm install
```

### 4. Database Initialization
```
cd backend
npm install
```

### 5. Run the Application
```
cd backend
npm install
```

## 🎯 Usage

### Default Login Credentials

#### **Admin Panel**
**URL:** http://localhost:3000  
- **Email:** admin@example.com  
- **Password:** admin123  

#### **Agent Panel**
**URL:** http://localhost:3000/agent-login  
- **Email:** agent@test.com  
- **Password:** agent123  

---

## 🔄 Workflow

1. Admin creates Agents  
2. Agents create Sub-agents  
3. Agents upload CSV/XLSX task files  
4. System automatically distributes tasks  
5. Sub-agents update task statuses  
6. Admin monitors the complete system  

---

## 📂 CSV Format Example

```csv
Title,Description,Priority,DueDate
"Client Meeting","Discuss project requirements","high","2024-12-31"
"Documentation","Complete API documentation","medium","2024-12-25"
"Testing","Perform unit tests","low",""
```

## 📊 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/auth/login` | Admin login |
| **POST** | `/api/agent-auth/login` | Agent/Sub-agent login |

---

### 👥 User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/agents` | Create agent (Admin only) |
| **GET** | `/api/agents` | Get all agents (Admin only) |
| **POST** | `/api/sub-agents` | Create sub-agent (Agent only) |
| **GET** | `/api/sub-agents` | Get sub-agents (Agent only) |

---

### 📝 Task Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/tasks` | Create a single task |
| **POST** | `/api/tasks/upload` | Upload CSV tasks |
| **GET** | `/api/tasks` | Get tasks (role-based) |
| **PUT** | `/api/tasks/:id/status` | Update task status |

---

### 🛠️ Admin Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/admin/tasks` | Get all system tasks |
| **POST** | `/api/admin/duplicates/detect` | Detect duplicate tasks |
| **POST** | `/api/admin/duplicates/remove` | Remove duplicate tasks |

---

## 🧪 Testing the Application

### **Admin**
- Login  
- Create agents  
- Monitor system dashboard  

### **Agent**
- Login  
- Create sub-agents  
- Upload CSV tasks  
- Verify task distribution  

### **Sub-Agent**
- Login  
- View assigned tasks  
- Update task status  

---

## 🔒 Security Features

- JWT-based authentication  
- Role-based access control  
- bcrypt password hashing  
- Request validation & sanitization  
- Protected API endpoints  

---

## 📈 Scalability Features

- Modular code architecture  
- RESTful API design  
- MongoDB Atlas cloud-ready  
- Stateless authentication  
- Optimized MongoDB queries  

---

---

## 👤 Author

**D K VIJENDRA KUMAR**  
GitHub: [@dk9480](https://github.com/dk9480)  
Project: **MERN Task Distributor**

