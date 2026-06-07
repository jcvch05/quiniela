export const BANDERAS: Record<string, string> = {
  // Grupo A
  'México':        '🇲🇽',
  'Sudáfrica':     '🇿🇦',
  'Corea del Sur': '🇰🇷',
  'Rep. Checa':    '🇨🇿',
  // Grupo B
  'Canadá':        '🇨🇦',
  'Bosnia-Herz.':  '🇧🇦',
  'Qatar':         '🇶🇦',
  'Suiza':         '🇨🇭',
  // Grupo C
  'Brasil':        '🇧🇷',
  'Marruecos':     '🇲🇦',
  'Haití':         '🇭🇹',
  'Escocia':       '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  // Grupo D
  'EE.UU.':        '🇺🇸',
  'Paraguay':      '🇵🇾',
  'Australia':     '🇦🇺',
  'Turquía':       '🇹🇷',
  // Grupo E
  'Alemania':      '🇩🇪',
  'Curazao':       '🇨🇼',
  'Costa de Marfil':'🇨🇮',
  'Ecuador':       '🇪🇨',
  // Grupo F
  'Países Bajos':  '🇳🇱',
  'Japón':         '🇯🇵',
  'Suecia':        '🇸🇪',
  'Túnez':         '🇹🇳',
  // Grupo G
  'Bélgica':       '🇧🇪',
  'Egipto':        '🇪🇬',
  'Irán':          '🇮🇷',
  'Nueva Zelanda': '🇳🇿',
  // Grupo H
  'España':        '🇪🇸',
  'Cabo Verde':    '🇨🇻',
  'Arabia Saudita':'🇸🇦',
  'Uruguay':       '🇺🇾',
  // Grupo I
  'Francia':       '🇫🇷',
  'Senegal':       '🇸🇳',
  'Iraq':          '🇮🇶',
  'Noruega':       '🇳🇴',
  // Grupo J
  'Argentina':     '🇦🇷',
  'Argelia':       '🇩🇿',
  'Austria':       '🇦🇹',
  'Jordania':      '🇯🇴',
  // Grupo K
  'Portugal':      '🇵🇹',
  'R.D. Congo':    '🇨🇩',
  'Uzbekistán':    '🇺🇿',
  'Colombia':      '🇨🇴',
  // Grupo L
  'Inglaterra':    '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Croacia':       '🇭🇷',
  'Ghana':         '🇬🇭',
  'Panamá':        '🇵🇦',
};

export function bandera(pais: string): string {
  return BANDERAS[pais] ?? '🏳️';
}

export function conBandera(pais: string): string {
  return `${bandera(pais)} ${pais}`;
}
