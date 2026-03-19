import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

const publicPaths = ['/login', '/api/auth', '/api/v1/webhook'];

export default auth((req: NextRequest & { auth: { user?: { rol: string; condominioId: string | null } } | null }) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/v1/webhook')) {
    return NextResponse.next();
  }

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/v1/')) {
    const apiKey = req.headers.get('x-api-key') || req.nextUrl.searchParams.get('apiKey');
    
    if (apiKey) {
      return NextResponse.next();
    }

    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return NextResponse.next();
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!req.auth) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = req.auth.user;
  const rol = user?.rol;

  if (pathname.startsWith('/super-admin') && rol !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  if (pathname.startsWith('/admin') && rol === 'RESIDENT') {
    return NextResponse.redirect(new URL('/residente/dashboard', req.url));
  }

  if (pathname.startsWith('/residente') && (rol === 'ADMIN' || rol === 'SUPER_ADMIN')) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads|public).*)'],
};
