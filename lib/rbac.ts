import { auth } from './auth';
import { prisma } from './prisma';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.rol)) {
    throw new Error('Forbidden');
  }
  return session;
}

export async function requireCondominioAccess(condominioId: string) {
  const session = await requireAuth();

  if (session.user.rol === 'SUPER_ADMIN') {
    return session;
  }

  if (session.user.condominioId !== condominioId) {
    throw new Error('Access denied to this condominio');
  }

  return session;
}

export async function validateApiKey(apiKey: string) {
  const user = await prisma.user.findUnique({
    where: { apiKey },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

export function canAccessResidentData(userRol: string): boolean {
  return userRol === 'ADMIN' || userRol === 'SUPER_ADMIN';
}

export function canAccessFinancialData(userRol: string): boolean {
  return userRol === 'ADMIN' || userRol === 'SUPER_ADMIN';
}

export function canManageCondominio(userRol: string): boolean {
  return userRol === 'ADMIN' || userRol === 'SUPER_ADMIN';
}

export function canAccessSuperAdmin(userRol: string): boolean {
  return userRol === 'SUPER_ADMIN';
}
