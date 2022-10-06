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
exports.admin = exports.auth = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const config_1 = __importDefault(require("../utils/config/config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
// only user logged user have access
exports.auth = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith('Bearer')) {
        const token = authorization.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.ACCESS_TOKEN_SECRET);
        const user = yield user_1.default.findById(decoded.id);
        if (user) {
            req.user = user;
            next();
        }
        else {
            res.status(401);
            throw new Error('no user has found!');
        }
    }
    else {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
}));
// only user within admin role have access
exports.admin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user && req.role === 'Admin') {
        next();
    }
    else {
        res.status(401);
        throw new Error('Not authorized, no admin');
    }
}));
