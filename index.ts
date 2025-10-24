import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./api/config/initDatabase";
import userRoutes from "./api/routes/userRoutes";
import authRoutes from "./api/routes/authRoutes";

dotenv.config();

const app = express();

// dominios permitidos
const allowedOrigins = [
  "http://localhost:5173",
  "https://dasake-front.vercel.app",
  "https://dasake-front-yc4x.vercel.app",
  "https://dasake-front-35rqu23me-santiagobedons-projects.vercel.app"
];

// cors
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS no permitido"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

//  maneja manualmente las solicitudes OPTIONS
app.options(/.*/, cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS no permitido"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// parsea JSON
app.use(express.json());

// rutas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// ruta base
app.get("/", (req, res) => res.send("🔥 backend funcionando correctamente"));

// inicializar db
initDatabase();

// puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 servidor corriendo en puerto ${PORT}`));
