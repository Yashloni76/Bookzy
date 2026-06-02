import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/onboarding']
const AUTH_ONLY = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const hasCookie = request.cookies.getAll()
    .some(c => c.name.startsWith('sb-') && 
               c.name.endsWith('-auth-token'))
  
  const isProtected = PROTECTED.some(p => 
    pathname.startsWith(p))
  const isAuthOnly = AUTH_ONLY.some(p => 
    pathname.startsWith(p))
  
  if (isProtected && !hasCookie) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    )
  }
  
  if (isAuthOnly && hasCookie) {
    return NextResponse.redirect(
      new URL('/dashboard', request.url)
    )
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/public).*)',
  ],
}
