const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
const BASE = `https://identitytoolkit.googleapis.com/v1/accounts`;

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  idToken: string;
}

async function authRequest(endpoint: string, body: object): Promise<AuthUser> {
  const res = await fetch(`${BASE}:${endpoint}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const code = data?.error?.message ?? 'ERROR';
    throw new Error(traducirError(code));
  }
  return {
    uid: data.localId,
    email: data.email,
    displayName: data.displayName,
    idToken: data.idToken,
  };
}

export async function signUp(email: string, password: string, nombre: string): Promise<AuthUser> {
  const user = await authRequest('signUp', { email, password, returnSecureToken: true });
  // Actualizar displayName
  await fetch(`${BASE}:update?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: user.idToken, displayName: nombre, returnSecureToken: false }),
  });
  return { ...user, displayName: nombre };
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  return authRequest('signInWithPassword', { email, password, returnSecureToken: true });
}

export async function getUserInfo(idToken: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${BASE}:lookup?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.users?.[0]) return null;
    const u = data.users[0];
    return { uid: u.localId, email: u.email, displayName: u.displayName, idToken };
  } catch { return null; }
}

function traducirError(code: string): string {
  const errores: Record<string, string> = {
    EMAIL_EXISTS: 'Ya existe una cuenta con ese email.',
    EMAIL_NOT_FOUND: 'No existe una cuenta con ese email.',
    INVALID_PASSWORD: 'Contraseña incorrecta.',
    INVALID_EMAIL: 'El email no es válido.',
    WEAK_PASSWORD: 'La contraseña debe tener al menos 6 caracteres.',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'Demasiados intentos. Intentá más tarde.',
    USER_DISABLED: 'Esta cuenta fue deshabilitada.',
    INVALID_LOGIN_CREDENTIALS: 'Email o contraseña incorrectos.',
  };
  return errores[code] ?? `Error: ${code}`;
}

// Cookie helpers (client-side)
export function saveSession(user: AuthUser) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString(); // 1 hora
  document.cookie = `auth_token=${user.idToken}; expires=${expires}; path=/; SameSite=Strict`;
  document.cookie = `auth_uid=${user.uid}; expires=${expires}; path=/; SameSite=Strict`;
  document.cookie = `auth_name=${encodeURIComponent(user.displayName ?? user.email)}; expires=${expires}; path=/; SameSite=Strict`;
}

export function clearSession() {
  if (typeof document === 'undefined') return;
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'auth_uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'auth_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export function getSession(): { uid: string; name: string; token: string } | null {
  if (typeof document === 'undefined') return null;
  const cookies = Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')));
  if (!cookies.auth_token || !cookies.auth_uid) return null;
  return {
    token: cookies.auth_token,
    uid: cookies.auth_uid,
    name: decodeURIComponent(cookies.auth_name ?? ''),
  };
}
