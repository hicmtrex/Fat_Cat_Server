"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userMessage = new mongoose_1.Schema({
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, trim: true },
    chat: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Chat' },
}, {
    timestamps: true,
});
const Message = (0, mongoose_1.model)('Message', userMessage);
exports.default = Message;
