import { Router } from 'express';
import { verifyAdmin } from '../middleware/verifyUser';
import { getCoursesQuestionDetails, updateTest } from '../controllers/testController';

const router = Router();

router.get('/getCoursesQuestionDetails', verifyAdmin, getCoursesQuestionDetails);
router.post('/updateTest', verifyAdmin, updateTest);

export default router;