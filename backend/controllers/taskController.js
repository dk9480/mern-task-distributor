const Task = require('../models/Task');
const Agent = require('../models/Agent');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');

// Create Single Task
exports.createTask = async (req, res) => {
  const { title, description, assignedTo, priority, dueDate } = req.body;
  const createdBy = req.user.id;

  try {
    // Check user type and assign tasks accordingly
    const creator = await Agent.findById(createdBy);
    
    let assignedAgent;
    
    if (creator.userType === 'agent') {
      // Agent can assign to their sub-agents
      assignedAgent = await Agent.findOne({
        _id: assignedTo,
        parentAgent: createdBy,
        userType: 'sub-agent'
      });
    } else if (creator.userType === 'sub-agent') {
      // Sub-agent can only assign to themselves
      if (assignedTo !== createdBy) {
        return res.status(403).json({
          success: false,
          message: 'Sub-agents can only assign tasks to themselves'
        });
      }
      assignedAgent = creator;
    }

    if (!assignedAgent) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment or not authorized'
      });
    }

    // Check for duplicate task (same title for same assigned agent)
    const existingTask = await Task.findOne({
      title: title.trim(),
      assignedTo: assignedTo,
      isDuplicate: false
    });

    if (existingTask) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate task found for this agent'
      });
    }

    const task = new Task({
      title: title.trim(),
      description,
      assignedTo,
      createdBy,
      priority,
      dueDate: dueDate || null
    });

    await task.save();
    
    // Populate assignedTo details for response
    await task.populate('assignedTo', 'name email userType');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Upload Tasks via CSV/Excel with Equal Distribution
exports.uploadTasks = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const createdBy = req.user.id;
    const creator = await Agent.findById(createdBy);
    const results = [];
    const errors = [];
    const successfulTasks = [];
    let duplicatesCount = 0;

    // Process CSV file
    if (req.file.mimetype === 'text/csv' || req.file.originalname.endsWith('.csv')) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (data) => {
            results.push(data);
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } 
    // Process Excel file
    else if (req.file.mimetype.includes('spreadsheet') || 
             req.file.originalname.endsWith('.xlsx') || 
             req.file.originalname.endsWith('.xls')) {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      results.push(...xlsx.utils.sheet_to_json(worksheet));
    } 
    else {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Unsupported file format. Only CSV and Excel files are allowed'
      });
    }

    // Get available sub-agents for distribution
    let availableAgents = [];
    if (creator.userType === 'agent') {
      availableAgents = await Agent.find({
        parentAgent: createdBy,
        userType: 'sub-agent',
        isActive: true
      });
    } else {
      // For sub-agents, they can only assign to themselves
      availableAgents = [creator];
    }

    if (availableAgents.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'No active sub-agents available for task distribution'
      });
    }

    console.log(`📊 Distributing ${results.length} tasks among ${availableAgents.length} sub-agents`);

    // Process each task with round-robin distribution
    for (const [index, row] of results.entries()) {
      try {
        const title = row.Title || row.title || row.Task || row.task || '';
        const description = row.Description || row.description || row.Notes || row.notes || '';
        const priority = row.Priority || row.priority || 'medium';
        const dueDate = row.DueDate || row.dueDate || row['Due Date'] || null;

        // Validate required fields
        if (!title.trim()) {
          errors.push(`Row ${index + 1}: Title is required`);
          continue;
        }

        // Assign to next available agent (round-robin distribution)
        const agentIndex = index % availableAgents.length;
        const assignedAgent = availableAgents[agentIndex];

        // Check for duplicates (same title for same agent)
        const existingTask = await Task.findOne({
          title: title.trim(),
          assignedTo: assignedAgent._id,
          isDuplicate: false
        });

        if (existingTask) {
          duplicatesCount++;
          errors.push(`Row ${index + 1}: Duplicate task "${title}" for ${assignedAgent.name}`);
          continue;
        }

        // Create task
        const task = new Task({
          title: title.trim(),
          description: description,
          assignedTo: assignedAgent._id,
          createdBy: createdBy,
          priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
          dueDate: dueDate ? new Date(dueDate) : null
        });

        await task.save();
        await task.populate('assignedTo', 'name email userType');
        successfulTasks.push(task);
        
        console.log(`✅ Task "${title}" assigned to ${assignedAgent.name}`);
        
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    // Clean up uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Update duplicate detection after upload
    if (successfulTasks.length > 0) {
      await detectDuplicatesSystemWide();
    }

    res.status(200).json({
      success: true,
      message: `Bulk upload completed! Distributed ${successfulTasks.length} tasks among ${availableAgents.length} sub-agent(s)`,
      data: {
        totalProcessed: results.length,
        successful: successfulTasks.length,
        duplicates: duplicatesCount,
        errors: errors.length,
        distribution: availableAgents.map(agent => ({
          agent: agent.name,
          tasksAssigned: successfulTasks.filter(task => task.assignedTo._id.toString() === agent._id.toString()).length
        })),
        successfulTasks: successfulTasks.slice(0, 10) // Return first 10 tasks for preview
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Return first 10 errors
    });

  } catch (err) {
    console.error('Upload error:', err);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'File processing error: ' + err.message
    });
  }
};

