import { supabase } from "./database";

/**
 * Initializes the required database tables in Supabase.
 * 
 * This function checks for the existence of the `users` and `password_resets` tables.
 * If any of them do not exist, it attempts to create them using Supabase RPC.
 * 
 * @async
 * @function initDatabase
 * @returns {Promise<void>} A promise that resolves when the tables are initialized.
 * @throws {Error} Logs and throws an error if table initialization fails.
 */
export const initDatabase = async () => {
  try {
    // verificar tabla users
    /**
     * Checks if the `users` table exists by attempting to select one record.
     * If an error occurs, it assumes the table does not exist and creates it.
     */
    const { error: usersError } = await supabase.from("users").select("*").limit(1);
    if (usersError) {
      console.log("🚀 Creando tabla 'users'...");
      // force creation if table does not exist
      await supabase.from("users").insert([]).select();
      await supabase.rpc("exec", {
        sql: `
        CREATE TABLE IF NOT EXISTS users (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          firstName text NOT NULL,
          lastName text NOT NULL,
          age int CHECK (age >= 13),
          email text UNIQUE NOT NULL,
          password text NOT NULL,
          created_at timestamptz DEFAULT now()
        );
      `
      });
    }

    // verificar tabla password_resets
    /**
     * Checks if the `password_resets` table exists by attempting to select one record.
     * If an error occurs, it assumes the table does not exist and creates it.
     */
    const { error: resetError } = await supabase.from("password_resets").select("*").limit(1);
    if (resetError) {
      console.log("🚀 Creando tabla 'password_resets'...");
      await supabase.rpc("exec", {
        sql: `
        CREATE TABLE IF NOT EXISTS password_resets (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES users(id) ON DELETE CASCADE,
          token text UNIQUE NOT NULL,
          expires_at timestamptz NOT NULL,
          used boolean DEFAULT false
        );
      `
      });
    }

    console.log("✅ Tablas inicializadas correctamente");
  } catch (err) {
    console.error("❌ Error al inicializar tablas:", err);
  }
};
