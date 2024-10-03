import { Router } from 'express';
import { verifyUser } from '../middleware/verifyUser';
import { getAllEmployees } from '../controllers/employeeController';

const router = Router();

router.get('/', verifyUser, getAllEmployees);

export default router;