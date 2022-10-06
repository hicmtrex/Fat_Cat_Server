import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import User from '../models/user';
import sanitizedConfig from '../utils/config/config';
import generateToken from '../utils/generateToken';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DataStoredInToken } from '../utils/interfaces/user.interface';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const userRegister = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, image, password } = req.body;

    const exist = await User.findOne({ email });

    if (exist) {
      res.status(422);
      throw new Error('email already been used!');
    }

    const user = await User.create({ name, image, email, password });

    if (user) {
      const userInfo = {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const userLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const userInfo = {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
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

      res.status(200).json({ user: userInfo, token });
    } else {
      res.status(401);
      throw new Error('wrong email or password');
    }
  } else {
    res.status(404);
    throw new Error('email not exist');
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private/Cookies
export const userLogout = asyncHandler(async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.token) {
    res.status(204);
    throw new Error('no cookies');
  }
  res.clearCookie('token', { httpOnly: true, sameSite: 'none', secure: true });
  res.json({ message: 'Cookie cleared' });
});

// @desc    refresh user token
// @route   POST /api/auth/refresh-token
// @access  Private/Cookies
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const cookies = req.cookies;

    if (!cookies.token) {
      res.status(401);
      throw new Error('Unauthorized no token!');
    }

    const refreshToken = cookies.token;

    const decoded = jwt.verify(
      refreshToken,
      sanitizedConfig.REFRESH_TOKEN_SECRET
    ) as DataStoredInToken;

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const accessToken = generateToken({
      id: user._id,
      key: sanitizedConfig.ACCESS_TOKEN_SECRET,
      time: '2h',
    });

    res.status(200).json({
      token: accessToken,
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        email: user.email,
        role: user.role,
      },
    });
  }
);