// Helper function to detect duplicates across system
const detectDuplicatesSystemWide = async () => {
  try {
    // Reset all duplicate flags
    await Task.updateMany({}, { $set: { isDuplicate: false, duplicateOf: null } });

    // Find duplicates: same title for same assigned agent
    const duplicates = await Task.aggregate([
      {
        $group: {
          _id: {
            title: { $toLower: '$title' },
            assignedTo: '$assignedTo'
          },
          count: { $sum: 1 },
          tasks: { $push: '$$ROOT' },
          minDate: { $min: '$createdAt' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    // Mark duplicates in database
    for (const group of duplicates) {
      const originalTask = group.tasks.reduce((oldest, current) => 
        new Date(oldest.createdAt) < new Date(current.createdAt) ? oldest : current
      );

      for (const task of group.tasks) {
        if (task._id.toString() !== originalTask._id.toString()) {
          await Task.findByIdAndUpdate(task._id, {
            isDuplicate: true,
            duplicateOf: originalTask._id
          });
        }
      }
    }

    console.log(`🔍 Duplicate detection: Found ${duplicates.length} duplicate groups`);
  } catch (error) {
    console.error('Duplicate detection error:', error);
  }
};

// Get Tasks with filtering
exports.getTasks = async (req, res) => {
  try {
    const { assignedTo, status, priority, page = 1, limit = 10 } = req.query;
    const createdBy = req.user.id;
    const creator = await Agent.findById(createdBy);

    // Build query based on user type
    let query = { createdBy };
    
    if (creator.userType === 'sub-agent') {
      // Sub-agents can only see tasks assigned to them
      query.assignedTo = createdBy;
    } else if (assignedTo) {
      // Agents can filter by their sub-agents
      const subAgent = await Agent.findOne({
        _id: assignedTo,
        parentAgent: createdBy
      });
      
      if (subAgent) {
        query.assignedTo = assignedTo;
      }
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email userType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        results: total
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update Task Status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const user = await Agent.findById(userId);

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, in-progress, completed, or cancelled'
      });
    }

    // Find task and verify authorization
    let task;
    if (user.userType === 'sub-agent') {
      // Sub-agents can only update tasks assigned to them
      task = await Task.findOne({
        _id: id,
        assignedTo: userId
      });
    } else {
      // Agents can update tasks they created
      task = await Task.findOne({
        _id: id,
        createdBy: userId
      });
    }

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not authorized'
      });
    }

    // Update status
    task.status = status;
    task.updatedAt = new Date();
    
    await task.save();
    await task.populate('assignedTo', 'name email userType');

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Only task creators can delete tasks
    const task = await Task.findOneAndDelete({
      _id: id,
      createdBy: userId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not authorized'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get Task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const user = await Agent.findById(userId);

    let task;
    if (user.userType === 'sub-agent') {
      // Sub-agents can only see tasks assigned to them
      task = await Task.findOne({
        _id: id,
        assignedTo: userId
      });
    } else {
      // Agents can see tasks they created
      task = await Task.findOne({
        _id: id,
        createdBy: userId
      });
    }

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not authorized'
      });
    }

    await task.populate('assignedTo', 'name email userType');

    res.json({
      success: true,
      data: task
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update Task (General)
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate } = req.body;
    const userId = req.user.id;

    // Find task and verify ownership (only creators can update)
    const task = await Task.findOne({
      _id: id,
      createdBy: userId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not authorized'
      });
    }

    // Update fields if provided
    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    
    task.updatedAt = new Date();
    await task.save();
    
    await task.populate('assignedTo', 'name email userType');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};