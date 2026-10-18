import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Database, RefreshCw } from "lucide-react";
import type { DashboardPage } from "../../app/config/routes";
import type { LoginResult } from "../../lib/api";
import { PesaguardApiError } from "../../lib/api";
import { dashboardResourceDefinition, dashboardResourceNote, fetchDashboardResource, type DashboardResourceResult } from "../../lib/dashboardResources";

interface ApiResourcePageProps {
  page: DashboardPage;
  session: LoginResult;
}

function humanize(value: string): string {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    /(secret|token|password|credential|private.?key|signing.?key|authorization|api.?key)/i.test(key)
      ? "[REDACTED]"
      : redactSensitive(item),
  ]));
}

function extractRows(payload: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return null;
  for (const key of ["items", "results", "data", "records", "rows"]) {
    if (Array.isArray(payload[key])) return (payload[key] as unknown[]).filter(isRecord);
  }
  return null;
}

function PayloadView({ payload }: { payload: unknown }) {
  const rows = extractRows(payload);
  const columns = useMemo(() => {
    const keys = new Set<string>();
    for (const row of (rows ?? []).slice(0, 30)) Object.keys(row).forEach((key) => keys.add(key));
    return [...keys].slice(0, 8);
  }, [rows]);

  if (rows) {
    if (rows.length === 0) {
      return <div className="panel" style={{ padding: 24 }}><h2>No records returned</h2><p>The Core API returned an empty collection for this tenant. No sample rows have been inserted.</p></div>;
    }
    if (columns.length === 0) return <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{JSON.stringify(rows, null, 2)}</pre>;
    return (
      <div style={{ overflowX: "auto", maxWidth: "100%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead><tr>{columns.map((column) => <th key={column} scope="col" style={{ padding: "12px 14px", borderBottom: "1px solid var(--border, #dce5df)", whiteSpace: "nowrap" }}>{humanize(column)}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => <tr key={String(row.id ?? row.uuid ?? row.key ?? index)}>{columns.map((column) => <td key={column} style={{ padding: "12px 14px", borderBottom: "1px solid var(--border, #dce5df)", verticalAlign: "top", maxWidth: 360, overflowWrap: "anywhere" }}>{displayValue(row[column])}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }

  if (isRecord(payload)) {
    const entries = Object.entries(payload);
    if (entries.length === 0) return <p>The Core API returned an empty object.</p>;
    return <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>{entries.map(([key, value]) => <div key={key} className="panel" style={{ padding: 16, minWidth: 0 }}><dt style={{ opacity: 0.7, marginBottom: 6 }}>{humanize(key)}</dt><dd style={{ margin: 0, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{displayValue(value)}</dd></div>)}</dl>;
  }

  return <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{displayValue(payload)}</pre>;
}

export function ApiResourcePage({ page, session }: ApiResourcePageProps) {
  const definition = useMemo(() => dashboardResourceDefinition(page, session.tenantId), [page, session.tenantId]);
  const [result, setResult] = useState<DashboardResourceResult | null>(null);
  const [error, setError] = useState<{ message: string; status: number; code: string } | null>(null);
  const [loading, setLoading] = useState(Boolean(definition));
  const [reloadVersion, setReloadVersion] = useState(0);

  const load = useCallback((signal: AbortSignal) => {
    setResult(null);
    setError(null);
    if (!definition) {
      setLoading(false);
      setError({ message: "No dedicated, verified Core API endpoint is mapped to this page. Sample data and local-only mutations are disabled.", status: 501, code: "endpoint_not_implemented" });
      return () => undefined;
    }
    setLoading(true);
    void fetchDashboardResource(page, session, signal)
      .then(setResult)
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        if (cause instanceof PesaguardApiError) setError({ message: cause.message, status: cause.status, code: cause.code });
        else setError({ message: "The Core API request failed. No sample data was substituted.", status: 0, code: "unknown_error" });
      })
      .finally(() => { if (!signal.aborted) setLoading(false); });
    return () => undefined;
  }, [definition, page, session]);

  useEffect(() => {
    const controller = new AbortController();
    const cancel = load(controller.signal);
    return () => { controller.abort(); cancel(); };
  }, [load, reloadVersion]);

  return (
    <section className="page-stack">
      <section className="panel" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p className="eyebrow">CORE API · READ-ONLY</p>
            <h1 style={{ margin: "8px 0" }}>{humanize(page)}</h1>
            <p>{dashboardResourceNote(page, session.tenantId)}</p>
            <p style={{ fontSize: 12, opacity: 0.7 }}>Tenant: {session.tenantId}</p>
          </div>
          {definition && <button type="button" className="button button-secondary" onClick={() => setReloadVersion((version) => version + 1)} disabled={loading} aria-label="Refresh Core API data"><RefreshCw size={16} /> Refresh</button>}
        </div>
      </section>

      {loading && <section className="panel" style={{ padding: 24 }} role="status"><RefreshCw size={18} className="spin" /> Loading data from the Core API…</section>}

      {!loading && result && (
        <section className="panel" style={{ padding: 24 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
            <CheckCircle2 size={17} />
            <strong>Live API response</strong>
            <span style={{ opacity: 0.7 }}>HTTP {result.status}</span>
            <span style={{ opacity: 0.7 }}>Updated {new Date(result.fetchedAt).toLocaleString()}</span>
            <code>{result.path}</code>
          </div>
          <PayloadView payload={redactSensitive(result.payload)} />
        </section>
      )}

      {!loading && error && (
        <section className="panel" style={{ padding: 24 }} role="alert">
          <p><AlertCircle size={18} /> <strong>{error.code === "endpoint_not_implemented" ? "Backend endpoint not implemented" : error.status === 403 ? "Access denied by the Core API" : error.status === 401 ? "Session expired or unauthorized" : "Core API data unavailable"}</strong></p>
          <p>{error.message}</p>
          <small>HTTP {error.status || "network"} · {error.code}</small>
          <p style={{ fontSize: 12, opacity: 0.75 }}>This page will not substitute demo data. Read-only mode remains in effect until a supported endpoint and permissioned operation are available.</p>
        </section>
      )}
    </section>
  );
}
