export type Resultado = 'L' | 'E' | 'V'; // Local, Empate, Visitante

export interface PronosticoPartido {
  golesLocal: number;
  golesVisitante: number;
}

export interface PronosticosGrupos {
  [partidoId: string]: PronosticoPartido;
}

export interface PronosticosEspeciales {
  campeon: string;
  subcampeon: string;
  semifinalistas: [string, string, string, string];
  maxGoleador: string;
}

export interface Participante {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  pagado: boolean;
  fechaRegistro: string;
  pronosticosEspeciales: PronosticosEspeciales;
  pronosticosGrupos: PronosticosGrupos;
  // fases eliminatorias
  octavos?: string[];   // 8 equipos a cuartos
  cuartos?: string[];   // 4 equipos a semis
  semis?: string[];     // 2 equipos a final
  puntos: number;
  desglose: {
    grupos: number;
    octavos: number;
    cuartos: number;
    semis: number;
    especiales: number;
  };
}

export interface Partido {
  id: string;
  fase: 'grupos' | 'octavos' | 'cuartos' | 'semis' | 'final';
  grupo?: string;
  local: string;
  visitante: string;
  fecha: string;
  sede?: string;
  ciudad?: string;
  golesLocal?: number;
  golesVisitante?: number;
  jugado: boolean;
}

// Los 48 clasificados al Mundial 2026 (extraídos del fixture oficial)
export const SELECCIONES = [
  // Grupo A
  'México', 'Sudáfrica', 'Corea del Sur', 'Rep. Checa',
  // Grupo B
  'Canadá', 'Bosnia-Herz.', 'Qatar', 'Suiza',
  // Grupo C
  'Brasil', 'Marruecos', 'Haití', 'Escocia',
  // Grupo D
  'EE.UU.', 'Paraguay', 'Australia', 'Turquía',
  // Grupo E
  'Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador',
  // Grupo F
  'Países Bajos', 'Japón', 'Suecia', 'Túnez',
  // Grupo G
  'Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda',
  // Grupo H
  'España', 'Cabo Verde', 'Arabia Saudita', 'Uruguay',
  // Grupo I
  'Francia', 'Senegal', 'Iraq', 'Noruega',
  // Grupo J
  'Argentina', 'Argelia', 'Austria', 'Jordania',
  // Grupo K
  'Portugal', 'R.D. Congo', 'Uzbekistán', 'Colombia',
  // Grupo L
  'Inglaterra', 'Croacia', 'Ghana', 'Panamá',
].sort();
