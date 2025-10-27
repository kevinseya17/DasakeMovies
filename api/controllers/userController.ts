import { Request, Response } from "express";
import { supabase } from "../config/database";
import { hashPassword } from "../middlewares/hashPassword";
import { isValidEmail, isValidPassword, isValidAge, passwordsMatch } from "../utils/validators";

/**
 * registers a new user in the database
 * validates input data such as name, age, email, and password
 * checks for existing users before saving a new one
 * stores passwords securely using bcrypt hashing
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    console.log("req.body recibido:", req.body);
    const { firstName, lastName, age, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName) return res.status(400).json({ message: "Nombre y lastName son requeridos" });
    if (!isValidAge(age)) return res.status(400).json({ message: "Edad mínima 13 años" });
    if (!isValidEmail(email)) return res.status(400).json({ message: "Correo inválido" });
    if (!isValidPassword(password)) return res.status(400).json({ message: "Contraseña no cumple los requisitos" });
    if (!passwordsMatch(password, confirmPassword)) return res.status(400).json({ message: "Las contraseñas no coinciden" });

    const { data: existing } = await supabase.from("users").select("*").eq("email", email);
    if (existing && existing.length > 0) return res.status(409).json({ message: "Este correo ya está registrado" });

    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabase.from("users").insert([{
      firstName, lastName, age, email, password: hashedPassword, created_at: new Date().toISOString()
    }]).select();

    if (error) return res.status(500).json({ message: "Intenta de nuevo más tarde" });

    res.status(201).json({ id: data[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Intenta de nuevo más tarde" });
  }
};

/**
 * retrieves all registered users from the database
 * returns the full list of users or an error message if something goes wrong
 */
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) return res.status(500).json({ message: "Intenta de nuevo más tarde" });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Intenta de nuevo más tarde" });
  }
};

/**
 * retrieves a single user by their id
 * returns the user information if found, or an error message if not
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("users").select("*").eq("id", id);
    if (error) return res.status(500).json({ message: "Intenta de nuevo más tarde" });
    if (!data || data.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Intenta de nuevo más tarde" });
  }
};

/**
 * updates user information such as name, age, email, or password
 * validates data before saving and hashes the password if changed
 * rejects updates if no valid fields are provided
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, age, correo, password, confirmPassword } = req.body;

    const updates: any = {};

    if (firstName) updates.firstName = firstName.trim();
    if (lastName) updates.lastName = lastName.trim();

    if (age !== undefined) {
      if (age < 13) {
        return res.status(400).json({ message: "debes tener al menos 13 años" });
      }
      updates.age = age;
    }

    if (correo) {
      const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!correoRegex.test(correo)) {
        return res.status(400).json({ message: "correo electrónico inválido" });
      }

      const { data: existingUser, error: emailCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("correo", correo)
        .neq("id", id)
        .maybeSingle();

      if (emailCheckError) throw emailCheckError;
      if (existingUser) {
        return res.status(409).json({ message: "el correo ya está registrado por otro usuario" });
      }

      updates.correo = correo;
    }

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "las contraseñas no coinciden" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "la contraseña debe tener al menos 8 caracteres" });
      }

      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "no se enviaron datos para actualizar" });
    }

    updates.updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("error actualizando usuario:", error);
      return res.status(500).json({ message: "intenta de nuevo más tarde" });
    }

    res.status(200).json({
      message: "usuario actualizado correctamente",
      user: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "error interno del servidor" });
  }
};

/**
 * deletes a user by id from the database
 * verifies that the user exists before deletion
 * returns confirmation of deletion or error details if it fails
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
      return res.status(400).json({ message: "id de usuario no proporcionado" });
    }

    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", id)
      .single();

    if (findError && findError.code !== "PGRST116") {
      console.error("error buscando usuario:", findError);
      return res.status(500).json({ message: "error verificando el usuario" });
    }

    if (!existingUser) {
      return res.status(404).json({ message: "usuario no encontrado" });
    }

    const { error: deleteError } = await supabase.from("users").delete().eq("id", id);

    if (deleteError) {
      console.error("error al eliminar usuario:", deleteError);
      return res.status(500).json({ message: "no se pudo eliminar el usuario, intenta más tarde" });
    }

    return res.status(200).json({
      message: "usuario eliminado correctamente",
      deletedUserId: id,
      deletedEmail: existingUser.email,
      deletedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("error interno:", err);
    return res.status(500).json({ message: "error interno del servidor" });
  }
};

/**
 * retrieves the profile of the currently authenticated user
 * requires user id provided by the authentication middleware
 * excludes the password field before returning the user object
 */
export const getProfile = async (req: Request, res: Response) => {
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
