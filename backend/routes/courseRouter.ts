import { Router } from "express";
import { addCourse } from "../controllers/courseController";
import { verifyUser } from "../middleware/verifyUser";
// Multer configuration
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.post('/addCourse', verifyUser ,upload.single('course_img'), addCourse);

export default router;