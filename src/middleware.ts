import { NextRequest, NextResponse } from 'next/server';

// Rutas completamente públicas (sin login)
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/',                // login, logout y me
  '/api/participantes',        // tabla pública de posiciones
  '/api/resultados-publicos',  // fixture público
  '/registro-roxana',          // página especial para Roxana
  '/api/registro-roxana',      // API de pronósticos de Roxana
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Assets estáticos siempre pasan
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Rutas públicas pasan sin login
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Todas las demás rutas (incluyendo /api/*) requieren sesión
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    // Si es una llamada a API, devolver 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    // Si es una página, redirigir al login
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
