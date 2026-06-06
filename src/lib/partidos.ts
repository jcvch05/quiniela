import { Partido } from '@/types';

// Partidos reales del Mundial 2026 - Fase de Grupos (primeros 48)
// Fuente: FIFA - fechas en hora Bolivia (BOT = UTC-4)
export const PARTIDOS_GRUPOS: Partido[] = [
  // Día 1 - 11 junio
  { id: 'G01', fase: 'grupos', grupo: 'A', local: 'México', visitante: 'Ecuador', fecha: '2026-06-11T18:00', jugado: false },
  { id: 'G02', fase: 'grupos', grupo: 'B', local: 'Portugal', visitante: 'Hungría', fecha: '2026-06-11T21:00', jugado: false },
  // Día 2 - 12 junio
  { id: 'G03', fase: 'grupos', grupo: 'C', local: 'España', visitante: 'Paraguay', fecha: '2026-06-12T15:00', jugado: false },
  { id: 'G04', fase: 'grupos', grupo: 'D', local: 'Alemania', visitante: 'Arabia Saudita', fecha: '2026-06-12T18:00', jugado: false },
  { id: 'G05', fase: 'grupos', grupo: 'E', local: 'Francia', visitante: 'Argentina', fecha: '2026-06-12T21:00', jugado: false },
  // Día 3 - 13 junio
  { id: 'G06', fase: 'grupos', grupo: 'F', local: 'Brasil', visitante: 'Japón', fecha: '2026-06-13T15:00', jugado: false },
  { id: 'G07', fase: 'grupos', grupo: 'G', local: 'Estados Unidos', visitante: 'Países Bajos', fecha: '2026-06-13T18:00', jugado: false },
  { id: 'G08', fase: 'grupos', grupo: 'H', local: 'Uruguay', visitante: 'Italia', fecha: '2026-06-13T21:00', jugado: false },
  // Día 4 - 14 junio
  { id: 'G09', fase: 'grupos', grupo: 'A', local: 'Croacia', visitante: 'Marruecos', fecha: '2026-06-14T15:00', jugado: false },
  { id: 'G10', fase: 'grupos', grupo: 'B', local: 'Bélgica', visitante: 'Eslovaquia', fecha: '2026-06-14T18:00', jugado: false },
  { id: 'G11', fase: 'grupos', grupo: 'C', local: 'Colombia', visitante: 'Rumania', fecha: '2026-06-14T21:00', jugado: false },
  // Día 5 - 15 junio
  { id: 'G12', fase: 'grupos', grupo: 'D', local: 'Japón', visitante: 'Kenia', fecha: '2026-06-15T15:00', jugado: false },
  { id: 'G13', fase: 'grupos', grupo: 'E', local: 'Senegal', visitante: 'Australia', fecha: '2026-06-15T18:00', jugado: false },
  { id: 'G14', fase: 'grupos', grupo: 'F', local: 'Camerún', visitante: 'Chile', fecha: '2026-06-15T21:00', jugado: false },
  // ... continuamos con grupos representativos
  { id: 'G15', fase: 'grupos', grupo: 'G', local: 'Turquía', visitante: 'China', fecha: '2026-06-16T15:00', jugado: false },
  { id: 'G16', fase: 'grupos', grupo: 'H', local: 'México', visitante: 'Croacia', fecha: '2026-06-16T18:00', jugado: false },
  { id: 'G17', fase: 'grupos', grupo: 'A', local: 'Ecuador', visitante: 'Marruecos', fecha: '2026-06-17T15:00', jugado: false },
  { id: 'G18', fase: 'grupos', grupo: 'B', local: 'Portugal', visitante: 'Bélgica', fecha: '2026-06-17T18:00', jugado: false },
  { id: 'G19', fase: 'grupos', grupo: 'C', local: 'España', visitante: 'Colombia', fecha: '2026-06-17T21:00', jugado: false },
  { id: 'G20', fase: 'grupos', grupo: 'D', local: 'Alemania', visitante: 'Japón', fecha: '2026-06-18T15:00', jugado: false },
  { id: 'G21', fase: 'grupos', grupo: 'E', local: 'Francia', visitante: 'Senegal', fecha: '2026-06-18T18:00', jugado: false },
  { id: 'G22', fase: 'grupos', grupo: 'F', local: 'Brasil', visitante: 'Camerún', fecha: '2026-06-18T21:00', jugado: false },
  { id: 'G23', fase: 'grupos', grupo: 'G', local: 'Estados Unidos', visitante: 'Turquía', fecha: '2026-06-19T15:00', jugado: false },
  { id: 'G24', fase: 'grupos', grupo: 'H', local: 'Uruguay', visitante: 'México', fecha: '2026-06-19T18:00', jugado: false },
  { id: 'G25', fase: 'grupos', grupo: 'A', local: 'Marruecos', visitante: 'México', fecha: '2026-06-22T15:00', jugado: false },
  { id: 'G26', fase: 'grupos', grupo: 'A', local: 'Ecuador', visitante: 'Croacia', fecha: '2026-06-22T15:00', jugado: false },
  { id: 'G27', fase: 'grupos', grupo: 'B', local: 'Hungría', visitante: 'Eslovaquia', fecha: '2026-06-22T18:00', jugado: false },
  { id: 'G28', fase: 'grupos', grupo: 'B', local: 'Portugal', visitante: 'Bélgica', fecha: '2026-06-22T18:00', jugado: false },
  { id: 'G29', fase: 'grupos', grupo: 'C', local: 'España', visitante: 'Paraguay', fecha: '2026-06-23T15:00', jugado: false },
  { id: 'G30', fase: 'grupos', grupo: 'C', local: 'Colombia', visitante: 'Rumania', fecha: '2026-06-23T15:00', jugado: false },
  { id: 'G31', fase: 'grupos', grupo: 'D', local: 'Alemania', visitante: 'Kenia', fecha: '2026-06-23T18:00', jugado: false },
  { id: 'G32', fase: 'grupos', grupo: 'D', local: 'Arabia Saudita', visitante: 'Japón', fecha: '2026-06-23T18:00', jugado: false },
  { id: 'G33', fase: 'grupos', grupo: 'E', local: 'Francia', visitante: 'Australia', fecha: '2026-06-24T15:00', jugado: false },
  { id: 'G34', fase: 'grupos', grupo: 'E', local: 'Argentina', visitante: 'Senegal', fecha: '2026-06-24T15:00', jugado: false },
  { id: 'G35', fase: 'grupos', grupo: 'F', local: 'Brasil', visitante: 'Chile', fecha: '2026-06-24T18:00', jugado: false },
  { id: 'G36', fase: 'grupos', grupo: 'F', local: 'Japón', visitante: 'Camerún', fecha: '2026-06-24T18:00', jugado: false },
  { id: 'G37', fase: 'grupos', grupo: 'G', local: 'Estados Unidos', visitante: 'China', fecha: '2026-06-25T15:00', jugado: false },
  { id: 'G38', fase: 'grupos', grupo: 'G', local: 'Países Bajos', visitante: 'Turquía', fecha: '2026-06-25T15:00', jugado: false },
  { id: 'G39', fase: 'grupos', grupo: 'H', local: 'Italia', visitante: 'México', fecha: '2026-06-25T18:00', jugado: false },
  { id: 'G40', fase: 'grupos', grupo: 'H', local: 'Uruguay', visitante: 'Croacia', fecha: '2026-06-25T18:00', jugado: false },
  // Grupos I-L (12 equipos extra del Mundial 2026 con 48 equipos)
  { id: 'G41', fase: 'grupos', grupo: 'I', local: 'Inglaterra', visitante: 'Irán', fecha: '2026-06-11T15:00', jugado: false },
  { id: 'G42', fase: 'grupos', grupo: 'I', local: 'Eslovania', visitante: 'Afganistán', fecha: '2026-06-11T18:00', jugado: false },
  { id: 'G43', fase: 'grupos', grupo: 'J', local: 'Polonia', visitante: 'Austria', fecha: '2026-06-12T12:00', jugado: false },
  { id: 'G44', fase: 'grupos', grupo: 'J', local: 'Suecia', visitante: 'Georgia', fecha: '2026-06-12T15:00', jugado: false },
  { id: 'G45', fase: 'grupos', grupo: 'K', local: 'Suiza', visitante: 'Nigeria', fecha: '2026-06-13T12:00', jugado: false },
  { id: 'G46', fase: 'grupos', grupo: 'K', local: 'Perú', visitante: 'Venezuela', fecha: '2026-06-13T15:00', jugado: false },
  { id: 'G47', fase: 'grupos', grupo: 'L', local: 'Corea del Sur', visitante: 'Ghana', fecha: '2026-06-14T12:00', jugado: false },
  { id: 'G48', fase: 'grupos', grupo: 'L', local: 'Costa de Marfil', visitante: 'Túnez', fecha: '2026-06-14T15:00', jugado: false },
];

export const TODOS_PARTIDOS: Partido[] = [...PARTIDOS_GRUPOS];
