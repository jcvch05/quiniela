# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

World Cup 2026 prediction pool (quiniela) for the Vilaseca family. Next.js 14 (App Router) + TypeScript + Tailwind CSS, deployed on Vercel. Backend is Firebase Firestore accessed exclusively via REST API (no Firebase SDK) using the project `nudge-fb713` in `southamerica-east1`.

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint
```

No test suite configured.

## Architecture

### Auth flow
Firebase Auth REST API (`identitytoolkit.googleapis.com`) — `src/lib/authService.ts` handles sign-up/sign-in and returns an `idToken`. The token is stored in a `auth_token` cookie (1h TTL). `src/middleware.ts` enforces auth on every route except the public allowlist (`/login`, `/api/auth/*`, `/api/participantes`, `/api/resultados-publicos`).

The `idToken` is passed as a `Bearer` token to Firestore write operations for permission enforcement. All API routes must receive it from `req.cookies.get('auth_token')` and forward it to firebase helpers.

### Firestore access layer (`src/lib/firebase.ts`)
Custom REST wrappers: `getCollection`, `getDocument`, `createDocument`, `updateDocument`. All values are serialized/deserialized through `toFirestoreValue` / `fromFirestoreValue` — **never pass raw Firestore JSON outside this module**. Upsert pattern in registration: try `getDocument`, then `updateDocument`, catch and fall back to `createDocument`.

### Scoring (`src/lib/puntuacion.ts`)
- Group stage match: exact score = 8 pts, exact difference = 5 pts, correct result = 3 pts, miss = 0.
- Knockout rounds: each correct team to advance = 10 pts.
- Specials: champion = 50, runner-up = 25, top scorer = 20, each semifinalist = 10.

### Pages / routes
- `/registro` — 4-step form (payment → personal data → specials → groups). Uses `react-hook-form` + `zod`. Submits to `POST /api/registro`.
- `/tabla` — public leaderboard, only shows `pagado: true` participants.
- `/admin` — password-protected panel (`ADMIN_PASSWORD` env var). Manages payment confirmation and participant deletion.
- `/dashboard` — authenticated participant view of their own predictions.
- `/pronosticos` — edit predictions.
- `/fixture` — public match schedule.

### API routes (`src/app/api/`)
| Route | Purpose |
|---|---|
| `POST /api/registro` | Create/upsert participant |
| `GET /api/participantes` | Public leaderboard (pagado only) |
| `GET/POST /api/resultados` | Admin: read/write match results |
| `GET /api/resultados-publicos` | Public fixture |
| `GET /api/dashboard` | Authenticated participant data |
| `POST /api/admin/participante` | Confirm payment / delete participant |
| `POST /api/email` | Send confirmation email via Resend |
| `POST /api/auth/login` | Sign in, set cookies |
| `POST /api/auth/logout` | Clear cookies |
| `GET /api/auth/me` | Verify session from cookie |

### Data model (`src/types/index.ts`)
Key type: `Participante` — stores `pronosticosGrupos` (map of `partidoId → {golesLocal, golesVisitante}`), `pronosticosEspeciales`, knockout bracket picks (`octavos[]`, `cuartos[]`, `semis[]`), and computed `puntos` / `desglose`.

Match data lives in `src/lib/partidos.ts` (static array of `Partido` objects). Flag emojis in `src/lib/banderas.ts`.

## Environment variables

```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nudge-fb713
NEXT_PUBLIC_FIREBASE_API_KEY=...       # Firebase Web API key (Identity Toolkit)
ADMIN_PASSWORD=...
RESEND_API_KEY=...
```

## Pending

- [ ] Subir QR real de E-BISA a `/public/qr-pago.png`
- [ ] Cambiar `ADMIN_PASSWORD` en Vercel
- [ ] Confirmar partidos reales en `src/lib/partidos.ts`
- [ ] API para cargar resultados y recalcular puntos
