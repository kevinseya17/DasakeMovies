import { Router } from "express";
import { login, logout, profile, forgotPassword, resetPassword } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// rutas de autenticación
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, profile);
router.post("/recover", forgotPassword);
router.post("/reset", resetPassword);

export default router;
