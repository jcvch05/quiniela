const FIREBASE_BASE = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`;

async function firestoreRequest(path: string, method = 'GET', body?: object, token?: string) {
  const url = `${FIREBASE_BASE}/${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Firestore error: ${res.status}`);
  return res.json();
}

function toFirestoreValue(val: unknown): object {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') return { integerValue: String(val) };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields: Record<string, object> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function fromFirestoreValue(val: Record<string, unknown>): unknown {
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return val.doubleValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    const arr = val.arrayValue as { values?: Record<string, unknown>[] };
    return (arr.values ?? []).map(fromFirestoreValue);
  }
  if ('mapValue' in val) {
    const map = val.mapValue as { fields?: Record<string, Record<string, unknown>> };
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(map.fields ?? {})) {
      obj[k] = fromFirestoreValue(v);
    }
    return obj;
  }
  return null;
}

function docToObject(doc: { name: string; fields: Record<string, Record<string, unknown>> }) {
  const id = doc.name.split('/').pop()!;
  const obj: Record<string, unknown> = { id };
  for (const [k, v] of Object.entries(doc.fields ?? {})) {
    obj[k] = fromFirestoreValue(v);
  }
  return obj;
}

export async function getCollection(collection: string, token?: string) {
  const data = await firestoreRequest(collection, 'GET', undefined, token);
  if (!data.documents) return [];
  return data.documents.map(docToObject);
}

export async function getDocument(collection: string, id: string, token?: string) {
  const doc = await firestoreRequest(`${collection}/${id}`, 'GET', undefined, token);
  return docToObject(doc);
}

export async function createDocument(collection: string, id: string, data: Record<string, unknown>, token?: string) {
  const fields: Record<string, object> = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = toFirestoreValue(v);
  }
  return firestoreRequest(`${collection}?documentId=${id}`, 'POST', { fields }, token);
}

export async function updateDocument(collection: string, id: string, data: Record<string, unknown>, token?: string) {
  const fields: Record<string, object> = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = toFirestoreValue(v);
  }
  const updateMask = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');
  return firestoreRequest(`${collection}/${id}?${updateMask}`, 'PATCH', { fields }, token);
}
