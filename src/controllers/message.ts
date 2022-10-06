import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Chat from '../models/chat';
import Message from '../models/message';

export const allMessges = asyncHandler(async (req: Request, res: Response) => {
  const messages = await Message.find({ chat: req.params.id })
    .populate('sender', 'name image email')
    .populate('chat');

  if (messages) {
    res.status(200).json(messages);
  } else {
    res.status(404);
    throw new Error('messages not found!');
  }
});

export const sendMessage = asyncHandler(async (req: any, res: Response) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    res.status(500);
    throw new Error('Invalid data passed into request');
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  const message = await Message.create(newMessage);

  if (message) {
    await message.populate('sender', 'name image');
    await message.populate('chat');
    await message.populate('chat.users');

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.status(201).json(message);
  } else {
    res.status(500);
    throw new Error('something went wrong');
  }
});
