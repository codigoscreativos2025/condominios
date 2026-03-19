'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { InputPassword } from '@/components/ui/InputPassword';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Ocurrió un error. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <Input
        label="Correo electrónico"
        type="email"
        placeholder="nombre@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <InputPassword
        label="Contraseña"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && (
        <div className="p-3 bg-error-container text-on-error-container text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loading}
        >
          <span>Entrar</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </Button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface relative overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden bg-surface-container-low">
        <div
          className="particle w-96 h-96 -top-20 -left-20 opacity-20"
          style={{ animation: 'float 15s infinite ease-in-out' }}
        />
        <div
          className="particle w-80 h-80 top-1/4 -right-10 opacity-10"
          style={{ animation: 'float 18s infinite ease-in-out reverse' }}
        />
        <div
          className="particle w-64 h-64 bottom-10 left-1/3 opacity-15"
          style={{ animation: 'float 12s infinite ease-in-out 2s' }}
        />
        <div
          className="particle w-40 h-40 top-1/2 right-1/4 opacity-10"
          style={{ animation: 'float 20s infinite ease-in-out 1s' }}
        />
      </div>

      <style jsx>{`
        .particle {
          position: absolute;
          background: radial-gradient(circle, #2563eb 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel rounded-xl shadow-card overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col items-center">
            <div className="mb-8">
              <div className="bg-surface-container-lowest rounded-full p-1 shadow-sm border border-outline-variant/10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary font-headline font-extrabold text-2xl tracking-tighter">
                  JC
                </div>
              </div>
            </div>

            <div className="text-center mb-10">
              <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
                JC Condominios
              </h1>
              <p className="text-on-surface-variant font-body text-sm">
                Management System
              </p>
            </div>

            <Suspense fallback={<div className="w-full text-center">Cargando...</div>}>
              <LoginForm />
            </Suspense>

            <div className="mt-8 text-center">
              <a
                href="#"
                className="text-xs font-semibold text-primary hover:text-primary-container transition-colors"
              >
                ¿Olvidó su contraseña?
              </a>
            </div>

            <div className="mt-12 text-center">
              <p className="text-xs text-on-surface-variant font-body italic">
                Automatizaciones por n8n
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant">
            ¿No tiene una cuenta?
            <a className="text-primary font-bold hover:underline underline-offset-4 ml-1" href="#">
              Contacte al Administrador
            </a>
          </p>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/20">
          <span className="w-2 h-2 rounded-full bg-tertiary" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/80">
            Premium Access Portal
          </span>
        </div>
      </div>
    </div>
  );
}
