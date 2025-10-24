import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./api/config/initDatabase";
import userRoutes from "./api/routes/userRoutes";
import authRoutes from "./api/routes/authRoutes";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://dasake-front.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      origin.startsWith("https://dasake-front") ||
      origin === "http://localhost:5173"
    ) {
      callback(null, true);
    } else {
      console.log("❌ cors bloqueado desde:", origin);
      callback(new Error("CORS no permitido"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("🔥 backend funcionando correctamente"));

initDatabase();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 servidor corriendo en puerto ${PORT}`));
