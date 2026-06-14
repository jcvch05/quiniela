'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';

const UID = 'wc9HNaAOGzYwTSjASuGfiJhYpK72';
const FECHA_CORTE = '2026-06-15'; // Solo partidos desde esta fecha

const partidosDisponibles = PARTIDOS_GRUPOS.filter(p => p.fecha.split('T')[0] >= FECHA_CORTE);

const gruposDisponibles = [...new Set(partidosDisponibles.map(p => p.grupo))].sort();

export default function RegistroRoxana() {
  const router = useRouter();
  const [pronosticos, setPronosticos] = useState<Record<string, { golesLocal: string; golesVisitante: string }>>({});
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');
  const [grupoActivo, setGrupoActivo] = useState(gruposDisponibles[0] ?? 'A');

  useEffect(() => {
    const init: Record<string, { golesLocal: string; golesVisitante: string }> = {};
    for (const p of partidosDisponibles) {
      init[p.id] = { golesLocal: '', golesVisitante: '' };
    }
    setPronosticos(init);
  }, []);

  function setGol(partidoId: string, campo: 'golesLocal' | 'golesVisitante', val: string) {
    setPronosticos(prev => ({ ...prev, [partidoId]: { ...prev[partidoId], [campo]: val } }));
  }

  async function guardar() {
    const incompletos = partidosDisponibles.filter(p => {
      const pred = pronosticos[p.id];
      return pred?.golesLocal === '' || pred?.golesVisitante === '';
    });
    if (incompletos.length > 0) {
      setError(`Faltan ${incompletos.length} pronóstico(s) por completar.`);
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const grupos: Record<string, { golesLocal: number; golesVisitante: number }> = {};
      for (const p of partidosDisponibles) {
        grupos[p.id] = {
          golesLocal: Number(pronosticos[p.id].golesLocal),
          golesVisitante: Number(pronosticos[p.id].golesVisitante),
        };
      }
      const res = await fetch('/api/registro-roxana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: UID, pronosticosGrupos: grupos }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setGuardado(true);
      setTimeout(() => router.push('/tabla'), 2000);
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : 'desconocido'}`);
    } finally {
      setGuardando(false);
    }
  }

  const partidosGrupo = partidosDisponibles.filter(p => p.grupo === grupoActivo);
  const completosEnGrupo = partidosGrupo.filter(p => pronosticos[p.id]?.golesLocal !== '' && pronosticos[p.id]?.golesVisitante !== '').length;
  const totalCompletos = partidosDisponibles.filter(p => pronosticos[p.id]?.golesLocal !== '' && pronosticos[p.id]?.golesVisitante !== '').length;

  if (guardado) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-black text-yellow-400">¡Pronósticos guardados!</h1>
          <p className="text-gray-400 mt-2">Redirigiendo a posiciones…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-yellow-400 mb-1">👋 Bienvenida, Roxana</h1>
          <p className="text-gray-400 text-sm">Completa tus pronósticos para los partidos del 15 de junio en adelante</p>
          <div className="mt-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 inline-block">
            <span className="text-yellow-400 font-bold">{totalCompletos}</span>
            <span className="text-gray-400"> / {partidosDisponibles.length} partidos completados</span>
          </div>
        </div>

        {/* Selector de grupo */}
        <div className="flex flex-wrap gap-2 mb-5 justify-center">
          {gruposDisponibles.map(g => {
            const ps = partidosDisponibles.filter(p => p.grupo === g);
            const comp = ps.filter(p => pronosticos[p.id]?.golesLocal !== '' && pronosticos[p.id]?.golesVisitante !== '').length;
            const done = comp === ps.length;
            return (
              <button key={g} onClick={() => setGrupoActivo(g)}
                className={`w-12 h-12 rounded-xl font-black text-sm transition-colors relative ${
                  grupoActivo === g ? 'bg-yellow-400 text-black' : done ? 'bg-green-700/50 text-green-300 border border-green-500/50' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}>
                {g}
                {done && grupoActivo !== g && <span className="absolute -top-1 -right-1 text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>

        <h2 className="text-lg font-black text-green-400 mb-3">
          Grupo {grupoActivo} — {completosEnGrupo}/{partidosGrupo.length}
        </h2>

        <div className="space-y-3 mb-6">
          {partidosGrupo.map(p => (
            <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-500 mb-2 text-center">
                {new Date(p.fecha.split('T')[0] + 'T12:00:00').toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}
                {p.fecha.includes('T') && <span className="text-yellow-400 ml-1">· {p.fecha.split('T')[1]} BOT</span>}
              </p>
              <div className="flex items-center gap-3">
                <span className="flex-1 text-right font-bold text-base leading-tight">{p.local}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number" min="0" max="20"
                    value={pronosticos[p.id]?.golesLocal ?? ''}
                    onChange={e => setGol(p.id, 'golesLocal', e.target.value)}
                    className="w-14 text-center font-black text-xl bg-gray-800 border border-white/20 rounded-lg py-2 text-white"
                    placeholder="?"
                  />
                  <span className="text-gray-500 font-black">-</span>
                  <input
                    type="number" min="0" max="20"
                    value={pronosticos[p.id]?.golesVisitante ?? ''}
                    onChange={e => setGol(p.id, 'golesVisitante', e.target.value)}
                    className="w-14 text-center font-black text-xl bg-gray-800 border border-white/20 rounded-lg py-2 text-white"
                    placeholder="?"
                  />
                </div>
                <span className="flex-1 text-left font-bold text-base leading-tight">{p.visitante}</span>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm mb-4 text-center font-semibold">{error}</p>}

        <button onClick={guardar} disabled={guardando}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black text-lg py-4 rounded-2xl transition-colors">
          {guardando ? '⏳ Guardando…' : '✅ Guardar pronósticos'}
        </button>

        <p className="text-xs text-gray-600 text-center mt-4">
          Los partidos ya jugados (antes del 15 de junio) no están disponibles para apostar.
        </p>
      </div>
    </main>
  );
}
