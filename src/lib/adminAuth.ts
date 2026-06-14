import { NextRequest } from 'next/server';

export async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('auth_token')?.value;
  return !!token;
}
