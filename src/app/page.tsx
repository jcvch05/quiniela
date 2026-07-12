'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const BANDERAS = [
  '🇦🇷','🇧🇷','🇫🇷','🇩🇪','🇪🇸','🇵🇹','🇬🇧','🇮🇹','🇳🇱','🇺🇾',
  '🇲🇽','🇺🇸','🇨🇦','🇯🇵','🇰🇷','🇸🇳','🇳🇬','🇲🇦','🇨🇴','🇨🇱',
  '🇦🇺','🇧🇪','🇨🇭','🇵🇱','🇸🇪','🇩🇰','🇹🇷','🇪🇨','🇵🇾','🇧🇴',
];

// Fases y sus ventanas de apuesta
const FASES = [
  {
    id: 'grupos',
    label: '📋 FASE GRUPOS',
    abre: new Date('2026-06-01T00:00:00-04:00'),
    cierra: new Date('2026-06-11T14:30:00-04:00'),
    href: '/pronosticos',
  },
  {
    id: 'dieciseisavos',
    label: '⚔️ FASE 16AVOS',
    abre: new Date('2026-06-28T01:00:00-04:00'),
    cierra: new Date('2026-06-28T14:00:00-04:00'),
    href: '/pronosticos',
  },
  {
    id: 'octavosPartidos',
    label: '⚡ FASE 8VOS',
    abre: new Date('2026-07-04T01:00:00-04:00'),
    cierra: new Date('2026-07-04T14:00:00-04:00'),
    href: '/pronosticos',
  },
  {
    id: 'cuartosPartidos',
    label: '🔥 FASE CUARTOS',
    abre: new Date('2026-07-08T11:00:00Z'),
    cierra: new Date('2026-07-09T19:00:00Z'),
    href: '/pronosticos',
  },
  {
    id: 'semisPartidos',
    label: '🌟 FASE SEMIS',
    abre: new Date('2026-07-12T11:00:00Z'),   // 7:00 BOT sáb 12 jul
    cierra: new Date('2026-07-14T18:00:00Z'), // 14:00 BOT mar 14 jul
    href: '/pronosticos',
  },
];

function getFaseActual() {
  const now = new Date();
  // Fase abierta ahora
  const abierta = FASES.find(f => now >= f.abre && now < f.cierra);
  if (abierta) return { fase: abierta, estado: 'abierta' as const };
  // Próxima fase
  const proxima = FASES.find(f => now < f.abre);
  if (proxima) return { fase: proxima, estado: 'proxima' as const };
  // Última fase cerrada
  const cerradas = FASES.filter(f => now >= f.cierra);
  const ultima = cerradas[cerradas.length - 1];
  if (ultima) return { fase: ultima, estado: 'cerrada' as const };
  return null;
}

function formatDeadline(d: Date) {
  return d.toLocaleString('es-BO', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Bracket visible desde que terminan D14-D16 (≈ 04:00 BOT del sáb 4 jul = 08:00 UTC)
const BRACKET_DESDE = new Date('2026-07-04T08:00:00Z');

export default function Home() {
  const [faseInfo, setFaseInfo] = useState<ReturnType<typeof getFaseActual>>(null);
  const [showBracket, setShowBracket] = useState(false);

  useEffect(() => {
    setFaseInfo(getFaseActual());
    const iv = setInterval(() => setFaseInfo(getFaseActual()), 30_000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const check = () => setShowBracket(new Date() >= BRACKET_DESDE);
    check();
    const iv = setInterval(check, 60_000);
    return () => clearInterval(iv);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* Fondo con banderas flotantes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-black to-blue-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-white/10" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
        {BANDERAS.map((flag, i) => (
          <span key={i} className="absolute text-3xl md:text-4xl opacity-20 select-none animate-pulse"
            style={{
              left: `${(i * 37 + 5) % 95}%`,
              top: `${(i * 23 + 8) % 90}%`,
              animationDelay: `${(i * 0.4) % 3}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}>
            {flag}
          </span>
        ))}
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">

        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-green-400 mb-3">
            🏠 Familia Vilaseca
          </h1>
          <p className="text-gray-300 text-lg max-w-sm mx-auto">
            Demuestra que eres el mejor pronosticador. Predice los resultados y compite por el pozo.
          </p>
        </div>

        {/* Banner de fase actual */}
        {faseInfo && (
          <div className={`w-full max-w-sm mb-6 rounded-2xl border-2 p-5 text-center ${
            faseInfo.estado === 'abierta'
              ? 'bg-yellow-900/40 border-yellow-500 text-yellow-300'
              : faseInfo.estado === 'proxima'
              ? 'bg-blue-900/30 border-blue-500/60 text-blue-300'
              : 'bg-gray-900/60 border-gray-600/60 text-gray-400'
          }`}>
            <div className="text-2xl font-black mb-1">{faseInfo.fase.label}</div>
            {faseInfo.estado === 'abierta' && (
              <>
                <p className="text-sm font-semibold mb-1 capitalize">
                  Cierra: {formatDeadline(faseInfo.fase.cierra)}
                </p>
                <Link href={faseInfo.fase.href}
                  className="text-sm font-bold underline underline-offset-2">
                  Toca aquí para apostar →
                </Link>
              </>
            )}
            {faseInfo.estado === 'proxima' && (
              <div className="text-sm font-semibold space-y-0.5">
                <p className="capitalize">Abre: {formatDeadline(faseInfo.fase.abre)}</p>
                <p className="capitalize">Cierra: {formatDeadline(faseInfo.fase.cierra)}</p>
              </div>
            )}
            {faseInfo.estado === 'cerrada' && (
              <p className="text-sm font-semibold">Apuestas cerradas</p>
            )}
          </div>
        )}

        {/* Botones principales */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Link href="/tabla"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-black font-black text-xl py-5 rounded-2xl transition-all shadow-lg shadow-yellow-400/20 hover:scale-105">
            Ver posiciones 🏆
          </Link>

          <Link href="/fixture"
            className="flex items-center justify-center gap-2 bg-transparent border-2 border-green-500 hover:bg-green-900/30 text-green-400 font-bold text-xl py-4 rounded-2xl transition-all">
            📅 Fixture
          </Link>

          <Link href="/resumenes"
            className="flex items-center justify-center gap-2 bg-transparent border-2 border-purple-500 hover:bg-purple-900/30 text-purple-400 font-bold text-xl py-4 rounded-2xl transition-all">
            🎬 Resúmenes
          </Link>

          {showBracket && (
            <Link href="/bracket"
              className="flex items-center justify-center gap-2 bg-transparent border-2 border-yellow-500 hover:bg-yellow-900/30 text-yellow-400 font-bold text-xl py-4 rounded-2xl transition-all">
              🏆 Bracket
            </Link>
          )}

        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
          <span>🇺🇸 Estados Unidos</span>
          <span>·</span>
          <span>🇨🇦 Canadá</span>
          <span>·</span>
          <span>🇲🇽 México</span>
        </div>
      </div>
    </main>
  );
}
