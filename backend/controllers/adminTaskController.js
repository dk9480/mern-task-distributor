const Task = require('../models/Task');
const Agent = require('../models/Agent');

// Get All Tasks across the system (Admin only) with CSV upload viewing
exports.getAllTasks = async (req, res) => {
  try {
    const { 
      agentId, 
      subAgentId, 
      status, 
      priority, 
      hasDuplicates,
      search,
      page = 1, 
      limit = 20 
    } = req.query;

    // Build query
    let query = {};
    
    if (agentId) {
      // Get tasks created by this agent or assigned to their sub-agents
      const subAgents = await Agent.find({ parentAgent: agentId }).select('_id');
      const subAgentIds = subAgents.map(sa => sa._id);
      
      query.$or = [
        { createdBy: agentId },
        { assignedTo: { $in: subAgentIds } }
      ];
    }
    
    if (subAgentId) {
      query.assignedTo = subAgentId;
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (hasDuplicates === 'true') query.isDuplicate = true;

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email userType')
      .populate('assignedTo', 'name email userType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    // Get statistics including upload distribution
    const stats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          duplicates: { $sum: { $cond: ['$isDuplicate', 1, 0] } }
        }
      }
    ]);

    // Get upload distribution stats
    const uploadStats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$createdBy',
          taskCount: { $sum: 1 },
          agent: { $first: '$createdBy' }
        }
      },
      {
        $lookup: {
          from: 'agents',
          localField: 'agent',
          foreignField: '_id',
          as: 'agentInfo'
        }
      },
      {
        $unwind: '$agentInfo'
      },
      {
        $project: {
          agentName: '$agentInfo.name',
          agentEmail: '$agentInfo.email',
          userType: '$agentInfo.userType',
          taskCount: 1
        }
      },
      { $sort: { taskCount: -1 } }
    ]);

    res.json({
      success: true,
      data: tasks,
      statistics: stats[0] || {
        totalTasks: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        duplicates: 0
      },
      uploadDistribution: uploadStats,
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

// Get tasks from specific CSV upload (group by creation batch)
exports.getTasksByUploadBatch = async (req, res) => {
  try {
    const { date, agentId } = req.query;
    
    let dateFilter = {};
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      dateFilter = {
        createdAt: {
          $gte: startDate,
          $lt: endDate
        }
      };
    }

    let query = { ...dateFilter };
    if (agentId) {
      query.createdBy = agentId;
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email userType')
      .populate('assignedTo', 'name email userType')
      .sort({ createdAt: -1 });

    // Group tasks by upload batch (same creator within 5-minute windows)
    const uploadBatches = [];
    let currentBatch = [];
    let lastCreator = null;
    let lastTime = null;

    tasks.forEach(task => {
      const taskTime = new Date(task.createdAt).getTime();
      
      if (lastCreator === task.createdBy._id.toString() && 
          lastTime && (taskTime - lastTime) < 300000) { // 5 minutes
        currentBatch.push(task);
      } else {
        if (currentBatch.length > 0) {
          uploadBatches.push({
            batchId: `batch_${uploadBatches.length + 1}`,
            uploadTime: new Date(currentBatch[0].createdAt),
            creator: currentBatch[0].createdBy,
            taskCount: currentBatch.length,
            tasks: currentBatch
          });
        }
        currentBatch = [task];
        lastCreator = task.createdBy._id.toString();
      }
      lastTime = taskTime;
    });

    // Add the last batch
    if (currentBatch.length > 0) {
      uploadBatches.push({
        batchId: `batch_${uploadBatches.length + 1}`,
        uploadTime: new Date(currentBatch[0].createdAt),
        creator: currentBatch[0].createdBy,
        taskCount: currentBatch.length,
        tasks: currentBatch
      });
    }

    res.json({
      success: true,
      data: uploadBatches,
      totalBatches: uploadBatches.length,
      totalTasks: tasks.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Detect Duplicates across the entire system
exports.detectDuplicates = async (req, res) => {
  try {
    // First, reset all duplicate flags
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
      },
      {
        $unwind: '$tasks'
      },
      {
        $project: {
          taskId: '$tasks._id',
          title: '$tasks.title',
          assignedTo: '$tasks.assignedTo',
          createdAt: '$tasks.createdAt',
          isOriginal: { $eq: ['$tasks.createdAt', '$minDate'] },
          duplicateGroup: '$_id'
        }
      },
      {
        $sort: {
          'duplicateGroup.title': 1,
          'createdAt': 1
        }
      }
    ]);

    // Mark duplicates in database
    const duplicateGroups = {};
    const operations = [];

    duplicates.forEach(dup => {
      const groupKey = `${dup.duplicateGroup.title}-${dup.duplicateGroup.assignedTo}`;
      
      if (!duplicateGroups[groupKey]) {
        duplicateGroups[groupKey] = {
          original: null,
          duplicates: []
        };
      }

      if (dup.isOriginal) {
        duplicateGroups[groupKey].original = dup.taskId;
      } else {
        duplicateGroups[groupKey].duplicates.push(dup.taskId);
      }
    });

    // Update database
    for (const groupKey in duplicateGroups) {
      const group = duplicateGroups[groupKey];
      
      if (group.original && group.duplicates.length > 0) {
        group.duplicates.forEach(dupId => {
          operations.push(
            Task.updateOne(
              { _id: dupId },
              { 
                $set: { 
                  isDuplicate: true, 
                  duplicateOf: group.original 
                } 
              }
            )
          );
        });
      }
    }

    await Promise.all(operations);

    res.json({
      success: true,
      message: `Duplicate detection completed. Found ${Object.keys(duplicateGroups).length} duplicate groups.`,
      data: {
        duplicateGroups: Object.keys(duplicateGroups).length,
        totalDuplicates: duplicates.length - Object.keys(duplicateGroups).length
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error during duplicate detection'
    });
  }
};

// Remove Duplicates (Keep only original, delete duplicates)
exports.removeDuplicates = async (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm duplicate removal by setting confirm: true'
      });
    }

    // Find all duplicate tasks
    const duplicateTasks = await Task.find({ 
      isDuplicate: true 
    });

    const deleteResult = await Task.deleteMany({ 
      isDuplicate: true 
    });

    // Reset remaining tasks' duplicate status
    await Task.updateMany(
      { isDuplicate: true }, 
      { $set: { isDuplicate: false, duplicateOf: null } }
    );

    res.json({
      success: true,
      message: `Removed ${deleteResult.deletedCount} duplicate tasks.`,
      data: {
        removed: deleteResult.deletedCount,
        remaining: await Task.countDocuments()
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error during duplicate removal'
    });
  }
};

// Get Duplicate Report
exports.getDuplicateReport = async (req, res) => {
  try {
    const duplicates = await Task.aggregate([
      {
        $match: { isDuplicate: true }
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'duplicateOf',
          foreignField: '_id',
          as: 'originalTask'
        }
      },
      {
        $unwind: { path: '$originalTask', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'agents',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedAgent'
        }
      },
      {
        $unwind: '$assignedAgent'
      },
      {
        $project: {
          title: 1,
          assignedTo: '$assignedAgent.name',
          createdAt: 1,
          originalTitle: '$originalTask.title',
          originalCreatedAt: '$originalTask.createdAt'
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json({
      success: true,
      data: duplicates,
      count: duplicates.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};