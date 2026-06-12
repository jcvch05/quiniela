'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';
import { Partido } from '@/types';

const REFRESH = 60_000;

const ZONAS = [
  { id: 'BOT', label: '🇧🇴 Bolivia', offset: -4 },
  { id: 'LON', label: '🇬🇧 Londres', offset: +1 },
  { id: 'BRU', label: '🇧🇪 Bruselas', offset: +2 },
];

function soloFecha(fecha: string) { return fecha.split('T')[0]; }

function horaEnZona(fecha: string, offsetHoras: number): string {
  if (!fecha.includes('T')) return '';
  const [datePart, timePart] = fecha.split('T');
  const [h, m] = timePart.split(':').map(Number);
  const totalMin = h * 60 + m + (offsetHoras + 4) * 60; // +4 porque BOT es GMT-4
  const dias = Math.floor(totalMin / (24 * 60));
  const minutos = ((totalMin % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = Math.floor(minutos / 60).toString().padStart(2, '0');
  const mm = (minutos % 60).toString().padStart(2, '0');
  const suffix = dias > 0 ? ' +1d' : dias < 0 ? ' -1d' : '';
  return `${hh}:${mm}${suffix}`;
}

function labelFecha(fecha: string) {
  const d = new Date(soloFecha(fecha) + 'T12:00:00');
  return d.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' });
}
function labelFechaCorta(fecha: string) {
  const d = new Date(soloFecha(fecha) + 'T12:00:00');
  return d.toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' });
}
function hoy() { return new Date().toISOString().split('T')[0]; }

export default function AgendaPage() {
  const [resultados, setResultados] = useState<Record<string, { golesLocal: number; golesVisitante: number }>>({});
  const [zona, setZona] = useState(ZONAS[0]);

  const fechasDisponibles = useMemo(() => {
    const set = new Set(PARTIDOS_GRUPOS.map(p => soloFecha(p.fecha)));
    return Array.from(set).sort();
  }, []);

  const fechaHoy = hoy();
  const fechaInicial = fechasDisponibles.find(f => f >= fechaHoy) ?? fechasDisponibles[0] ?? '';
  const [fechaSel, setFechaSel] = useState(fechaInicial);

  const fetchResultados = useCallback(async () => {
    try {
      const res = await fetch('/api/resultados-publicos', { cache: 'no-store' });
      const data: Array<{ id: string; golesLocal: number; golesVisitante: number }> = await res.json();
      const map: Record<string, { golesLocal: number; golesVisitante: number }> = {};
      for (const r of data) map[r.id] = { golesLocal: r.golesLocal, golesVisitante: r.golesVisitante };
      setResultados(map);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchResultados();
    const iv = setInterval(fetchResultados, REFRESH);
    return () => clearInterval(iv);
  }, [fetchResultados]);

  function enrich(p: Partido): Partido {
    const r = resultados[p.id];
    return r ? { ...p, golesLocal: r.golesLocal, golesVisitante: r.golesVisitante, jugado: true } : p;
  }

  const partidosDelDia = useMemo(() =>
    PARTIDOS_GRUPOS
      .filter(p => soloFecha(p.fecha) === fechaSel)
      .map(enrich)
      .sort((a, b) => a.fecha.localeCompare(b.fecha)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [fechaSel, resultados]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-yellow-400 mb-1">🗓️ Agenda</h1>
          <p className="text-gray-400 text-sm">Partidos por día · Elige tu zona horaria</p>
        </div>

        {/* Selector de zona horaria */}
        <div className="flex gap-2 mb-6 justify-center">
          {ZONAS.map(z => (
            <button key={z.id} onClick={() => setZona(z)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                zona.id === z.id ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}>
              {z.label}
            </button>
          ))}
        </div>

        {/* Selector de fechas */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {fechasDisponibles.map(f => {
            const jugados = PARTIDOS_GRUPOS.filter(p => soloFecha(p.fecha) === f && resultados[p.id]).length;
            const total = PARTIDOS_GRUPOS.filter(p => soloFecha(p.fecha) === f).length;
            const esHoy = f === fechaHoy;
            return (
              <button key={f} onClick={() => setFechaSel(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors relative ${
                  fechaSel === f ? 'bg-yellow-400 text-black' : esHoy ? 'bg-green-700/50 text-green-300 border border-green-500/50' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}>
                {esHoy && fechaSel !== f && <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                {labelFechaCorta(f)}
                {jugados > 0 && <span className="ml-1 text-[10px] opacity-70">{jugados}/{total}</span>}
              </button>
            );
          })}
        </div>

        {/* Título del día */}
        {fechaSel && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black capitalize">{labelFecha(fechaSel)}</h2>
            <span className="text-sm text-gray-400 bg-white/10 px-3 py-1 rounded-full">
              {partidosDelDia.length} partido{partidosDelDia.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Lista de partidos */}
        <div className="space-y-3">
          {partidosDelDia.map(p => (
            <div key={p.id} className={`rounded-2xl border ${p.jugado ? 'bg-green-900/20 border-green-600/40' : 'bg-white/5 border-white/10'} p-4`}>
              <div className="flex items-center gap-3">
                <span className="flex-1 text-right font-bold text-lg leading-tight">{p.local}</span>
                <div className="text-center shrink-0 min-w-[90px]">
                  {p.jugado
                    ? <span className="bg-green-700/70 px-3 py-1.5 rounded-xl font-black text-2xl">{p.golesLocal} - {p.golesVisitante}</span>
                    : <span className="text-gray-500 font-black text-xl">vs</span>}
                </div>
                <span className="flex-1 text-left font-bold text-lg leading-tight">{p.visitante}</span>
              </div>
              <div className="text-center mt-2 space-y-0.5">
                <p className="text-sm font-semibold text-yellow-400">
                  {horaEnZona(p.fecha, zona.offset)} {zona.id}
                  {p.jugado && <span className="text-green-400 ml-2 font-bold">✓ Finalizado</span>}
                </p>
                <p className="text-xs text-gray-500">
                  Grupo {p.grupo} · 📍 {p.sede}, {p.ciudad}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
