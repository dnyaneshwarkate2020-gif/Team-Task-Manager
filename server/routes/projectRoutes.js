import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roleAuth.js';
import { projectValidation, mongoIdValidation } from '../utils/validators.js';

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.get('/:id', mongoIdValidation, getProject);

// Admin-only routes
router.post('/', isAdmin, projectValidation, createProject);
router.put('/:id', isAdmin, mongoIdValidation, projectValidation, updateProject);
router.delete('/:id', isAdmin, mongoIdValidation, deleteProject);
router.post('/:id/members', isAdmin, mongoIdValidation, addMember);
router.delete('/:id/members/:userId', isAdmin, mongoIdValidation, removeMember);

export default router;
