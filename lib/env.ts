const requiredPublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const requiredServerEnv = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

function getRequiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const publicEnv = {
  supabaseUrl: getRequiredEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    requiredPublicEnv.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: getRequiredEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    requiredPublicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  get appUrl() {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  },
};

export function getServiceRoleKey() {
  return getRequiredEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    requiredServerEnv.SUPABASE_SERVICE_ROLE_KEY,
  );
}
