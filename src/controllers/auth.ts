import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import User from '../models/user';
import sanitizedConfig from '../utils/config/config';
import generateToken from '../utils/generateToken';

// @desc    Fetch 12 products
// @route   GET /api/products
// @access  Public
export const userRegister = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    const exist = await User.findOne({ email });

    if (exist) {
      res.status(422);
      throw new Error('email already been used!');
    }

    const user = await User.create({ username, email, password });

    if (user) {
      const userInfo = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const token = generateToken({
        id: user._id,
        key: sanitizedConfig.ACCESS_TOKEN_SECRET,
        time: '2h',
      });

      const refreshToken = generateToken({
        id: user._id,
        key: sanitizedConfig.REFRESH_TOKEN_SECRET,
        time: '7d',
      });

      res.cookie('token', refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: true, //https,
        sameSite: 'none', //cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
      });

      res.status(201).json({ user: userInfo, token });
    } else {
      res.status(400);
      throw new Error('something went wrong');
    }
  }
);
