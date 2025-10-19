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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const { data: userData } = await supabase.from("users").select("*").eq("email", email).single();
    if (!userData) {
      return res.status(200).json({ message: "Revisa tu correo para continuar" });
    }

    const user = userData;

    // generar JWT con duración de 1 hora
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset?token=${token}`;

    const html = `
      <p>Hola ${user.firstName},</p>
      <p>Haz clic <a href="${resetLink}">aquí</a> para restablecer tu contraseña.</p>
      <p>Este enlace es válido por 1 hora.</p>
      <p>Si no solicitaste el cambio, ignora este correo.</p>
    `;

    await sendMail(email, "Restablece tu contraseña", html);

    res.status(200).json({ message: "Revisa tu correo para continuar" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Intenta de nuevo más tarde" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token y contraseña requeridos" });

    // verificar JWT
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const userId = payload.userId;

    // actualizar contraseña
    const hashedPassword = await hashPassword(password);

    const { error } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", userId);

    if (error) return res.status(500).json({ message: "Error al actualizar contraseña" });

    res.status(200).json({ message: "Contraseña restablecida correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Intenta de nuevo más tarde" });
  }
};