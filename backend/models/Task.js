const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  isDuplicate: {
    type: Boolean,
    default: false
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  }
}, {
  timestamps: true
});

// Compound index for duplicate detection
taskSchema.index({ title: 1, assignedTo: 1 });

module.exports = mongoose.model('Task', taskSchema);