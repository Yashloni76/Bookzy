import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check for Supabase auth cookies (they follow the pattern sb-<ref>-auth-token)
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
  );

  // Protect /dashboard and /onboarding — redirect to /login if no session
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  if (isProtectedRoute && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from /login
  if (pathname === "/login" && hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
