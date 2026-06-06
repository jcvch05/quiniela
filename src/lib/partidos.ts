import { Partido } from '@/types';

// Bolivia (BOT) = UTC-4 = igual que ET en verano
// Todas las horas ya están en hora Bolivia
export const PARTIDOS_GRUPOS: Partido[] = [
  // ── GRUPO A ──
  { id: 'G01', fase: 'grupos', grupo: 'A', local: 'México',       visitante: 'Sudáfrica',   fecha: '2026-06-11T15:00', sede: 'Estadio Azteca',         ciudad: 'Ciudad de México', jugado: false },
  { id: 'G02', fase: 'grupos', grupo: 'A', local: 'Corea del Sur',visitante: 'Rep. Checa',     fecha: '2026-06-11T22:00', sede: 'Estadio Akron',           ciudad: 'Guadalajara',      jugado: false },
  { id: 'G03', fase: 'grupos', grupo: 'A', local: 'Rep. Checa',      visitante: 'Sudáfrica',   fecha: '2026-06-18T12:00', sede: 'Mercedes-Benz Stadium',  ciudad: 'Atlanta',          jugado: false },
  { id: 'G04', fase: 'grupos', grupo: 'A', local: 'México',       visitante: 'Corea del Sur',fecha:'2026-06-18T21:00', sede: 'Estadio Akron',           ciudad: 'Guadalajara',      jugado: false },
  { id: 'G05', fase: 'grupos', grupo: 'A', local: 'Rep. Checa',      visitante: 'México',      fecha: '2026-06-24T21:00', sede: 'Estadio Azteca',         ciudad: 'Ciudad de México', jugado: false },
  { id: 'G06', fase: 'grupos', grupo: 'A', local: 'Sudáfrica',    visitante: 'Corea del Sur',fecha:'2026-06-24T21:00', sede: 'Estadio BBVA',            ciudad: 'Monterrey',        jugado: false },

  // ── GRUPO B ──
  { id: 'G07', fase: 'grupos', grupo: 'B', local: 'Canadá',       visitante: 'Bosnia-Herz.',fecha: '2026-06-12T15:00', sede: 'BMO Field',              ciudad: 'Toronto',          jugado: false },
  { id: 'G08', fase: 'grupos', grupo: 'B', local: 'Qatar',        visitante: 'Suiza',       fecha: '2026-06-13T15:00', sede: "Levi's Stadium",         ciudad: 'San Francisco',    jugado: false },
  { id: 'G09', fase: 'grupos', grupo: 'B', local: 'Suiza',        visitante: 'Bosnia-Herz.',fecha: '2026-06-18T15:00', sede: 'SoFi Stadium',           ciudad: 'Los Ángeles',      jugado: false },
  { id: 'G10', fase: 'grupos', grupo: 'B', local: 'Canadá',       visitante: 'Qatar',       fecha: '2026-06-18T18:00', sede: 'BC Place',               ciudad: 'Vancouver',        jugado: false },
  { id: 'G11', fase: 'grupos', grupo: 'B', local: 'Suiza',        visitante: 'Canadá',      fecha: '2026-06-24T15:00', sede: 'BC Place',               ciudad: 'Vancouver',        jugado: false },
  { id: 'G12', fase: 'grupos', grupo: 'B', local: 'Bosnia-Herz.', visitante: 'Qatar',       fecha: '2026-06-24T15:00', sede: 'Lumen Field',            ciudad: 'Seattle',          jugado: false },

  // ── GRUPO C ──
  { id: 'G13', fase: 'grupos', grupo: 'C', local: 'Brasil',       visitante: 'Marruecos',   fecha: '2026-06-13T18:00', sede: 'MetLife Stadium',        ciudad: 'Nueva York / NJ',  jugado: false },
  { id: 'G14', fase: 'grupos', grupo: 'C', local: 'Haití',        visitante: 'Escocia',     fecha: '2026-06-13T21:00', sede: 'Gillette Stadium',       ciudad: 'Boston',           jugado: false },
  { id: 'G15', fase: 'grupos', grupo: 'C', local: 'Escocia',      visitante: 'Marruecos',   fecha: '2026-06-19T18:00', sede: 'Gillette Stadium',       ciudad: 'Boston',           jugado: false },
  { id: 'G16', fase: 'grupos', grupo: 'C', local: 'Brasil',       visitante: 'Haití',       fecha: '2026-06-19T21:00', sede: 'Lincoln Financial Field',ciudad: 'Filadelfia',       jugado: false },
  { id: 'G17', fase: 'grupos', grupo: 'C', local: 'Escocia',      visitante: 'Brasil',      fecha: '2026-06-24T18:00', sede: 'Hard Rock Stadium',      ciudad: 'Miami',            jugado: false },
  { id: 'G18', fase: 'grupos', grupo: 'C', local: 'Marruecos',    visitante: 'Haití',       fecha: '2026-06-24T18:00', sede: 'Mercedes-Benz Stadium',  ciudad: 'Atlanta',          jugado: false },

  // ── GRUPO D ──
  { id: 'G19', fase: 'grupos', grupo: 'D', local: 'EE.UU.',       visitante: 'Paraguay',    fecha: '2026-06-12T21:00', sede: 'SoFi Stadium',           ciudad: 'Los Ángeles',      jugado: false },
  { id: 'G20', fase: 'grupos', grupo: 'D', local: 'Australia',    visitante: 'Turquía',     fecha: '2026-06-14T00:00', sede: 'BC Place',               ciudad: 'Vancouver',        jugado: false },
  { id: 'G21', fase: 'grupos', grupo: 'D', local: 'EE.UU.',       visitante: 'Australia',   fecha: '2026-06-19T15:00', sede: 'Lumen Field',            ciudad: 'Seattle',          jugado: false },
  { id: 'G22', fase: 'grupos', grupo: 'D', local: 'Turquía',      visitante: 'Paraguay',    fecha: '2026-06-20T00:00', sede: "Levi's Stadium",         ciudad: 'San Francisco',    jugado: false },
  { id: 'G23', fase: 'grupos', grupo: 'D', local: 'Turquía',      visitante: 'EE.UU.',      fecha: '2026-06-25T22:00', sede: 'SoFi Stadium',           ciudad: 'Los Ángeles',      jugado: false },
  { id: 'G24', fase: 'grupos', grupo: 'D', local: 'Paraguay',     visitante: 'Australia',   fecha: '2026-06-25T22:00', sede: "Levi's Stadium",         ciudad: 'San Francisco',    jugado: false },

  // ── GRUPO E ──
  { id: 'G25', fase: 'grupos', grupo: 'E', local: 'Alemania',     visitante: 'Curazao',     fecha: '2026-06-14T13:00', sede: 'NRG Stadium',            ciudad: 'Houston',          jugado: false },
  { id: 'G26', fase: 'grupos', grupo: 'E', local: 'Costa de Marfil',visitante:'Ecuador',    fecha: '2026-06-14T19:00', sede: 'Lincoln Financial Field',ciudad: 'Filadelfia',       jugado: false },
  { id: 'G27', fase: 'grupos', grupo: 'E', local: 'Alemania',     visitante: 'Costa de Marfil',fecha:'2026-06-20T16:00',sede: 'BMO Field',             ciudad: 'Toronto',          jugado: false },
  { id: 'G28', fase: 'grupos', grupo: 'E', local: 'Ecuador',      visitante: 'Curazao',     fecha: '2026-06-20T20:00', sede: 'Arrowhead Stadium',      ciudad: 'Kansas City',      jugado: false },
  { id: 'G29', fase: 'grupos', grupo: 'E', local: 'Ecuador',      visitante: 'Alemania',    fecha: '2026-06-25T16:00', sede: 'MetLife Stadium',        ciudad: 'Nueva York / NJ',  jugado: false },
  { id: 'G30', fase: 'grupos', grupo: 'E', local: 'Curazao',      visitante: 'Costa de Marfil',fecha:'2026-06-25T16:00',sede:'Lincoln Financial Field',ciudad: 'Filadelfia',       jugado: false },

  // ── GRUPO F ──
  { id: 'G31', fase: 'grupos', grupo: 'F', local: 'Países Bajos', visitante: 'Japón',       fecha: '2026-06-14T16:00', sede: 'AT&T Stadium',           ciudad: 'Dallas',           jugado: false },
  { id: 'G32', fase: 'grupos', grupo: 'F', local: 'Suecia',       visitante: 'Túnez',       fecha: '2026-06-14T22:00', sede: 'Estadio BBVA',           ciudad: 'Monterrey',        jugado: false },
  { id: 'G33', fase: 'grupos', grupo: 'F', local: 'Países Bajos', visitante: 'Suecia',      fecha: '2026-06-20T13:00', sede: 'NRG Stadium',            ciudad: 'Houston',          jugado: false },
  { id: 'G34', fase: 'grupos', grupo: 'F', local: 'Túnez',        visitante: 'Japón',       fecha: '2026-06-21T00:00', sede: 'Estadio BBVA',           ciudad: 'Monterrey',        jugado: false },
  { id: 'G35', fase: 'grupos', grupo: 'F', local: 'Japón',        visitante: 'Suecia',      fecha: '2026-06-25T19:00', sede: 'AT&T Stadium',           ciudad: 'Dallas',           jugado: false },
  { id: 'G36', fase: 'grupos', grupo: 'F', local: 'Túnez',        visitante: 'Países Bajos',fecha: '2026-06-25T19:00', sede: 'Arrowhead Stadium',      ciudad: 'Kansas City',      jugado: false },

  // ── GRUPO G ──
  { id: 'G37', fase: 'grupos', grupo: 'G', local: 'Bélgica',      visitante: 'Egipto',      fecha: '2026-06-15T15:00', sede: 'Lumen Field',            ciudad: 'Seattle',          jugado: false },
  { id: 'G38', fase: 'grupos', grupo: 'G', local: 'Irán',         visitante: 'Nueva Zelanda',fecha:'2026-06-15T21:00', sede: 'SoFi Stadium',           ciudad: 'Los Ángeles',      jugado: false },
  { id: 'G39', fase: 'grupos', grupo: 'G', local: 'Bélgica',      visitante: 'Irán',        fecha: '2026-06-21T15:00', sede: 'SoFi Stadium',           ciudad: 'Los Ángeles',      jugado: false },
  { id: 'G40', fase: 'grupos', grupo: 'G', local: 'Nueva Zelanda',visitante: 'Egipto',      fecha: '2026-06-21T21:00', sede: 'BC Place',               ciudad: 'Vancouver',        jugado: false },
  { id: 'G41', fase: 'grupos', grupo: 'G', local: 'Egipto',       visitante: 'Irán',        fecha: '2026-06-26T23:00', sede: 'Lumen Field',            ciudad: 'Seattle',          jugado: false },
  { id: 'G42', fase: 'grupos', grupo: 'G', local: 'Nueva Zelanda',visitante: 'Bélgica',     fecha: '2026-06-26T23:00', sede: 'BC Place',               ciudad: 'Vancouver',        jugado: false },

  // ── GRUPO H ──
  { id: 'G43', fase: 'grupos', grupo: 'H', local: 'España',       visitante: 'Cabo Verde',  fecha: '2026-06-15T12:00', sede: 'Mercedes-Benz Stadium',  ciudad: 'Atlanta',          jugado: false },
  { id: 'G44', fase: 'grupos', grupo: 'H', local: 'Arabia Saudita',visitante:'Uruguay',     fecha: '2026-06-15T18:00', sede: 'Hard Rock Stadium',      ciudad: 'Miami',            jugado: false },
  { id: 'G45', fase: 'grupos', grupo: 'H', local: 'España',       visitante: 'Arabia Saudita',fecha:'2026-06-21T12:00',sede: 'Mercedes-Benz Stadium',  ciudad: 'Atlanta',          jugado: false },
  { id: 'G46', fase: 'grupos', grupo: 'H', local: 'Uruguay',      visitante: 'Cabo Verde',  fecha: '2026-06-21T18:00', sede: 'Hard Rock Stadium',      ciudad: 'Miami',            jugado: false },
  { id: 'G47', fase: 'grupos', grupo: 'H', local: 'Cabo Verde',   visitante: 'Arabia Saudita',fecha:'2026-06-26T20:00',sede: 'NRG Stadium',            ciudad: 'Houston',          jugado: false },
  { id: 'G48', fase: 'grupos', grupo: 'H', local: 'Uruguay',      visitante: 'España',      fecha: '2026-06-26T20:00', sede: 'Estadio Akron',          ciudad: 'Guadalajara',      jugado: false },

  // ── GRUPO I ──
  { id: 'G49', fase: 'grupos', grupo: 'I', local: 'Francia',      visitante: 'Senegal',     fecha: '2026-06-16T15:00', sede: 'MetLife Stadium',        ciudad: 'Nueva York / NJ',  jugado: false },
  { id: 'G50', fase: 'grupos', grupo: 'I', local: 'Iraq',         visitante: 'Noruega',     fecha: '2026-06-16T18:00', sede: 'Gillette Stadium',       ciudad: 'Boston',           jugado: false },
  { id: 'G51', fase: 'grupos', grupo: 'I', local: 'Francia',      visitante: 'Iraq',        fecha: '2026-06-22T17:00', sede: 'Lincoln Financial Field',ciudad: 'Filadelfia',       jugado: false },
  { id: 'G52', fase: 'grupos', grupo: 'I', local: 'Noruega',      visitante: 'Senegal',     fecha: '2026-06-22T20:00', sede: 'MetLife Stadium',        ciudad: 'Nueva York / NJ',  jugado: false },
  { id: 'G53', fase: 'grupos', grupo: 'I', local: 'Noruega',      visitante: 'Francia',     fecha: '2026-06-26T15:00', sede: 'Gillette Stadium',       ciudad: 'Boston',           jugado: false },
  { id: 'G54', fase: 'grupos', grupo: 'I', local: 'Senegal',      visitante: 'Iraq',        fecha: '2026-06-26T15:00', sede: 'BMO Field',              ciudad: 'Toronto',          jugado: false },

  // ── GRUPO J ──
  { id: 'G55', fase: 'grupos', grupo: 'J', local: 'Argentina',    visitante: 'Argelia',     fecha: '2026-06-16T21:00', sede: 'Arrowhead Stadium',      ciudad: 'Kansas City',      jugado: false },
  { id: 'G56', fase: 'grupos', grupo: 'J', local: 'Austria',      visitante: 'Jordania',    fecha: '2026-06-17T00:00', sede: "Levi's Stadium",         ciudad: 'San Francisco',    jugado: false },
  { id: 'G57', fase: 'grupos', grupo: 'J', local: 'Argentina',    visitante: 'Austria',     fecha: '2026-06-22T13:00', sede: 'AT&T Stadium',           ciudad: 'Dallas',           jugado: false },
  { id: 'G58', fase: 'grupos', grupo: 'J', local: 'Jordania',     visitante: 'Argelia',     fecha: '2026-06-22T23:00', sede: "Levi's Stadium",         ciudad: 'San Francisco',    jugado: false },
  { id: 'G59', fase: 'grupos', grupo: 'J', local: 'Argelia',      visitante: 'Austria',     fecha: '2026-06-27T22:00', sede: 'Arrowhead Stadium',      ciudad: 'Kansas City',      jugado: false },
  { id: 'G60', fase: 'grupos', grupo: 'J', local: 'Jordania',     visitante: 'Argentina',   fecha: '2026-06-27T22:00', sede: 'AT&T Stadium',           ciudad: 'Dallas',           jugado: false },

  // ── GRUPO K ──
  { id: 'G61', fase: 'grupos', grupo: 'K', local: 'Portugal',     visitante: 'R.D. Congo',  fecha: '2026-06-17T13:00', sede: 'NRG Stadium',            ciudad: 'Houston',          jugado: false },
  { id: 'G62', fase: 'grupos', grupo: 'K', local: 'Uzbekistán',   visitante: 'Colombia',    fecha: '2026-06-17T22:00', sede: 'Estadio Azteca',         ciudad: 'Ciudad de México', jugado: false },
  { id: 'G63', fase: 'grupos', grupo: 'K', local: 'Portugal',     visitante: 'Uzbekistán',  fecha: '2026-06-23T13:00', sede: 'NRG Stadium',            ciudad: 'Houston',          jugado: false },
  { id: 'G64', fase: 'grupos', grupo: 'K', local: 'Colombia',     visitante: 'R.D. Congo',  fecha: '2026-06-23T22:00', sede: 'Estadio Akron',          ciudad: 'Guadalajara',      jugado: false },
  { id: 'G65', fase: 'grupos', grupo: 'K', local: 'Colombia',     visitante: 'Portugal',    fecha: '2026-06-27T19:30', sede: 'Hard Rock Stadium',      ciudad: 'Miami',            jugado: false },
  { id: 'G66', fase: 'grupos', grupo: 'K', local: 'R.D. Congo',   visitante: 'Uzbekistán',  fecha: '2026-06-27T19:30', sede: 'Mercedes-Benz Stadium',  ciudad: 'Atlanta',          jugado: false },

  // ── GRUPO L ──
  { id: 'G67', fase: 'grupos', grupo: 'L', local: 'Inglaterra',   visitante: 'Croacia',     fecha: '2026-06-17T16:00', sede: 'AT&T Stadium',           ciudad: 'Dallas',           jugado: false },
  { id: 'G68', fase: 'grupos', grupo: 'L', local: 'Ghana',        visitante: 'Panamá',      fecha: '2026-06-17T19:00', sede: 'BMO Field',              ciudad: 'Toronto',          jugado: false },
  { id: 'G69', fase: 'grupos', grupo: 'L', local: 'Inglaterra',   visitante: 'Ghana',       fecha: '2026-06-23T16:00', sede: 'Gillette Stadium',       ciudad: 'Boston',           jugado: false },
  { id: 'G70', fase: 'grupos', grupo: 'L', local: 'Panamá',       visitante: 'Croacia',     fecha: '2026-06-23T19:00', sede: 'BMO Field',              ciudad: 'Toronto',          jugado: false },
  { id: 'G71', fase: 'grupos', grupo: 'L', local: 'Panamá',       visitante: 'Inglaterra',  fecha: '2026-06-27T17:00', sede: 'MetLife Stadium',        ciudad: 'Nueva York / NJ',  jugado: false },
  { id: 'G72', fase: 'grupos', grupo: 'L', local: 'Croacia',      visitante: 'Ghana',       fecha: '2026-06-27T17:00', sede: 'Lincoln Financial Field',ciudad: 'Filadelfia',       jugado: false },
];

export const TODOS_PARTIDOS: Partido[] = [...PARTIDOS_GRUPOS];
