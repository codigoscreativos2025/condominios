import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.rol === 'SUPER_ADMIN') {
    redirect('/super-admin/dashboard');
  }

  if (session.user.rol === 'RESIDENT') {
    redirect('/residente/dashboard');
  }

  redirect('/admin/dashboard');
}
