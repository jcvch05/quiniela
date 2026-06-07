'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signUp, saveSession } from '@/lib/authService';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') ?? '/';

  const [modo, setModo] = useState<'login' | 'signup'>('login');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function cambiarModo(m: 'login' | 'signup') {
    setModo(m);
    setError('');
    setPassword('');
    setConfirm('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (modo === 'signup') {
      if (!nombre.trim()) { setError('Ingresá tu nombre'); return; }
      if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
      if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    }

    if (!email.trim()) { setError('Ingresá tu email'); return; }
    if (!password) { setError('Ingresá tu contraseña'); return; }

    setLoading(true);
    try {
      const user = modo === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, nombre);

      // Guardar sesión via servidor (cookie HttpOnly + SameSite=Lax)
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: user.idToken, uid: user.uid, name: user.displayName ?? user.email, email: user.email }),
      });

      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">⚽</div>
        <h1 className="text-2xl font-black">Quiniela Mundialista 2026</h1>
        <p className="text-green-300 font-semibold">Familia Vilaseca</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
          <button type="button" onClick={() => cambiarModo('login')}
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${modo === 'login' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'}`}>
            Iniciar sesión
          </button>
          <button type="button" onClick={() => cambiarModo('signup')}
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${modo === 'signup' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'}`}>
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === 'signup' && (
            <div>
              <label className="block text-sm text-gray-300 mb-1">Tu nombre completo</label>
              <input
                value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Juan Vilaseca"
                autoComplete="name"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="juan@email.com"
              autoComplete="email"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-lg px-1">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {modo === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            )}
          </div>

          {modo === 'signup' && (
            <div>
              <label className="block text-sm text-gray-300 mb-1">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-lg px-1">
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Indicador en tiempo real de coincidencia */}
              {confirm.length > 0 && (
                <p className={`text-xs mt-1 ${password === confirm ? 'text-green-400' : 'text-red-400'}`}>
                  {password === confirm ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 disabled:opacity-50 text-black font-black py-3.5 rounded-xl transition-all text-lg mt-2">
            {loading
              ? '⏳ Cargando...'
              : modo === 'login' ? 'Entrar →' : 'Crear cuenta →'}
          </button>
        </form>
      </div>

      {modo === 'signup' && (
        <p className="text-center text-xs text-gray-500 mt-4">
          Al crear tu cuenta podrás registrar tus pronósticos e inscribirte en la quiniela.
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-black to-blue-950 text-white flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-gray-400">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
