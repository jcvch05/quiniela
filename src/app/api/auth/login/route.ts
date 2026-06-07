import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { token, uid, name, email } = await req.json();
  if (!token || !uid) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });

  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  const exp = expires.toUTCString();

  const res = NextResponse.json({ ok: true });
  // auth_token: HttpOnly (solo el servidor lo lee, más seguro)
  res.headers.append('Set-Cookie', `auth_token=${token}; expires=${exp}; path=/; SameSite=Lax; HttpOnly`);
  // uid, name, email: accesibles al cliente para mostrar en la UI
  res.headers.append('Set-Cookie', `auth_uid=${uid}; expires=${exp}; path=/; SameSite=Lax`);
  res.headers.append('Set-Cookie', `auth_name=${encodeURIComponent(name ?? '')}; expires=${exp}; path=/; SameSite=Lax`);
  res.headers.append('Set-Cookie', `auth_email=${encodeURIComponent(email ?? '')}; expires=${exp}; path=/; SameSite=Lax`);
  return res;
}
