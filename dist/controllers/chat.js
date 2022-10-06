"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToGroup = exports.removeFromGroup = exports.renameGroup = exports.createGroupChat = exports.userChats = exports.accessChat = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const chat_1 = __importDefault(require("../models/chat"));
exports.accessChat = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    if (!userId) {
        res.status(400);
        throw new Error('UserId param not send with request');
    }
    let isChat = yield chat_1.default.find({
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
    }
    else {
        const chatData = {
            chatName: 'sender',
            isGroupChat: false,
            users: [req.user._id, userId],
        };
        const createdChat = yield chat_1.default.create(chatData);
        const FullChat = yield chat_1.default.findOne({ _id: createdChat._id }).populate('users', '-password');
        res.status(200).json(FullChat);
    }
}));
//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
exports.userChats = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chats = yield chat_1.default.find({
        users: { $elemMatch: { $eq: req.user._id } },
    })
        .populate('users', '-password')
        .populate('latestMessage')
        .populate('groupAdmin', '-password')
        .populate('latestMessage.sender')
        .sort({ updatedAt: -1 });
    if (chats) {
        res.status(200).json(chats);
    }
    else {
        res.status(404);
        throw new Error('no chats');
    }
}));
//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
exports.createGroupChat = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const groupChat = yield chat_1.default.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
    });
    if (groupChat) {
        const fullGroupChat = yield chat_1.default.findOne({ _id: groupChat._id })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');
        res.status(200).json(fullGroupChat);
    }
    else {
        res.status(404);
        throw new Error('failed to creat group chat');
    }
}));
// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
exports.renameGroup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatName } = req.body;
    const chat = yield chat_1.default.findById(req.params.id)
        .populate('users', '-password')
        .populate('groupAdmin', '-password');
    if (chat) {
        chat.chatName = chatName;
        const updatedName = yield chat.save();
        res.status(200).json(updatedName);
    }
    else {
        res.status(404);
        throw new Error('chat not found!');
    }
}));
// @desc    Remove user from Group
// @route   DELETE /api/chat/:id
// @access  Protected
exports.removeFromGroup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, chatId } = req.body;
    const removed = yield chat_1.default.findByIdAndUpdate(chatId, {
        $pull: { users: userId },
    }, { new: true })
        .populate('users', '-password')
        .populate('groupAdmin', '-password');
    if (removed) {
        res.status(200).json(removed);
    }
    else {
        res.status(404);
        throw new Error('Chat not found!');
    }
}));
// @desc    Add user to Group / Leave
// @route   Patch /api/chat/:id
// @access  Protected
exports.addToGroup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const added = yield chat_1.default.findByIdAndUpdate(req.params.id, {
        $push: { users: userId },
    }, { new: true })
        .populate('users', '-password')
        .populate('groupAdmin', '-password');
    if (added) {
        res.status(200).json(added);
    }
    else {
        res.status(404);
        throw new Error('Chat not found!');
    }
}));
