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

export const SELECCIONES = [
  'Argentina', 'Australia', 'Brasil', 'Canadá', 'Chile', 'Colombia',
  'Croacia', 'Dinamarca', 'Ecuador', 'España', 'Estados Unidos', 'Francia',
  'Inglaterra', 'Italia', 'Japón', 'Marruecos', 'México', 'Nigeria',
  'Países Bajos', 'Polonia', 'Portugal', 'Senegal', 'Serbia', 'Suiza',
  'Turquía', 'Uruguay', 'Alemania', 'Bélgica', 'Costa Rica', 'Ghana',
  'Irán', 'Arabia Saudita', 'Corea del Sur', 'Camerún', 'Qatar', 'Bolivia',
  'Venezuela', 'Perú', 'Paraguay', 'Panamá',
].sort();
