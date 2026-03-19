import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'JC Condominios - Management System',
  description: 'Plataforma SaaS multi-tenant para administración integral de condominios',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body selection:bg-primary-container selection:text-on-primary-container">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
