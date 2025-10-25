import { Request, Response } from "express";
import { supabase } from "../config/database";
import { hashPassword, comparePassword } from "../middlewares/hashPassword";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendMail } from "../services/emailService";
import { isValidEmail, isValidPassword, passwordsMatch } from "../utils/validators";

// login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.from("users").select("*").eq("email", email);

    if (error) return res.status(500).json({ message: "Intenta de nuevo más tarde" });
    if (!data || data.length === 0) return res.status(401).json({ message: "Correo o contraseña inválidos" });

    const user = data[0];
    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ message: "Correo o contraseña inválidos" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "2h" });

    res.status(200).json({ token, nombre: user.nombre, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Intenta de nuevo más tarde" });
  }
};

// logout
export const logout = async (_req: Request, res: Response) => {
  res.status(200).json({ message: "Sesión cerrada correctamente" });
};

// perfil del usuario loggeado
export const profile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { data, error } = await supabase.from("users").select("*").eq("id", userId);

    if (error) return res.status(500).json({ message: "Intenta de nuevo más tarde" });
    if (!data || data.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const { password, ...user } = data[0];
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Intenta de nuevo más tarde" });
  }
};
const JWT_SECRET = process.env.JWT_SECRET!;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
// solicitar recuperación de contraseña
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const { data: users } = await supabase.from("users").select("*").eq("email", email);
    if (!users || users.length === 0) {
      // no revelamos si el correo existe
      return res.status(200).json({ message: "Revisa tu correo para continuar" });
    }

    const user = users[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    // guardar token en tabla auxiliar
    await supabase.from("password_resets").insert([
      { user_id: user.id, token, used: false, created_at: new Date().toISOString() }
    ]);

    const resetLink = `https://dasake-front.vercel.app/reset?token=${token}`;
    const html = `
      <p>hola ${user.firstName},</p>
      <p>haz clic <a href="${resetLink}">aquí</a> para restablecer tu contraseña.</p>
      <p>el enlace vence en 1 hora y solo puede usarse una vez.</p>
    `;

    await sendMail(email, "restablece tu contraseña", html);
    return res.status(200).json({ message: "revisa tu correo para continuar" });
  } catch (err) {
    console.error("error en forgotPassword:", err);
    return res.status(500).json({ message: "intenta de nuevo más tarde" });
  }
};

// resetear contraseña
export const resetPassword = async (req: Request, res: Response) => {
  
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: "token y nueva contraseña requeridos" });

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      
      return res.status(400).json({ message: "enlace inválido o caducado" });
    }

    const { data: users } = await supabase.from("users").select("*").eq("id", payload.userId);
    if (!users || users.length === 0)
      return res.status(404).json({ message: "usuario no encontrado" });

    const user = users[0];
    const hashedPassword = await hashPassword(newPassword);

    await supabase.from("users").update({ password: hashedPassword }).eq("id", user.id);
    await supabase.from("password_resets").update({ used: true }).eq("token", token);

    return res.status(200).json({ message: "contraseña actualizada con éxito" });
  } catch (err) {
    console.error("error en resetPassword:", err);
    return res.status(500).json({ message: "intenta de nuevo más tarde" });
  }
};
// cambiar contraseña desde perfil
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "faltan campos requeridos" });

    // obtener usuario
    const { data: users, error } = await supabase.from("users").select("*").eq("id", userId).single();
    if (error || !users) return res.status(404).json({ message: "usuario no encontrado" });

    const valid = await comparePassword(currentPassword, users.password);
    if (!valid) return res.status(401).json({ message: "contraseña actual incorrecta" });

    const hashedPassword = await hashPassword(newPassword);
    await supabase.from("users").update({ password: hashedPassword }).eq("id", userId);

    return res.status(200).json({ message: "contraseña actualizada con éxito" });
  } catch (err) {
    console.error("error en changePassword:", err);
    return res.status(500).json({ message: "intenta de nuevo más tarde" });
  }
};
