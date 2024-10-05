import { Router } from "express";
import { addCourse, allCourses, courseEmployeeRelation, courseEmployeeRelationUpdate, getPDF, assignedCoursesDetails, updateAssignedCourse } from "../controllers/courseController";
import { verifyAdmin, verifyUser } from "../middleware/verifyUser";
// Multer configuration
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.post('/addCourse', verifyAdmin, upload.fields([{ name: 'course_img', maxCount: 1 }, { name: 'course_file', maxCount: 1 }]), addCourse);
router.get('/allCourses', verifyAdmin, allCourses);
router.get('/courseEmp/:courseId', verifyAdmin, courseEmployeeRelation);
router.post('/courseEmp/:courseId', verifyAdmin, courseEmployeeRelationUpdate);

router.post('/getPdf', verifyUser, getPDF);

router.get('/assignedCoursesDetails', verifyUser, assignedCoursesDetails);
router.post('/updateAssignedCourse', verifyUser, updateAssignedCourse);

export default router;