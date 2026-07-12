import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const uid = req.nextUrl.searchParams.get('uid');
  const nombre = req.nextUrl.searchParams.get('nombre');

  if (!uid && !nombre) return NextResponse.json(null);

  try {
    const all = await getCollection('participantes') as Record<string, unknown>[];

    // 1. Exact uid field match
    if (uid) {
      const byUid = all.find(p => p.uid === uid);
      if (byUid) return NextResponse.json(byUid);
    }

    // 2. Nombre match (case-insensitive)
    if (nombre) {
      const n = nombre.trim().toLowerCase();
      const byNombre = all.find(p =>
        typeof p.nombre === 'string' && p.nombre.trim().toLowerCase() === n
      );
      if (byNombre) return NextResponse.json(byNombre);
    }

    return NextResponse.json(null);
  } catch {
    return NextResponse.json(null);
  }
}
