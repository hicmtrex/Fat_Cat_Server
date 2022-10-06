"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_1 = require("../controllers/chat");
const protecte_routes_1 = require("../middleware/protecte-routes");
const router = express_1.default.Router();
router.route('/').post(protecte_routes_1.auth, chat_1.accessChat).get(protecte_routes_1.auth, chat_1.userChats);
router.route('/group').post(protecte_routes_1.auth, chat_1.createGroupChat);
router.route('/remove').put(protecte_routes_1.auth, chat_1.removeFromGroup);
router.route('/:id').put(protecte_routes_1.auth, chat_1.renameGroup).patch(protecte_routes_1.auth, chat_1.addToGroup);
exports.default = router;
