import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = asyncHandler(async (req, res) => {
  let query;

  // Admin sees all projects, members see only their assigned projects
  if (req.user.role === 'admin') {
    query = Project.find();
  } else {
    query = Project.find({ members: req.user._id });
  }

  const projects = await query
    .populate('members', 'name email role')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email')
    .populate({
      path: 'tasks',
      populate: { path: 'assignedTo', select: 'name email' },
    });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check if member has access
  if (
    req.user.role !== 'admin' &&
    !project.members.some((m) => m._id.toString() === req.user._id.toString())
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this project',
    });
  }

  res.json({
    success: true,
    data: project,
  });
});

/**
 * @desc    Create project
 * @route   POST /api/projects
 * @access  Private/Admin
 */
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, deadline, members } = req.body;

  const project = await Project.create({
    name,
    description,
    deadline,
    members: members || [],
    createdBy: req.user._id,
  });

  const populatedProject = await Project.findById(project._id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Project created',
    data: populatedProject,
  });
});

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private/Admin
 */
export const updateProject = asyncHandler(async (req, res) => {
  const { name, description, deadline, members } = req.body;

  let project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  project = await Project.findByIdAndUpdate(
    req.params.id,
    { name, description, deadline, members },
    { new: true, runValidators: true }
  )
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Project updated',
    data: project,
  });
});

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private/Admin
 */
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Delete all tasks in this project
  await Task.deleteMany({ projectId: req.params.id });
  await Project.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Project and associated tasks deleted',
  });
});

/**
 * @desc    Add member to project
 * @route   POST /api/projects/:id/members
 * @access  Private/Admin
 */
export const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check if member already exists
  if (project.members.includes(userId)) {
    return res.status(400).json({
      success: false,
      message: 'User is already a member',
    });
  }

  project.members.push(userId);
  await project.save();

  const updatedProject = await Project.findById(project._id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Member added',
    data: updatedProject,
  });
});

/**
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private/Admin
 */
export const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  project.members = project.members.filter(
    (m) => m.toString() !== req.params.userId
  );
  await project.save();

  const updatedProject = await Project.findById(project._id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Member removed',
    data: updatedProject,
  });
});
