type ApiErrorBody = { code?: string; message?: string; error?: string; requestId?: string };

export type AuthResponse = { token: string; user_id: string; username: string; tenant_id: string; roles: string[]; expires_in: number };

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.pesaguard.victorkipruto.com").replace(/\/$/, "");

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init.headers ?? {}) } });
  const body = await response.json().catch(() => ({})) as ApiErrorBody;
  if (!response.ok) throw new Error(body.message ?? body.error ?? `Request failed (${response.status})`);
  return body as T;
}

export const apiClient = {
  login(username: string, password: string) { return request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }); },
  verify() { return request<{ user_id: string; username: string; tenant_id: string; roles: string[]; permissions: string[] }>("/auth/verify"); },
};