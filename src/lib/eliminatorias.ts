import { PARTIDOS_DIECISEISAVOS } from './partidos';

export type FaseEliminatoria = 'dieciseisavos' | 'octavos' | 'cuartos' | 'semis' | 'final';

export interface ResultadoEliminatoria {
  id: string;
  fase: FaseEliminatoria;
  ganador: string;
  perdedor?: string;
}

// Estructura bracket para dieciseisavos → octavos
// D01: Sudáfrica vs Canadá → ganador a O1
// D02: Brasil vs Japón → ganador a O2
// ... etc
const DIECISEISAVOS_TO_OCTAVOS: Record<string, string> = {
  'D01': 'O01', 'D02': 'O01', // O01 = 1er puesto grupo A vs 2o grupo D
  'D03': 'O02', 'D04': 'O02', // O02 = 1er puesto grupo E vs 2o grupo B
  'D05': 'O03', 'D06': 'O03',
  'D07': 'O04', 'D08': 'O04',
  'D09': 'O05', 'D10': 'O05',
  'D11': 'O06', 'D12': 'O06',
  'D13': 'O07', 'D14': 'O07',
  'D15': 'O08', 'D16': 'O08',
};

export function getPartidoDieciseisavos(id: string) {
  return PARTIDOS_DIECISEISAVOS.find(p => p.id === id);
}

export function determinarGanador(
  local: string,
  visitante: string,
  golesLocal: number,
  golesVisitante: number,
  penalesLocal?: number,
  penalesVisitante?: number
): string {
  // Si hay penales, usarlos
  if (penalesLocal !== undefined && penalesVisitante !== undefined) {
    return penalesLocal > penalesVisitante ? local : visitante;
  }
  // Si no, ganador por goles
  return golesLocal > golesVisitante ? local : visitante;
}

export function calcularClasificadosPorFase(
  resultados: ResultadoEliminatoria[],
  fase: FaseEliminatoria
): string[] {
  return resultados
    .filter(r => r.fase === fase)
    .map(r => r.ganador);
}
