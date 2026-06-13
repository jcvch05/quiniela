import { NextRequest, NextResponse } from 'next/server';
import { getCollection, updateDocument } from '@/lib/firebase';
import { verifyAdmin } from '@/lib/adminAuth';

const FIREBASE_BASE = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`;

export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const participantes = await getCollection('participantes');
  return NextResponse.json(participantes);
}

export async function PATCH(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const token = req.cookies.get('auth_token')?.value;
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
  await updateDocument('participantes', id, data, token);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const token = req.cookies.get('auth_token')?.value;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  const res = await fetch(`${FIREBASE_BASE}/participantes/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Firestore delete error:', res.status, err);
    return NextResponse.json({ error: `Error Firestore: ${res.status}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
