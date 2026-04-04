const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ACCESS_TOKEN_KEY = 'solsqld_access_token';

function getToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      (body as Record<string, string>).detail ??
      (body as Record<string, string>).message ??
      `API 요청 실패 (${response.status})`;
    throw new Error(message);
  }

  return (await response.json()) as T;
}
