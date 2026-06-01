import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey, publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createSupabaseAdminClient() {
  return createClient<Database>(publicEnv.supabaseUrl, getServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
