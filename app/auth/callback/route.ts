import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  // If we don't have an auth code, we check if this is an implicit flow redirect (which has access_token in hash)
  // Server-side cannot read URL hash fragments directly, so we return a self-contained HTML/JS page
  // that reads the hash in the browser and POSTs it back to our server to establish the session.
  if (!code) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
        </head>
        <body style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #fafafa; color: #0f172a; margin: 0;">
          <div style="text-align: center; max-width: 400px; padding: 2.5rem; border-radius: 16px; background: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05); border: 1px solid #f0f0f0;">
            <div style="width: 48px; height: 48px; border: 4px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animate: spin 1s linear infinite; margin: 0 auto 1.5rem auto; animation: spin 1s linear infinite;"></div>
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 700;">Logging you in...</h2>
            <p style="color: #64748b; margin: 0; font-size: 0.95rem;">Establishing secure developer session.</p>
          </div>
          <style>
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
          <script>
            // 1. Read hash fragment from browser
            if (window.location.hash) {
              const hash = window.location.hash.substring(1);
              const params = new URLSearchParams(hash);
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');

              if (accessToken && refreshToken) {
                // 2. POST to self to exchange hash tokens for server session cookies
                fetch('/auth/callback', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ accessToken, refreshToken })
                })
                .then(res => {
                  if (res.ok) return res.json();
                  throw new Error('Session establishment failed');
                })
                .then(data => {
                  window.location.href = data.redirect || '/dashboard';
                })
                .catch(err => {
                  console.error(err);
                  window.location.href = '/login?error=hash_session_failed';
                });
                
                // Block executing direct redirection
                throw new Error('Exchanging implicit flow hash...');
              }
            }
            
            // If no hash fragment and no code, redirect to login with error
            window.location.href = '/login?error=missing_code';
          </script>
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Exchange code for session error:", error);
    return NextResponse.redirect(`${publicEnv.appUrl}/login?error=auth_callback`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${publicEnv.appUrl}/login?error=no_user`);
  }

  // Use Admin client for businesses query to bypass RLS issues during callback
  const adminClient = createSupabaseAdminClient();
  const { data: business } = await adminClient
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  let isFullyOnboarded = false;
  if (business) {
    const { count: servicesCount } = await adminClient
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id);

    const { count: hoursCount } = await adminClient
      .from("business_hours")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id);

    if (servicesCount && servicesCount > 0 && hoursCount && hoursCount > 0) {
      isFullyOnboarded = true;
    }
  }

  if (next?.startsWith("/")) {
    return NextResponse.redirect(`${publicEnv.appUrl}${next}`);
  }

  return NextResponse.redirect(
    isFullyOnboarded ? `${publicEnv.appUrl}/dashboard` : `${publicEnv.appUrl}/onboarding`,
  );
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json();

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: "Missing session tokens" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    
    // Set server-side session cookies using Supabase client
    const { data: { user }, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error || !user) {
      return NextResponse.json({ error: error?.message || "User not found" }, { status: 401 });
    }

    // Check if business exists for the owner using Admin Client to bypass RLS issues
    const adminClient = createSupabaseAdminClient();
    const { data: business } = await adminClient
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    let isFullyOnboarded = false;
    if (business) {
      const { count: servicesCount } = await adminClient
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id);

      const { count: hoursCount } = await adminClient
        .from("business_hours")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id);

      if (servicesCount && servicesCount > 0 && hoursCount && hoursCount > 0) {
        isFullyOnboarded = true;
      }
    }

    return NextResponse.json({
      success: true,
      redirect: isFullyOnboarded ? "/dashboard" : "/onboarding",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
