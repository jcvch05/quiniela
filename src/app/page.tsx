import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-black text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center pt-20 pb-12 px-4 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
          Quiniela Mundialista 2026
        </h1>
        <p className="text-xl text-green-300 font-semibold mb-6">
          Familia Vilaseca
        </p>
        <p className="text-gray-300 max-w-md mb-8">
          Demuestra que eres el mejor pronosticador de la familia.
          Inscríbete antes del <span className="text-yellow-400 font-bold">10 de junio</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/registro"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Inscribirme ahora
          </Link>
          <Link
            href="/tabla"
            className="border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Ver tabla de posiciones
          </Link>
        </div>
      </section>

      {/* Premios */}
      <section className="max-w-2xl mx-auto px-4 mb-12">
        <h2 className="text-2xl font-bold text-center mb-6">💰 Premios</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl p-4">
            <div className="text-3xl mb-1">🥇</div>
            <div className="font-bold text-yellow-400">1° Lugar</div>
            <div className="text-2xl font-black">60%</div>
            <div className="text-sm text-gray-400">del pozo total</div>
          </div>
          <div className="bg-gray-400/20 border border-gray-400/40 rounded-xl p-4">
            <div className="text-3xl mb-1">🥈</div>
            <div className="font-bold text-gray-300">2° Lugar</div>
            <div className="text-2xl font-black">25%</div>
            <div className="text-sm text-gray-400">del pozo total</div>
          </div>
          <div className="bg-orange-600/20 border border-orange-600/40 rounded-xl p-4">
            <div className="text-3xl mb-1">🥉</div>
            <div className="font-bold text-orange-400">3° Lugar</div>
            <div className="text-2xl font-black">15%</div>
            <div className="text-sm text-gray-400">del pozo total</div>
          </div>
        </div>
        <p className="text-center text-gray-400 mt-4 text-sm">
          Inscripción: <span className="text-yellow-400 font-bold">50 Bs</span> · Pago único
        </p>
      </section>

      {/* Puntuación */}
      <section className="max-w-2xl mx-auto px-4 mb-12">
        <h2 className="text-2xl font-bold text-center mb-6">📊 Sistema de Puntos</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-bold text-green-400 mb-3">Fase de Grupos</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span>Ganador/Empate correcto</span><span className="font-bold text-yellow-400">3 pts</span></li>
              <li className="flex justify-between"><span>Diferencia exacta de goles</span><span className="font-bold text-yellow-400">5 pts</span></li>
              <li className="flex justify-between"><span>Marcador exacto</span><span className="font-bold text-yellow-400">8 pts</span></li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-bold text-blue-400 mb-3">Pronósticos Especiales</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span>Campeón del Mundial</span><span className="font-bold text-yellow-400">50 pts</span></li>
              <li className="flex justify-between"><span>Subcampeón</span><span className="font-bold text-yellow-400">25 pts</span></li>
              <li className="flex justify-between"><span>Semifinalista (c/u)</span><span className="font-bold text-yellow-400">10 pts</span></li>
              <li className="flex justify-between"><span>Máximo goleador</span><span className="font-bold text-yellow-400">20 pts</span></li>
              <li className="flex justify-between"><span>Clasificado eliminatoria</span><span className="font-bold text-yellow-400">10 pts</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-16 px-4">
        <p className="text-gray-400 mb-4">
          ¿Listo para demostrar tu conocimiento mundialista?
        </p>
        <Link
          href="/registro"
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-10 py-4 rounded-xl text-lg transition-colors inline-block"
        >
          Quiero participar 🚀
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          Cierre de inscripciones: 10 de junio de 2026
        </p>
      </section>
    </main>
  );
}
