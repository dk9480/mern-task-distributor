const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  getAllTasks,
  detectDuplicates,
  removeDuplicates,
  getDuplicateReport,
  getTasksByUploadBatch  // Add this import
} = require('../controllers/adminTaskController');

// Protect all admin routes
router.use(adminAuth);

// @route   GET /api/admin/tasks
router.get('/tasks', getAllTasks);

// @route   GET /api/admin/upload-batches
router.get('/upload-batches', getTasksByUploadBatch);

// @route   POST /api/admin/duplicates/detect
router.post('/duplicates/detect', detectDuplicates);

// @route   POST /api/admin/duplicates/remove
router.post('/duplicates/remove', removeDuplicates);

// @route   GET /api/admin/duplicates/report
router.get('/duplicates/report', getDuplicateReport);

module.exports = router;