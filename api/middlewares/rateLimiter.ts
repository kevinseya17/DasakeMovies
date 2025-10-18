import rateLimit from "express-rate-limit";

// 5 intentos por 10 minutos
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Demasiados intentos fallidos, intenta nuevamente en 10 minutos",
  standardHeaders: true,
  legacyHeaders: false,
});
