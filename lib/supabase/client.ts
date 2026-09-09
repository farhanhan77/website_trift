import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.length > 0 &&
    supabaseUrl.startsWith("http") &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.length > 0
  );
};

/**
 * Browser-safe Supabase client (pakai anon key).
 * Dipakai di sisi client untuk membaca data yang tidak butuh elevasi.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
