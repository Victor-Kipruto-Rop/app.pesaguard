const DEFAULT_API_BASE_URL = "https://api.pesaguard.co.ke";

export const API_BASE_URL = (
  import.meta.env.VITE_PESAGUARD_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

export type ApiConnectionState = "checking" | "healthy" | "degraded" | "unreachable";

export interface ApiConnectionSnapshot {
  state: ApiConnectionState;
  message: string;
  checkedAt: string | null;
  httpStatus: number | null;
}

interface ApiErrorPayload {
  error?: string;
  message?: string;
}

export class PesaguardApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = "api_error") {
    super(message);
    this.name = "PesaguardApiError";
    this.status = status;
    this.code = code;
  }
}

async function readPayload(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

function apiError(payload: unknown, status: number): PesaguardApiError {
  const record = payload && typeof payload === "object" ? payload as ApiErrorPayload : {};
  return new PesaguardApiError(
    typeof record.message === "string" ? record.message : "The request could not be completed.",
    status,
    typeof record.error === "string" ? record.error : "api_error",
  );
}

export interface LoginResult {
  accessToken: string;
  tenantId: string;
  userId: string;
  username: string;
  expiresIn: number | null;
}

export async function loginToApi(email: string, password: string, tenantId = "default"): Promise<LoginResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ username: email.trim(), password, tenant_id: tenantId.trim() || "default" }),
    });
  } catch {
    throw new PesaguardApiError("Could not reach PesaGuard authentication. Check API availability and CORS configuration.", 0, "network_error");
  }

  const payload = await readPayload(response);
  if (!response.ok) throw apiError(payload, response.status);

  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  if (record.status === "mfa_challenge_required" || record.challenge_type) {
    throw new PesaguardApiError("This account requires an additional verification step. Complete the configured MFA challenge before signing in.", response.status, "mfa_required");
  }

  const accessToken = typeof record.access_token === "string"
    ? record.access_token
    : typeof record.token === "string" ? record.token : "";
  const returnedTenant = typeof record.tenant_id === "string" ? record.tenant_id : "";
  if (!accessToken || !returnedTenant) {
    throw new PesaguardApiError("The identity service returned an incomplete session. No dashboard access was granted.", response.status, "invalid_session_response");
  }

  const user = record.user && typeof record.user === "object" ? record.user as Record<string, unknown> : {};
  return {
    accessToken,
    tenantId: returnedTenant,
    userId: typeof record.user_id === "string" ? record.user_id : typeof user.id === "string" ? user.id : "",
    username: typeof record.username === "string" ? record.username : typeof user.username === "string" ? user.username : email.trim(),
    expiresIn: typeof record.expires_in === "number" ? record.expires_in : null,
  };
}

export interface ApiTransactionPage {
  items: Array<{
    id: string;
    tenant_id: string;
    trans_id: string;
    status: string;
    trans_amount: string | number;
    currency: string;
    created_at: string;
  }>;
  page: number;
  per_page: number;
  total: number;
}

export async function fetchTenantTransactions(accessToken: string, signal?: AbortSignal): Promise<ApiTransactionPage> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/transactions/search?page=1&per_page=100&sort=created_at:desc`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new PesaguardApiError("Could not reach the transaction API. Check API availability and CORS configuration.", 0, "network_error");
  }

  const payload = await readPayload(response);
  if (!response.ok) throw apiError(payload, response.status);
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  if (!Array.isArray(record.items) || typeof record.total !== "number") {
    throw new PesaguardApiError("The transaction API returned an unexpected response format.", response.status, "invalid_response");
  }
  return record as unknown as ApiTransactionPage;
}

export async function checkApiHealth(signal?: AbortSignal): Promise<ApiConnectionSnapshot> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/status`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });
    const payload: unknown = await response.json().catch(() => null);
    const record = payload && typeof payload === "object"
      ? payload as Record<string, unknown>
      : {};
    const statusText = String(record.status ?? record.state ?? "").toLowerCase();
    const isHealthy = response.ok && ["ok", "healthy", "operational", "success"].includes(statusText);
    const isDegraded = ["degraded", "partial", "warning", "outage", "unknown", "failed"].includes(statusText) || response.status === 503;

    return {
      state: isHealthy ? "healthy" : isDegraded ? "degraded" : "unreachable",
      message: isHealthy
        ? "API status endpoint reports healthy."
        : isDegraded
          ? "The API or one of its dependencies reports a degraded state."
          : `API status check returned HTTP ${response.status}.`,
      checkedAt: new Date().toISOString(),
      httpStatus: response.status,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return {
      state: "unreachable",
      message: "Could not reach the API status endpoint. Check service availability and CORS configuration.",
      checkedAt: new Date().toISOString(),
      httpStatus: null,
    };
  }
}
