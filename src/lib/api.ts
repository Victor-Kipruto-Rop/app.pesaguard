const DEFAULT_API_BASE_URL = "https://api.pesaguard.co.ke";

export const API_BASE_URL = (
  import.meta.env.VITE_PESAGUARD_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\\/+$/, "");

export type ApiConnectionState = "checking" | "healthy" | "degraded" | "unreachable";

export interface ApiConnectionSnapshot {
  state: ApiConnectionState;
  message: string;
  checkedAt: string | null;
  httpStatus: number | null;
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
    const isDegraded = ["degraded", "partial", "warning"].includes(statusText) || response.status === 503;

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
