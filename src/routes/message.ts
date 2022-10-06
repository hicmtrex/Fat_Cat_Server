import express from 'express';
import { allMessges, sendMessage } from '../controllers/message';
import { auth } from '../middleware/protecte-routes';

const router = express.Router();

router.route('/').post(auth, sendMessage);
router.route('/:id').get(auth, allMessges);

export default router;
