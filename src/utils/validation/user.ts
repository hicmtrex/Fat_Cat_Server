import { body } from 'express-validator';

export const registerSchema = [
  body('name').isLength({ min: 4, max: 20 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6, max: 50 }),
];

export const loginSchema = [
  body('email').isEmail(),
  body('password').isLength({ min: 6, max: 50 }),
];
