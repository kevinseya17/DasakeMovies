import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import cors from "cors";

/**
 * Authentication middleware that validates JWT tokens in incoming requests.
 * Ensures that only authorized users can access protected routes.
 *
 * This function checks the Authorization header for a valid token,
 * verifies it using the secret key from environment variables,
 * and attaches the decoded user data to the request object.
 *
 * If the token is missing, invalid, or expired, the request is denied with a 401 status.
 *
 * param req Express request object containing headers and user data.
 * param res Express response object used to send back HTTP responses.
 * param next Function to pass control to the next middleware in the chain.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No autorizado" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No autorizado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
