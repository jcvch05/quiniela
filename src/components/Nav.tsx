'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getSession, clearSession } from '@/lib/authService';

// Bracket visible desde el sábado 4 jul 2026 00:00 BOT (= 04:00 UTC)
const BRACKET_DESDE = new Date('2026-07-04T04:00:00Z');

const links = [
  { href: '/',          label: '🏠 Inicio' },
  { href: '/tabla',     label: '🏆 Posiciones' },
  { href: '/fixture',   label: '📅 Fixture' },
  { href: '/resumenes', label: '🎬 Resúmenes' },
  { href: '/reglas',    label: '📋 Reglas' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [showBracket, setShowBracket] = useState(false);

  useEffect(() => {
    const check = () => setShowBracket(new Date() >= BRACKET_DESDE);
    check();
    const iv = setInterval(check, 60_000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(({ user }) => {
        if (user?.name) setUserName(user.name);
        else { const s = getSession(); if (s?.name) setUserName(s.name); }
      })
      .catch(() => { const s = getSession(); if (s?.name) setUserName(s.name); });
  }, [pathname]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    clearSession();
    router.push('/login');
  }

  return (
    <nav className="bg-green-950/90 backdrop-blur border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-black text-yellow-400 text-sm tracking-tight shrink-0">
            ⚽ Quiniela Vilaseca 2026
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}>
                {l.label}
              </Link>
            ))}
            {showBracket && (
              <Link href="/bracket"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/bracket'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}>
                🏆 Bracket
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {userName && <span className="text-xs text-gray-400">👤 {userName.split(' ')[0]}</span>}
            <Link href="/pronosticos" className="text-xs bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-lg transition-colors font-semibold">
              🎯 Mis apuestas
            </Link>
            <button onClick={logout}
              className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 px-3 py-1.5 rounded-lg transition-colors">
              Salir
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2 text-xl">
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.href ? 'bg-yellow-400 text-black' : 'text-gray-300 hover:bg-white/10'
                }`}>
                {l.label}
              </Link>
            ))}
            {showBracket && (
              <Link href="/bracket" onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/bracket' ? 'bg-yellow-400 text-black' : 'text-gray-300 hover:bg-white/10'
                }`}>
                🏆 Bracket
              </Link>
            )}
            <Link href="/pronosticos" onClick={() => setOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-yellow-400 hover:bg-white/10">
              🎯 Mis apuestas
            </Link>
            {userName && <p className="px-4 py-2 text-xs text-gray-500">👤 {userName}</p>}
            <button onClick={logout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 rounded-lg transition-colors">
              🚪 Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
