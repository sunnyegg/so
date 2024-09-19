import { createClient } from "@supabase/supabase-js";

export default function NewSupabaseClient() {
  const SUPABASE_URL = process.env.NEXT_SUPABASE_URL as string;
  const SUPABASE_KEY = process.env.NEXT_SUPABASE_KEY as string;

  return createClient(SUPABASE_URL, SUPABASE_KEY);
}
