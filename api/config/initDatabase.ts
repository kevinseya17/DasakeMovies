import { supabase } from "./database";

export const initDatabase = async () => {
  try {
    // verificar tabla users
    const { error: usersError } = await supabase.from("users").select("*").limit(1);
    if (usersError) {
      console.log("🚀 Creando tabla 'users'...");
      await supabase.from("users").insert([]).select(); // esto forzará la creación si no existe
      await supabase.rpc("exec", { sql: `
        CREATE TABLE IF NOT EXISTS users (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          firstName text NOT NULL,
          lastName text NOT NULL,
          age int CHECK (age >= 13),
          email text UNIQUE NOT NULL,
          password text NOT NULL,
          created_at timestamptz DEFAULT now()
        );
      `});
    }

    // verificar tabla password_resets
    const { error: resetError } = await supabase.from("password_resets").select("*").limit(1);
    if (resetError) {
      console.log("🚀 Creando tabla 'password_resets'...");
      await supabase.rpc("exec", { sql: `
        CREATE TABLE IF NOT EXISTS password_resets (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES users(id) ON DELETE CASCADE,
          token text UNIQUE NOT NULL,
          expires_at timestamptz NOT NULL,
          used boolean DEFAULT false
        );
      `});
    }

    console.log("✅ Tablas inicializadas correctamente");
  } catch (err) {
    console.error("❌ Error al inicializar tablas:", err);
  }
};
