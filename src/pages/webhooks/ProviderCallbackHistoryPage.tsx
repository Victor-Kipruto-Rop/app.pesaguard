import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Check, ChevronDown,
  ChevronRight, CircleHelp, Clock3, Copy, ExternalLink, Filter, RotateCcw,
  Search, ShieldCheck, Webhook, XCircle,
} from "lucide-react";
import type { DashboardPage } from "../../app/config/routes";
import type { Workspace } from "../../types/dashboard";
import "./provider-callback-history-page.css";

interface Props {
  workspace: Workspace;
  onNavigate: (page: DashboardPage) => void;
}

type DeliveryStatus = "Delivered" | "Retry scheduled" | "Failed";
type CallbackEvent = {
  id: string;
  event: string;
  reference: string;
  endpoint: string;
  status: DeliveryStatus;
  attempt: number;
  maxAttempts: number;
  response: string;
  latency: string;
  created: string;
  requestId: string;
  correlationId: string;
  signature: "Not verified in preview";
  payload: string;
  note: string;
};

const sampleCallbacks: CallbackEvent[] = [
  { id: "cb_01J8M2KQ", event: "transaction.completed", reference: "PG-TXN-80419", endpoint: "https://merchant.example/callbacks/pesaguard", status: "Delivered", attempt: 1, maxAttempts: 5, response: "200 OK", latency: "184 ms", created: "Today, 10:42:18", requestId: "req_demo_7f21c8", correlationId: "cor_demo_80419", signature: "Not verified in preview", payload: '{"id":"evt_demo_01","type":"transaction.completed","data":{"reference":"PG-TXN-80419","status":"completed","currency":"KES"}}', note: "Illustrative successful delivery. The HTTP response is sample data, not a live endpoint response." },
  { id: "cb_01J8M2KP", event: "transaction.pending", reference: "PG-TXN-80418", endpoint: "https://merchant.example/callbacks/pesaguard", status: "Retry scheduled", attempt: 2, maxAttempts: 5, response: "503 Service Unavailable", latency: "2.1 s", created: "Today, 10:39:51", requestId: "req_demo_6a9d10", correlationId: "cor_demo_80418", signature: "Not verified in preview", payload: '{"id":"evt_demo_02","type":"transaction.pending","data":{"reference":"PG-TXN-80418","status":"pending","currency":"KES"}}', note: "Illustrative retry state. No retry has been queued by this preview." },
  { id: "cb_01J8M2KN", event: "reconciliation.exception.created", reference: "PG-TXN-80392", endpoint: "https://finance.example/hooks/reconcile", status: "Failed", attempt: 5, maxAttempts: 5, response: "401 Unauthorized", latency: "96 ms", created: "Today, 09:58:06", requestId: "req_demo_4b8e03", correlationId: "cor_demo_80392", signature: "Not verified in preview", payload: '{"id":"evt_demo_03","type":"reconciliation.exception.created","data":{"reference":"PG-TXN-80392","reason":"unmatched"}}', note: "Illustrative exhausted delivery. Confirm endpoint authentication and inspect server logs before retrying in a real environment." },
  { id: "cb_01J8M2KM", event: "transaction.completed", reference: "PG-TXN-80377", endpoint: "https://merchant.example/callbacks/pesaguard", status: "Delivered", attempt: 1, maxAttempts: 5, response: "204 No Content", latency: "122 ms", created: "Today, 09:41:33", requestId: "req_demo_1d63aa", correlationId: "cor_demo_80377", signature: "Not verified in preview", payload: '{"id":"evt_demo_04","type":"transaction.completed","data":{"reference":"PG-TXN-80377","status":"completed","currency":"KES"}}', note: "Illustrative delivery record for interface review only." },
  { id: "cb_01J8M2KJ", event: "settlement.batch.updated", reference: "PG-SET-20931", endpoint: "https://finance.example/hooks/settlements", status: "Retry scheduled", attempt: 3, maxAttempts: 5, response: "504 Gateway Timeout", latency: "5.0 s", created: "Today, 09:18:09", requestId: "req_demo_9e020f", correlationId: "cor_demo_20931", signature: "Not verified in preview", payload: '{"id":"evt_demo_05","type":"settlement.batch.updated","data":{"reference":"PG-SET-20931","status":"processing"}}', note: "Illustrative transient delivery failure. Retry timing must come from the connected delivery service." },
];

const statusClass: Record<DeliveryStatus, string> = {
  Delivered: "pc-delivered",
  "Retry scheduled": "pc-retrying",
  Failed: "pc-failed",
};

