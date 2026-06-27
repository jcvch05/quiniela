'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PARTIDOS_DIECISEISAVOS, DEADLINE_DIECISEISAVOS } from '@/lib/partidos';

interface UserSession { uid: string; name: string; }
interface Pred { golesLocal: string; golesVisitante: string; }

function horaBOT(fecha: string) {
  return fecha.includes('T') ? fecha.split('T')[1] + ' BOT' : '';
}

export default function EliminatoriasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [picks, setPicks] = useState<Record<string, Pred>>({});
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState('');
  const [yaGuardado, setYaGuardado] = useState(false);

  const deadline = new Date(DEADLINE_DIECISEISAVOS);
  const cerrado = new Date() > deadline;

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(({ user: u }) => {
        if (!u) { router.push('/login'); return; }
        setUser({ uid: u.uid, name: u.name });
        fetch('/api/participantes', { cache: 'no-store' })
          .then(r => r.json())
          .then((parts: Array<{ id: string; pronosticosDieciseisavos?: Record<string, Pred> }>) => {
            const p = parts.find(x => x.id === u.uid);
            if (p?.pronosticosDieciseisavos && Object.keys(p.pronosticosDieciseisavos).length > 0) {
              setPicks(p.pronosticosDieciseisavos);
              setYaGuardado(true);
            }
          });
      });
  }, [router]);

  function setGol(partidoId: string, campo: 'golesLocal' | 'golesVisitante', val: string) {
    if (cerrado) return;
    setPicks(prev => ({ ...prev, [partidoId]: { ...prev[partidoId] ?? { golesLocal: '', golesVisitante: '' }, [campo]: val } }));
    setYaGuardado(false);
  }

  async function guardar() {
    if (!user) return;
    setGuardando(true);
    setMsg('');
    try {
      const res = await fetch('/api/pronosticos-eliminatorias', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, pronosticosDieciseisavos: picks }),
      });
      const json = await res.json();
      if (res.ok) { setMsg('✅ Apuestas guardadas'); setYaGuardado(true); }
      else setMsg(`❌ ${json.error}`);
    } catch { setMsg('❌ Error de red'); }
    finally { setGuardando(false); }
  }

  const disponibles = PARTIDOS_DIECISEISAVOS.filter(p => p.local !== 'Por confirmar' && p.visitante !== 'Por confirmar');
  const completados = disponibles.filter(p => picks[p.id]?.golesLocal !== '' && picks[p.id]?.golesVisitante !== '' && picks[p.id]?.golesLocal !== undefined).length;

  const porFecha = PARTIDOS_DIECISEISAVOS.reduce((acc, p) => {
    const f = p.fecha.split('T')[0];
    if (!acc[f]) acc[f] = [];
    acc[f].push(p);
    return acc;
  }, {} as Record<string, typeof PARTIDOS_DIECISEISAVOS>);

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-yellow-400 mb-1">⚔️ Dieciseisavos</h1>
          <p className="text-gray-400 text-sm">Predice el marcador · Exacto: 10pts · Diferencia: 5pts · Ganador: 3pts</p>
          {user && <p className="text-green-300 text-sm mt-1">👤 {user.name}</p>}
        </div>

        <div className={`rounded-xl px-4 py-3 mb-6 text-center text-sm font-semibold ${cerrado ? 'bg-red-900/30 border border-red-500/40 text-red-300' : 'bg-yellow-400/10 border border-yellow-400/30 text-yellow-300'}`}>
          {cerrado
            ? '🔒 Plazo cerrado — las apuestas ya no se pueden modificar'
            : `⏰ Cierra el 28 jun a las 14:00 BOT · ${completados}/${disponibles.length} completados`}
        </div>

        {Object.entries(porFecha).map(([fecha, partidos]) => (
          <div key={fecha} className="mb-6">
            <h2 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-3">
              {new Date(fecha + 'T12:00:00').toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <div className="space-y-3">
              {partidos.map(p => {
                const porConfirmar = p.local === 'Por confirmar' || p.visitante === 'Por confirmar';
                const pred = picks[p.id];
                const completo = pred?.golesLocal !== '' && pred?.golesLocal !== undefined && pred?.golesVisitante !== '' && pred?.golesVisitante !== undefined;
                return (
                  <div key={p.id} className={`rounded-2xl border p-4 ${porConfirmar ? 'border-white/5 opacity-40' : completo ? 'border-yellow-400/40 bg-yellow-400/5' : 'border-white/10 bg-white/5'}`}>
                    <p className="text-xs text-gray-500 text-center mb-3">
                      {horaBOT(p.fecha)} · 📍 {p.sede}, {p.ciudad}
                    </p>
                    {porConfirmar ? (
                      <p className="text-center text-gray-500 text-sm italic">Por confirmar tras grupos</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="flex-1 text-right font-bold text-base leading-tight">{p.local}</span>
                        <input type="number" min="0" max="20" placeholder="?" disabled={cerrado}
                          value={pred?.golesLocal ?? ''}
                          onChange={e => setGol(p.id, 'golesLocal', e.target.value)}
                          className="w-14 text-center font-black text-xl bg-gray-800 border border-white/20 rounded-lg py-2 text-white disabled:opacity-50" />
                        <span className="text-gray-500 font-black">-</span>
                        <input type="number" min="0" max="20" placeholder="?" disabled={cerrado}
                          value={pred?.golesVisitante ?? ''}
                          onChange={e => setGol(p.id, 'golesVisitante', e.target.value)}
                          className="w-14 text-center font-black text-xl bg-gray-800 border border-white/20 rounded-lg py-2 text-white disabled:opacity-50" />
                        <span className="flex-1 text-left font-bold text-base leading-tight">{p.visitante}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {!cerrado && (
          <div className="sticky bottom-4">
            <button onClick={guardar} disabled={guardando || completados === 0}
              className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-black text-lg py-4 rounded-2xl shadow-lg shadow-yellow-400/20 transition-all">
              {guardando ? '⏳ Guardando…' : yaGuardado ? '✅ Guardado' : `💾 Guardar (${completados}/${disponibles.length})`}
            </button>
            {msg && <p className="text-center text-sm mt-2 font-semibold">{msg}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
