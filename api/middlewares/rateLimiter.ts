import rateLimit from "express-rate-limit";

/**
 * This rate limiter is used to protect the login route from brute-force attacks.
 * It restricts users to a maximum of 5 failed login attempts within a 10-minute window.
 * If the limit is exceeded, the user will receive a message indicating that they should
 * try again after 10 minutes.
 *
 * windowMs: Time window for which the requests are checked (10 minutes in milliseconds).
 * max: Maximum number of allowed attempts within the window.
 * message: Response message sent when the limit is reached.
 * standardHeaders: Sends rate limit information in standard HTTP headers.
 * legacyHeaders: Disables older, deprecated headers.
 */
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Demasiados intentos fallidos, intenta nuevamente en 10 minutos",
  standardHeaders: true,
  legacyHeaders: false,
});
