import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getDashboardStats,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roleAuth.js';
import {
  taskValidation,
  taskStatusValidation,
  mongoIdValidation,
} from '../utils/validators.js';

const router = express.Router();

router.use(protect);

// Dashboard stats
router.get('/stats/dashboard', getDashboardStats);

// Task CRUD
router.get('/', getTasks);
router.get('/:id', mongoIdValidation, getTask);
router.post('/', isAdmin, taskValidation, createTask);
router.put('/:id', isAdmin, mongoIdValidation, updateTask);
router.patch('/:id/status', mongoIdValidation, taskStatusValidation, updateTaskStatus);
router.delete('/:id', isAdmin, mongoIdValidation, deleteTask);

export default router;
