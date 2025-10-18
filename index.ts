import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./api/config/initDatabase";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// importar rutas correctamente
import userRoutes from "./api/routes/userRoutes";
import authRoutes from "./api/routes/authRoutes";

// usar rutas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// inicializar la DB
initDatabase();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
