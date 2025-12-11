const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { agentAuth } = require('../middleware/authMiddleware');
const {
  createTask,
  uploadTasks,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');

// Protect all routes
router.use(agentAuth);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`)
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   POST /api/tasks
router.post('/', createTask);

// @route   POST /api/tasks/upload
router.post('/upload', upload.single('file'), uploadTasks);

// @route   GET /api/tasks
router.get('/', getTasks);

// @route   GET /api/tasks/:id
router.get('/:id', getTaskById);

// @route   PUT /api/tasks/:id
router.put('/:id', updateTask);

// @route   PUT /api/tasks/:id/status
router.put('/:id/status', updateTaskStatus);

// @route   DELETE /api/tasks/:id
router.delete('/:id', deleteTask);

module.exports = router;