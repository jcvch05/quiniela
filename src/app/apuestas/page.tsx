'use client';

import { useEffect, useState, useMemo } from 'react';
import { PARTIDOS_GRUPOS, PARTIDOS_DIECISEISAVOS } from '@/lib/partidos';

interface Participante {
  id: string;
  nombre: string;
  pronosticosGrupos: Record<string, { golesLocal: number; golesVisitante: number }>;
  pronosticosDieciseisavos?: Record<string, { golesLocal: number; golesVisitante: number }>;
}

interface Resultado {
  id: string;
  golesLocal: number;
  golesVisitante: number;
}

type Fase = 'grupos' | 'dieciseisavos';
const GRUPOS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

function pts(gl: number, gv: number, pl: number | string, pv: number | string): number {
  const pln = Number(pl), pvn = Number(pv);
  if (isNaN(pln) || isNaN(pvn)) return 0;
  if (gl === pln && gv === pvn) return 8;
  if (gl - gv === pln - pvn) return 5;
  if (gl !== gv && ((gl > gv) === (pln > pvn))) return 3;
  return 0;
}

function ptsElim(gl: number, gv: number, pl: number | string, pv: number | string): number {
  const pln = Number(pl), pvn = Number(pv);
  if (isNaN(pln) || isNaN(pvn)) return 0;
  if (gl === pln && gv === pvn) return 10;
  if (gl - gv === pln - pvn) return 5;
  if (gl !== gv && ((gl > gv) === (pln > pvn))) return 3;
  return 0;
}

function PtsChip({ p }: { p: number }) {
  if (p === 10) return <span className="text-xs font-bold text-yellow-300 bg-yellow-400/20 px-1.5 py-0.5 rounded-lg">+10</span>;
  if (p === 8)  return <span className="text-xs font-bold text-yellow-300 bg-yellow-400/20 px-1.5 py-0.5 rounded-lg">+8</span>;
  if (p === 5)  return <span className="text-xs font-bold text-green-300 bg-green-400/20 px-1.5 py-0.5 rounded-lg">+5</span>;
  if (p === 3)  return <span className="text-xs font-bold text-blue-300 bg-blue-400/20 px-1.5 py-0.5 rounded-lg">+3</span>;
  return <span className="text-xs font-bold text-gray-500">0</span>;
}

