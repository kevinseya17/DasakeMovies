import { Router } from "express";
import { registerUser, getUsers, getUserById, updateUser, deleteUser, getProfile } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// rutas de usuario
router.post("/", registerUser);
router.get("/", authMiddleware, getUsers);
router.get("/me", authMiddleware, getProfile);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
