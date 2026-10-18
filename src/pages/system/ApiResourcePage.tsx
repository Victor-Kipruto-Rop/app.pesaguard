import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, CheckCircle2, Database, RefreshCw } from "lucide-react";
import type { DashboardPage } from "../../app/config/routes";
import type { LoginResult } from "../../lib/api";
import { API_BASE_URL, PesaguardApiError, refreshApiSession } from "../../lib/api";
import { dashboardResourceDefinition, dashboardResourceNote, fetchDashboardResource, type DashboardResourceResult } from "../../lib/dashboardResources";

interface ApiResourcePageProps {
  page: DashboardPage;
  session: LoginResult;
  onSessionRefresh: (session: LoginResult) => void;
  onSessionExpired: () => void;
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
    /(secret|token|password|credential|private.?key|signing.?key|authorization|api.?key|raw.?payload|msisdn|phone.?number)/i.test(key)
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

function OverviewPayloadView({ payload }: { payload: Record<string, unknown> }) {
  const transactions = isRecord(payload.transactions) ? payload.transactions : {};
  const discrepancies = isRecord(payload.discrepancies) ? payload.discrepancies : {};
  const statuses = isRecord(transactions.by_status) ? transactions.by_status : {};
  const amountsByCurrency = isRecord(transactions.amount_by_currency) ? transactions.amount_by_currency : {};
  const amountLabel = Object.entries(amountsByCurrency).map(([currency, amount]) => currency + " " + displayValue(amount)).join(" · ") || "—";
  const severities = isRecord(discrepancies.by_severity) ? discrepancies.by_severity : {};
  const metrics = [
    ["Total transactions", displayValue(transactions.total), displayValue(transactions.recent_30_days) + " in the last 30 days"],
    ["Recorded transaction amount by currency", amountLabel, "Persisted amounts grouped by currency; no currency conversion is applied"],
    ["Total discrepancies", displayValue(discrepancies.total), displayValue(discrepancies.recent_30_days) + " detected in the last 30 days"],
    ["Open discrepancies", displayValue(discrepancies.open), displayValue(discrepancies.resolved) + " resolved"],
  ];
  const generatedAt = typeof payload.generated_at === "string" ? new Date(payload.generated_at) : null;
  const updated = generatedAt && !Number.isNaN(generatedAt.getTime()) ? generatedAt.toLocaleString() : "timestamp unavailable";
  return (
    <div className="page-stack">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
        {metrics.map(([label, value, detail]) => <article className="panel" key={label} style={{ padding: 20, minWidth: 0 }}>
          <p style={{ margin: 0, opacity: 0.7, fontSize: 13 }}>{label}</p>
          <p style={{ margin: "12px 0", fontSize: 28, fontWeight: 700, overflowWrap: "anywhere" }}>{value}</p>
          <p style={{ margin: 0, opacity: 0.7, fontSize: 12 }}>{detail}</p>
        </article>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <section className="panel" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>Transaction lifecycle</h2>
          {Object.keys(statuses).length ? <dl style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>{Object.entries(statuses).map(([key, value]) => <div key={key} style={{ display: "contents" }}><dt>{humanize(key)}</dt><dd style={{ margin: 0 }}>{displayValue(value)}</dd></div>)}</dl> : <p>No transaction status counts were returned.</p>}
        </section>
        <section className="panel" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>Discrepancy severity</h2>
          {Object.keys(severities).length ? <dl style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>{Object.entries(severities).map(([key, value]) => <div key={key} style={{ display: "contents" }}><dt>{humanize(key)}</dt><dd style={{ margin: 0 }}>{displayValue(value)}</dd></div>)}</dl> : <p>No discrepancy severity counts were returned.</p>}
        </section>
      </div>
      <p style={{ fontSize: 12, opacity: 0.7 }}>Updated {updated}. Figures come from persisted tenant records; no sample KPIs or inferred risk scores are shown.</p>
    </div>
  );
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

  if (isRecord(payload) && payload.data_source === "persisted_tenant_records") return <OverviewPayloadView payload={payload} />;

  if (isRecord(payload)) {
    const entries = Object.entries(payload);
    if (entries.length === 0) return <p>The Core API returned an empty object.</p>;
    return <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>{entries.map(([key, value]) => <div key={key} className="panel" style={{ padding: 16, minWidth: 0 }}><dt style={{ opacity: 0.7, marginBottom: 6 }}>{humanize(key)}</dt><dd style={{ margin: 0, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{displayValue(value)}</dd></div>)}</dl>;
  }

  return <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{displayValue(payload)}</pre>;
}

export function ApiResourcePage({ page, session, onSessionRefresh, onSessionExpired }: ApiResourcePageProps) {
  const definition = useMemo(() => dashboardResourceDefinition(page, session.tenantId), [page, session.tenantId]);
  const [result, setResult] = useState<DashboardResourceResult | null>(null);
  const [error, setError] = useState<{ message: string; status: number; code: string } | null>(null);
  const [loading, setLoading] = useState(Boolean(definition));
  const [reloadVersion, setReloadVersion] = useState(0);
  const [resourcePage, setResourcePage] = useState(1);
  const [resourceStatus, setResourceStatus] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [recordId, setRecordId] = useState("");
  const [appliedRecordId, setAppliedRecordId] = useState("");
  const [workflowTitle, setWorkflowTitle] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [workflowPayload, setWorkflowPayload] = useState("{}");
  const [workflowRecordId, setWorkflowRecordId] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState("");
  const [workflowUpdatePayload, setWorkflowUpdatePayload] = useState("");
  const [workflowUpdateTitle, setWorkflowUpdateTitle] = useState("");
  const [workflowUpdateDescription, setWorkflowUpdateDescription] = useState("");
  const [workflowBusy, setWorkflowBusy] = useState(false);
  const [workflowMessage, setWorkflowMessage] = useState("");
  const [evidenceType, setEvidenceType] = useState("transaction_reference");
  const [evidenceReference, setEvidenceReference] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");

  useEffect(() => {
    setResourcePage(1);
    setResourceStatus(definition?.defaultStatus ?? "");
    setResourceSearch("");
    setAppliedSearch("");
    setRecordId("");
    setAppliedRecordId("");
    setWorkflowTitle("");
    setWorkflowDescription("");
    setWorkflowPayload(definition?.payloadTemplate ?? "{}");
    setWorkflowRecordId("");
    setWorkflowStatus("");
    setWorkflowUpdatePayload("");
    setWorkflowUpdateTitle("");
    setWorkflowUpdateDescription("");
    setWorkflowMessage("");
    setEvidenceType("transaction_reference");
    setEvidenceReference("");
    setEvidenceNote("");
  }, [page, definition?.defaultStatus]);

  const load = useCallback((signal: AbortSignal) => {
    setResult(null);
    setError(null);
    if (!definition) {
      setLoading(false);
      setError({ message: "No dedicated, verified Core API endpoint is mapped to this page. Sample data and local-only mutations are disabled.", status: 501, code: "endpoint_not_implemented" });
      return () => undefined;
    }
    if (definition.recordIdParam && !appliedRecordId.trim()) {
      setLoading(false);
      setError(null);
      setResult(null);
      return () => undefined;
    }
    setLoading(true);
    void (async () => {
      try {
        const response = await fetchDashboardResource(page, session, signal, { page: resourcePage, perPage: 25, status: resourceStatus, search: appliedSearch, recordId: appliedRecordId });
        if (!signal.aborted) setResult(response);
      } catch (cause: unknown) {
        if (signal.aborted || (cause instanceof DOMException && cause.name === "AbortError")) return;
        if (cause instanceof PesaguardApiError && cause.status === 401 && session.refreshToken) {
          try {
            const renewed = await refreshApiSession(session);
            if (signal.aborted) return;
            onSessionRefresh(renewed);
            const response = await fetchDashboardResource(page, renewed, signal, { page: resourcePage, perPage: 25, status: resourceStatus, search: appliedSearch, recordId: appliedRecordId });
            if (!signal.aborted) setResult(response);
            return;
          } catch (refreshCause: unknown) {
            if (signal.aborted) return;
            if (refreshCause instanceof PesaguardApiError && refreshCause.status === 401) {
              onSessionExpired();
              return;
            }
            if (refreshCause instanceof PesaguardApiError) {
              setError({ message: refreshCause.message, status: refreshCause.status, code: refreshCause.code });
              return;
            }
            setError({ message: "Session renewal failed. No sample data was substituted.", status: 0, code: "session_refresh_failed" });
            return;
          }
        }
        if (cause instanceof PesaguardApiError) setError({ message: cause.message, status: cause.status, code: cause.code });
        else setError({ message: "The Core API request failed. No sample data was substituted.", status: 0, code: "unknown_error" });
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    })();
    return () => undefined;
  }, [definition, page, session, onSessionRefresh, onSessionExpired, resourcePage, resourceStatus, appliedSearch, appliedRecordId]);

  useEffect(() => {
    const controller = new AbortController();
    const cancel = load(controller.signal);
    return () => { controller.abort(); cancel(); };
  }, [load, reloadVersion]);

  const submitWorkflowCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!definition?.workflow || !workflowTitle.trim()) return;
    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(workflowPayload);
      if (!isRecord(parsedPayload)) throw new Error("Payload must be a JSON object.");
    } catch (cause) {
      setError({ message: cause instanceof Error ? cause.message : "Payload must be valid JSON.", status: 400, code: "invalid_payload_json" });
      return;
    }
    setWorkflowBusy(true);
    setWorkflowMessage("");
    setError(null);
    try {
      const body = JSON.stringify({ title: workflowTitle.trim(), description: workflowDescription.trim() || undefined, payload: parsedPayload });
      let activeSession = session;
      let response = await fetch(API_BASE_URL + definition.path, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + activeSession.accessToken },
        body,
        cache: "no-store",
      });
      if (response.status === 401 && activeSession.refreshToken) {
        activeSession = await refreshApiSession(activeSession);
        onSessionRefresh(activeSession);
        response = await fetch(API_BASE_URL + definition.path, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + activeSession.accessToken },
          body,
          cache: "no-store",
        });
      }
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 401) onSessionExpired();
        const message = isRecord(payload) && typeof payload.message === "string" ? payload.message : "Core API request failed with HTTP " + response.status + ".";
        setError({ message, status: response.status, code: isRecord(payload) && typeof payload.error === "string" ? payload.error : "workflow_create_failed" });
        return;
      }
      setWorkflowTitle("");
      setWorkflowDescription("");
      setWorkflowPayload(definition?.payloadTemplate ?? "{}");
      setWorkflowMessage("Workflow record saved by the Core API.");
      setReloadVersion((version) => version + 1);
    } catch (cause) {
      setError({ message: cause instanceof Error ? cause.message : "Workflow record could not be saved.", status: 0, code: "workflow_create_failed" });
    } finally {
      setWorkflowBusy(false);
    }
  };

  const submitEvidence = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!definition?.evidence || !appliedRecordId.trim() || !evidenceType.trim()) return;
    setWorkflowBusy(true);
    setWorkflowMessage("");
    setError(null);
    try {
      const url = API_BASE_URL + definition.path.replace("/{record}", "/" + encodeURIComponent(appliedRecordId.trim())) + "/evidence";
      const body = JSON.stringify({ evidence: { type: evidenceType.trim(), reference: evidenceReference.trim() || undefined, note: evidenceNote.trim() || undefined } });
      let activeSession = session;
      let response = await fetch(url, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + activeSession.accessToken },
        body,
        cache: "no-store",
      });
      if (response.status === 401 && activeSession.refreshToken) {
        activeSession = await refreshApiSession(activeSession);
        onSessionRefresh(activeSession);
        response = await fetch(url, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + activeSession.accessToken },
          body,
          cache: "no-store",
        });
      }
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 401) onSessionExpired();
        const message = isRecord(payload) && typeof payload.message === "string" ? payload.message : "Evidence could not be attached.";
        setError({ message, status: response.status, code: isRecord(payload) && typeof payload.error === "string" ? payload.error : "evidence_create_failed" });
        return;
      }
      setEvidenceReference("");
      setEvidenceNote("");
      setWorkflowMessage("Evidence metadata appended to the investigation.");
      setReloadVersion((version) => version + 1);
    } catch (cause) {
      setError({ message: cause instanceof Error ? cause.message : "Evidence could not be attached.", status: 0, code: "evidence_create_failed" });
    } finally {
      setWorkflowBusy(false);
    }
  };

  const submitWorkflowUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!(definition?.workflow || definition?.workflowUpdate) || !workflowRecordId.trim() || (!workflowStatus && !workflowUpdatePayload.trim() && !workflowUpdateTitle.trim() && !workflowUpdateDescription.trim())) return;
    let updatePayload: Record<string, unknown> | undefined;
    if (workflowUpdatePayload.trim()) {
      try {
        const parsed = JSON.parse(workflowUpdatePayload);
        if (!isRecord(parsed)) throw new Error("Update payload must be a JSON object.");
        updatePayload = parsed;
      } catch (cause) {
        setError({ message: cause instanceof Error ? cause.message : "Update payload must be valid JSON.", status: 400, code: "invalid_payload_json" });
        return;
      }
    }
    const basePath = definition.path.includes("/{record}") ? definition.path.split("/{record}")[0] : definition.path;
    setWorkflowBusy(true);
    setWorkflowMessage("");
    setError(null);
    try {
      let activeSession = session;
      const url = API_BASE_URL + basePath + "/" + encodeURIComponent(workflowRecordId.trim());
      const readRecord = (token: string) => fetch(url, {
        method: "GET",
        headers: { Accept: "application/json", Authorization: "Bearer " + token },
        cache: "no-store",
      });
      let currentResponse = await readRecord(activeSession.accessToken);
      if (currentResponse.status === 401 && activeSession.refreshToken) {
        activeSession = await refreshApiSession(activeSession);
        onSessionRefresh(activeSession);
        currentResponse = await readRecord(activeSession.accessToken);
      }
      const currentPayload = await currentResponse.json().catch(() => null);
      if (!currentResponse.ok) {
        if (currentResponse.status === 401) onSessionExpired();
        const message = isRecord(currentPayload) && typeof currentPayload.message === "string" ? currentPayload.message : "The current workflow record could not be loaded before updating.";
        setError({ message, status: currentResponse.status, code: isRecord(currentPayload) && typeof currentPayload.error === "string" ? currentPayload.error : "workflow_version_read_failed" });
        return;
      }
      const currentItem = isRecord(currentPayload) && isRecord(currentPayload.item) ? currentPayload.item : null;
      if (!currentItem || typeof currentItem.version !== "number" || !Number.isInteger(currentItem.version)) {
        setError({ message: "The Core API did not return a record version. Update was stopped to avoid overwriting concurrent changes.", status: 502, code: "workflow_version_unavailable" });
        return;
      }
      const requestOptions = (token: string): RequestInit => ({
        method: "PATCH",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ version: currentItem.version, ...(workflowStatus ? { status: workflowStatus } : {}), ...(updatePayload ? { payload: updatePayload } : {}), ...(workflowUpdateTitle.trim() ? { title: workflowUpdateTitle.trim() } : {}), ...(workflowUpdateDescription.trim() ? { description: workflowUpdateDescription.trim() } : {}) }),
        cache: "no-store",
      });
      let response = await fetch(url, requestOptions(activeSession.accessToken));
      if (response.status === 401 && activeSession.refreshToken) {
        activeSession = await refreshApiSession(activeSession);
        onSessionRefresh(activeSession);
        response = await fetch(url, requestOptions(activeSession.accessToken));
      }
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 401) onSessionExpired();
        const message = isRecord(payload) && typeof payload.message === "string" ? payload.message : "Core API request failed with HTTP " + response.status + ".";
        setError({ message, status: response.status, code: isRecord(payload) && typeof payload.error === "string" ? payload.error : "workflow_update_failed" });
        return;
      }
      setWorkflowMessage("Workflow status updated by the Core API.");
      setReloadVersion((version) => version + 1);
    } catch (cause) {
      setError({ message: cause instanceof Error ? cause.message : "Workflow status could not be updated.", status: 0, code: "workflow_update_failed" });
    } finally {
      setWorkflowBusy(false);
    }
  };

  const submitMatchingRuleDisable = async () => {
    if (page !== "matching-rules") return;
    const recordId = workflowRecordId.trim();
    if (!recordId) {
      setError({ message: "Enter the matching rule ID before disabling it.", status: 400, code: "matching_rule_id_required" });
      return;
    }
    if (!window.confirm("Disable this matching rule? It will be soft-disabled and retained for audit history. Existing reconciliation results will not be changed.")) return;

    setWorkflowBusy(true);
    setWorkflowMessage("");
    setError(null);
    try {
      let activeSession = session;
      const url = API_BASE_URL + "/api/v1/matching-rules/" + encodeURIComponent(recordId);
      const send = (token: string) => fetch(url, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: "Bearer " + token },
        cache: "no-store",
      });
      let response = await send(activeSession.accessToken);
      if (response.status === 401 && activeSession.refreshToken) {
        activeSession = await refreshApiSession(activeSession);
        onSessionRefresh(activeSession);
        response = await send(activeSession.accessToken);
      }
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status === 401) onSessionExpired();
        const message = isRecord(payload) && typeof payload.message === "string" ? payload.message : "Matching rule could not be disabled.";
        setError({ message, status: response.status, code: isRecord(payload) && typeof payload.error === "string" ? payload.error : "matching_rule_disable_failed" });
        return;
      }
      setWorkflowMessage("Matching rule soft-disabled by the Core API. The rule and its history remain stored.");
      setReloadVersion((version) => version + 1);
    } catch (cause) {
      setError({ message: cause instanceof Error ? cause.message : "Matching rule could not be disabled.", status: 0, code: "matching_rule_disable_failed" });
    } finally {
      setWorkflowBusy(false);
    }
  };

  return (
    <section className="page-stack">
      <section className="panel" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p className="eyebrow">{(definition?.workflow || definition?.workflowUpdate) ? "CORE API · LIVE WORKFLOW" : "CORE API · LIVE RESOURCE"}</p>
            <h1 style={{ margin: "8px 0" }}>{humanize(page)}</h1>
            <p>{dashboardResourceNote(page, session.tenantId)}</p>
            <p style={{ fontSize: 12, opacity: 0.7 }}>Tenant: {session.tenantId}</p>
          </div>
          {definition && <button type="button" className="button button-secondary" onClick={() => setReloadVersion((version) => version + 1)} disabled={loading} aria-label="Refresh Core API data"><RefreshCw size={16} /> Refresh</button>}
        </div>
      </section>


      {(definition?.workflow || definition?.workflowUpdate) && (
        <section className="panel" style={{ padding: 18 }}>
          {definition.workflow && (<details>
            <summary style={{ cursor: "pointer", fontWeight: 650 }}>Create workflow record</summary>
            <form onSubmit={submitWorkflowCreate} style={{ display: "grid", gap: 12, marginTop: 16 }}>
              <label style={{ display: "grid", gap: 6, fontSize: 13 }}>Title
                <input value={workflowTitle} onChange={(event) => setWorkflowTitle(event.target.value)} maxLength={200} required disabled={workflowBusy} placeholder="Describe this request or record" />
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 13 }}>Description
                <textarea value={workflowDescription} onChange={(event) => setWorkflowDescription(event.target.value)} maxLength={4000} rows={2} disabled={workflowBusy} placeholder="Optional context for reviewers" />
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 13 }}>Payload (JSON object)
                <textarea value={workflowPayload} onChange={(event) => setWorkflowPayload(event.target.value)} rows={5} spellCheck={false} disabled={workflowBusy} required aria-describedby="workflow-payload-help" />
                <small id="workflow-payload-help" style={{ opacity: 0.7 }}>A valid starter template is prefilled for this workflow. Edit it to match your tenant’s data; the Core API validates the fields and permitted status transitions.</small>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <button type="submit" className="button button-primary" disabled={workflowBusy || !workflowTitle.trim()}>{workflowBusy ? "Saving…" : "Create record"}</button>
                <small style={{ opacity: 0.7 }}>The Core API validates and persists the record. Creating a request does not execute payments or destructive actions.</small>
              </div>
            </form>
          </details>)}
          {(definition.workflow || definition.workflowUpdate) && (<details style={{ marginTop: 14 }}>
            <summary style={{ cursor: "pointer", fontWeight: 650 }}>Update workflow record</summary>
            <form onSubmit={submitWorkflowUpdate} style={{ display: "flex", alignItems: "end", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
              <label style={{ display: "grid", gap: 6, flex: "1 1 240px", fontSize: 13 }}>Record ID
                <input value={workflowRecordId} onChange={(event) => setWorkflowRecordId(event.target.value)} maxLength={200} required disabled={workflowBusy} placeholder="wf_…" />
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 13 }}>New status
                <select value={workflowStatus} onChange={(event) => setWorkflowStatus(event.target.value)} disabled={workflowBusy}>
                  <option value="">Select status</option>
                  {(definition.statusOptions ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label style={{ display: "grid", gap: 6, flex: "1 1 240px", fontSize: 13 }}>New title (optional)
                <input value={workflowUpdateTitle} onChange={(event) => setWorkflowUpdateTitle(event.target.value)} maxLength={200} disabled={workflowBusy} placeholder="Leave blank to keep the current title" />
              </label>
              <label style={{ display: "grid", gap: 6, flex: "1 1 240px", fontSize: 13 }}>New description (optional)
                <input value={workflowUpdateDescription} onChange={(event) => setWorkflowUpdateDescription(event.target.value)} maxLength={4000} disabled={workflowBusy} placeholder="Leave blank to keep the current description" />
              </label>
              <label style={{ display: "grid", gap: 6, flex: "1 1 100%", fontSize: 13 }}>Replacement payload JSON (optional)
                <textarea value={workflowUpdatePayload} onChange={(event) => setWorkflowUpdatePayload(event.target.value)} rows={3} spellCheck={false} disabled={workflowBusy} placeholder="Leave blank to keep the current payload" />
              </label>
              <button type="submit" className="button button-secondary" disabled={workflowBusy || !workflowRecordId.trim() || (!workflowStatus && !workflowUpdatePayload.trim() && !workflowUpdateTitle.trim() && !workflowUpdateDescription.trim())}>Update record</button>
              {page === "matching-rules" && <button type="button" className="button button-secondary" onClick={submitMatchingRuleDisable} disabled={workflowBusy || !workflowRecordId.trim()} aria-label="Soft-disable matching rule">Disable rule</button>
            </form>
          </details>)}
          {workflowMessage && <p role="status" style={{ marginBottom: 0 }}>{workflowMessage}</p>}
        </section>
      )}

      {definition?.evidence && appliedRecordId && (
        <section className="panel" style={{ padding: 18 }}>
          <h2 style={{ marginTop: 0 }}>Append investigation evidence</h2>
          <p style={{ opacity: 0.75, fontSize: 13 }}>Attach evidence metadata or a reference. Do not paste raw M-Pesa payloads, phone numbers, tokens, or credentials.</p>
          <form onSubmit={submitEvidence} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 13 }}>Evidence type
              <select value={evidenceType} onChange={(event) => setEvidenceType(event.target.value)} disabled={workflowBusy} required>
                <option value="transaction_reference">Transaction reference</option>
                <option value="ledger_reference">Ledger reference</option>
                <option value="statement_reference">Statement reference</option>
                <option value="operator_note">Operator note</option>
                <option value="document_reference">Document reference</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13 }}>Reference (optional)
              <input value={evidenceReference} onChange={(event) => setEvidenceReference(event.target.value)} maxLength={200} disabled={workflowBusy} />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13 }}>Reviewer note (optional)
              <textarea value={evidenceNote} onChange={(event) => setEvidenceNote(event.target.value)} rows={3} maxLength={2000} disabled={workflowBusy} />
            </label>
            <div><button type="submit" className="button button-primary" disabled={workflowBusy || !evidenceType.trim()}>{workflowBusy ? "Saving…" : "Append evidence"}</button></div>
          </form>
        </section>
      )}

      {definition?.recordIdParam && (
        <section className="panel" style={{ padding: 16 }}>
          <form onSubmit={(event) => { event.preventDefault(); setAppliedRecordId(recordId.trim()); }} style={{ display: "flex", alignItems: "end", gap: 12, flexWrap: "wrap" }}>
            <label style={{ display: "grid", gap: 6, flex: "1 1 320px", fontSize: 13 }}>
              {definition.recordIdParam.label}
              <input value={recordId} onChange={(event) => setRecordId(event.target.value)} placeholder={definition.recordIdParam.label} maxLength={200} autoComplete="off" />
              <small style={{ opacity: 0.7 }}>{definition.recordIdParam.help}</small>
            </label>
            <button type="submit" className="button button-primary" disabled={loading || !recordId.trim()}>Load record</button>
            {appliedRecordId && <button type="button" className="button button-secondary" onClick={() => { setRecordId(""); setAppliedRecordId(""); }} disabled={loading}>Clear</button>}
          </form>
        </section>
      )}

      {definition && (definition.paginated || definition.statusFilter) && (
        <section className="panel" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {definition.searchParam && (
              <form onSubmit={(event) => { event.preventDefault(); setResourcePage(1); setAppliedSearch(resourceSearch.trim()); }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="search" value={resourceSearch} onChange={(event) => setResourceSearch(event.target.value)} placeholder={definition.searchLabel ?? "Search records"} aria-label={definition.searchLabel ?? "Search records"} maxLength={200} disabled={loading} />
                <button type="submit" className="button button-secondary" disabled={loading}>Search</button>
                {appliedSearch && <button type="button" className="button button-secondary" onClick={() => { setResourceSearch(""); setAppliedSearch(""); setResourcePage(1); }} disabled={loading}>Clear</button>}
              </form>
            )}
            {definition.statusFilter && (
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                {definition.statusLabel ?? "Status"}
                <select value={resourceStatus} onChange={(event) => { setResourceStatus(event.target.value); setResourcePage(1); }} disabled={loading} aria-label={`Filter by ${definition.statusLabel ?? "status"}`}>
                  {!definition.defaultStatus && <option value="">All statuses</option>}
                  {(definition.statusOptions ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            )}
            {definition.paginated && <span style={{ fontSize: 12, opacity: 0.7 }}>Server-side pagination · 25 records per page</span>}
          </div>
          {definition.paginated && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button type="button" className="button button-secondary" onClick={() => setResourcePage((value) => Math.max(1, value - 1))} disabled={loading || resourcePage <= 1}>Previous</button>
              <span style={{ fontSize: 13 }}>Page {resourcePage}</span>
              <button type="button" className="button button-secondary" onClick={() => setResourcePage((value) => value + 1)} disabled={loading || (result !== null && isRecord(result.payload) && typeof result.payload.total === "number" && resourcePage * 25 >= result.payload.total)}>Next</button>
            </div>
          )}
        </section>
      )}

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
