import { NextRequest, NextResponse } from 'next/server';
import { updateDocument } from '@/lib/firebase';

const PRONOSTICOS_GRUPOS: Record<string, { golesLocal: number; golesVisitante: number }> = {
  "G01":{"golesLocal":1,"golesVisitante":2},"G02":{"golesLocal":2,"golesVisitante":0},
  "G03":{"golesLocal":1,"golesVisitante":2},"G04":{"golesLocal":1,"golesVisitante":2},
  "G05":{"golesLocal":0,"golesVisitante":1},"G06":{"golesLocal":1,"golesVisitante":2},
  "G07":{"golesLocal":2,"golesVisitante":0},"G08":{"golesLocal":1,"golesVisitante":3},
  "G09":{"golesLocal":2,"golesVisitante":0},"G10":{"golesLocal":2,"golesVisitante":0},
  "G11":{"golesLocal":3,"golesVisitante":1},"G12":{"golesLocal":1,"golesVisitante":0},
  "G13":{"golesLocal":3,"golesVisitante":2},"G14":{"golesLocal":0,"golesVisitante":4},
  "G15":{"golesLocal":1,"golesVisitante":3},"G16":{"golesLocal":5,"golesVisitante":0},
  "G17":{"golesLocal":1,"golesVisitante":3},"G18":{"golesLocal":4,"golesVisitante":0},
  "G19":{"golesLocal":1,"golesVisitante":2},"G20":{"golesLocal":3,"golesVisitante":0},
  "G21":{"golesLocal":0,"golesVisitante":2},"G22":{"golesLocal":0,"golesVisitante":1},
  "G23":{"golesLocal":1,"golesVisitante":1},"G24":{"golesLocal":1,"golesVisitante":3},
  "G25":{"golesLocal":5,"golesVisitante":0},"G26":{"golesLocal":1,"golesVisitante":3},
  "G27":{"golesLocal":4,"golesVisitante":1},"G28":{"golesLocal":3,"golesVisitante":0},
  "G29":{"golesLocal":2,"golesVisitante":3},"G30":{"golesLocal":1,"golesVisitante":2},
  "G31":{"golesLocal":3,"golesVisitante":1},"G32":{"golesLocal":1,"golesVisitante":0},
  "G33":{"golesLocal":3,"golesVisitante":1},"G34":{"golesLocal":0,"golesVisitante":2},
  "G35":{"golesLocal":2,"golesVisitante":1},"G36":{"golesLocal":0,"golesVisitante":3},
  "G37":{"golesLocal":3,"golesVisitante":2},"G38":{"golesLocal":0,"golesVisitante":2},
  "G39":{"golesLocal":4,"golesVisitante":0},"G40":{"golesLocal":2,"golesVisitante":2},
  "G41":{"golesLocal":3,"golesVisitante":0},"G42":{"golesLocal":1,"golesVisitante":4},
  "G43":{"golesLocal":4,"golesVisitante":0},"G44":{"golesLocal":1,"golesVisitante":3},
  "G45":{"golesLocal":4,"golesVisitante":0},"G46":{"golesLocal":2,"golesVisitante":0},
  "G47":{"golesLocal":0,"golesVisitante":1},"G48":{"golesLocal":2,"golesVisitante":3},
  "G49":{"golesLocal":3,"golesVisitante":1},"G50":{"golesLocal":0,"golesVisitante":3},
  "G51":{"golesLocal":4,"golesVisitante":0},"G52":{"golesLocal":2,"golesVisitante":1},
  "G53":{"golesLocal":3,"golesVisitante":2},"G54":{"golesLocal":2,"golesVisitante":0},
  "G55":{"golesLocal":3,"golesVisitante":1},"G56":{"golesLocal":2,"golesVisitante":1},
  "G57":{"golesLocal":3,"golesVisitante":0},"G58":{"golesLocal":1,"golesVisitante":1},
  "G59":{"golesLocal":1,"golesVisitante":2},"G60":{"golesLocal":0,"golesVisitante":4},
  "G61":{"golesLocal":3,"golesVisitante":0},"G62":{"golesLocal":0,"golesVisitante":3},
  "G63":{"golesLocal":4,"golesVisitante":0},"G64":{"golesLocal":3,"golesVisitante":1},
  "G65":{"golesLocal":3,"golesVisitante":2},"G66":{"golesLocal":2,"golesVisitante":0},
  "G67":{"golesLocal":1,"golesVisitante":2},"G68":{"golesLocal":2,"golesVisitante":0},
  "G69":{"golesLocal":3,"golesVisitante":1},"G70":{"golesLocal":0,"golesVisitante":3},
  "G71":{"golesLocal":0,"golesVisitante":4},"G72":{"golesLocal":3,"golesVisitante":1},
};

const ESPECIALES = {
  campeon: "España",
  subcampeon: "Brasil",
  semifinalistas: ["España", "Brasil", "Argentina", "Noruega"],
  maxGoleador: "Lamine Yamal",
};

// Cuenta principal de Nicolás (UID de Firebase Auth)
const NICOLAS_DOC_ID = "yaMeGnyaShTEAdOZL2j6qhmFR3U2";

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  await updateDocument('participantes', NICOLAS_DOC_ID, {
    pronosticosGrupos: PRONOSTICOS_GRUPOS,
    pronosticosEspeciales: ESPECIALES,
  }, token);

  return NextResponse.json({
    ok: true,
    grupos: Object.keys(PRONOSTICOS_GRUPOS).length,
    especiales: ESPECIALES,
  });
}