function PartidoCard({
  partidoId, local, visitante, resultado, participantes, calcPts,
}: {
  partidoId: string; local: string; visitante: string;
  resultado?: Resultado; participantes: Participante[];
  calcPts: (gl: number, gv: number, pl: number, pv: number) => number;
  getPred: (p: Participante) => { golesLocal: number; golesVisitante: number } | undefined;
}) {
  const [open, setOpen] = useState(false);
  const rows = useMemo(() => participantes.map(p => ({
    nombre: p.nombre,
    pred: p.pronosticosGrupos?.[partidoId],
  })), [participantes, partidoId]);
  const conApuesta = rows.filter(r => r.pred !== undefined).length;

  return (
    <div className={`rounded-2xl border overflow-hidden ${resultado ? 'border-green-600/40 bg-green-900/10' : 'border-white/10 bg-white/5'}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full text-left p-4">
        <div className="flex items-center gap-3">
          <span className="flex-1 text-right font-bold text-lg leading-tight">{local}</span>
          <div className="text-center shrink-0 min-w-[80px]">
            {resultado
              ? <span className="bg-green-700/70 px-3 py-1.5 rounded-xl font-black text-2xl">{resultado.golesLocal} - {resultado.golesVisitante}</span>
              : <span className="text-gray-500 font-black text-xl">vs</span>}
          </div>
          <span className="flex-1 text-left font-bold text-lg leading-tight">{visitante}</span>
          <span className="text-gray-400 text-sm ml-2 shrink-0">{open ? '▲' : '▼'} {conApuesta}/{participantes.length}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-white/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2">Participante</th>
                <th className="px-3 py-2 text-center">{local.split(' ')[0]}</th>
                <th className="px-3 py-2 text-center">{visitante.split(' ')[0]}</th>
                {resultado && <th className="px-3 py-2 text-center">Pts</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map(({ nombre, pred }) => (
                <tr key={nombre} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 font-semibold text-gray-200 truncate max-w-[140px]">{nombre}</td>
                  <td className="px-3 py-2.5 text-center font-black text-white text-lg">{pred !== undefined ? pred.golesLocal : <span className="text-gray-600">—</span>}</td>
                  <td className="px-3 py-2.5 text-center font-black text-white text-lg">{pred !== undefined ? pred.golesVisitante : <span className="text-gray-600">—</span>}</td>
                  {resultado && (
                    <td className="px-3 py-2.5 text-center">
                      {pred !== undefined
                        ? <PtsChip p={calcPts(resultado.golesLocal, resultado.golesVisitante, pred.golesLocal, pred.golesVisitante)} />
                        : <span className="text-gray-600 text-xs">—</span>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PartidoCardElim({
  partidoId, local, visitante, resultado, participantes,
}: {
  partidoId: string; local: string; visitante: string;
  resultado?: Resultado; participantes: Participante[];
}) {
  const [open, setOpen] = useState(false);
  const rows = useMemo(() => participantes.map(p => ({
    nombre: p.nombre,
    pred: p.pronosticosDieciseisavos?.[partidoId],
  })), [participantes, partidoId]);
  const conApuesta = rows.filter(r => r.pred !== undefined).length;

  return (
    <div className={`rounded-2xl border overflow-hidden ${resultado ? 'border-green-600/40 bg-green-900/10' : 'border-white/10 bg-white/5'}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full text-left p-4">
        <div className="flex items-center gap-3">
          <span className="flex-1 text-right font-bold text-lg leading-tight">{local}</span>
          <div className="text-center shrink-0 min-w-[80px]">
            {resultado
              ? <span className="bg-green-700/70 px-3 py-1.5 rounded-xl font-black text-2xl">{resultado.golesLocal} - {resultado.golesVisitante}</span>
              : <span className="text-gray-500 font-black text-xl">vs</span>}
          </div>
          <span className="flex-1 text-left font-bold text-lg leading-tight">{visitante}</span>
          <span className="text-gray-400 text-sm ml-2 shrink-0">{open ? '▲' : '▼'} {conApuesta}/{participantes.length}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-white/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2">Participante</th>
                <th className="px-3 py-2 text-center">{local.split(' ')[0]}</th>
                <th className="px-3 py-2 text-center">{visitante.split(' ')[0]}</th>
                {resultado && <th className="px-3 py-2 text-center">Pts</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map(({ nombre, pred }) => (
                <tr key={nombre} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 font-semibold text-gray-200 truncate max-w-[140px]">{nombre}</td>
                  <td className="px-3 py-2.5 text-center font-black text-white text-lg">{pred !== undefined ? pred.golesLocal : <span className="text-gray-600">—</span>}</td>
                  <td className="px-3 py-2.5 text-center font-black text-white text-lg">{pred !== undefined ? pred.golesVisitante : <span className="text-gray-600">—</span>}</td>
                  {resultado && (
                    <td className="px-3 py-2.5 text-center">
                      {pred !== undefined
                        ? <PtsChip p={ptsElim(resultado.golesLocal, resultado.golesVisitante, pred.golesLocal, pred.golesVisitante)} />
                        : <span className="text-gray-600 text-xs">—</span>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ApuestasPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [resultados, setResultados] = useState<Record<string, Resultado>>({});
  const [fase, setFase] = useState<Fase>('dieciseisavos');
  const [grupoActivo, setGrupoActivo] = useState('A');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/participantes', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/resultados-publicos', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([parts, ress]) => {
      setParticipantes(parts);
      const map: Record<string, Resultado> = {};
      for (const r of ress) if (r.jugado) map[r.id] = r;
      setResultados(map);
      setLoading(false);
    });
  }, []);

  const gruposDisponibles = useMemo(() =>
    GRUPOS.filter(g => PARTIDOS_GRUPOS.some(p => p.grupo === g)), []);

  const partidosGrupo = useMemo(() =>
    PARTIDOS_GRUPOS.filter(p => p.grupo === grupoActivo), [grupoActivo]);

  const dieciseisavosDisponibles = PARTIDOS_DIECISEISAVOS.filter(
    p => p.local !== 'Por confirmar' && p.visitante !== 'Por confirmar'
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-yellow-400 mb-1">🎲 Apuestas</h1>
          <p className="text-gray-400 text-sm">Pronósticos de todos · toca un partido para ver</p>
        </div>

        {/* Tabs de fase */}
        <div className="flex gap-2 mb-6 justify-center">
          {([['grupos', '📊 Fase Grupos'], ['dieciseisavos', '⚔️ Fase 16avos']] as [Fase, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setFase(id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                fase === id ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Cargando apuestas…</div>
        ) : (
          <>
            {/* ── FASE GRUPOS ── */}
            {fase === 'grupos' && (
              <>
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  {gruposDisponibles.map(g => (
                    <button key={g} onClick={() => setGrupoActivo(g)}
                      className={`w-11 h-11 rounded-xl font-black text-base transition-colors ${
                        grupoActivo === g ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
                <h2 className="text-xl font-black text-green-400 mb-3">Grupo {grupoActivo}</h2>
                <div className="space-y-3">
                  {partidosGrupo.map(p => (
                    <PartidoCard
                      key={p.id}
                      partidoId={p.id}
                      local={p.local}
                      visitante={p.visitante}
                      resultado={resultados[p.id]}
                      participantes={participantes}
                      calcPts={pts}
                      getPred={(part) => part.pronosticosGrupos?.[p.id]}
                    />
                  ))}
                </div>
              </>
            )}

            {/* ── FASE 16AVOS ── */}
            {fase === 'dieciseisavos' && (
              <>
                <div className="space-y-3">
                  {dieciseisavosDisponibles.map(p => (
                    <PartidoCardElim
                      key={p.id}
                      partidoId={p.id}
                      local={p.local}
                      visitante={p.visitante}
                      resultado={resultados[p.id]}
                      participantes={participantes}
                    />
                  ))}
                  {dieciseisavosDisponibles.length === 0 && (
                    <p className="text-center text-gray-500 py-10">Los cruces se confirman esta noche.</p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
