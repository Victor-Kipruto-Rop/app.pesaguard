import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Database, RefreshCw } from "lucide-react";
import type { DashboardPage } from "../../app/config/routes";
import type { LoginResult } from "../../lib/api";
import { PesaguardApiError } from "../../lib/api";
import { dashboardResourceDefinition, dashboardResourceNote, fetchDashboardResource, type DashboardResourceResult } from "../../lib/dashboardResources";

interface ApiResourcePageProps {
  page: DashboardPage;
  session: LoginResult;
}

function readable(value: unknown): string {
  try { return JSON.stringify(value, null, 2) ?? "null"; }
  catch { return String(value); }
}

export function ApiResourcePage({ page, session }: ApiResourcePageProps) {
  const definition = dashboardResourceDefinition(page, session.tenantId);
  const [result, setResult] = useState<DashboardResourceResult | null>(null);
  const [error, setError] = useState<{ message: string; status: number; code: string } | null>(null);
  const [loading, setLoading] = useState(Boolean(definition));

  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    setError(null);
    if (!definition) {
      setLoading(false);
      setError({ message: "No verified Core API endpoint is implemented for this page. Sample data and local-only mutations are disabled.", status: 501, code: "endpoint_not_implemented" });
      return () => controller.abort();
    }
    setLoading(true);
    void fetchDashboardResource(page, session, controller.signal)
      .then((value) => setResult(value))
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        if (cause instanceof PesaguardApiError) setError({ message: cause.message, status: cause.status, code: cause.code });
        else setError({ message: "The Core API request failed. No sample data was substituted.", status: 0, code: "unknown_error" });
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, session.accessToken, session.tenantId, definition?.path]);

  return (
    <main className="page-stack">
      <section className="panel" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p className="eyebrow">CORE API · READ-ONLY</p>
            <h1 style={{ margin: "8px 0" }}>{page.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</h1>
            <p>{dashboardResourceNote(page, session.tenantId)}</p>
          </div>
          <span className="mw-status mw-status--neutral"><Database size={14} /> Tenant API data</span>
        </div>
        <div role="status" aria-live="polite" style={{ marginTop: 20 }}>
          {loading && <p><RefreshCw size={16} className="spin" /> Loading verified Core API data…</p>}
          {!loading && result && (
            <div>
              <p><CheckCircle2 size={16} /> Received HTTP {result.status} · {new Date(result.fetchedAt).toLocaleString()}</p>
              <p><code>{result.path}</code></p>
              <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: "60vh", overflow: "auto", padding: 16, borderRadius: 12, background: "var(--surface-subtle, #f4f7f5)" }}>{readable(result.payload)}</pre>
            </div>
          )}
          {!loading && error && (
            <div className="panel" style={{ padding: 16 }} role="alert">
              <p><AlertCircle size={18} /> {error.code === "endpoint_not_implemented" ? "Backend endpoint not implemented" : error.status === 403 ? "Access denied by the Core API" : error.status === 401 ? "Session expired or unauthorized" : "Core API data unavailable"}</p>
              <p>{error.message}</p>
              <small>HTTP {error.status || "network"} · {error.code}</small>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
