import { Router } from 'express';
import { verifyAdmin, verifyUser } from '../middleware/verifyUser';
import { empCountIncrease, getAllEmployees, getEmployeeStatistics } from '../controllers/employeeController';

const router = Router();

router.get('/', verifyAdmin, getAllEmployees);
router.get('/empCount', verifyAdmin, empCountIncrease);
router.get('/getEmployeeStatistics', verifyUser, getEmployeeStatistics);

export default router;