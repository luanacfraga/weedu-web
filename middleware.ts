import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const publicRoutes = [
  '/login',
  '/register',
  '/register-master',
  '/accept-invite',
  '/forgot-password',
  '/reset-password',
]
const protectedRoutes = ['/companies', '/plans', '/dashboard']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('tooldo_token')

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isPublicRoute && token) {
    return NextResponse.next()
  }

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}
