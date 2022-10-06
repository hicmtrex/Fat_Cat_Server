import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Chat from '../models/chat';

export const accessChat = asyncHandler(async (req: any, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error('UserId param not send with request');
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage')
    .populate('latestMessage.sender');

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(chatData);

    const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      'users',
      '-password'
    );
    res.status(200).json(FullChat);
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
export const userChats = asyncHandler(async (req: any, res: Response) => {
  const chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate('users', '-password')
    .populate('latestMessage')
    .populate('groupAdmin', '-password')
    .populate('latestMessage.sender')
    .sort({ updatedAt: -1 });

  if (chats) {
    res.status(200).json(chats);
  } else {
    res.status(404);
    throw new Error('no chats');
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
export const createGroupChat = asyncHandler(async (req: any, res: Response) => {
  if (!req.body.users || !req.body.name) {
    res.status(400);
    throw new Error('Please Fill all the feilds');
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    res.status(400);
    throw new Error('More than 2 users are required to form a group chat');
  }

  users.push(req.user);

  const groupChat = await Chat.create({
    chatName: req.body.name,
    users: users,
    isGroupChat: true,
    groupAdmin: req.user,
  });
  if (groupChat) {
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).json(fullGroupChat);
  } else {
    res.status(404);
    throw new Error('failed to creat group chat');
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected

export const renameGroup = asyncHandler(async (req: Request, res: Response) => {
  const { chatName } = req.body;

  const chat = await Chat.findById(req.params.id)
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (chat) {
    chat.chatName = chatName;
    const updatedName = await chat.save();
    res.status(200).json(updatedName);
  } else {
    res.status(404);
    throw new Error('chat not found!');
  }
});

// @desc    Remove user from Group
// @route   DELETE /api/chat/:id
// @access  Protected
export const removeFromGroup = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, chatId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (removed) {
      res.status(200).json(removed);
    } else {
      res.status(404);
      throw new Error('Chat not found!');
    }
  }
);

// @desc    Add user to Group / Leave
// @route   Patch /api/chat/:id
// @access  Protected
export const addToGroup = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    req.params.id,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (added) {
    res.status(200).json(added);
  } else {
    res.status(404);
    throw new Error('Chat not found!');
  }
});
