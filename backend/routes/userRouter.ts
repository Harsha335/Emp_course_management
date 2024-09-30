import { Router } from 'express';
import { getAllUsers } from '../controllers/userController';
import { verifyUser } from '../middleware/verifyUser';

const router = Router();

router.get('/', verifyUser, getAllUsers);

export default router;