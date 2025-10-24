import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./api/config/initDatabase";

dotenv.config();

const app = express();

// opciones de cors
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://dasake-front-yc4x.vercel.app",
    "https://dasake-front.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// aplica cors
app.use(cors(corsOptions));

// maneja manualmente las solicitudes OPTIONS (preflight)
app.options(/.*/, cors(corsOptions)); // <-- esta línea es clave

app.use(express.json());

// importar rutas
import userRoutes from "./api/routes/userRoutes";
import authRoutes from "./api/routes/authRoutes";

// usar rutas
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// ruta básica
app.get("/", (req, res) => {
  res.send("🔥 backend funcionando correctamente");
});

// inicializar la DB
initDatabase();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 servidor corriendo en puerto ${PORT}`));
