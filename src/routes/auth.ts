import express from 'express';
import { userRegister } from '../controllers/auth';
import validation from '../middleware/validation';
import { registerSchema } from '../utils/validation/user';

const router = express.Router();

router.route('/register').post(registerSchema, validation, userRegister);

export default router;
