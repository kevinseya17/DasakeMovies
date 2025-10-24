import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./api/config/initDatabase";

dotenv.config();

const app = express();

// 🔧 configuracion cors ultra estricta
const allowedOrigins = [
  "http://localhost:5173",
  "https://dasake-front-yc4x.vercel.app", // frontend en vercel
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // maneja el preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// importar rutas
import userRoutes from "./api/routes/userRoutes";
import authRoutes from "./api/routes/authRoutes";

// usar rutas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// inicializar base de datos
initDatabase();

// ruta de prueba
app.get("/", (req, res) => {
  res.send("🔥 backend funcionando correctamente");
});

// iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 servidor corriendo en puerto ${PORT}`));
