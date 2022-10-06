"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const limite_loger_1 = __importDefault(require("../middleware/limite-loger"));
const validation_1 = __importDefault(require("../middleware/validation"));
const user_1 = require("../utils/validation/user");
const router = express_1.default.Router();
router.route('/register').post(user_1.registerSchema, validation_1.default, auth_1.userRegister);
router.route('/login').post(user_1.loginSchema, validation_1.default, limite_loger_1.default, auth_1.userLogin);
router.route('/refresh-token').get(auth_1.refreshToken);
router.route('/logout').post(auth_1.userLogout);
exports.default = router;
