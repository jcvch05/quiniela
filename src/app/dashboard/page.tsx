'use client';

import { useEffect, useState, useCallback } from 'react';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';

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

// La contraseña nunca llega al navegador — el fetch usa una cookie de sesión
// El servidor valida que el uid del cookie corresponda al admin

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(REFRESH / 1000);
  const [tab, setTab] = useState<'overview' | 'participantes' | 'emails' | 'sistema'>('overview');
  const [enviandoMasivo, setEnviandoMasivo] = useState(false);
  const [resultadoMasivo, setResultadoMasivo] = useState<{ enviados: number; fallidos: number; total: number } | null>(null);
  const [resultadoForm, setResultadoForm] = useState({ partidoId: '', golesLocal: '', golesVisitante: '', video: '' });
  const [guardandoResultado, setGuardandoResultado] = useState(false);
  const [msgResultado, setMsgResultado] = useState('');
  const [resultadosSistema, setResultadosSistema] = useState<Record<string, { golesLocal: number; golesVisitante: number }>>({});

  const HEADERS = { 'Content-Type': 'application/json' };
  const OPTS = { credentials: 'include' as const };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard', { ...OPTS, cache: 'no-store' });
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
    fetch('/api/resultados-publicos', { cache: 'no-store' })
      .then(r => r.json())
      .then((data: Array<{ id: string; golesLocal: number; golesVisitante: number; jugado: boolean }>) => {
        const map: Record<string, { golesLocal: number; golesVisitante: number }> = {};
        for (const r of data) if (r.jugado) map[r.id] = { golesLocal: r.golesLocal, golesVisitante: r.golesVisitante };
        setResultadosSistema(map);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setCountdown(c => c <= 1 ? REFRESH / 1000 : c - 1), 1000);
    return () => clearInterval(tick);
  }, []);

  async function togglePago(id: string, pagado: boolean) {
    await fetch('/api/admin', {
      ...OPTS, method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({ id, pagado: !pagado }),
    });
    fetchData();
  }

  async function enviarEmailsMasivo() {
    if (!confirm(`¿Enviar los pronósticos de todos los participantes con Fase 1 a tu correo?\nEsto puede tardar unos segundos.`)) return;
    setEnviandoMasivo(true);
    setResultadoMasivo(null);
    try {
      const res = await fetch('/api/admin/email-masivo', {
        ...OPTS, method: 'POST',
        headers: HEADERS,
      });
      const json = await res.json();
      if (res.ok) setResultadoMasivo(json);
      else alert('Error: ' + (json.error ?? 'desconocido'));
    } catch { alert('Error de conexión'); }
    finally { setEnviandoMasivo(false); }
  }

  async function guardarResultado() {
    const { partidoId, golesLocal, golesVisitante } = resultadoForm;
    if (!partidoId || golesLocal === '' || golesVisitante === '') return;
    setGuardandoResultado(true);
    setMsgResultado('');
    try {
      const res = await fetch('/api/resultados', {
        ...OPTS, method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ partidoId: partidoId.toUpperCase(), golesLocal: Number(golesLocal), golesVisitante: Number(golesVisitante), video: resultadoForm.video || undefined }),
      });
      const json = await res.json();
      if (res.ok) {
        setMsgResultado('✅ Resultado guardado y puntos recalculados');
        setResultadoForm({ partidoId: '', golesLocal: '', golesVisitante: '', video: '' });
        fetchData();
      } else {
        setMsgResultado(`❌ Error: ${json.error ?? res.status}`);
      }
    } catch (e) {
      setMsgResultado(`❌ Error de red: ${e instanceof Error ? e.message : 'desconocido'}`);
    } finally {
      setGuardandoResultado(false);
    }
  }

  async function borrarParticipante(id: string, nombre: string) {
    if (!confirm(`¿Borrar a "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
    const res = await fetch('/api/admin', {
      ...OPTS, method: 'DELETE',
      headers: HEADERS,
      body: JSON.stringify({ id }),
    });
    if (!res.ok) alert('Error al borrar. Intenta de nuevo.');
    else fetchData();
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
            {/* Pendientes de pago destacados */}
            {participantes.filter(p => !p.pagado).length > 0 && (
              <div className="bg-orange-900/30 border border-orange-700/40 rounded-2xl p-4">
                <h2 className="font-bold text-orange-400 mb-3">⏳ Pendientes de confirmar pago ({participantes.filter(p => !p.pagado).length})</h2>
                <div className="space-y-2">
                  {participantes.filter(p => !p.pagado).map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-black/20 rounded-xl px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{p.nombre}</p>
                        <p className="text-xs text-gray-400">{p.telefono} · {timeAgo(p.fechaRegistro)}</p>
                      </div>
                      <button onClick={() => togglePago(p.id, p.pagado)}
                        className="bg-green-500/20 hover:bg-green-500/40 text-green-400 font-bold text-sm px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
                        ✅ Confirmar pago
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <h2 className="font-bold text-lg">Todos los participantes</h2>
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
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => togglePago(p.id, p.pagado)}
                            className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${p.pagado ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'}`}>
                            {p.pagado ? 'Revertir' : 'Confirmar'}
                          </button>
                          <button onClick={() => borrarParticipante(p.id, p.nombre)}
                            className="text-xs px-2 py-1 rounded-lg font-semibold bg-red-900/40 hover:bg-red-900/60 text-red-400 transition-colors">
                            🗑️
                          </button>
                        </div>
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

            <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-5">
              <h2 className="font-bold mb-1">⚽ Cargar resultado de partido</h2>
              <p className="text-sm text-gray-400 mb-4">Ingresa el ID del partido (ej: G01) y el marcador final. Los puntos se recalculan automáticamente.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Partido</label>
                  <select value={resultadoForm.partidoId} onChange={e => setResultadoForm(f => ({ ...f, partidoId: e.target.value }))}
                    className="bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white w-full max-w-sm">
                    <option value="">— Selecciona un partido —</option>
                    {PARTIDOS_GRUPOS.map(p => {
                      const jugado = resultadosSistema[p.id];
                      return (
                        <option key={p.id} value={p.id}>
                          {jugado ? '✓ ' : ''}{p.id}: {p.local} vs {p.visitante}{jugado ? ` (${jugado.golesLocal}-${jugado.golesVisitante})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      {resultadoForm.partidoId ? PARTIDOS_GRUPOS.find(p => p.id === resultadoForm.partidoId)?.local ?? 'Local' : 'Local'}
                    </label>
                    <input value={resultadoForm.golesLocal} onChange={e => setResultadoForm(f => ({ ...f, golesLocal: e.target.value }))}
                      type="number" min="0" max="20" placeholder="0"
                      className="bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white w-16 text-center font-bold text-lg" />
                  </div>
                  <span className="text-2xl font-black text-gray-400 pb-1">-</span>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      {resultadoForm.partidoId ? PARTIDOS_GRUPOS.find(p => p.id === resultadoForm.partidoId)?.visitante ?? 'Visitante' : 'Visitante'}
                    </label>
                    <input value={resultadoForm.golesVisitante} onChange={e => setResultadoForm(f => ({ ...f, golesVisitante: e.target.value }))}
                      type="number" min="0" max="20" placeholder="0"
                      className="bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white w-16 text-center font-bold text-lg" />
                  </div>
                  <button onClick={guardarResultado} disabled={guardandoResultado || !resultadoForm.partidoId || resultadoForm.golesLocal === '' || resultadoForm.golesVisitante === ''}
                    className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-bold px-5 py-2 rounded-xl transition-colors">
                    {guardandoResultado ? '⏳' : '✅ Guardar'}
                  </button>
                </div>
                <input value={resultadoForm.video} onChange={e => setResultadoForm(f => ({ ...f, video: e.target.value }))}
                  type="url" placeholder="🎬 Link YouTube (opcional)"
                  className="bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white text-sm w-full mt-2" />
              </div>
              {msgResultado && <p className="mt-3 text-sm font-semibold">{msgResultado}</p>}
            </div>

            <div className="bg-gray-900 border border-white/10 rounded-2xl p-5">
              <h2 className="font-bold mb-3">📧 Envío masivo de pronósticos</h2>
              <p className="text-sm text-gray-400 mb-4">Envía los pronósticos de Fase 1 de todos los participantes a tu correo para que los reenvíes manualmente.</p>
              <button onClick={enviarEmailsMasivo} disabled={enviandoMasivo}
                className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold px-6 py-3 rounded-xl transition-colors">
                {enviandoMasivo ? '⏳ Enviando...' : '📤 Enviar todos los pronósticos a mi correo'}
              </button>
              {resultadoMasivo && (
                <div className="mt-4 text-sm">
                  <p className="text-green-400 font-semibold">✅ Enviados: {resultadoMasivo.enviados} / {resultadoMasivo.total}</p>
                  {resultadoMasivo.fallidos > 0 && <p className="text-red-400">❌ Fallidos: {resultadoMasivo.fallidos}</p>}
                </div>
              )}
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
