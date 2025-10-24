import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./api/config/initDatabase";

dotenv.config();

const app = express();

// configuración CORS
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://dasake-front-yc4x.vercel.app", // tu frontend en vercel
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions)); // aplica cors globalmente
app.use(express.json());

// importar rutas
import userRoutes from "./api/routes/userRoutes";
import authRoutes from "./api/routes/authRoutes";

// usar rutas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// inicializar la DB
initDatabase();

// ruta básica de prueba
app.get("/", (req, res) => {
  res.send("🔥 backend funcionando correctamente");
});

// iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 servidor corriendo en puerto ${PORT}`));
