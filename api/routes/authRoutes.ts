import { Router } from "express";
import { login, logout, profile, forgotPassword, resetPassword, changePassword } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

/**
 * Defines the authentication routes for the application.
 * Includes endpoints for login, logout, password recovery, and user profile.
 */

// handles user login and token generation
router.post("/login", login);

// handles user logout, requires authentication
router.post("/logout", authMiddleware, logout);

// retrieves the authenticated user's profile data
router.get("/profile", authMiddleware, profile);

// initiates password recovery process by sending a reset link to the user's email
router.post("/recover", forgotPassword);

// resets the user's password using a valid reset token
router.post("/reset", resetPassword);

// allows the authenticated user to change their password
router.put("/change-password", authMiddleware, changePassword);

export default router;
