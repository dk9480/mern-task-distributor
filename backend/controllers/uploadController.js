  const csv = require('csvtojson');
  const xlsx = require('xlsx');
  const fs = require('fs');
  const Agent = require('../models/Agent');
  const DistributedList = require('../models/DistributedList');

  exports.uploadFile = async (req, res) => {
  try {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

  const filePath = req.file.path;
  const extension = req.file.originalname.split('.').pop().toLowerCase();

  let jsonData;

  if (extension === 'csv') {
    jsonData = await csv().fromFile(filePath);
  } else {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    jsonData = xlsx.utils.sheet_to_json(sheet);
  }

  // Get all agents
  const agents = await Agent.find();
  if (agents.length === 0) {
    return res.status(400).json({ msg: 'No agents found to distribute data' });
  }

  // Distribute data equally
  let agentIndex = 0;
  for (let i = 0; i < jsonData.length; i++) {
    const item = jsonData[i];
    const agent = agents[agentIndex];

    const distributedItem = new DistributedList({
      agentId: agent._id,
      firstName: item.FirstName || item.firstname || '',
      phone: item.Phone || item.phone || '',
      notes: item.Notes || item.notes || ''
    });

    await distributedItem.save();

    agentIndex = (agentIndex + 1) % agents.length;
  }

  // Delete uploaded file
  fs.unlinkSync(filePath);

  res.status(200).json({ msg: 'File uploaded and data distributed successfully' });

  } catch (err) {
  console.error(err);
  res.status(500).json({ msg: 'Server error' });
  }
  };

  //Get tasks for specific agent using ?agentId=
  exports.getDistributedData = async (req, res) => {
  try {
  const { agentId } = req.query;


  let query = {};
  if (agentId) {
    query.agentId = agentId;
  }

  const lists = await DistributedList.find(query).populate('agentId', 'name email');
  res.json(lists);


  } catch (err) {
  console.error(err);
  res.status(500).send('Server error');
  }
  };
