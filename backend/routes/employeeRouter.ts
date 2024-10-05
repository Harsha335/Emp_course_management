import { Router } from 'express';
import { verifyAdmin } from '../middleware/verifyUser';
import { getAllEmployees } from '../controllers/employeeController';

const router = Router();

router.get('/', verifyAdmin, getAllEmployees);

export default router;