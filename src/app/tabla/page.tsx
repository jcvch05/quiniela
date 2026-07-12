'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Entry {
  id: string;
  nombre: string;
  puntos: number;
  desglose: {
    grupos?: number;
    dieciseisavos?: number;
    octavos?: number;
    cuartos?: number;
    semis?: number;
    especiales?: number;
  };
}

const REFRESH_INTERVAL = 30_000; // 30 segundos

export default function TablaPage() {
  const [tabla, setTabla] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);

  const fetchTabla = useCallback(async () => {
    try {
      const res = await fetch('/api/participantes', { cache: 'no-store' });
      const data = await res.json();
      setTabla(data);
      setLastUpdate(new Date());
      setCountdown(REFRESH_INTERVAL / 1000);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch inicial y auto-refresh cada 30s
  useEffect(() => {
    fetchTabla();
    const interval = setInterval(fetchTabla, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchTabla]);

  // Countdown visual
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => (c <= 1 ? REFRESH_INTERVAL / 1000 : c - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-center mb-2">🏆 Tabla de Posiciones</h1>
        <p className="text-center text-green-300 mb-2">Quiniela Mundialista 2026 · Familia Vilaseca</p>

        {/* Indicador de actualización */}
        <div className="flex items-center justify-center gap-2 mb-8 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          <span>En vivo · actualiza en {countdown}s</span>
          {lastUpdate && (
            <span>· última actualización: {lastUpdate.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          )}
          <button onClick={fetchTabla} className="text-green-400 hover:text-green-300 underline ml-1">↻</button>
        </div>

        {loading && (
          <div className="text-center text-gray-400 py-20">Cargando...</div>
        )}

        {!loading && tabla.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <div className="text-4xl mb-3">⏳</div>
            <p>Aún no hay participantes con pago confirmado.<br />¡Sé el primero en inscribirte!</p>
            <Link href="/registro" className="mt-6 inline-block bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl">
              Inscribirme
            </Link>
          </div>
        )}

        {!loading && tabla.length > 0 && (
          <div className="space-y-3">
            {tabla.map((entry, i) => (
              <div key={entry.id}
                className={`rounded-xl p-4 flex items-center gap-4 transition-all ${
                  i === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' :
                  i === 1 ? 'bg-gray-400/10 border border-gray-400/30' :
                  i === 2 ? 'bg-orange-600/10 border border-orange-600/30' :
                  'bg-white/5 border border-white/10'
                }`}>
                <span className="text-2xl w-8 text-center">
                  {medals[i] ?? <span className="text-gray-400 font-bold text-base">{i + 1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{entry.nombre}</p>
                  <div className="flex gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                    {[
                      { label: 'Grupos',    val: entry.desglose?.grupos,         show: true },
                      { label: '16avos',    val: entry.desglose?.dieciseisavos,  show: true },
                      { label: '8vos',      val: entry.desglose?.octavos,        show: true },
                      { label: '4tos',      val: entry.desglose?.cuartos,        show: true },
                      { label: 'Semis',     val: entry.desglose?.semis,          show: true },
                      { label: 'Especiales',val: entry.desglose?.especiales,     show: true },
                    ].filter(f => f.show).map(f => (
                      <span key={f.label}>
                        {f.label}: <strong className={(f.val ?? 0) > 0 ? 'text-yellow-400' : 'text-white'}>{f.val ?? 0}</strong>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-3xl font-black text-yellow-400 shrink-0">{entry.puntos}</div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-600 mt-8">
          Los puntos se recalculan automáticamente al cargar cada resultado
        </p>
      </div>
    </main>
  );
}
