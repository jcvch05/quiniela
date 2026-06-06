# Quiniela Mundialista 2026 · Familia Vilaseca

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Firebase Firestore via REST API (proyecto: nudge-fb713)
- Deploy en Vercel

## Páginas
- `/` — Landing con reglas y premios
- `/registro` — Formulario 4 pasos: pago → datos → especiales → grupos
- `/tabla` — Leaderboard público (solo participantes con pago confirmado)
- `/admin` — Panel privado con password

## Variables de entorno
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=nudge-fb713`
- `ADMIN_PASSWORD=vilaseca2026`

## Pendientes
- [ ] Subir QR real de E-BISA a /public/qr-pago.png
- [ ] Cambiar ADMIN_PASSWORD en Vercel
- [ ] Confirmar partidos reales en src/lib/partidos.ts
- [ ] API para cargar resultados y recalcular puntos
