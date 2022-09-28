import asyncHandler from 'express-async-handler';
import sanitizedConfig from '../utils/config/config';
import jwt from 'jsonwebtoken';
import { DataStoredInToken } from '../utils/interfaces/user.interface';
import User from '../models/user';
import { NextFunction, Response } from 'express';

// only user logged user have access
export const auth = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (authorization && authorization.startsWith('Bearer')) {
      const token = authorization.split(' ')[1];

      const decoded = jwt.verify(
        token,
        sanitizedConfig.ACCESS_TOKEN_SECRET
      ) as DataStoredInToken;

      const user = await User.findById(decoded.id);

      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401);
        throw new Error('no user has found!');
      }
    } else {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
);

// only user within admin role have access
export const admin = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    if (req.user && req.role === 'Admin') {
      next();
    } else {
      res.status(401);
      throw new Error('Not authorized, no admin');
    }
  }
);
