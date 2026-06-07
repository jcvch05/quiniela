import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const uid   = req.cookies.get('auth_uid')?.value;
  const name  = decodeURIComponent(req.cookies.get('auth_name')?.value ?? '');
  const email = decodeURIComponent(req.cookies.get('auth_email')?.value ?? '');

  if (!token || !uid) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { uid, name, email, token } });
}
