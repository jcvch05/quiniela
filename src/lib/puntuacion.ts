import { Participante, Partido, PronosticoPartido } from '@/types';

function getResultado(gL: number, gV: number): 'L' | 'E' | 'V' {
  if (gL > gV) return 'L';
  if (gL === gV) return 'E';
  return 'V';
}

export function calcularPuntosPartido(
  pronostico: PronosticoPartido,
  partido: Partido
): number {
  if (!partido.jugado || partido.golesLocal === undefined || partido.golesVisitante === undefined) return 0;
  const resReal = getResultado(partido.golesLocal, partido.golesVisitante);
  const resPron = getResultado(pronostico.golesLocal, pronostico.golesVisitante);
  if (pronostico.golesLocal === partido.golesLocal && pronostico.golesVisitante === partido.golesVisitante) return 8;
  const difReal = partido.golesLocal - partido.golesVisitante;
  const difPron = pronostico.golesLocal - pronostico.golesVisitante;
  if (difReal === difPron) return 5;
  if (resReal === resPron) return 3;
  return 0;
}

export function calcularPuntosEspeciales(
  participante: Participante,
  resultadosFinales: {
    campeon?: string;
    subcampeon?: string;
    semifinalistas?: string[];
    maxGoleador?: string;
  }
): number {
  let puntos = 0;
  const e = participante.pronosticosEspeciales;
  if (resultadosFinales.campeon && e.campeon === resultadosFinales.campeon) puntos += 50;
  if (resultadosFinales.subcampeon && e.subcampeon === resultadosFinales.subcampeon) puntos += 25;
  if (resultadosFinales.maxGoleador && e.maxGoleador === resultadosFinales.maxGoleador) puntos += 20;
  if (resultadosFinales.semifinalistas) {
    for (const semi of e.semifinalistas) {
      if (resultadosFinales.semifinalistas.includes(semi)) puntos += 10;
    }
  }
  return puntos;
}

export function calcularPuntosEliminatoria(
  pronostico: string[],
  clasificados: string[]
): number {
  return pronostico.filter(e => clasificados.includes(e)).length * 10;
}
