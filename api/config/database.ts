import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

/**
 * The URL of the Supabase project.
 * Loaded from the environment variable `SUPABASE_URL`.
 * type {string}
 */
const supabaseUrl = process.env.SUPABASE_URL as string;

/**
 * The public API key for accessing the Supabase project.
 * Loaded from the environment variable `SUPABASE_KEY`.
 * type {string}
 */
const supabaseKey = process.env.SUPABASE_KEY as string;

/**
 * Validates the existence of required environment variables for Supabase connection.
 * Throws an error if `SUPABASE_URL` or `SUPABASE_KEY` are missing.
 * throws {Error} If required environment variables are not found.
 */
if (!supabaseUrl || !supabaseKey) {
  throw new Error("faltan variables SUPABASE_URL o SUPABASE_KEY en el archivo .env");
}

/**
 * Supabase client instance.
 * Provides access to the Supabase database and authentication features.
 * constant
 * type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
