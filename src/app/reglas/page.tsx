export default function ReglasPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center">
          <div className="text-5xl mb-3">📋</div>
          <h1 className="text-3xl font-black mb-1">Reglamento Oficial</h1>
          <p className="text-green-300">Quiniela Mundialista 2026 · Familia Vilaseca</p>
        </div>

        <Section title="🎯 Objetivo">
          <p className="text-gray-300">
            Premiar al participante que demuestre el mejor conocimiento y capacidad de predicción
            durante todo el torneo. Cada participante acumula puntos según sus aciertos en los
            pronósticos que realizó antes del inicio de cada fase.
          </p>
        </Section>

        <Section title="💳 Inscripción">
          <ul className="text-gray-300 space-y-2">
            <li>• Costo de inscripción: <strong className="text-yellow-400">50 Bs</strong> por participante (pago con QR)</li>
            <li>• Pago único antes del inicio del torneo</li>
            <li>• No existen pagos adicionales durante el Mundial</li>
            <li>• Fecha límite: <strong className="text-yellow-400">10 de junio de 2026</strong></li>
          </ul>
        </Section>

        <Section title="💰 Premios">
          <div className="grid grid-cols-3 gap-3 text-center mb-3">
            <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl p-3">
              <div className="text-2xl">🥇</div>
              <div className="font-bold text-yellow-400">1° Lugar</div>
              <div className="text-xl font-black">60%</div>
            </div>
            <div className="bg-gray-400/10 border border-gray-400/30 rounded-xl p-3">
              <div className="text-2xl">🥈</div>
              <div className="font-bold text-gray-300">2° Lugar</div>
              <div className="text-xl font-black">25%</div>
            </div>
            <div className="bg-orange-600/10 border border-orange-600/30 rounded-xl p-3">
              <div className="text-2xl">🥉</div>
              <div className="font-bold text-orange-400">3° Lugar</div>
              <div className="text-xl font-black">15%</div>
            </div>
          </div>
          <p className="text-sm text-gray-400">Ejemplo con 20 participantes (1.000 Bs): 1° 600 Bs · 2° 250 Bs · 3° 150 Bs</p>
        </Section>

        <Section title="📊 Sistema de Puntuación">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-green-400 mb-2">Fase de Grupos</h3>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-white/10">
                  <Row label="Ganador o empate correcto" pts="3 pts" />
                  <Row label="Diferencia exacta de goles" pts="5 pts" />
                  <Row label="Marcador exacto" pts="8 pts" />
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="font-bold text-blue-400 mb-2">Fases Eliminatorias</h3>
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Equipo clasificado correcto (c/u)" pts="10 pts" />
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Pronósticos Especiales</h3>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-white/10">
                  <Row label="Campeón del Mundial" pts="50 pts" />
                  <Row label="Subcampeón del Mundial" pts="25 pts" />
                  <Row label="Semifinalista acertado (c/u)" pts="10 pts" />
                  <Row label="Máximo goleador" pts="20 pts" />
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <Section title="📅 Fases y Fechas Límite">
          <ul className="text-gray-300 space-y-3 text-sm">
            <li><strong className="text-white">Fase 1 – Grupos:</strong> Pronósticos de los 48 partidos + especiales → antes del <span className="text-yellow-400">10 de junio</span></li>
            <li><strong className="text-white">Fase 2 – Octavos:</strong> 8 equipos clasificados a cuartos → antes del primer partido de octavos</li>
            <li><strong className="text-white">Fase 3 – Cuartos:</strong> 4 equipos clasificados a semis → antes del primer partido de cuartos</li>
            <li><strong className="text-white">Fase 4 – Semis:</strong> 2 equipos finalistas → antes de la primera semifinal</li>
          </ul>
        </Section>

        <Section title="📜 Reglas Generales">
          <ol className="text-gray-300 space-y-2 text-sm list-decimal list-inside">
            <li>Los pronósticos deben enviarse antes de la fecha límite de cada fase.</li>
            <li>Una vez enviados, los pronósticos no podrán modificarse.</li>
            <li>Si un participante no entrega pronósticos antes del plazo, obtiene 0 puntos en esa fase.</li>
            <li>Los resultados oficiales del Mundial son la única fuente válida.</li>
            <li>La tabla de posiciones se actualiza después de cada fase.</li>
            <li>Gana el participante con mayor cantidad de puntos al finalizar el torneo.</li>
          </ol>
        </Section>

        <Section title="⚖️ Desempates">
          <ol className="text-gray-300 space-y-2 text-sm list-decimal list-inside">
            <li>Mayor cantidad de marcadores exactos acertados.</li>
            <li>Mayor cantidad de partidos acertados.</li>
            <li>Mayor cantidad de clasificados acertados en eliminatorias.</li>
            <li>Si persiste el empate, el premio se comparte.</li>
          </ol>
        </Section>

        <div className="bg-green-900/30 border border-green-700/40 rounded-2xl p-6 text-center">
          <p className="text-green-300 text-sm">
            🏆 La quiniela está diseñada para premiar el conocimiento, el análisis y la capacidad
            de predicción. El principal objetivo es disfrutar el Mundial en familia y mantener
            la emoción desde el primer partido hasta la Final.
          </p>
          <p className="text-yellow-400 font-bold mt-3">¡Que gane el mejor pronosticador!</p>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, pts }: { label: string; pts: string }) {
  return (
    <tr>
      <td className="py-2 text-gray-300">{label}</td>
      <td className="py-2 text-right font-bold text-yellow-400">{pts}</td>
    </tr>
  );
}
