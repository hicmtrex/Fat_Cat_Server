import express from 'express';
import {
  accessChat,
  addToGroup,
  createGroupChat,
  removeFromGroup,
  renameGroup,
  userChats,
} from '../controllers/chat';
import { auth } from '../middleware/protecte-routes';

const router = express.Router();

router.route('/').post(auth, accessChat).get(auth, userChats);
router.route('/group').post(auth, createGroupChat);
router.route('/remove').put(auth, removeFromGroup);
router.route('/:id').put(auth, renameGroup).patch(auth, addToGroup);

export default router;
