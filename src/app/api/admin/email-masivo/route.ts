import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getCollection, createDocument } from '@/lib/firebase';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Vilaseca@2026';
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Quiniela Vilaseca <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'jcarlos.vilaseca10@gmail.com';

const BANDERAS: Record<string, string> = {
  'México':'🇲🇽','Sudáfrica':'🇿🇦','Corea del Sur':'🇰🇷','Rep. Checa':'🇨🇿',
  'Canadá':'🇨🇦','Bosnia-Herz.':'🇧🇦','Qatar':'🇶🇦','Suiza':'🇨🇭',
  'Brasil':'🇧🇷','Marruecos':'🇲🇦','Haití':'🇭🇹','Escocia':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'EE.UU.':'🇺🇸','Paraguay':'🇵🇾','Australia':'🇦🇺','Turquía':'🇹🇷',
  'Alemania':'🇩🇪','Curazao':'🇨🇼','Costa de Marfil':'🇨🇮','Ecuador':'🇪🇨',
  'Países Bajos':'🇳🇱','Japón':'🇯🇵','Suecia':'🇸🇪','Túnez':'🇹🇳',
  'Bélgica':'🇧🇪','Egipto':'🇪🇬','Irán':'🇮🇷','Nueva Zelanda':'🇳🇿',
  'España':'🇪🇸','Cabo Verde':'🇨🇻','Arabia Saudita':'🇸🇦','Uruguay':'🇺🇾',
  'Francia':'🇫🇷','Senegal':'🇸🇳','Iraq':'🇮🇶','Noruega':'🇳🇴',
  'Argentina':'🇦🇷','Argelia':'🇩🇿','Austria':'🇦🇹','Jordania':'🇯🇴',
  'Portugal':'🇵🇹','R.D. Congo':'🇨🇩','Uzbekistán':'🇺🇿','Colombia':'🇨🇴',
  'Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Croacia':'🇭🇷','Ghana':'🇬🇭','Panamá':'🇵🇦',
};

function f(p: string) { return `${BANDERAS[p] ?? ''} ${p}`; }

function buildHtml(nombre: string, email: string, especiales: Record<string, unknown>, partidos: Record<string, { golesLocal: number; golesVisitante: number }>) {
  const semis = (especiales.semifinalistas as string[]) ?? [];
  const grupos = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  const grupoHTML = grupos.map(grupo => {
    const pgs = PARTIDOS_GRUPOS.filter(p => p.grupo === grupo);
    if (!pgs.length) return '';
    const rows = pgs.map(p => {
      const pron = partidos[p.id];
      const gl = pron?.golesLocal ?? 0;
      const gv = pron?.golesVisitante ?? 0;
      return `<tr>
        <td style="padding:5px 8px;text-align:right;color:#e2e8f0;font-size:13px;">${f(p.local)}</td>
        <td style="padding:5px 12px;text-align:center;font-weight:bold;color:#facc15;font-size:15px;white-space:nowrap;">${gl} - ${gv}</td>
        <td style="padding:5px 8px;text-align:left;color:#e2e8f0;font-size:13px;">${f(p.visitante)}</td>
      </tr>`;
    }).join('');
    return `<div style="margin-bottom:16px;">
      <p style="color:#4ade80;font-weight:bold;font-size:13px;margin:0 0 6px;letter-spacing:1px;">GRUPO ${grupo}</p>
      <table style="width:100%;border-collapse:collapse;background:#1e293b;border-radius:8px;overflow:hidden;">${rows}</table>
    </div>`;
  }).join('');

  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#fff;padding:32px;border-radius:16px;">
    <div style="text-align:center;margin-bottom:28px;">
      <h1 style="color:#facc15;font-size:26px;margin:0 0 4px;">⚽ Quiniela Mundialista 2026</h1>
      <p style="color:#86efac;margin:0;font-size:14px;">Familia Vilaseca</p>
    </div>
    <p style="font-size:15px;margin-bottom:8px;">Participante: <strong>${nombre}</strong></p>
    ${email ? `<p style="font-size:13px;color:#94a3b8;margin-bottom:24px;">📧 ${email}</p>` : ''}
    <div style="background:#1e293b;border:1px solid #166534;border-radius:12px;padding:20px;margin-bottom:20px;">
      <h2 style="color:#4ade80;margin:0 0 16px;font-size:16px;">⭐ Pronósticos Especiales</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#94a3b8;padding:7px 0;font-size:13px;width:40%;">🏆 Campeón (50 pts)</td><td style="font-weight:bold;font-size:14px;">${f(especiales.campeon as string)}</td></tr>
        <tr><td style="color:#94a3b8;padding:7px 0;font-size:13px;">🥈 Subcampeón (25 pts)</td><td style="font-weight:bold;font-size:14px;">${f(especiales.subcampeon as string)}</td></tr>
        <tr><td style="color:#94a3b8;padding:7px 0;font-size:13px;vertical-align:top;">⭐ Semifinalistas (10 c/u)</td><td style="font-weight:bold;font-size:13px;line-height:1.8;">${semis.map(s => f(s)).join('<br/>')}</td></tr>
        <tr><td style="color:#94a3b8;padding:7px 0;font-size:13px;">⚽ Máx. Goleador (20 pts)</td><td style="font-weight:bold;font-size:14px;">${especiales.maxGoleador as string}</td></tr>
      </table>
    </div>
    <div style="background:#1e293b;border:1px solid #1e3a5f;border-radius:12px;padding:20px;margin-bottom:20px;">
      <h2 style="color:#60a5fa;margin:0 0 16px;font-size:16px;">📊 Pronósticos de Grupos</h2>
      ${grupoHTML}
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

  const conF1 = participantes.filter(p =>
    p.pronosticosGrupos && Object.keys(p.pronosticosGrupos as object).length > 0
  );

  let enviados = 0;
  let fallidos = 0;
  const errores: string[] = [];

  for (const p of conF1) {
    const nombre = String(p.nombre ?? 'Participante');
    const email = String(p.email ?? '');
    const especiales = (p.pronosticosEspeciales as Record<string, unknown>) ?? {};
    const grupos = (p.pronosticosGrupos as Record<string, { golesLocal: number; golesVisitante: number }>) ?? {};

    try {
      const html = buildHtml(nombre, email, especiales, grupos);
      const subject = `✅ [${nombre}] Pronósticos Fase 1 - Quiniela Vilaseca 2026`;
      await resend.emails.send({ from: FROM, to: ADMIN_EMAIL, replyTo: email || undefined, subject, html });
      await logEmail(ADMIN_EMAIL, nombre, 'fase1-masivo', true);
      enviados++;
      // Pausa breve para no saturar la API de Resend
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      await logEmail(ADMIN_EMAIL, nombre, 'fase1-masivo', false, msg);
      errores.push(`${nombre}: ${msg}`);
      fallidos++;
    }
  }

  return NextResponse.json({ ok: true, enviados, fallidos, errores, total: conF1.length });
}
