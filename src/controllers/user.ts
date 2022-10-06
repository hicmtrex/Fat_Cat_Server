import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/user';

export const allUsers = asyncHandler(async (req: any, res: Response) => {
  const { search } = req.query;
  const keyword = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user._id } })
    .select('-password');

  if (users) {
    res.status(200).json(users);
  }
});
