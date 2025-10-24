import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./api/config/initDatabase";

dotenv.config();

const app = express();

//  configuración CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dasake-front-yc4x.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

//  esto permite que express responda correctamente las solicitudes preflight (OPTIONS)
app.options("*", cors());

//  parseo de JSON
app.use(express.json());
// ✅rutas
import userRoutes from "./api/routes/userRoutes";
import authRoutes from "./api/routes/authRoutes";

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

//  test route (mantener)
app.get("/", (_req, res) => {
  res.send("🔥 backend funcionando correctamente");
});

// ✅ inicializar DB
initDatabase();

// ✅ iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 servidor corriendo en puerto ${PORT}`));
