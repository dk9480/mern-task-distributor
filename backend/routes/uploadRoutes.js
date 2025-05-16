const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadFile, getDistributedData } = require('../controllers/uploadController');

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`)
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
    cb(null, true);
  } else {
    cb(new Error('Only .csv, .xlsx, .xls files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post('/upload', upload.single('file'), uploadFile);
router.get('/lists', getDistributedData);

module.exports = router;
