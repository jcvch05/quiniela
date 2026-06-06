'use client';

import { useState } from 'react';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';

const GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

function formatFecha(fecha: string) {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatHora(fecha: string) {
  const d = new Date(fecha);
  return d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
}

export default function FixturePage() {
  const [grupoActivo, setGrupoActivo] = useState('A');

  const gruposByLetter = PARTIDOS_GRUPOS.reduce<Record<string, typeof PARTIDOS_GRUPOS>>((acc, p) => {
    const g = p.grupo ?? 'X';
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});

  const partidos = gruposByLetter[grupoActivo] ?? [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📅</div>
          <h1 className="text-3xl font-black mb-1">Fixture Mundial 2026</h1>
          <p className="text-green-300 text-sm">Horarios en hora Bolivia (BOT)</p>
        </div>

        {/* Tabs de grupos */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {GRUPOS.filter(g => gruposByLetter[g]).map(g => (
            <button key={g} onClick={() => setGrupoActivo(g)}
              className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${
                grupoActivo === g
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}>
              {g}
            </button>
          ))}
        </div>

        {/* Partidos del grupo */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-green-400 uppercase tracking-widest">
            Grupo {grupoActivo}
          </h2>
          {partidos.map(partido => (
            <div key={partido.id}
              className={`rounded-xl p-4 border ${
                partido.jugado
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/5 border-white/10'
              }`}>
              <div className="flex items-center gap-3">
                {/* Local */}
                <span className="flex-1 text-right font-semibold text-sm">{partido.local}</span>

                {/* Marcador o vs */}
                <div className="text-center min-w-[64px]">
                  {partido.jugado ? (
                    <span className="bg-green-700/50 px-3 py-1 rounded-lg font-black text-lg">
                      {partido.golesLocal} - {partido.golesVisitante}
                    </span>
                  ) : (
                    <span className="text-gray-500 font-bold">vs</span>
                  )}
                </div>

                {/* Visitante */}
                <span className="flex-1 text-left font-semibold text-sm">{partido.visitante}</span>
              </div>

              <div className="text-center mt-2 text-xs text-gray-500">
                {formatFecha(partido.fecha)} · {formatHora(partido.fecha)}
                {partido.jugado && <span className="ml-2 text-green-400">✓ Finalizado</span>}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          Los resultados se actualizan automáticamente y recalculan los puntos de todos los participantes.
        </p>
      </div>
    </main>
  );
}
