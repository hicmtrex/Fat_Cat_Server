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
exports.sendMessage = exports.allMessges = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const chat_1 = __importDefault(require("../models/chat"));
const message_1 = __importDefault(require("../models/message"));
exports.allMessges = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield message_1.default.find({ chat: req.params.id })
        .populate('sender', 'name image email')
        .populate('chat');
    if (messages) {
        res.status(200).json(messages);
    }
    else {
        res.status(404);
        throw new Error('messages not found!');
    }
}));
exports.sendMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const message = yield message_1.default.create(newMessage);
    if (message) {
        yield message.populate('sender', 'name image');
        yield message.populate('chat');
        yield message.populate('chat.users');
        yield chat_1.default.findByIdAndUpdate(chatId, { latestMessage: message });
        res.status(201).json(message);
    }
    else {
        res.status(500);
        throw new Error('something went wrong');
    }
}));
