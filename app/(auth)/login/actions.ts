"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";

export async function devBypassLoginAction(email: string) {
  if (process.env.NODE_ENV !== "development") {
    return { error: "Bypass only allowed in local development." };
  }

  const adminClient = createSupabaseAdminClient();
  
  // This generates the magic link URL WITHOUT actually sending an email
  // bypassing the Supabase rate limit entirely.
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${publicEnv.appUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { action_link: data.properties.action_link };
}
