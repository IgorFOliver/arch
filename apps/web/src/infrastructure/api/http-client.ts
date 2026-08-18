const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message = `Request failed with status ${status}`,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(apiUrl(path), {
    credentials: 'include',
    ...init,
    headers: init?.body
      ? { 'Content-Type': 'application/json', ...init.headers }
      : init?.headers,
  });

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
