const TOKEN_KEY = 'pub_mis_token';

// Base URL for the API.
// - In dev, leave VITE_API_URL unset and Vite's `/api` proxy handles it.
// - In prod (Vercel), set VITE_API_URL to the Render API origin
//   (e.g. https://lps-mis-api.onrender.com) and we'll prefix every request.
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown };

export async function api<T = unknown>(path: string, options: Options = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const token = getToken();
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    // Let AuthContext / router handle the redirect on next render
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new ApiError('Unauthorized', 401);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      (data as { error?: string }).error || `HTTP ${res.status}`,
      res.status,
      data
    );
  }

  return data as T;
}
