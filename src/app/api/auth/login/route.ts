import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { token, uid, name, email } = await req.json();
  if (!token || !uid) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  const cookieOpts = `expires=${expires.toUTCString()}; path=/; SameSite=Lax; HttpOnly`;

  const res = NextResponse.json({ ok: true });
  res.headers.append('Set-Cookie', `auth_token=${token}; ${cookieOpts}`);
  res.headers.append('Set-Cookie', `auth_uid=${uid}; ${cookieOpts}`);
  res.headers.append('Set-Cookie', `auth_name=${encodeURIComponent(name ?? '')}; ${cookieOpts}`);
  res.headers.append('Set-Cookie', `auth_email=${encodeURIComponent(email ?? '')}; ${cookieOpts}`);
  return res;
}
