import Link from 'next/link';
import Image from 'next/image';

const SELECCIONES = [
  '🇦🇷','🇧🇷','🇫🇷','🇩🇪','🇪🇸','🇵🇹','🇬🇧','🇮🇹','🇳🇱','🇺🇾',
  '🇲🇽','🇺🇸','🇨🇦','🇯🇵','🇰🇷','🇸🇳','🇳🇬','🇲🇦','🇨🇴','🇨🇱',
  '🇦🇺','🇧🇪','🇨🇭','🇵🇱','🇸🇪','🇩🇰','🇹🇷','🇪🇨','🇵🇾','🇧🇴',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* Fondo animado con banderas flotantes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradiente base */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-black to-blue-950" />

        {/* Círculos decorativos de cancha */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-white/10" />

        {/* Línea central */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />

        {/* Banderas flotantes */}
        {SELECCIONES.map((flag, i) => (
          <span
            key={i}
            className="absolute text-3xl md:text-4xl opacity-20 select-none animate-pulse"
            style={{
              left: `${(i * 37 + 5) % 95}%`,
              top: `${(i * 23 + 8) % 90}%`,
              animationDelay: `${(i * 0.4) % 3}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          >
            {flag}
          </span>
        ))}

        {/* Pelota decorativa grande */}
        <div className="absolute -bottom-20 -right-20 text-[200px] opacity-5 select-none">⚽</div>
        <div className="absolute -top-10 -left-10 text-[150px] opacity-5 select-none">🏆</div>
      </div>

      {/* Contenido */}
      <div className="relative z-10">

        {/* ── HERO ── */}
        <section className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">

          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            ⚽ FIFA World Cup 2026™ · 11 junio – 19 julio
          </div>

          {/* Logo oficial del Mundial 2026 */}
          <div className="relative mb-6">
            <div style={{ filter: 'drop-shadow(0 0 40px rgba(250,204,21,0.4))' }}>
              <Image
                src="/copa-mundial.png"
                alt="FIFA World Cup 2026 Official Emblem"
                width={220}
                height={340}
                className="mx-auto"
                priority
              />
            </div>
            <div className="absolute top-2 -right-6 text-4xl animate-bounce">⚽</div>
            <div className="absolute bottom-4 -left-6 text-3xl animate-pulse">⭐</div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-3 leading-none">
            <span className="text-white">Quiniela</span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Mundialista 2026
            </span>
          </h1>

          <p className="text-2xl md:text-3xl font-bold text-green-300 mb-3">
            🏠 Familia Vilaseca
          </p>

          <p className="text-gray-400 max-w-md mb-10 text-lg">
            Demuestra que eres el mejor pronosticador. Predice los resultados y compite por el pozo.
          </p>

          {/* Banner Eliminatorias */}
          <Link href="/eliminatorias"
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/60 hover:border-yellow-400 text-yellow-300 px-6 py-4 rounded-2xl text-sm font-bold mb-6 flex flex-col items-center gap-1 transition-all hover:scale-105 max-w-sm">
            <span className="text-xl">⚔️ ¡Pronostica la Fase 16avos!</span>
            <span className="text-xs text-yellow-400/80">Cierra el domingo 29 jun a las 13:00 BOT</span>
            <span className="text-xs text-white/60 mt-1">Toca aquí para apostar →</span>
          </Link>

          {/* Inscripciones cerradas */}
          <div className="bg-gray-800/60 border border-gray-600/40 text-gray-400 px-4 py-2 rounded-xl text-sm font-semibold mb-6 inline-flex items-center gap-2">
            🔒 Inscripciones cerradas
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Link href="/tabla"
              className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-black font-black px-10 py-4 rounded-2xl text-xl transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:scale-105">
              Ver posiciones 🏆
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/agenda"
              className="border-2 border-green-500/40 hover:border-green-400/70 hover:bg-green-900/20 text-green-300 font-bold px-10 py-4 rounded-2xl text-xl transition-all">
              🗓️ Agenda
            </Link>
            <Link href="/highlights"
              className="border-2 border-purple-500/40 hover:border-purple-400/70 hover:bg-purple-900/20 text-purple-300 font-bold px-10 py-4 rounded-2xl text-xl transition-all">
              🎬 Resúmenes
            </Link>
          </div>

          {/* Sedes */}
          <div className="mt-12 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
            <span>🇺🇸 Estados Unidos</span>
            <span>·</span>
            <span>🇨🇦 Canadá</span>
            <span>·</span>
            <span>🇲🇽 México</span>
          </div>
        </section>

        {/* ── PREMIOS ── */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black mb-2">💰 El Pozo</h2>
            <p className="text-gray-400">Todo lo recaudado se reparte entre los tres mejores</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="relative bg-gradient-to-b from-yellow-500/30 to-yellow-900/20 border-2 border-yellow-500/60 rounded-2xl p-5 md:p-6">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-4xl">🥇</div>
              <div className="mt-3 font-black text-yellow-400 text-lg md:text-xl">1° Lugar</div>
              <div className="text-4xl md:text-5xl font-black mt-1">60%</div>
              <div className="text-xs text-gray-400 mt-1">del pozo total</div>
            </div>
            <div className="relative bg-gradient-to-b from-gray-400/20 to-gray-800/20 border-2 border-gray-400/40 rounded-2xl p-5 md:p-6 mt-4">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-4xl">🥈</div>
              <div className="mt-3 font-black text-gray-300 text-lg md:text-xl">2° Lugar</div>
              <div className="text-4xl md:text-5xl font-black mt-1">25%</div>
              <div className="text-xs text-gray-400 mt-1">del pozo total</div>
            </div>
            <div className="relative bg-gradient-to-b from-orange-600/20 to-orange-900/20 border-2 border-orange-500/40 rounded-2xl p-5 md:p-6 mt-8">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-4xl">🥉</div>
              <div className="mt-3 font-black text-orange-400 text-lg md:text-xl">3° Lugar</div>
              <div className="text-4xl md:text-5xl font-black mt-1">15%</div>
              <div className="text-xs text-gray-400 mt-1">del pozo total</div>
            </div>
          </div>

          <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-300">
              Inscripción: <span className="text-yellow-400 font-black text-xl">50 Bs</span> · Pago único con QR Banco BISA
            </p>
            <p className="text-xs text-gray-500 mt-1">Ejemplo con 20 jugadores: pozo de 1.000 Bs → 1° 600 Bs · 2° 250 Bs · 3° 150 Bs</p>
          </div>
        </section>

        {/* ── PUNTUACIÓN ── */}
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black mb-2">📊 ¿Cómo se ganan puntos?</h2>
            <p className="text-gray-400">Cuanto más exacto, más puntos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gradient-to-b from-green-900/40 to-transparent border border-green-700/40 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-3">✅</div>
              <div className="font-black text-2xl text-yellow-400 mb-1">3 pts</div>
              <div className="font-bold text-white mb-1">Resultado correcto</div>
              <div className="text-sm text-gray-400">Acertás quién gana o si empata</div>
            </div>
            <div className="bg-gradient-to-b from-blue-900/40 to-transparent border border-blue-700/40 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <div className="font-black text-2xl text-yellow-400 mb-1">5 pts</div>
              <div className="font-bold text-white mb-1">Diferencia exacta</div>
              <div className="text-sm text-gray-400">Acertás la diferencia de goles</div>
            </div>
            <div className="bg-gradient-to-b from-purple-900/40 to-transparent border border-purple-700/40 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-3">🔮</div>
              <div className="font-black text-2xl text-yellow-400 mb-1">8 pts</div>
              <div className="font-bold text-white mb-1">Marcador exacto</div>
              <div className="text-sm text-gray-400">Acertás el resultado completo</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { pts: '50', label: 'Campeón', icon: '🏆' },
              { pts: '25', label: 'Subcampeón', icon: '🥈' },
              { pts: '10', label: 'Semifinalista', icon: '⭐' },
              { pts: '20', label: 'Máx. Goleador', icon: '⚽' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="font-black text-xl text-yellow-400">{item.pts} pts</div>
                <div className="text-xs text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SELECCIONES PARTICIPANTES ── */}
        <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
          <h2 className="text-2xl font-black mb-6 text-gray-300">48 selecciones · 104 partidos · 1 campeón</h2>
          <div className="flex flex-wrap justify-center gap-3 text-4xl">
            {SELECCIONES.map((flag, i) => (
              <span key={i} className="hover:scale-125 transition-transform cursor-default" title="">
                {flag}
              </span>
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="text-center pb-20 px-4">
          <div className="max-w-md mx-auto bg-gradient-to-b from-green-900/40 to-transparent border border-green-700/40 rounded-3xl p-8">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-black mb-2">¿Listo para competir?</h3>
            <p className="text-gray-400 mb-6 text-sm">El mundial ya comenzó. Seguí los resultados y mirá quién va ganando la quiniela.</p>
            <Link href="/tabla"
              className="block bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-black font-black px-8 py-4 rounded-2xl text-xl transition-all hover:scale-105 shadow-lg shadow-yellow-400/20">
              Ver tabla de posiciones 🏆
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
