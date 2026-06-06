'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';
import { SELECCIONES } from '@/types';
import { getSession } from '@/lib/authService';
import { getDocument } from '@/lib/firebase';

// Deadlines en hora Bolivia
const DEADLINES = {
  fase1:  new Date('2026-06-10T23:59:00-04:00'),
  octavos: new Date('2026-06-29T11:00:00-04:00'),
  cuartos: new Date('2026-07-04T11:00:00-04:00'),
  semis:   new Date('2026-07-14T11:00:00-04:00'),
};

type Fase = 'fase1' | 'octavos' | 'cuartos' | 'semis';

const FASES = [
  { id: 'fase1'  as Fase, label: '📋 Fase 1 – Grupos',    deadline: DEADLINES.fase1,   desc: 'Especiales + todos los partidos de grupos' },
  { id: 'octavos'as Fase, label: '⚔️ Fase 2 – Octavos',   deadline: DEADLINES.octavos, desc: '8 equipos clasificados a cuartos' },
  { id: 'cuartos'as Fase, label: '🔥 Fase 3 – Cuartos',   deadline: DEADLINES.cuartos, desc: '4 equipos clasificados a semifinales' },
  { id: 'semis'  as Fase, label: '🌟 Fase 4 – Semis',     deadline: DEADLINES.semis,   desc: '2 equipos finalistas' },
];

const GRUPOS_LETRAS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

// Equipos reales por grupo para las fases eliminatorias
const TODOS_EQUIPOS = Array.from(new Set(PARTIDOS_GRUPOS.flatMap(p => [p.local, p.visitante]))).sort();

interface FormFase1 { campeon: string; subcampeon: string; semi1: string; semi2: string; semi3: string; semi4: string; maxGoleador: string; [key: string]: string; }

function faseAbierta(fase: Fase) { return new Date() < DEADLINES[fase]; }
function formatDeadline(d: Date) {
  return d.toLocaleString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

async function enviarEmail(fase: string, email: string, nombre: string, datos: unknown) {
  try {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, nombre, fase, datos }),
    });
  } catch { /* email opcional */ }
}

