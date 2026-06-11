import { NextRequest, NextResponse } from 'next/server';
import { updateDocument } from '@/lib/firebase';

const PRONOSTICOS_GRUPOS: Record<string, { golesLocal: number; golesVisitante: number }> = {
  // Grupo A
  "G01":{"golesLocal":2,"golesVisitante":0}, // México - Sudáfrica
  "G02":{"golesLocal":1,"golesVisitante":1}, // Corea del Sur - Rep. Checa
  "G03":{"golesLocal":1,"golesVisitante":0}, // Rep. Checa - Sudáfrica
  "G04":{"golesLocal":2,"golesVisitante":1}, // México - Corea del Sur
  "G05":{"golesLocal":0,"golesVisitante":2}, // Rep. Checa - México
  "G06":{"golesLocal":1,"golesVisitante":1}, // Sudáfrica - Corea del Sur
  // Grupo B
  "G07":{"golesLocal":2,"golesVisitante":1}, // Canadá - Bosnia-Herz.
  "G08":{"golesLocal":0,"golesVisitante":2}, // Qatar - Suiza
  "G09":{"golesLocal":3,"golesVisitante":0}, // Suiza - Bosnia-Herz.
  "G10":{"golesLocal":2,"golesVisitante":1}, // Canadá - Qatar
  "G11":{"golesLocal":3,"golesVisitante":1}, // Suiza - Canadá
  "G12":{"golesLocal":1,"golesVisitante":0}, // Bosnia-Herz. - Qatar
  // Grupo C
  "G13":{"golesLocal":3,"golesVisitante":1}, // Brasil - Marruecos
  "G14":{"golesLocal":0,"golesVisitante":2}, // Haití - Escocia
  "G15":{"golesLocal":0,"golesVisitante":1}, // Escocia - Marruecos
  "G16":{"golesLocal":3,"golesVisitante":0}, // Brasil - Haití
  "G17":{"golesLocal":0,"golesVisitante":2}, // Escocia - Brasil
  "G18":{"golesLocal":1,"golesVisitante":1}, // Marruecos - Haití
  // Grupo D
  "G19":{"golesLocal":2,"golesVisitante":1}, // EE.UU. - Paraguay
  "G20":{"golesLocal":1,"golesVisitante":1}, // Australia - Turquía
  "G21":{"golesLocal":1,"golesVisitante":1}, // EE.UU. - Australia
  "G22":{"golesLocal":2,"golesVisitante":1}, // Turquía - Paraguay
  "G23":{"golesLocal":2,"golesVisitante":2}, // Turquía - EE.UU.
  "G24":{"golesLocal":2,"golesVisitante":0}, // Paraguay - Australia
  // Grupo E
  "G25":{"golesLocal":3,"golesVisitante":1}, // Alemania - Curazao
  "G26":{"golesLocal":1,"golesVisitante":2}, // Costa de Marfil - Ecuador
  "G27":{"golesLocal":2,"golesVisitante":0}, // Alemania - Costa de Marfil
  "G28":{"golesLocal":1,"golesVisitante":1}, // Ecuador - Curazao
  "G29":{"golesLocal":1,"golesVisitante":3}, // Ecuador - Alemania
  "G30":{"golesLocal":1,"golesVisitante":1}, // Curazao - Costa de Marfil
  // Grupo F
  "G31":{"golesLocal":3,"golesVisitante":1}, // Países Bajos - Japón
  "G32":{"golesLocal":3,"golesVisitante":0}, // Suecia - Túnez
  "G33":{"golesLocal":3,"golesVisitante":2}, // Países Bajos - Suecia
  "G34":{"golesLocal":2,"golesVisitante":1}, // Túnez - Japón
  "G35":{"golesLocal":1,"golesVisitante":4}, // Japón - Suecia
  "G36":{"golesLocal":1,"golesVisitante":3}, // Túnez - Países Bajos
  // Grupo G
  "G37":{"golesLocal":2,"golesVisitante":2}, // Bélgica - Egipto
  "G38":{"golesLocal":1,"golesVisitante":0}, // Irán - Nueva Zelanda
  "G39":{"golesLocal":2,"golesVisitante":1}, // Bélgica - Irán
  "G40":{"golesLocal":0,"golesVisitante":2}, // Nueva Zelanda - Egipto
  "G41":{"golesLocal":3,"golesVisitante":1}, // Egipto - Irán
  "G42":{"golesLocal":2,"golesVisitante":3}, // Nueva Zelanda - Bélgica
  // Grupo H
  "G43":{"golesLocal":3,"golesVisitante":0}, // España - Cabo Verde
  "G44":{"golesLocal":2,"golesVisitante":3}, // Arabia Saudita - Uruguay
  "G45":{"golesLocal":3,"golesVisitante":2}, // España - Arabia Saudita
  "G46":{"golesLocal":2,"golesVisitante":1}, // Uruguay - Cabo Verde
  "G47":{"golesLocal":1,"golesVisitante":2}, // Cabo Verde - Arabia Saudita
  "G48":{"golesLocal":2,"golesVisitante":4}, // Uruguay - España
  // Grupo I
  "G49":{"golesLocal":4,"golesVisitante":2}, // Francia - Senegal
  "G50":{"golesLocal":1,"golesVisitante":3}, // Iraq - Noruega
  "G51":{"golesLocal":2,"golesVisitante":1}, // Francia - Iraq
  "G52":{"golesLocal":2,"golesVisitante":0}, // Noruega - Senegal
  "G53":{"golesLocal":2,"golesVisitante":2}, // Noruega - Francia
  "G54":{"golesLocal":2,"golesVisitante":1}, // Senegal - Iraq
  // Grupo J
  "G55":{"golesLocal":3,"golesVisitante":1}, // Argentina - Argelia
  "G56":{"golesLocal":1,"golesVisitante":1}, // Austria - Jordania
  "G57":{"golesLocal":2,"golesVisitante":1}, // Argentina - Austria
  "G58":{"golesLocal":3,"golesVisitante":2}, // Jordania - Argelia
  "G59":{"golesLocal":1,"golesVisitante":2}, // Argelia - Austria
  "G60":{"golesLocal":2,"golesVisitante":2}, // Jordania - Argentina
  // Grupo K
  "G61":{"golesLocal":3,"golesVisitante":0}, // Portugal - R.D. Congo
  "G62":{"golesLocal":1,"golesVisitante":2}, // Uzbekistán - Colombia
  "G63":{"golesLocal":2,"golesVisitante":1}, // Portugal - Uzbekistán
  "G64":{"golesLocal":2,"golesVisitante":1}, // Colombia - R.D. Congo
  "G65":{"golesLocal":2,"golesVisitante":4}, // Colombia - Portugal
  "G66":{"golesLocal":1,"golesVisitante":1}, // R.D. Congo - Uzbekistán
  // Grupo L
  "G67":{"golesLocal":3,"golesVisitante":2}, // Inglaterra - Croacia
  "G68":{"golesLocal":1,"golesVisitante":2}, // Ghana - Panamá
  "G69":{"golesLocal":3,"golesVisitante":0}, // Inglaterra - Ghana
  "G70":{"golesLocal":1,"golesVisitante":3}, // Panamá - Croacia
  "G71":{"golesLocal":2,"golesVisitante":2}, // Panamá - Inglaterra
  "G72":{"golesLocal":3,"golesVisitante":0}, // Croacia - Ghana
};

const ESPECIALES = {
  campeon: "Portugal",
  subcampeon: "Francia",
  semifinalistas: ["Brasil", "Francia", "España", "Portugal"],
  maxGoleador: "Mbappe",
};

// Cuenta principal de Esteban (UID de Firebase Auth)
const ESTEBAN_DOC_ID = "8qoH7Ri6ylQ49LInEwcH7TaEOrg2";

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await updateDocument('participantes', ESTEBAN_DOC_ID, {
    pronosticosGrupos: PRONOSTICOS_GRUPOS,
    pronosticosEspeciales: ESPECIALES,
  }, token);

  return NextResponse.json({
    ok: true,
    grupos: Object.keys(PRONOSTICOS_GRUPOS).length,
    especiales: ESPECIALES,
  });
}
