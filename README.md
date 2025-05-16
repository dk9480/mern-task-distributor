# mern-task-distributor

A full-stack web application designed for admins to efficiently manage and distribute tasks among agents. The key functionalities include:
  - Secure admin login
  - Agent creation and management
  - Upload of .csv or .xlsx files containing task data
  - Automatic and equal distribution of tasks among agents
  - Viewing distributed task lists per agent


# Features
  - Admin Login with JWT-based secure authentication
  - Agent Management: Create, view, and manage agents easily
  - File Upload: Supports .csv and .xlsx uploads using Multer
  - Automatic Equal Task Distribution: Tasks are distributed evenly among all agents to ensure balanced workload (e.g., if there are X agents and Y tasks, each         agent receives approximately Y/X tasks)
  - Distributed Task Overview: View tasks assigned to each agent individually
  - Frontend built using React.js with React Router and Axios
  - Backend powered by Node.js, Express.js, and MongoDB with Mongoose


# Technology Stack
  - Frontend: React, Axios, React Router
  - Backend: Node.js, Express.js, MongoDB (Mongoose)
  - Authentication: JWT (JSON Web Tokens)
  - File Handling: Multer, csvtojson, xlsx
  - Database: MongoDB Atlas or Local MongoDB


# How to start
  -Backend Setup:-
    - `cd backend`
    - `node server.js`
  -Frontend Setup
    - `cd frontend`
    - `npm start`


# How It Works
  - Admin Login: Secure authentication via JWT tokens.
  - Agent Creation: Admin adds agents to the system.
  - Task Upload: Admin uploads task data via .csv or .xlsx files.
  - Task Distribution: The backend automatically distributes tasks equally among all agents, ensuring balanced workload.
  - Task Review: Admin can view tasks assigned to each agent in a dedicated dashboard.


# Future Enhancements
  - Implement agent login and role-based access control
  - Add real-time notifications for task updates
  - Integrate advanced search and filtering options
  - Export distributed tasks reports in various formats.
