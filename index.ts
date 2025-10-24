import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./api/config/initDatabase";

dotenv.config();

const app = express();
app.use(express.json());

// orígenes permitidos
const allowedOrigins = [
  "http://localhost:5173",
  "https://dasake-front-ep5g.vercel.app"
];

// configuración cors global
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// respuesta automática a preflight requests (opciones)
app.options("*", cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// rutas
import userRoutes from "./api/routes/userRoutes";
import authRoutes from "./api/routes/authRoutes";

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// inicializar la base de datos
initDatabase();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ servidor corriendo en puerto ${PORT}`));
