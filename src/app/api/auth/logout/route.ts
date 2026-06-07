import { NextResponse } from 'next/server';

export async function POST() {
  const expired = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  const res = NextResponse.json({ ok: true });
  res.headers.append('Set-Cookie', `auth_token=; ${expired}`);
  res.headers.append('Set-Cookie', `auth_uid=; ${expired}`);
  res.headers.append('Set-Cookie', `auth_name=; ${expired}`);
  res.headers.append('Set-Cookie', `auth_email=; ${expired}`);
  return res;
}
