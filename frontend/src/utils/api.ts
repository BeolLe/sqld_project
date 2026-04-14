const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CSRF_COOKIE_NAME = 'solsqld_csrf_token';

let refreshPromise: Promise<boolean> | null = null;

function getCookie(name: string): string | null {
  const target = `${name}=`;
  const cookies = document.cookie.split(';');
  for (const rawCookie of cookies) {
    const cookie = rawCookie.trim();
    if (cookie.startsWith(target)) {
      return decodeURIComponent(cookie.slice(target.length));
    }
  }
  return null;
}

function isUnsafeMethod(method?: string): boolean {
  const normalizedMethod = (method ?? 'GET').toUpperCase();
  return !['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod);
}

async function performRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const csrfToken = getCookie(CSRF_COOKIE_NAME);
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
      });
      return response.ok;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiRequest(path: string, init?: RequestInit, allowRefresh = true): Promise<Response> {
  const csrfToken = getCookie(CSRF_COOKIE_NAME);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(isUnsafeMethod(init?.method) && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (
    response.status === 401 &&
    allowRefresh &&
    path !== '/auth/login' &&
    path !== '/auth/refresh'
  ) {
    const refreshed = await performRefresh();
    if (refreshed) {
      return apiRequest(path, init, false);
    }
  }

  return response;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiRequest(path, init);

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
