const mongoose = require('mongoose');

const distributedListSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  firstName: String,
  phone: Number,
  notes: String
});

module.exports = mongoose.model('DistributedList', distributedListSchema);
