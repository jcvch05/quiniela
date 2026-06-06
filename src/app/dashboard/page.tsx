'use client';

import { useEffect, useState, useCallback } from 'react';

interface DashData {
  timestamp: string;
  sistema: { firestoreMs: number; firestoreOk: boolean; partidos_cargados: number; ultimo_resultado: string | null };
  stats: { total: number; pagados: number; pendientes_pago: number; pozo_bs: number; con_fase1: number; con_octavos: number; con_cuartos: number; con_semis: number };
  emails: { total: number; enviados_ok: number; fallidos: number; recientes: EmailLog[] };
  participantes: Participante[];
}

interface EmailLog { id: string; to: string; nombre: string; fase: string; ok: boolean; error?: string; timestamp: string }
interface Participante { id: string; nombre: string; telefono: string; email: string; pagado: boolean; puntos: number; fechaRegistro: string; fases: { f1: boolean; f2: boolean; f3: boolean; f4: boolean }; campeon: string }

const REFRESH = 30_000;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const ADMIN_PWD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'vilaseca2026';

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(REFRESH / 1000);
  const [tab, setTab] = useState<'overview' | 'participantes' | 'emails' | 'sistema'>('overview');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard', { headers: { 'x-admin-password': ADMIN_PWD }, cache: 'no-store' });
      if (!res.ok) { setError('Error al cargar datos'); return; }
      const json = await res.json();
      setData(json);
      setCountdown(REFRESH / 1000);
      setError('');
    } catch { setError('Error de conexión'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(() => fetchData(), REFRESH);
    return () => clearInterval(iv);
  }, [fetchData]);

  useEffect(() => {
    const tick = setInterval(() => setCountdown(c => c <= 1 ? REFRESH / 1000 : c - 1), 1000);
    return () => clearInterval(tick);
  }, []);

  async function togglePago(id: string, pagado: boolean) {
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PWD },
      body: JSON.stringify({ id, pagado: !pagado }),
    });
    fetchData();
  }

  if (loading && !data) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">📊</div>
        <p className="text-gray-400">Cargando dashboard...</p>
      </div>
    </main>
  );

  if (error && !data) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </main>
  );

  if (!data) return null;

  const { stats, emails, sistema, participantes } = data;
  const premios = { p1: Math.round(stats.pozo_bs * 0.6), p2: Math.round(stats.pozo_bs * 0.25), p3: Math.round(stats.pozo_bs * 0.15) };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-white/10 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-black text-lg">📊 Dashboard · Quiniela Vilaseca</h1>
            <p className="text-xs text-gray-400">Última actualización: {formatTime(data.timestamp)} · actualiza en {countdown}s</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${sistema.firestoreOk ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            <span className="text-xs text-gray-400 hidden sm:block">{sistema.firestoreOk ? 'Sistema OK' : 'Error Firestore'}</span>
            <button onClick={() => fetchData()} disabled={loading}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors ml-2">
              {loading ? '⏳' : '↻ Actualizar'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Inscritos" value={stats.total} icon="👥" color="blue" />
          <StatCard label="Pagados" value={stats.pagados} sub={`${stats.pendientes_pago} pendientes`} icon="✅" color="green" />
          <StatCard label="Pozo total" value={`${stats.pozo_bs} Bs`} sub={`1°: ${premios.p1} · 2°: ${premios.p2} · 3°: ${premios.p3}`} icon="💰" color="yellow" />
          <StatCard label="Emails enviados" value={emails.enviados_ok} sub={emails.fallidos > 0 ? `⚠️ ${emails.fallidos} fallidos` : 'Sin errores'} icon="✉️" color={emails.fallidos > 0 ? 'red' : 'green'} />
        </div>

        {/* Progreso de fases */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
          <h2 className="font-bold text-gray-300 mb-4">📋 Progreso de pronósticos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Fase 1 – Grupos', count: stats.con_fase1, color: 'green' },
              { label: 'Fase 2 – Octavos', count: stats.con_octavos, color: 'blue' },
              { label: 'Fase 3 – Cuartos', count: stats.con_cuartos, color: 'orange' },
              { label: 'Fase 4 – Semis', count: stats.con_semis, color: 'purple' },
            ].map(f => (
              <div key={f.label} className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-yellow-400">{f.count}</div>
                <div className="text-xs text-gray-400 mt-1">{f.label}</div>
                <div className="mt-2 bg-white/10 rounded-full h-1.5">
                  <div className="bg-green-400 h-1.5 rounded-full transition-all"
                    style={{ width: stats.total > 0 ? `${(f.count / stats.total) * 100}%` : '0%' }} />
                </div>
                <div className="text-xs text-gray-500 mt-1">{stats.total > 0 ? Math.round((f.count / stats.total) * 100) : 0}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-0">
          {(['overview', 'participantes', 'emails', 'sistema'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${tab === t ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
              {t === 'overview' ? '🏠 Resumen' : t === 'participantes' ? '👥 Participantes' : t === 'emails' ? '✉️ Emails' : '⚙️ Sistema'}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {tab === 'overview' && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg">Participantes recientes</h2>
            <div className="space-y-2">
              {participantes.slice(0, 5).map(p => (
                <div key={p.id} className="bg-gray-900 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-400">{p.telefono} · registrado {timeAgo(p.fechaRegistro)}</p>
                  </div>
                  <div className="flex gap-1">
                    <FaseBadge ok={p.fases.f1} label="F1" />
                    <FaseBadge ok={p.fases.f2} label="F2" />
                    <FaseBadge ok={p.fases.f3} label="F3" />
                    <FaseBadge ok={p.fases.f4} label="F4" />
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.pagado ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.pagado ? '✓ Pagado' : 'Pendiente'}
                  </span>
                  <span className="text-xl font-black text-yellow-400 w-12 text-right">{p.puntos}</span>
                </div>
              ))}
              {participantes.length > 5 && (
                <button onClick={() => setTab('participantes')} className="w-full text-center text-sm text-gray-400 hover:text-white py-2">
                  Ver todos ({participantes.length}) →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab: Participantes */}
        {tab === 'participantes' && (
          <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-3">Nombre</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Teléfono</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Email</th>
                    <th className="px-4 py-3">Pago</th>
                    <th className="px-4 py-3">F1</th>
                    <th className="px-4 py-3">F2</th>
                    <th className="px-4 py-3">F3</th>
                    <th className="px-4 py-3">F4</th>
                    <th className="px-4 py-3 hidden md:table-cell">Campeón</th>
                    <th className="px-4 py-3">Pts</th>
                    <th className="px-4 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {participantes.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-semibold">{p.nombre}</td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{p.telefono}</td>
                      <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">{p.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${p.pagado ? 'text-green-400' : 'text-red-400'}`}>
                          {p.pagado ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center"><FaseBadge ok={p.fases.f1} label="F1" /></td>
                      <td className="px-4 py-3 text-center"><FaseBadge ok={p.fases.f2} label="F2" /></td>
                      <td className="px-4 py-3 text-center"><FaseBadge ok={p.fases.f3} label="F3" /></td>
                      <td className="px-4 py-3 text-center"><FaseBadge ok={p.fases.f4} label="F4" /></td>
                      <td className="px-4 py-3 text-gray-300 hidden md:table-cell text-xs">{p.campeon}</td>
                      <td className="px-4 py-3 text-center font-black text-yellow-400">{p.puntos}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => togglePago(p.id, p.pagado)}
                          className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${p.pagado ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'}`}>
                          {p.pagado ? 'Revertir' : 'Confirmar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {participantes.length === 0 && <p className="text-center text-gray-500 py-10">Aún no hay participantes</p>}
            </div>
          </div>
        )}

        {/* Tab: Emails */}
        {tab === 'emails' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total enviados" value={emails.total} icon="✉️" color="blue" />
              <StatCard label="Exitosos" value={emails.enviados_ok} icon="✅" color="green" />
              <StatCard label="Fallidos" value={emails.fallidos} icon="❌" color={emails.fallidos > 0 ? 'red' : 'green'} />
            </div>

            <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <h2 className="font-bold">Últimos emails</h2>
              </div>
              <div className="divide-y divide-white/5">
                {emails.recientes.length === 0 && <p className="text-center text-gray-500 py-8">No hay emails registrados</p>}
                {emails.recientes.map(log => (
                  <div key={log.id} className="px-4 py-3 flex items-center gap-3">
                    <span className="text-lg">{log.ok ? '✅' : '❌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{log.nombre} <span className="text-gray-400 font-normal">→ {log.to}</span></p>
                      {log.error && <p className="text-xs text-red-400">{log.error}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      log.fase === 'fase1' ? 'bg-green-900/50 text-green-300' :
                      log.fase === 'octavos' ? 'bg-blue-900/50 text-blue-300' :
                      log.fase === 'cuartos' ? 'bg-orange-900/50 text-orange-300' :
                      'bg-purple-900/50 text-purple-300'
                    }`}>{log.fase}</span>
                    <span className="text-xs text-gray-500 shrink-0">{timeAgo(log.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Sistema */}
        {tab === 'sistema' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SistemaCard
                label="Firestore"
                ok={sistema.firestoreOk}
                detail={`Respuesta: ${sistema.firestoreMs}ms`}
                icon="🗄️"
              />
              <SistemaCard
                label="Fixture / Resultados"
                ok={true}
                detail={`${sistema.partidos_cargados} resultados cargados${sistema.ultimo_resultado ? ` · último: ${sistema.ultimo_resultado}` : ''}`}
                icon="📅"
              />
              <SistemaCard
                label="Emails (Resend)"
                ok={emails.fallidos === 0}
                detail={`${emails.enviados_ok} enviados · ${emails.fallidos} errores`}
                icon="✉️"
              />
            </div>

            <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 space-y-3">
              <h2 className="font-bold">🔗 Links de la app</h2>
              {[
                { label: 'Página pública', url: 'https://quiniela-gray.vercel.app' },
                { label: 'Tabla de posiciones', url: 'https://quiniela-gray.vercel.app/tabla' },
                { label: 'Fixture', url: 'https://quiniela-gray.vercel.app/fixture' },
                { label: 'Admin', url: 'https://quiniela-gray.vercel.app/admin' },
              ].map(l => (
                <div key={l.label} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-gray-300">{l.label}</span>
                  <a href={l.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 underline">{l.url}</a>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
              <h2 className="font-bold mb-3">⏰ Deadlines de fases</h2>
              <div className="space-y-2 text-sm">
                {[
                  { fase: 'Fase 1 – Grupos', deadline: '10 jun 2026, 23:59 BOT' },
                  { fase: 'Fase 2 – Octavos', deadline: '29 jun 2026, 11:00 BOT' },
                  { fase: 'Fase 3 – Cuartos', deadline: '4 jul 2026, 11:00 BOT' },
                  { fase: 'Fase 4 – Semis', deadline: '14 jul 2026, 11:00 BOT' },
                ].map(d => {
                  const vencido = new Date() > new Date(d.deadline.replace('10 jun', 'Jun 10').replace('29 jun', 'Jun 29').replace('4 jul', 'Jul 4').replace('14 jul', 'Jul 14').replace('BOT', '-04:00'));
                  return (
                    <div key={d.fase} className="flex justify-between items-center py-1.5 border-b border-white/5">
                      <span className="text-gray-300">{d.fase}</span>
                      <span className={`text-xs font-semibold ${vencido ? 'text-red-400' : 'text-green-400'}`}>
                        {vencido ? '🔒 Cerrada' : '⏳ Abierta'} · {d.deadline}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-900/30 border-blue-700/40', green: 'bg-green-900/30 border-green-700/40',
    yellow: 'bg-yellow-900/30 border-yellow-700/40', red: 'bg-red-900/30 border-red-700/40',
    purple: 'bg-purple-900/30 border-purple-700/40',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color] ?? colors.blue}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl md:text-3xl font-black">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function SistemaCard({ label, ok, detail, icon }: { label: string; ok: boolean; detail: string; icon: string }) {
  return (
    <div className={`rounded-2xl border p-5 ${ok ? 'bg-green-900/20 border-green-700/40' : 'bg-red-900/20 border-red-700/40'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ok ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {ok ? '● OK' : '● Error'}
        </span>
      </div>
      <h3 className="font-bold mb-1">{label}</h3>
      <p className="text-xs text-gray-400">{detail}</p>
    </div>
  );
}

function FaseBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ok ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-600'}`}>
      {label}
    </span>
  );
}
