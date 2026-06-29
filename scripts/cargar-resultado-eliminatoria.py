#!/usr/bin/env python3
"""
Script para cargar resultados de fases eliminatorias (dieciseisavos, octavos, etc.)
Automáticamente recalcula los puntos de todos los participantes.

Uso:
  python scripts/cargar-resultado-eliminatoria.py D03 Paraguay
  python scripts/cargar-resultado-eliminatoria.py O02 "Costa de Marfil"

El script detecta la fase automáticamente por el ID:
  D01-D16: dieciseisavos
  O01-O08: octavos
  C01-C04: cuartos
  S01-S02: semis
  F01: final
"""

import requests
import sys
import os
from dotenv import load_dotenv

load_dotenv()

VERCEL_URL = os.getenv('VERCEL_URL', 'https://quiniela-gray.vercel.app').rstrip('/')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', '')

if not ADMIN_PASSWORD:
    print('Error: ADMIN_PASSWORD no configurada en .env')
    sys.exit(1)

def cargar_resultado(partido_id: str, ganador: str):
    """Carga un resultado de eliminatoria y recalcula puntos."""
    url = f'{VERCEL_URL}/api/resultados-eliminatorias'

    payload = {
        'partidoId': partido_id.upper(),
        'ganador': ganador,
    }

    # Usar Basic Auth con contraseña como bearer token
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {ADMIN_PASSWORD}',
    }

    print(f'Cargando: {partido_id} → ganador: {ganador}')
    print(f'POST {url}')

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        result = response.json()
        print(f'✓ Éxito: {result}')
        return True
    except requests.exceptions.RequestException as e:
        print(f'✗ Error: {e}')
        if hasattr(e, 'response') and e.response is not None:
            print(f'  Response: {e.response.text}')
        return False

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)

    partido_id = sys.argv[1]
    ganador = sys.argv[2]

    if not cargar_resultado(partido_id, ganador):
        sys.exit(1)
