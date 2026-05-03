import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get all tasks (with filters)
 * @route   GET /api/tasks
 * @access  Private
 */
export const getTasks = asyncHandler(async (req, res) => {
  const { projectId, status, assignedTo } = req.query;
  let query = {};

  // Filter by project
  if (projectId) {
    query.projectId = projectId;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by assigned user
  if (assignedTo) {
    query.assignedTo = assignedTo;
  }

  // Members can only see tasks assigned to them or tasks in their projects
  if (req.user.role !== 'admin') {
    const memberProjects = await Project.find({ members: req.user._id }).select(
      '_id'
    );
    const projectIds = memberProjects.map((p) => p._id);

    query.$or = [
      { assignedTo: req.user._id },
      { projectId: { $in: projectIds } },
    ];
  }

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email')
    .populate('projectId', 'name')
    .populate('createdBy', 'name email')
    .sort({ dueDate: 1, createdAt: -1 });

  res.json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('projectId', 'name')
    .populate('createdBy', 'name email');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Check access for members
  if (req.user.role !== 'admin') {
    const project = await Project.findById(task.projectId);
    const isMember = project?.members.includes(req.user._id);
    const isAssigned = task.assignedTo?._id.toString() === req.user._id.toString();

    if (!isMember && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }
  }

  res.json({
    success: true,
    data: task,
  });
});

/**
 * @desc    Create task
 * @route   POST /api/tasks
 * @access  Private/Admin
 */
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, dueDate, assignedTo, projectId } = req.body;

  // Verify project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  const task = await Task.create({
    title,
    description,
    status: status || 'todo',
    dueDate,
    assignedTo,
    projectId,
    createdBy: req.user._id,
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('projectId', 'name')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Task created',
    data: populatedTask,
  });
});

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private/Admin
 */
export const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, dueDate, assignedTo, projectId } = req.body;

  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  task = await Task.findByIdAndUpdate(
    req.params.id,
    { title, description, status, dueDate, assignedTo, projectId },
    { new: true, runValidators: true }
  )
    .populate('assignedTo', 'name email')
    .populate('projectId', 'name')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Task updated',
    data: task,
  });
});

/**
 * @desc    Update task status (for members)
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Members can only update status of tasks assigned to them
  if (req.user.role !== 'admin') {
    if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }
  }

  task = await Task.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  )
    .populate('assignedTo', 'name email')
    .populate('projectId', 'name')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Task status updated',
    data: task,
  });
});

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private/Admin
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  await Task.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Task deleted',
  });
});

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/tasks/stats/dashboard
 * @access  Private
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let matchQuery = {};

  // Members only see stats for their tasks
  if (req.user.role !== 'admin') {
    const memberProjects = await Project.find({ members: req.user._id }).select('_id');
    const projectIds = memberProjects.map((p) => p._id);
    
    matchQuery.$or = [
      { assignedTo: req.user._id },
      { projectId: { $in: projectIds } },
    ];
  }

  // Get all relevant tasks
  const tasks = await Task.find(matchQuery);

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < today
  ).length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;

  // Get user's assigned tasks
  const myTasks = await Task.find({ assignedTo: req.user._id })
    .populate('projectId', 'name')
    .sort({ dueDate: 1 })
    .limit(10);

  // Get recent tasks
  const recentTasks = await Task.find(matchQuery)
    .populate('assignedTo', 'name email')
    .populate('projectId', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  // Project count
  let projectCount;
  if (req.user.role === 'admin') {
    projectCount = await Project.countDocuments();
  } else {
    projectCount = await Project.countDocuments({ members: req.user._id });
  }

  res.json({
    success: true,
    data: {
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        inProgressTasks,
        todoTasks,
        projectCount,
      },
      myTasks,
      recentTasks,
    },
  });
});
