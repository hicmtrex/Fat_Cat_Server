import express from 'express';
import { allUsers } from '../controllers/user';
import { auth } from '../middleware/protecte-routes';

const router = express.Router();

router.route('/').get(auth, allUsers);

export default router;
