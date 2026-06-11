const BASE = process.env.NEXT_PUBLIC_API_URL!;

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? body.detail ?? 'Erro desconhecido');
  return body as T;
}

export function login(email: string, password: string) {
  return req<{ token: string }>('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string) {
  return req<{ message: string }>('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export interface CapturaResponse {
  id_registro: string;
  hash_sha256: string;
  tamanho_bytes: number;
  status: string;
  screenshot_base64?: string;
}

export interface Registro {
  id: string;
  titulo: string;
  url_alvo: string;
  hash_img: string;
  created_at?: string;
}

export function getCaptures(token: string) {
  return req<{ registros: Registro[] }>('/api/captures', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getCapture(token: string, id: string) {
  return req<Registro>(`/api/captures/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function solicitarCaptura(
  token: string,
  url: string,
  titulo: string,
  usuario_id: string
) {
  return req<CapturaResponse>('/api/capture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, titulo, usuario_id }),
  });
}
