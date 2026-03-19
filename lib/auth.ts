import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import type { Rol } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    nombre: string;
    rol: Rol;
    condominioId: string | null;
    apiKey: string;
  }

  interface Session {
    user: User;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    email: string;
    nombre: string;
    rol: Rol;
    condominioId: string | null;
    apiKey: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol as Rol,
          condominioId: user.condominioId,
          apiKey: user.apiKey,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.nombre = user.nombre;
        token.rol = user.rol;
        token.condominioId = user.condominioId;
        token.apiKey = user.apiKey;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.nombre = token.nombre;
        session.user.rol = token.rol;
        session.user.condominioId = token.condominioId;
        session.user.apiKey = token.apiKey;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});
