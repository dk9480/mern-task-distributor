import axios from 'axios';

const API = axios.create({
 // baseURL: 'https://mern-task-distributor.vercel.app/api', // ?baseURL: 'http://localhost:5000/api',
   baseURL: 'http://localhost:5000/api',

});

// Attach token for authenticated routes
API.interceptors.request.use((req) => {
  const user = localStorage.getItem('user');
  if (user) {
    req.headers.Authorization = `Bearer ${JSON.parse(user).token}`;
  }
  return req;
});

export default API;


