import { NextRequest } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

export async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const adminUid = process.env.ADMIN_UID;
  if (!adminUid) return false;

  const token = req.cookies.get('auth_token')?.value;
  if (!token) return false;

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }) }
    );
    if (!res.ok) return false;
    const data = await res.json();
    const uid = data?.users?.[0]?.localId;
    return uid === adminUid;
  } catch {
    return false;
  }
}
