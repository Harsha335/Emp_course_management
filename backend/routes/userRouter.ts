import { Router } from 'express';
import { getAllUsers } from '../controllers/userController';
import { verifyAdmin } from '../middleware/verifyUser';

const router = Router();

router.get('/', verifyAdmin, getAllUsers);

export default router;