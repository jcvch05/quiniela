// Mapeo de nombres en inglés (football-data.org) → nombres en español (app)
export const TEAM_MAP: Record<string, string> = {
  'Mexico': 'México',
  'South Africa': 'Sudáfrica',
  'Korea Republic': 'Corea del Sur',
  'Czechia': 'Rep. Checa',
  'Czech Republic': 'Rep. Checa',
  'Canada': 'Canadá',
  'Bosnia and Herzegovina': 'Bosnia-Herz.',
  'Qatar': 'Qatar',
  'Switzerland': 'Suiza',
  'Brazil': 'Brasil',
  'Morocco': 'Marruecos',
  'Haiti': 'Haití',
  'Scotland': 'Escocia',
  'United States': 'EE.UU.',
  'USA': 'EE.UU.',
  'Paraguay': 'Paraguay',
  'Australia': 'Australia',
  'Turkey': 'Turquía',
  'Türkiye': 'Turquía',
  'Germany': 'Alemania',
  'Curaçao': 'Curazao',
  'Curacao': 'Curazao',
  "Côte d'Ivoire": 'Costa de Marfil',
  'Ivory Coast': 'Costa de Marfil',
  'Ecuador': 'Ecuador',
  'Netherlands': 'Países Bajos',
  'Japan': 'Japón',
  'Sweden': 'Suecia',
  'Tunisia': 'Túnez',
  'Belgium': 'Bélgica',
  'Egypt': 'Egipto',
  'Iran': 'Irán',
  'New Zealand': 'Nueva Zelanda',
  'Spain': 'España',
  'Cape Verde': 'Cabo Verde',
  'Saudi Arabia': 'Arabia Saudita',
  'Uruguay': 'Uruguay',
  'France': 'Francia',
  'Senegal': 'Senegal',
  'Iraq': 'Iraq',
  'Norway': 'Noruega',
  'Argentina': 'Argentina',
  'Algeria': 'Argelia',
  'Austria': 'Austria',
  'Jordan': 'Jordania',
  'Portugal': 'Portugal',
  'DR Congo': 'R.D. Congo',
  'Congo DR': 'R.D. Congo',
  'Uzbekistan': 'Uzbekistán',
  'Colombia': 'Colombia',
  'England': 'Inglaterra',
  'Croatia': 'Croacia',
  'Ghana': 'Ghana',
  'Panama': 'Panamá',
};

export interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

export function toSpanish(name: string): string {
  return TEAM_MAP[name] ?? name;
}

export async function fetchFinishedMatches(): Promise<ApiMatch[]> {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?season=2026&status=FINISHED',
      { headers: { 'X-Auth-Token': key }, cache: 'no-store' }
    );
    if (!res.ok) {
      console.error('football-data.org error:', res.status, await res.text());
      return [];
    }
    const data = await res.json();
    return (data.matches ?? []) as ApiMatch[];
  } catch (e) {
    console.error('football-data.org fetch error:', e);
    return [];
  }
}
