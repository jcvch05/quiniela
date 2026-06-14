import { NextRequest } from 'next/server';

function getUidFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    const json = JSON.parse(decoded);
    return json.user_id ?? json.sub ?? null;
  } catch {
    return null;
  }
}

export async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const adminUid = process.env.ADMIN_UID;
  if (!adminUid) return false;
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return false;
  return getUidFromToken(token) === adminUid;
}