export default function PronosticosPage() {
  const [faseActiva, setFaseActiva] = useState<Fase>('fase1');
  const [session, setSession] = useState<{ uid: string; name: string; token: string } | null>(null);
  const [participante, setParticipante] = useState<Record<string, unknown> | null>(null);
  const [enviado, setEnviado] = useState<Partial<Record<Fase, boolean>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (s?.uid) {
      getDocument('participantes', s.uid)
        .then(p => {
          setParticipante(p as Record<string, unknown>);
          // Detectar qué fases ya tiene guardadas
          const env: Partial<Record<Fase, boolean>> = {};
          const pp = p as Record<string, unknown>;
          if (pp.pronosticosGrupos && Object.keys(pp.pronosticosGrupos as object).length > 0) env.fase1 = true;
          if (pp.octavos && (pp.octavos as string[]).length > 0) env.octavos = true;
          if (pp.cuartos && (pp.cuartos as string[]).length > 0) env.cuartos = true;
          if (pp.semis && (pp.semis as string[]).length > 0) env.semis = true;
          setEnviado(env);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <Cargando />;
  if (!session) return <Cargando mensaje="Iniciá sesión para ver tus pronósticos" />;

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-1">🎯 Mis Pronósticos</h1>
          <p className="text-green-300">Hola, <strong>{session.name}</strong> · Quiniela Vilaseca 2026</p>
        </div>

        {/* Tabs de fases */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
          {FASES.map(f => {
            const abierta = faseAbierta(f.id);
            const done = enviado[f.id];
            return (
              <button key={f.id} onClick={() => setFaseActiva(f.id)}
                className={`rounded-xl p-3 text-left transition-all border ${
                  faseActiva === f.id
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : done ? 'bg-green-900/40 border-green-600/40 text-green-300'
                    : abierta ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    : 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed'
                }`}>
                <div className="text-xs font-bold mb-1">{f.label}</div>
                <div className={`text-xs ${faseActiva === f.id ? 'text-black/70' : 'text-gray-500'}`}>
                  {done ? '✓ Enviado' : abierta ? '⏳ Abierta' : '🔒 Cerrada'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Contenido de la fase activa */}
        {faseActiva === 'fase1' && (
          <Fase1
            session={session}
            participante={participante}
            yaEnviado={!!enviado.fase1}
            onEnviado={() => setEnviado(e => ({ ...e, fase1: true }))}
          />
        )}
        {faseActiva === 'octavos' && (
          <FaseElim
            fase="octavos"
            label="Octavos de Final"
            cantidad={8}
            instruccion="Seleccioná los 8 equipos que clasificarán a cuartos de final"
            session={session}
            participante={participante}
            yaEnviado={!!enviado.octavos}
            onEnviado={() => setEnviado(e => ({ ...e, octavos: true }))}
          />
        )}
        {faseActiva === 'cuartos' && (
          <FaseElim
            fase="cuartos"
            label="Cuartos de Final"
            cantidad={4}
            instruccion="Seleccioná los 4 equipos que clasificarán a semifinales"
            session={session}
            participante={participante}
            yaEnviado={!!enviado.cuartos}
            onEnviado={() => setEnviado(e => ({ ...e, cuartos: true }))}
          />
        )}
        {faseActiva === 'semis' && (
          <FaseElim
            fase="semis"
            label="Semifinales"
            cantidad={2}
            instruccion="Seleccioná los 2 equipos que llegarán a la Final"
            session={session}
            participante={participante}
            yaEnviado={!!enviado.semis}
            onEnviado={() => setEnviado(e => ({ ...e, semis: true }))}
          />
        )}
      </div>
    </main>
  );
}

// ─── Fase 1: Especiales + Grupos ─────────────────────────────────────────────
function Fase1({ session, participante, yaEnviado, onEnviado }: {
  session: { uid: string; name: string; token: string };
  participante: Record<string, unknown> | null;
  yaEnviado: boolean;
  onEnviado: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormFase1>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [grupoActivo, setGrupoActivo] = useState('A');
  const abierta = faseAbierta('fase1');

  const gruposByLetter = PARTIDOS_GRUPOS.reduce<Record<string, typeof PARTIDOS_GRUPOS>>((acc, p) => {
    const g = p.grupo ?? 'X';
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});

  async function onSubmit(data: FormFase1) {
    setLoading(true); setError('');
    try {
      const pronosticosGrupos: Record<string, { golesLocal: number; golesVisitante: number }> = {};
      for (const p of PARTIDOS_GRUPOS) {
        pronosticosGrupos[p.id] = {
          golesLocal: parseInt(data[`${p.id}_local`] ?? '0'),
          golesVisitante: parseInt(data[`${p.id}_visitante`] ?? '0'),
        };
      }
      const especiales = {
        campeon: data.campeon, subcampeon: data.subcampeon,
        semifinalistas: [data.semi1, data.semi2, data.semi3, data.semi4],
        maxGoleador: data.maxGoleador,
      };

      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: session.uid,
          nombre: participante?.nombre ?? session.name,
          telefono: participante?.telefono ?? '',
          email: participante?.email ?? '',
          pronosticosEspeciales: especiales,
          pronosticosGrupos,
        }),
      });
      if (!res.ok) throw new Error('Error al guardar');

      // Email de confirmación
      await enviarEmail('fase1', participante?.email as string ?? '', session.name, {
        especiales, grupos: pronosticosGrupos,
      });

      onEnviado();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  const prev = participante?.pronosticosEspeciales as Record<string, unknown> | undefined;

  if (yaEnviado) {
    return (
      <div className="bg-green-900/30 border border-green-600/40 rounded-2xl p-6 text-center">
        <div className="text-5xl mb-3">✅</div>
        <h2 className="text-xl font-black text-green-400 mb-2">¡Fase 1 enviada!</h2>
        <p className="text-gray-300 mb-4">Tus pronósticos de grupos y especiales están guardados. Revisá tu email.</p>
        {prev && (
          <div className="text-left bg-black/20 rounded-xl p-4 text-sm space-y-1">
            <p>🏆 Campeón: <strong>{prev.campeon as string}</strong></p>
            <p>🥈 Subcampeón: <strong>{prev.subcampeon as string}</strong></p>
            <p>⭐ Semis: <strong>{(prev.semifinalistas as string[])?.join(', ')}</strong></p>
            <p>⚽ Goleador: <strong>{prev.maxGoleador as string}</strong></p>
          </div>
        )}
      </div>
    );
  }

  if (!abierta) return <FaseCerrada deadline={DEADLINES.fase1} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <DeadlineBanner deadline={DEADLINES.fase1} />

      {/* Especiales */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-black text-yellow-400">⭐ Pronósticos Especiales</h2>
        <SelectEquipo label="🏆 Campeón del Mundial (50 pts)" name="campeon" register={register} errors={errors} />
        <SelectEquipo label="🥈 Subcampeón (25 pts)" name="subcampeon" register={register} errors={errors} />
        <SelectEquipo label="Semifinalista #1 (10 pts)" name="semi1" register={register} errors={errors} />
        <SelectEquipo label="Semifinalista #2 (10 pts)" name="semi2" register={register} errors={errors} />
        <SelectEquipo label="Semifinalista #3 (10 pts)" name="semi3" register={register} errors={errors} />
        <SelectEquipo label="Semifinalista #4 (10 pts)" name="semi4" register={register} errors={errors} />
        <div>
          <label className="block text-sm text-gray-300 mb-1">⚽ Máximo Goleador (20 pts) *</label>
          <input {...register('maxGoleador', { required: true })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
            placeholder="Nombre del jugador" />
        </div>
      </div>

      {/* Grupos */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-black text-green-400 mb-4">🗓️ Fase de Grupos</h2>

        {/* Selector de grupo */}
        <div className="flex flex-wrap gap-2 mb-5">
          {GRUPOS_LETRAS.filter(g => gruposByLetter[g]).map(g => (
            <button type="button" key={g} onClick={() => setGrupoActivo(g)}
              className={`w-10 h-10 rounded-lg font-black text-sm transition-colors ${grupoActivo === g ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              {g}
            </button>
          ))}
        </div>

        <h3 className="text-sm font-bold text-green-400 mb-3">Grupo {grupoActivo}</h3>
        <div className="space-y-3">
          {(gruposByLetter[grupoActivo] ?? []).map(partido => (
            <div key={partido.id} className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-2">📍 {partido.sede}, {partido.ciudad}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold flex-1 text-right">{partido.local}</span>
                <input {...register(`${partido.id}_local`)} type="number" min="0" max="20" defaultValue="0"
                  className="w-14 text-center bg-white/10 border border-white/20 rounded-lg py-2 text-white focus:outline-none focus:border-yellow-400" />
                <span className="text-gray-500 font-bold">-</span>
                <input {...register(`${partido.id}_visitante`)} type="number" min="0" max="20" defaultValue="0"
                  className="w-14 text-center bg-white/10 border border-white/20 rounded-lg py-2 text-white focus:outline-none focus:border-yellow-400" />
                <span className="text-sm font-semibold flex-1">{partido.visitante}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 disabled:opacity-50 text-black font-black py-4 rounded-2xl text-lg transition-all">
        {loading ? '⏳ Guardando...' : '✅ Enviar pronósticos Fase 1'}
      </button>
      <p className="text-xs text-gray-500 text-center">Recibirás un email con tus pronósticos al enviar.</p>
    </form>
  );
}

// ─── Fases eliminatorias ──────────────────────────────────────────────────────
function FaseElim({ fase, label, cantidad, instruccion, session, participante, yaEnviado, onEnviado }: {
  fase: Fase; label: string; cantidad: number; instruccion: string;
  session: { uid: string; name: string; token: string };
  participante: Record<string, unknown> | null;
  yaEnviado: boolean;
  onEnviado: () => void;
}) {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abierta = faseAbierta(fase);

  const previos = participante?.[fase] as string[] | undefined;

  function toggle(equipo: string) {
    setSeleccionados(prev =>
      prev.includes(equipo) ? prev.filter(e => e !== equipo) : prev.length < cantidad ? [...prev, equipo] : prev
    );
  }

  async function enviar() {
    if (seleccionados.length !== cantidad) { setError(`Seleccioná exactamente ${cantidad} equipos`); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': 'self' },
        body: JSON.stringify({ id: session.uid, [fase]: seleccionados }),
      });
      // Si no tiene permisos de admin, usar endpoint de usuario
      if (res.status === 401) {
        await fetch('/api/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: session.uid,
            nombre: participante?.nombre ?? session.name,
            telefono: participante?.telefono ?? '',
            email: participante?.email ?? '',
            pronosticosEspeciales: participante?.pronosticosEspeciales ?? {},
            pronosticosGrupos: participante?.pronosticosGrupos ?? {},
            [fase]: seleccionados,
          }),
        });
      }

      await enviarEmail(fase, participante?.email as string ?? '', session.name, { equipos: seleccionados });
      onEnviado();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  if (yaEnviado && previos) {
    return (
      <div className="bg-green-900/30 border border-green-600/40 rounded-2xl p-6">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-xl font-black text-green-400">¡{label} enviado!</h2>
          <p className="text-gray-400 text-sm mt-1">Revisá tu email para ver el detalle.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {previos.map(e => (
            <div key={e} className="bg-green-800/30 border border-green-600/30 rounded-xl px-3 py-2 text-sm font-semibold">✓ {e}</div>
          ))}
        </div>
      </div>
    );
  }

  if (!abierta) return <FaseCerrada deadline={DEADLINES[fase]} />;

  return (
    <div className="space-y-5">
      <DeadlineBanner deadline={DEADLINES[fase]} />
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-black mb-1">{label}</h2>
        <p className="text-sm text-gray-400 mb-4">{instruccion}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">Seleccionados: <strong className={seleccionados.length === cantidad ? 'text-green-400' : 'text-yellow-400'}>{seleccionados.length}/{cantidad}</strong></span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TODOS_EQUIPOS.map(equipo => {
            const sel = seleccionados.includes(equipo);
            const lleno = seleccionados.length >= cantidad && !sel;
            return (
              <button key={equipo} type="button" onClick={() => !lleno && toggle(equipo)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                  sel ? 'bg-green-600 border-green-500 border text-white' :
                  lleno ? 'bg-white/3 border border-white/5 text-gray-600 cursor-not-allowed' :
                  'bg-white/10 border border-white/10 text-gray-300 hover:bg-white/20'
                }`}>
                {sel && '✓ '}{equipo}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button onClick={enviar} disabled={loading || seleccionados.length !== cantidad}
        className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 disabled:opacity-40 text-black font-black py-4 rounded-2xl text-lg transition-all">
        {loading ? '⏳ Guardando...' : `✅ Enviar pronósticos ${label}`}
      </button>
      <p className="text-xs text-gray-500 text-center">Recibirás un email con tus selecciones.</p>
    </div>
  );
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────
function DeadlineBanner({ deadline }: { deadline: Date }) {
  const restante = Math.max(0, deadline.getTime() - Date.now());
  const dias = Math.floor(restante / 86400000);
  const horas = Math.floor((restante % 86400000) / 3600000);
  return (
    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
      <span className="text-yellow-300">⏰ Cierra: <span className="capitalize">{formatDeadline(deadline)}</span></span>
      <span className="text-yellow-400 font-bold">{dias > 0 ? `${dias}d ${horas}h` : `${horas}h`}</span>
    </div>
  );
}

function FaseCerrada({ deadline }: { deadline: Date }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-gray-400 mb-2">Fase cerrada</h2>
      <p className="text-gray-500 text-sm">El plazo venció el <span className="capitalize">{formatDeadline(deadline)}</span></p>
    </div>
  );
}

function Cargando({ mensaje }: { mensaje?: string }) {
  return (
    <main className="min-h-screen bg-green-950 text-white flex items-center justify-center">
      <p className="text-gray-400">{mensaje ?? 'Cargando...'}</p>
    </main>
  );
}

function SelectEquipo({ label, name, register, errors }: {
  label: string; name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any; errors: any;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <select {...register(name, { required: true })}
        className="w-full bg-green-950 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400">
        <option value="">Seleccioná una selección...</option>
        {SELECCIONES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      {errors[name] && <p className="text-red-400 text-xs mt-1">Obligatorio</p>}
    </div>
  );
}
