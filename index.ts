import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./api/config/initDatabase";
import userRoutes from "./api/routes/userRoutes";
import authRoutes from "./api/routes/authRoutes";

dotenv.config();

const app = express();

// lista de orígenes permitidos
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // https://dasake-front.vercel.app
];

// configuración de cors
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith("https://dasake-front")
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS no permitido"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// manejar solicitudes OPTIONS (preflight)
app.options(
  /.*/,
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith("https://dasake-front")
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS no permitido"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// middleware json
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