export function ProviderCallbackHistoryPage({ workspace, onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [selectedId, setSelectedId] = useState(sampleCallbacks[0].id);
  const [showPayload, setShowPayload] = useState(false);
  const [copied, setCopied] = useState("");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => sampleCallbacks.filter((item) => {
    const matchesStatus = status === "All statuses" || item.status === status;
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || [item.id, item.event, item.reference, item.endpoint, item.correlationId].some((value) => value.toLowerCase().includes(needle));
    return matchesStatus && matchesQuery;
  }), [query, status]);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;
  const delivered = sampleCallbacks.filter((item) => item.status === "Delivered").length;
  const retrying = sampleCallbacks.filter((item) => item.status === "Retry scheduled").length;
  const failed = sampleCallbacks.filter((item) => item.status === "Failed").length;

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setNotice("Clipboard access is unavailable in this browser. Select the identifier and copy it manually.");
    }
  }

  return (
    <main className="pc-page">
      <nav className="pc-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={() => onNavigate("webhooks")}>Webhooks</button><ChevronRight size={13}/><span>Provider callback history</span>
        <span className="pc-preview-label"><i/> SAMPLE DATA</span>
      </nav>

      <header className="pc-hero">
        <div className="pc-hero-copy">
          <span className="pc-eyebrow"><Webhook size={14}/> DELIVERY OBSERVABILITY <b>·</b> {workspace.name}</span>
          <h1>Provider callback history</h1>
          <p>Inspect callback delivery attempts, response outcomes and correlation identifiers in one traceable view.</p>
        </div>
        <button className="pc-button pc-button-primary" type="button" onClick={() => { setQuery(""); setStatus("All statuses"); setSelectedId(sampleCallbacks[0].id); setNotice("Sample view reset. No provider request was made."); }}>
          <RotateCcw size={15}/> Reset view
        </button>
      </header>

      <section className="pc-notice" role="note">
        <span className="pc-notice-icon"><CircleHelp size={18}/></span>
        <div><strong>Preview only — no live callback service is connected</strong><p>Every event, endpoint, HTTP response, latency and retry state below is synthetic. Signature verification is intentionally marked unverified; this page does not send, retry or replay requests.</p></div>
        <span className="pc-local-pill">LOCAL FIXTURES</span>
      </section>

      <section className="pc-metrics" aria-label="Sample callback summary">
        <article className="pc-metric"><span className="pc-metric-icon pc-metric-green"><ShieldCheck size={18}/></span><div><span>Delivered</span><strong>{delivered.toString().padStart(2, "0")}</strong><small><i className="pc-dot pc-dot-green"/> Sample 2xx responses</small></div></article>
        <article className="pc-metric"><span className="pc-metric-icon pc-metric-amber"><Clock3 size={18}/></span><div><span>Retry scheduled</span><strong>{retrying.toString().padStart(2, "0")}</strong><small><i className="pc-dot pc-dot-amber"/> Sample retry states</small></div></article>
        <article className="pc-metric"><span className="pc-metric-icon pc-metric-red"><AlertTriangle size={18}/></span><div><span>Failed</span><strong>{failed.toString().padStart(2, "0")}</strong><small><i className="pc-dot pc-dot-red"/> Sample exhausted attempts</small></div></article>
        <article className="pc-metric pc-metric-last"><span className="pc-metric-icon pc-metric-neutral"><Activity size={18}/></span><div><span>Tracked events</span><strong>{sampleCallbacks.length.toString().padStart(2, "0")}</strong><small>Static preview dataset</small></div></article>
      </section>

      <section className="pc-workspace">
        <div className="pc-list-panel">
          <div className="pc-list-heading"><div><span className="pc-eyebrow">DELIVERY LOG</span><h2>Callback attempts</h2></div><span className="pc-record-count">{filtered.length} records</span></div>
          <div className="pc-filters">
            <label className="pc-search"><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search event, reference, ID…" aria-label="Search callback records"/>{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><XCircle size={15}/></button>}</label>
            <label className="pc-status-filter"><Filter size={14}/><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by delivery status"><option>All statuses</option><option>Delivered</option><option>Retry scheduled</option><option>Failed</option></select><ChevronDown size={13}/></label>
          </div>
          <div className="pc-record-list">
            {filtered.map((item) => (
              <button type="button" key={item.id} className={`pc-record ${selected?.id === item.id ? "is-selected" : ""}`} onClick={() => {setSelectedId(item.id);setShowPayload(false);setNotice("");}} aria-pressed={selected?.id === item.id}>
                <span className={`pc-record-symbol ${statusClass[item.status]}`}>{item.status === "Delivered" ? <Check size={16}/> : item.status === "Failed" ? <XCircle size={16}/> : <Clock3 size={16}/>}</span>
                <span className="pc-record-main"><strong>{item.event}</strong><span>{item.reference} <i>·</i> Attempt {item.attempt}/{item.maxAttempts}</span><small>{item.created}</small></span>
                <span className="pc-record-side"><b className={statusClass[item.status]}>{item.status}</b><small>{item.response}</small><ChevronRight size={14}/></span>
              </button>
            ))}
            {filtered.length === 0 && <div className="pc-empty"><Search size={21}/><strong>No matching callback records</strong><p>Try another reference, event name or delivery status.</p><button type="button" onClick={() => {setQuery("");setStatus("All statuses");}}>Clear filters</button></div>}
          </div>
          <footer className="pc-list-footer"><span><i/> Static fixture set</span><span>5 sample records</span></footer>
        </div>

        <aside className="pc-detail-panel">
          {selected ? <>
            <div className="pc-detail-heading"><div><span className="pc-eyebrow">DELIVERY INSPECTOR</span><h2>Attempt details</h2></div><span className={`pc-status-chip ${statusClass[selected.status]}`}>{selected.status}</span></div>
            <div className="pc-event-title"><span className="pc-event-icon"><Webhook size={19}/></span><div><strong>{selected.event}</strong><span>{selected.id}</span></div><button type="button" aria-label="Copy event ID" onClick={() => void copyValue(selected.id, "event")}><Copy size={15}/></button></div>
            <div className="pc-attempt-track"><div className="pc-track-top"><span>Delivery attempts</span><strong>{selected.attempt} <i>/</i> {selected.maxAttempts}</strong></div><div className="pc-track-bars">{Array.from({length: selected.maxAttempts}, (_, index) => <span key={index} className={index < selected.attempt ? (selected.status === "Failed" ? "track-failed" : index === selected.attempt - 1 && selected.status === "Retry scheduled" ? "track-current" : "track-done") : ""}/>)}</div><p>{selected.status === "Delivered" ? "Sample delivery completed." : selected.status === "Failed" ? "Sample attempts exhausted." : "Sample record indicates another attempt may be scheduled."} Actual attempt policy and scheduling require backend evidence.</p></div>
            <div className="pc-detail-section"><h3>Request metadata</h3>
              <div className="pc-detail-row"><span>Event reference</span><button type="button" onClick={() => void copyValue(selected.reference, "reference")}>{selected.reference}<Copy size={12}/></button></div>
              <div className="pc-detail-row"><span>Request ID</span><button type="button" onClick={() => void copyValue(selected.requestId, "request")}>{selected.requestId}<Copy size={12}/></button></div>
              <div className="pc-detail-row"><span>Correlation ID</span><button type="button" onClick={() => void copyValue(selected.correlationId, "correlation")}>{selected.correlationId}<Copy size={12}/></button></div>
              <div className="pc-detail-row"><span>HTTP response</span><strong>{selected.response}</strong></div>
              <div className="pc-detail-row"><span>Response latency</span><strong>{selected.latency}</strong></div>
            </div>
            <div className="pc-detail-section"><h3>Destination endpoint</h3><div className="pc-endpoint"><span><ExternalLink size={14}/>{selected.endpoint}</span><small>Sample URL · not contacted</small></div></div>
            <div className="pc-security-row"><span className="pc-security-icon"><ShieldCheck size={17}/></span><div><strong>Signature verification</strong><span>Not verified in preview</span></div><span className="pc-unverified">UNVERIFIED</span></div>
            <div className="pc-payload-section"><button type="button" className="pc-payload-toggle" onClick={() => setShowPayload((value) => !value)} aria-expanded={showPayload}><span><ChevronDown size={15} className={showPayload ? "pc-chevron-open" : ""}/> Event payload</span><small>JSON · synthetic</small></button>{showPayload && <pre className="pc-payload"><code>{JSON.stringify(JSON.parse(selected.payload), null, 2)}</code></pre>}</div>
            <div className="pc-detail-note"><AlertTriangle size={15}/><p>{selected.note}</p></div>
            <button className="pc-button pc-button-secondary pc-full-button" type="button" onClick={() => setNotice("Preview action only: a live retry is unavailable until the callback delivery API is connected.")}><RotateCcw size={15}/> Retry delivery <span>Preview only</span></button>
          </> : <div className="pc-empty pc-detail-empty"><Webhook size={24}/><strong>Select a callback record</strong><p>Choose a delivery attempt from the log to inspect its metadata.</p></div>}
          {copied && <div className="pc-inline-feedback" role="status><Check size={14}/> Copied {copied} identifier</div>}
          {notice && <div className="pc-inline-feedback pc-inline-feedback-note" role="status"><CircleHelp size={14}/><span>{notice}</span><button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}><XCircle size={14}/></button></div>}
        </aside>
      </section>

      <section className="pc-next-step"><span className="pc-next-icon"><ArrowUpRight size={18}/></span><div><strong>Need to change callback behavior?</strong><p>Review endpoint configuration and signing-secret management before enabling live deliveries.</p></div><button type="button" onClick={() => onNavigate("callback-configuration")}>Callback configuration <ArrowDownRight size={15}/></button></section>
    </main>
  );
}
