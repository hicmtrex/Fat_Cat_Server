import express from 'express';
import {
  refreshToken,
  userLogin,
  userLogout,
  userRegister,
} from '../controllers/auth';
import loginLimiter from '../middleware/limite-loger';
import validation from '../middleware/validation';
import { loginSchema, registerSchema } from '../utils/validation/user';

const router = express.Router();

router.route('/register').post(registerSchema, validation, userRegister);
router.route('/login').post(loginSchema, validation, loginLimiter, userLogin);
router.route('/refresh-token').get(refreshToken);
router.route('/logout').post(userLogout);

export default router;
