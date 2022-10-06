"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = ({ id, key, time }) => {
    return jsonwebtoken_1.default.sign({ id }, key, {
        expiresIn: time,
    });
};
exports.default = generateToken;
