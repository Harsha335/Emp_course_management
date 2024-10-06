import { Router } from "express";
import { getAdminNotifications, updateNotification } from "../controllers/notificationController";
import { verifyAdmin } from "../middleware/verifyUser";


const router = Router();

router.get('/admin', verifyAdmin, getAdminNotifications);
router.post('/update-status/:enroll_id', verifyAdmin, updateNotification);

export default router;