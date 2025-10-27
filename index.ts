import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { initDatabase } from "./api/config/initDatabase";
import userRoutes from "./api/routes/userRoutes";
import authRoutes from "./api/routes/authRoutes";
import movieRoutes from "./api/routes/movieRoutes";

dotenv.config();

const app = express();

/**
 * allowed origins list
 * defines which domains can interact with the backend
 */
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // example: https://dasake-front.vercel.app
];

/**
 * cors configuration
 * allows secure cross-origin requests only from trusted sources
 */
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
        callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * handles OPTIONS requests (CORS preflight)
 * ensures browsers can confirm permissions before sending actual requests
 */
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
        callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * security protection using helmet
 * helps protect against known web vulnerabilities
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

/**
 * custom content security policy (CSP)
 * restricts external resources to prevent malicious content injection
 */
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src * data:",
      "media-src https://videos.pexels.com https://player.vimeo.com",
      "script-src 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
    ].join("; ")
  );
  next();
});

/**
 * additional security headers
 * - prevents MIME type sniffing
 * - disables clickjacking
 * - controls referrer information sent to other sites
 */
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

/**
 * json middleware
 * parses incoming JSON requests into req.body
 */
app.use(express.json());

/**
 * main route handlers
 * organizes API endpoints by category
 */
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", movieRoutes);

/**
 * base route
 * used to verify that the backend is running correctly
 */
app.get("/", (req, res) => res.send("🔥 backend running successfully"));

/**
 * initializes database connection
 * ensures tables and connections are ready before serving requests
 */
initDatabase();

/**
 * starts the server
 * listens on the specified port and logs successful startup
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 server running on port ${PORT}`));
