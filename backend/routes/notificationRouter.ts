import { Router } from "express";
import { getAdminNotifications, getUserNotifications, markAsRead, updateNotification } from "../controllers/notificationController";
import { verifyAdmin, verifyUser } from "../middleware/verifyUser";


const router = Router();

router.get('/admin', verifyAdmin, getAdminNotifications);
router.get('/user', verifyUser, getUserNotifications);
router.post('/user/markAsRead', verifyUser, markAsRead);
router.post('/update-status/:enroll_id', verifyAdmin, updateNotification);

export default router;