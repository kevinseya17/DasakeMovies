import { Router } from "express";
import { registerUser, getUsers, getUserById, updateUser, deleteUser, getProfile } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

/**
 * Defines all user-related routes in the application.
 * Includes endpoints for registration, profile access, and user management.
 */

// registers a new user account
router.post("/", registerUser);

// retrieves a list of all users (requires authentication)
router.get("/", authMiddleware, getUsers);

// retrieves the profile of the currently authenticated user
router.get("/me", authMiddleware, getProfile);

// retrieves a specific user by id (requires authentication)
router.get("/:id", authMiddleware, getUserById);

// updates an existing user by id (requires authentication)
router.put("/:id", authMiddleware, updateUser);

// deletes a user by id (requires authentication)
router.delete("/:id", authMiddleware, deleteUser);

export default router;
