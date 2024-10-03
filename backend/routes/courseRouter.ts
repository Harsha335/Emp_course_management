import { Router } from "express";
import { addCourse, allCourses, courseEmployeeRelation, courseEmployeeRelationUpdate } from "../controllers/courseController";
import { verifyUser } from "../middleware/verifyUser";
// Multer configuration
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.post('/addCourse', verifyUser, upload.fields([{ name: 'course_img', maxCount: 1 }, { name: 'course_file', maxCount: 1 }]), addCourse);
router.get('/allCourses', verifyUser, allCourses);
router.get('/courseEmp/:courseId', verifyUser, courseEmployeeRelation);
router.post('/courseEmp/:courseId', verifyUser, courseEmployeeRelationUpdate);
export default router;