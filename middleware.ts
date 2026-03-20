import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicPaths = ['/login', '/api/auth', '/api/v1/webhook'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/v1/webhook')) {
    return NextResponse.next();
  }

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/v1/')) {
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');
    
    if (apiKey) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return NextResponse.next();
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const rol = token.rol as string;

  if (pathname.startsWith('/super-admin') && rol !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  if (pathname.startsWith('/admin') && rol === 'RESIDENT') {
    return NextResponse.redirect(new URL('/residente/dashboard', request.url));
  }

  if (pathname.startsWith('/residente') && (rol === 'ADMIN' || rol === 'SUPER_ADMIN')) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads|public).*)'],
};
