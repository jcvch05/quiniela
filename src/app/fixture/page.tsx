'use client';

import { useState } from 'react';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';

const FASES = [
  { id: 'grupos', label: '🗓️ Grupos' },
  { id: 'octavos', label: '⚔️ Octavos' },
  { id: 'cuartos', label: '🔥 Cuartos' },
  { id: 'semis', label: '🌟 Semis' },
  { id: 'final', label: '🏆 Final' },
];

const GRUPOS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

// Partidos eliminatorios (se llenarán con los clasificados)
const OCTAVOS = Array.from({ length: 16 }, (_, i) => ({
  id: `O${String(i + 1).padStart(2, '0')}`,
  local: `Clasificado ${i * 2 + 1}`,
  visitante: `Clasificado ${i * 2 + 2}`,
  fecha: '2026-06-28',
  jugado: false,
}));

const CUARTOS = Array.from({ length: 8 }, (_, i) => ({
  id: `C${String(i + 1).padStart(2, '0')}`,
  local: `Ganador O${String(i * 2 + 1).padStart(2, '0')}`,
  visitante: `Ganador O${String(i * 2 + 2).padStart(2, '0')}`,
  fecha: '2026-07-04',
  jugado: false,
}));

const SEMIS = [
  { id: 'S01', local: 'Ganador C01', visitante: 'Ganador C02', fecha: '2026-07-08', jugado: false },
  { id: 'S02', local: 'Ganador C03', visitante: 'Ganador C04', fecha: '2026-07-09', jugado: false },
];

const TERCER = { id: 'T01', local: 'Perdedor S01', visitante: 'Perdedor S02', fecha: '2026-07-11', jugado: false };
const FINAL = { id: 'F01', local: 'Ganador S01', visitante: 'Ganador S02', fecha: '2026-07-12', jugado: false };

function formatFecha(fecha: string) {
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatHora(fecha: string) {
  const d = new Date(fecha);
  if (isNaN(d.getTime()) || !fecha.includes('T')) return '';
  return d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
}

function PartidoCard({ local, visitante, fecha, jugado, golesLocal, golesVisitante, grande = false }: {
  local: string; visitante: string; fecha: string;
  jugado: boolean; golesLocal?: number; golesVisitante?: number; grande?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 md:p-5 ${jugado ? 'bg-white/10 border-green-600/40' : 'bg-white/5 border-white/10'}`}>
      <div className={`flex items-center gap-3 md:gap-5 ${grande ? 'gap-4' : ''}`}>
        <span className={`flex-1 text-right font-bold ${grande ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}`}>{local}</span>
        <div className="text-center min-w-[72px] md:min-w-[90px]">
          {jugado ? (
            <span className={`bg-green-700/60 px-3 py-1.5 rounded-xl font-black ${grande ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
              {golesLocal} - {golesVisitante}
            </span>
          ) : (
            <span className={`text-gray-500 font-black ${grande ? 'text-xl' : 'text-base'}`}>vs</span>
          )}
        </div>
        <span className={`flex-1 text-left font-bold ${grande ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}`}>{visitante}</span>
      </div>
      <p className="text-center mt-2 text-sm text-gray-400 capitalize">
        {formatFecha(fecha)}{fecha.includes('T') ? ` · ${formatHora(fecha)}` : ''}
        {jugado && <span className="ml-2 text-green-400 font-semibold">✓ Finalizado</span>}
      </p>
    </div>
  );
}

export default function FixturePage() {
  const [faseActiva, setFaseActiva] = useState('grupos');
  const [grupoActivo, setGrupoActivo] = useState('A');

  const gruposByLetter = PARTIDOS_GRUPOS.reduce<Record<string, typeof PARTIDOS_GRUPOS>>((acc, p) => {
    const g = p.grupo ?? 'X';
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black mb-1">📅 Fixture 2026</h1>
          <p className="text-green-300">Horarios en hora Bolivia (BOT)</p>
        </div>

        {/* Tabs de fases */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FASES.map(f => (
            <button key={f.id} onClick={() => setFaseActiva(f.id)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                faseActiva === f.id ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* GRUPOS */}
        {faseActiva === 'grupos' && (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              {GRUPOS.filter(g => gruposByLetter[g]).map(g => (
                <button key={g} onClick={() => setGrupoActivo(g)}
                  className={`w-11 h-11 rounded-xl font-black text-base transition-colors ${
                    grupoActivo === g ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}>
                  {g}
                </button>
              ))}
            </div>
            <h2 className="text-2xl font-black text-green-400 mb-4">Grupo {grupoActivo}</h2>
            <div className="space-y-3">
              {(gruposByLetter[grupoActivo] ?? []).map(p => (
                <PartidoCard key={p.id} local={p.local} visitante={p.visitante}
                  fecha={p.fecha} jugado={p.jugado}
                  golesLocal={p.golesLocal} golesVisitante={p.golesVisitante} />
              ))}
            </div>
          </>
        )}

        {/* OCTAVOS */}
        {faseActiva === 'octavos' && (
          <>
            <h2 className="text-2xl font-black text-yellow-400 mb-4">Octavos de Final</h2>
            <p className="text-gray-400 text-sm mb-4">A partir del 28 de junio de 2026</p>
            <div className="space-y-3">
              {OCTAVOS.map((p, i) => (
                <div key={p.id}>
                  {i % 2 === 0 && <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 mt-3">Llave {Math.floor(i/2) + 1}</p>}
                  <PartidoCard local={p.local} visitante={p.visitante} fecha={p.fecha} jugado={p.jugado} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* CUARTOS */}
        {faseActiva === 'cuartos' && (
          <>
            <h2 className="text-2xl font-black text-orange-400 mb-4">Cuartos de Final</h2>
            <p className="text-gray-400 text-sm mb-4">A partir del 4 de julio de 2026</p>
            <div className="space-y-3">
              {CUARTOS.map(p => (
                <PartidoCard key={p.id} local={p.local} visitante={p.visitante} fecha={p.fecha} jugado={p.jugado} />
              ))}
            </div>
          </>
        )}

        {/* SEMIS */}
        {faseActiva === 'semis' && (
          <>
            <h2 className="text-2xl font-black text-purple-400 mb-4">Semifinales</h2>
            <div className="space-y-4">
              {SEMIS.map((p, i) => (
                <div key={p.id}>
                  <p className="text-sm text-gray-400 mb-2">Semifinal {i + 1}</p>
                  <PartidoCard local={p.local} visitante={p.visitante} fecha={p.fecha} jugado={p.jugado} grande />
                </div>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-2">Tercer Lugar</p>
              <PartidoCard local={TERCER.local} visitante={TERCER.visitante} fecha={TERCER.fecha} jugado={TERCER.jugado} grande />
            </div>
          </>
        )}

        {/* FINAL */}
        {faseActiva === 'final' && (
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-black text-yellow-400 mb-6">Gran Final</h2>
            <p className="text-gray-400 mb-6">12 de julio de 2026 · MetLife Stadium, Nueva York</p>
            <PartidoCard local={FINAL.local} visitante={FINAL.visitante} fecha={FINAL.fecha} jugado={FINAL.jugado} grande />
          </div>
        )}
      </div>
    </main>
  );
}
