import { NextRequest, NextResponse } from 'next/server';

// Rutas que NO requieren autenticación
const PUBLIC_PATHS = ['/login', '/api/auth'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir rutas públicas y assets
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/qr-pago') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Verificar cookie de sesión
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
