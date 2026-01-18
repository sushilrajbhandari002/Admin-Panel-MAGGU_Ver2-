const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Something went wrong';
    try {
      const data = await response.json();
      message = data?.message ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  return handleResponse<T>(response);
}

export { API_BASE_URL };

