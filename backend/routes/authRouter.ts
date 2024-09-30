import { Router } from "express";
import { signInUser,signUpAdmin, signUpEmployee } from "../controllers/authController";

const router = Router();

router.post('/signin', signInUser);
router.post('/signupAdmin', signUpAdmin);
router.post('/signupEmp', signUpEmployee);

export default router;