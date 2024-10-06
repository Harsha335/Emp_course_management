import { Router } from 'express';
import { verifyAdmin, verifyUser } from '../middleware/verifyUser';
import { getCoursesQuestionDetails, getTestData, updateTest, verifyAnswers } from '../controllers/testController';

const router = Router();

router.get('/getCoursesQuestionDetails', verifyAdmin, getCoursesQuestionDetails);
router.post('/updateTest', verifyAdmin, updateTest);

router.get('/attempt/:course_id', verifyUser, getTestData);
router.post('/attempt/verify-answers', verifyUser, verifyAnswers);

export default router;