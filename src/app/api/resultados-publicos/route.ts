import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/firebase';

export async function GET() {
  try {
    const resultados = await getCollection('resultados');
    return NextResponse.json(resultados, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
