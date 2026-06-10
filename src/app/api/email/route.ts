import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createDocument } from '@/lib/firebase';
import { PARTIDOS_GRUPOS } from '@/lib/partidos';

// RESEND_FROM_EMAIL debe ser una dirección de un dominio verificado en Resend.
// onboarding@resend.dev solo entrega al email del dueño de la cuenta (modo prueba).
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Quiniela Vilaseca <onboarding@resend.dev>';

const FASES_VALIDAS = ['fase1', 'octavos', 'cuartos', 'semis'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function plantillaFase1(
  nombre: string,
  especiales: Record<string, unknown>,
  partidos: Record<string, { golesLocal: number; golesVisitante: number }>
) {
  const semis = (especiales.semifinalistas as string[]) ?? [];

  // Agrupar partidos por grupo con nombres de equipos
  const grupos = ['A','B','C','D','E','F','G','H','I','J','K','L'];
  const grupoHTML = grupos.map(grupo => {
    const partidosGrupo = PARTIDOS_GRUPOS.filter(p => p.grupo === grupo);
    if (partidosGrupo.length === 0) return '';

    const rows = partidosGrupo.map(p => {
      const pron = partidos[p.id];
      const gl = pron?.golesLocal ?? 0;
      const gv = pron?.golesVisitante ?? 0;
      return `
        <tr>
          <td style="padding:5px 8px;text-align:right;color:#e2e8f0;font-size:13px;">${f(p.local)}</td>
          <td style="padding:5px 12px;text-align:center;font-weight:bold;color:#facc15;font-size:15px;white-space:nowrap;">${gl} - ${gv}</td>
          <td style="padding:5px 8px;text-align:left;color:#e2e8f0;font-size:13px;">${f(p.visitante)}</td>
        </tr>`;
    }).join('');

    return `
      <div style="margin-bottom:16px;">
        <p style="color:#4ade80;font-weight:bold;font-size:13px;margin:0 0 6px;letter-spacing:1px;">GRUPO ${grupo}</p>
        <table style="width:100%;border-collapse:collapse;background:#1e293b;border-radius:8px;overflow:hidden;">
          ${rows}
        </table>
      </div>`;
  }).join('');

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#fff;padding:32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:28px;">
        <h1 style="color:#facc15;font-size:26px;margin:0 0 4px;">⚽ Quiniela Mundialista 2026</h1>
        <p style="color:#86efac;margin:0;font-size:14px;">Familia Vilaseca</p>
      </div>

      <p style="font-size:15px;margin-bottom:24px;">
        Hola <strong>${nombre}</strong>, tus pronósticos de <strong>Fase 1</strong> fueron registrados.
        Guardá este email como comprobante.
      </p>

      <!-- Especiales -->
      <div style="background:#1e293b;border:1px solid #166534;border-radius:12px;padding:20px;margin-bottom:20px;">
        <h2 style="color:#4ade80;margin:0 0 16px;font-size:16px;">⭐ Pronósticos Especiales</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#94a3b8;padding:7px 0;font-size:13px;width:40%;">🏆 Campeón (50 pts)</td>
            <td style="font-weight:bold;font-size:14px;">${f(especiales.campeon as string)}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:7px 0;font-size:13px;">🥈 Subcampeón (25 pts)</td>
            <td style="font-weight:bold;font-size:14px;">${f(especiales.subcampeon as string)}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:7px 0;font-size:13px;vertical-align:top;">⭐ Semifinalistas (10 c/u)</td>
            <td style="font-weight:bold;font-size:13px;line-height:1.8;">
              ${semis.map(s => f(s)).join('<br/>')}
            </td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:7px 0;font-size:13px;">⚽ Máx. Goleador (20 pts)</td>
            <td style="font-weight:bold;font-size:14px;">${especiales.maxGoleador}</td>
          </tr>
        </table>
      </div>

      <!-- Todos los partidos -->
      <div style="background:#1e293b;border:1px solid #1e3a5f;border-radius:12px;padding:20px;margin-bottom:20px;">
        <h2 style="color:#60a5fa;margin:0 0 16px;font-size:16px;">📊 Todos tus pronósticos de Grupos</h2>
        ${grupoHTML}
      </div>

      <p style="color:#64748b;font-size:12px;text-align:center;margin-top:16px;">
        Quiniela Mundialista 2026 · Familia Vilaseca · ¡Buena suerte! 🍀
      </p>
    </div>`;
}

function plantillaFaseElim(nombre: string, fase: string, equipos: string[]) {
  const labels: Record<string, string> = {
    octavos: '⚔️ Octavos de Final',
    cuartos: '🔥 Cuartos de Final',
    semis: '🌟 Semifinales',
  };
  const puntos: Record<string, string> = {
    octavos: '8 equipos a cuartos · 10 pts c/u',
    cuartos: '4 equipos a semis · 10 pts c/u',
    semis: '2 finalistas · 10 pts c/u',
  };

  const filas = equipos.map((e, i) => `
    <tr>
      <td style="padding:8px 12px;color:#94a3b8;font-size:13px;">${i + 1}.</td>
      <td style="padding:8px 4px;font-size:22px;">${BANDERAS[e] ?? '🏳️'}</td>
      <td style="padding:8px 12px;font-weight:bold;font-size:14px;color:#e2e8f0;">${e}</td>
    </tr>`).join('');

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#fff;padding:32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:28px;">
        <h1 style="color:#facc15;font-size:26px;margin:0 0 4px;">⚽ Quiniela Mundialista 2026</h1>
        <p style="color:#86efac;margin:0;font-size:14px;">Familia Vilaseca</p>
      </div>

      <p style="font-size:15px;margin-bottom:24px;">
        Hola <strong>${nombre}</strong>, tus pronósticos de <strong>${labels[fase] ?? fase}</strong> fueron registrados.
        Guardá este email como comprobante.
      </p>

      <div style="background:#1e293b;border:1px solid #166534;border-radius:12px;padding:20px;margin-bottom:20px;">
        <h2 style="color:#4ade80;margin:0 0 4px;font-size:16px;">${labels[fase] ?? fase}</h2>
        <p style="color:#64748b;font-size:12px;margin:0 0 16px;">${puntos[fase] ?? ''}</p>
        <table style="width:100%;border-collapse:collapse;">
          ${filas}
        </table>
      </div>

      <p style="color:#64748b;font-size:12px;text-align:center;margin-top:16px;">
        Quiniela Mundialista 2026 · Familia Vilaseca · ¡Buena suerte! 🍀
      </p>
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
  try {
    const { to, nombre, fase, datos } = await req.json();
    if (!to || !fase) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

    if (!EMAIL_REGEX.test(to)) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    if (!FASES_VALIDAS.includes(fase)) return NextResponse.json({ error: 'Fase inválida' }, { status: 400 });
    if (typeof nombre !== 'string' || nombre.length > 200) return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });

    if (!process.env.RESEND_API_KEY) {
      await logEmail(to, nombre, fase, false, 'RESEND_API_KEY no configurada');
      return NextResponse.json({ ok: true, skipped: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const labels: Record<string, string> = { fase1: 'Fase 1', octavos: 'Octavos', cuartos: 'Cuartos', semis: 'Semis' };
    const subject = `✅ [${nombre}] Pronósticos ${labels[fase] ?? fase} - Quiniela Vilaseca 2026`;

    const html = fase === 'fase1'
      ? plantillaFase1(nombre, datos.especiales, datos.grupos)
      : plantillaFaseElim(nombre, fase, datos.equipos);

    // Enviamos al admin para que reenvíe manualmente. El email real del participante va en Reply-To.
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'jcarlos.vilaseca10@gmail.com';
    await resend.emails.send({ from: FROM, to: ADMIN_EMAIL, replyTo: to, subject, html });
    await logEmail(to, nombre, fase, true);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    try {
      const body = await req.clone().json().catch(() => ({}));
      await logEmail(body.to ?? '?', body.nombre ?? '?', body.fase ?? '?', false, msg);
    } catch { /* ignore */ }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
