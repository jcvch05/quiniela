import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getCollection, createDocument } from '@/lib/firebase';
import { PARTIDOS_OCTAVOS } from '@/lib/partidos';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Quiniela Vilaseca <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'jcarlos.vilaseca10@gmail.com';

const BANDERAS: Record<string, string> = {
  'Canadá':'🇨🇦','Marruecos':'🇲🇦','Paraguay':'🇵🇾','Francia':'🇫🇷',
  'Brasil':'🇧🇷','Noruega':'🇳🇴','México':'🇲🇽','Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'España':'🇪🇸','Portugal':'🇵🇹','EE.UU.':'🇺🇸','Bélgica':'🇧🇪',
  'Suiza':'🇨🇭','Argentina':'🇦🇷','Egipto':'🇪🇬','Colombia':'🇨🇴',
};

function f(p: string) { return `${BANDERAS[p] ?? ''} ${p}`; }

function buildHtml(nombre: string, email: string, pronosticosOctavos: Record<string, { golesLocal: number; golesVisitante: number }>) {
  const rows = PARTIDOS_OCTAVOS.map(p => {
    const pron = pronosticosOctavos[p.id];
    if (!pron) return `<tr>
      <td style="padding:5px 8px;text-align:right;color:#e2e8f0;font-size:13px;">${f(p.local)}</td>
      <td style="padding:5px 12px;text-align:center;color:#64748b;font-size:13px;">sin apuesta</td>
      <td style="padding:5px 8px;text-align:left;color:#e2e8f0;font-size:13px;">${f(p.visitante)}</td>
    </tr>`;
    return `<tr>
      <td style="padding:5px 8px;text-align:right;color:#e2e8f0;font-size:13px;">${f(p.local)}</td>
      <td style="padding:5px 12px;text-align:center;font-weight:bold;color:#facc15;font-size:15px;white-space:nowrap;">${pron.golesLocal} - ${pron.golesVisitante}</td>
      <td style="padding:5px 8px;text-align:left;color:#e2e8f0;font-size:13px;">${f(p.visitante)}</td>
    </tr>`;
  }).join('');

  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#fff;padding:32px;border-radius:16px;">
    <div style="text-align:center;margin-bottom:28px;">
      <h1 style="color:#facc15;font-size:26px;margin:0 0 4px;">⚡ Quiniela Mundialista 2026</h1>
      <p style="color:#86efac;margin:0;font-size:14px;">Familia Vilaseca · Fase Octavos de Final</p>
    </div>
    <p style="font-size:15px;margin-bottom:8px;">Participante: <strong>${nombre}</strong></p>
    ${email ? `<p style="font-size:13px;color:#94a3b8;margin-bottom:24px;">📧 ${email}</p>` : ''}
    <div style="background:#1e293b;border:1px solid #1e3a5f;border-radius:12px;padding:20px;margin-bottom:20px;">
      <h2 style="color:#60a5fa;margin:0 0 16px;font-size:16px;">⚡ Pronósticos Octavos de Final</h2>
      <table style="width:100%;border-collapse:collapse;background:#1e293b;border-radius:8px;overflow:hidden;">${rows}</table>
    </div>
    <p style="color:#64748b;font-size:12px;text-align:center;margin-top:16px;">Quiniela Mundialista 2026 · Familia Vilaseca · ¡Buena suerte! 🍀</p>
  </div>`;
}

async function logEmail(to: string, nombre: string, fase: string, ok: boolean, error?: string) {
  try {
    await createDocument('logs_email', `${Date.now()}-${to.split('@')[0]}`, {
      to, nombre, fase, ok, error: error ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch { /* log no crítico */ }
}

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY)
    return NextResponse.json({ error: 'RESEND_API_KEY no configurada' }, { status: 500 });

  const resend = new Resend(process.env.RESEND_API_KEY);

  const token = req.cookies.get('auth_token')?.value;
  const participantes = await getCollection('participantes', token) as Record<string, unknown>[];

  const conOctavos = participantes.filter(p =>
    p.pronosticosOctavos && Object.keys(p.pronosticosOctavos as object).length > 0
  );

  let enviados = 0;
  let fallidos = 0;
  const errores: string[] = [];

  for (const p of conOctavos) {
    const nombre = String(p.nombre ?? 'Participante');
    const email = String(p.email ?? '');
    const octavos = (p.pronosticosOctavos as Record<string, { golesLocal: number; golesVisitante: number }>) ?? {};

    try {
      const html = buildHtml(nombre, email, octavos);
      const subject = `⚡ [${nombre}] Pronósticos 8vos - Quiniela Vilaseca 2026`;
      await resend.emails.send({ from: FROM, to: ADMIN_EMAIL, replyTo: email || undefined, subject, html });
      await logEmail(ADMIN_EMAIL, nombre, 'octavos-masivo', true);
      enviados++;
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      await logEmail(ADMIN_EMAIL, nombre, 'octavos-masivo', false, msg);
      errores.push(`${nombre}: ${msg}`);
      fallidos++;
    }
  }

  return NextResponse.json({ ok: true, enviados, fallidos, errores, total: conOctavos.length });
}
