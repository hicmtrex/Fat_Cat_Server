"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const message_1 = require("../controllers/message");
const protecte_routes_1 = require("../middleware/protecte-routes");
const router = express_1.default.Router();
router.route('/').post(protecte_routes_1.auth, message_1.sendMessage);
router.route('/:id').get(protecte_routes_1.auth, message_1.allMessges);
exports.default = router;
