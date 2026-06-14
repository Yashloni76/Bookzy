import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined
          const value = document.cookie
            .split('; ')
            .find((row) => row.startsWith(name + '='))
          return value?.split('=')[1]
        },
        set(name: string, value: string, options) {
          if (typeof document === 'undefined') return
          let cookie = `${name}=${value}; path=/; max-age=${options?.maxAge ?? 3600}; SameSite=Lax`
          if (location.protocol === 'https:') cookie += '; Secure'
          document.cookie = cookie
        },
        remove(name: string, options) {
          if (typeof document === 'undefined') return
          document.cookie = `${name}=; path=/; max-age=0`
        },
      },
    }
  );
}
