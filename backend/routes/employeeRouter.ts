import { Router } from 'express';
import { verifyAdmin, verifyUser } from '../middleware/verifyUser';
import { empCountIncrease, getAllEmployees, getEmployeePerformance, getEmployeeStatistics } from '../controllers/employeeController';

const router = Router();

router.get('/', verifyAdmin, getAllEmployees);
router.get('/empCount', verifyAdmin, empCountIncrease);
router.get('/getEmployeeStatistics', verifyUser, getEmployeeStatistics);
router.get('/course-progress/:emp_id', verifyUser, getEmployeePerformance);

export default router;