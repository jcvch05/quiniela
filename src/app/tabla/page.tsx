'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Entry {
  id: string;
  nombre: string;
  puntos: number;
  desglose: {
    grupos: number;
    octavos: number;
    cuartos: number;
    semis: number;
    especiales: number;
  };
}

export default function TablaPage() {
  const [tabla, setTabla] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/participantes')
      .then(r => r.json())
      .then(data => { setTabla(data); setLoading(false); });
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/" className="text-green-400 text-sm hover:underline mb-6 inline-block">← Volver</Link>
        <h1 className="text-3xl font-black text-center mb-2">🏆 Tabla de Posiciones</h1>
        <p className="text-center text-green-300 mb-8">Quiniela Mundialista 2026 · Familia Vilaseca</p>

        {loading && (
          <div className="text-center text-gray-400 py-20">Cargando...</div>
        )}

        {!loading && tabla.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <div className="text-4xl mb-3">⏳</div>
            <p>El torneo aún no ha comenzado.<br/>¡Sé el primero en inscribirte!</p>
            <Link href="/registro" className="mt-6 inline-block bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl">
              Inscribirme
            </Link>
          </div>
        )}

        {!loading && tabla.length > 0 && (
          <div className="space-y-3">
            {tabla.map((entry, i) => (
              <div key={entry.id}
                className={`rounded-xl p-4 flex items-center gap-4 ${
                  i === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' :
                  i === 1 ? 'bg-gray-400/10 border border-gray-400/30' :
                  i === 2 ? 'bg-orange-600/10 border border-orange-600/30' :
                  'bg-white/5 border border-white/10'
                }`}>
                <span className="text-2xl w-8 text-center">
                  {medals[i] ?? <span className="text-gray-400 font-bold">{i + 1}</span>}
                </span>
                <div className="flex-1">
                  <p className="font-bold">{entry.nombre}</p>
                  <p className="text-xs text-gray-400">
                    Grupos: {entry.desglose.grupos} · Eliminatorias: {entry.desglose.octavos + entry.desglose.cuartos + entry.desglose.semis} · Especiales: {entry.desglose.especiales}
                  </p>
                </div>
                <div className="text-2xl font-black text-yellow-400">{entry.puntos}</div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-600 mt-8">
          Tabla actualizada después de cada fase
        </p>
      </div>
    </main>
  );
}
