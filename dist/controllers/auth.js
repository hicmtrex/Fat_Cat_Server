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
exports.refreshToken = exports.userLogout = exports.userLogin = exports.userRegister = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_1 = __importDefault(require("../models/user"));
const config_1 = __importDefault(require("../utils/config/config"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.userRegister = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, image, password } = req.body;
    const exist = yield user_1.default.findOne({ email });
    if (exist) {
        res.status(422);
        throw new Error('email already been used!');
    }
    const user = yield user_1.default.create({ name, image, email, password });
    if (user) {
        const userInfo = {
            _id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
        };
        const token = (0, generateToken_1.default)({
            id: user._id,
            key: config_1.default.ACCESS_TOKEN_SECRET,
            time: '2h',
        });
        const refreshToken = (0, generateToken_1.default)({
            id: user._id,
            key: config_1.default.REFRESH_TOKEN_SECRET,
            time: '7d',
        });
        res.cookie('token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
        });
        res.status(201).json({ user: userInfo, token });
    }
    else {
        res.status(400);
        throw new Error('something went wrong');
    }
}));
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.userLogin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_1.default.findOne({ email });
    if (user) {
        const match = yield bcryptjs_1.default.compare(password, user.password);
        if (match) {
            const userInfo = {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
            };
            const token = (0, generateToken_1.default)({
                id: user._id,
                key: config_1.default.ACCESS_TOKEN_SECRET,
                time: '2h',
            });
            const refreshToken = (0, generateToken_1.default)({
                id: user._id,
                key: config_1.default.REFRESH_TOKEN_SECRET,
                time: '7d',
            });
            res.cookie('token', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
            });
            res.status(200).json({ user: userInfo, token });
        }
        else {
            res.status(401);
            throw new Error('wrong email or password');
        }
    }
    else {
        res.status(404);
        throw new Error('email not exist');
    }
}));
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private/Cookies
exports.userLogout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = req.cookies;
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.token)) {
        res.status(204);
        throw new Error('no cookies');
    }
    res.clearCookie('token', { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ message: 'Cookie cleared' });
}));
// @desc    refresh user token
// @route   POST /api/auth/refresh-token
// @access  Private/Cookies
exports.refreshToken = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = req.cookies;
    if (!cookies.token) {
        res.status(401);
        throw new Error('Unauthorized no token!');
    }
    const refreshToken = cookies.token;
    const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.default.REFRESH_TOKEN_SECRET);
    const user = yield user_1.default.findById(decoded.id);
    if (!user) {
        res.status(401);
        throw new Error('Unauthorized');
    }
    const accessToken = (0, generateToken_1.default)({
        id: user._id,
        key: config_1.default.ACCESS_TOKEN_SECRET,
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
}));
