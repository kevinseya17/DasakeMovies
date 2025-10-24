import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./api/config/initDatabase";

dotenv.config();

const app = express();

// configuracion cors
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://dasake-front-yc4x.vercel.app", // frontend en vercel
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// aplica cors y json
app.use(cors(corsOptions));
app.use(express.json());

// middleware adicional para asegurar los headers cors en todas las respuestas
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://dasake-front-yc4x.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// importar rutas
import userRoutes from "./api/routes/userRoutes";
import authRoutes from "./api/routes/authRoutes";

// usar rutas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// inicializar base de datos
initDatabase();

// ruta base de prueba
app.get("/", (req, res) => {
  res.send("🔥 backend funcionando correctamente");
});

// iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 servidor corriendo en puerto ${PORT}`));
