import express from 'express';
import {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roleAuth.js';
import { mongoIdValidation } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

router.get('/', getUsers);
router.get('/:id', mongoIdValidation, getUser);
router.put('/:id/role', mongoIdValidation, updateUserRole);
router.delete('/:id', mongoIdValidation, deleteUser);

export default router;
