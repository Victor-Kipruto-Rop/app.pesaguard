import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, CircleHelp,
  Clock3, Download, Fingerprint, Gauge, GitBranch, LockKeyhole,
  ShieldCheck, Timer, Webhook, XCircle, Zap,
} from "lucide-react";
import type { DashboardPage } from "../../app/config/routes";
import type { Workspace } from "../../types/dashboard";
import "../integrations/integration-setup-pages.css";
import "./webhook-observability-pages.css";

interface Props { workspace: Workspace; onNavigate: (page: DashboardPage) => void; }

type Attempt = { attempt: number; time: string; result: string; status: "Failed" | "Succeeded" | "Timed out"; duration: string; note: string };
const sampleAttempts: Attempt[] = [
  { attempt: 4, time: "04:12:08.441", result: "HTTP 410", status: "Failed", duration: "184 ms", note: "The sample receiver reported that the endpoint is no longer available." },
  { attempt: 3, time: "04:11:38.208", result: "HTTP 503", status: "Failed", duration: "2.0 s", note: "The sample receiver was unavailable. Retry policy would decide whether another attempt is eligible." },
  { attempt: 2, time: "04:10:37.912", result: "Timed out", status: "Timed out", duration: "10.0 s", note: "No response was received before the illustrative timeout threshold." },
  { attempt: 1, time: "04:09:08.031", result: "HTTP 503", status: "Failed", duration: "322 ms", note: "Initial sample delivery was rejected by the unavailable receiver." },
];

export function WebhookDeliveryDetailPage({ workspace, onNavigate }: Props) {
  const [selectedAttempt, setSelectedAttempt] = useState(0);
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const [notice, setNotice] = useState("");
  const current = sampleAttempts[selectedAttempt];
  const event = useMemo(() => ({ id: "evt_8F31A2", type: "transaction.completed", created_at: "2026-10-16T04:09:07Z", tenant_reference: "tenant_sample_01", data: { transaction_reference: "txn_sample_94A1", amount: 1250, currency: "KES", status: "completed" } }), []);

  return <main className="ips-page wo-page">
    <nav className="ips-breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={() => onNavigate("webhooks")}>Webhooks</button><ChevronRight size={14}/><button type="button" onClick={() => onNavigate("webhook-retry")}>Delivery queue</button><ChevronRight size={14}/><span>Delivery detail</span><span className="ips-preview-pill"><i/> PREVIEW</span></nav>
    <header className="ips-hero"><div><span className="ips-eyebrow"><Webhook size={14}/> DELIVERY INVESTIGATION <b>·</b> {workspace.name}</span><h1>Delivery detail</h1><p>Trace one event from its original delivery through each attempt, response, and retry decision.</p></div><div className="wo-hero-actions"><button type="button" className="ips-btn ips-btn-secondary" onClick={() => onNavigate("webhook-delivery-analytics")}>Delivery analytics <ArrowRight size={14}/></button><span className="wo-header-state"><XCircle size={15}/> Dead-lettered sample</span></div></header>
    <section className="ips-preview-notice"><span><CircleHelp size={19}/></span><div><strong>Illustrative delivery trace</strong><p>This event, response timeline, headers, and payload are synthetic sample data. The page does not retrieve live delivery logs, expose real customer data, or trigger retries.</p></div><b>READ-ONLY PREVIEW</b></section>
    <section className="wo-event-summary">
      <div className="wo-event-main"><span className="wo-event-icon"><Webhook size={20}/></span><div><span className="wo-overline">EVENT ID</span><h2>evt_8F31A2</h2><div className="wo-event-tags"><code>transaction.completed</code><span className="wo-status-badge failed"><XCircle size={12}/> Dead-lettered</span></div></div></div>
      <div className="wo-summary-facts"><div><span>Endpoint</span><strong>Finance operations receiver</strong><small>Sandbox · Sample endpoint</small></div><div><span>Created at</span><strong>16 Oct 2026, 04:09:07 UTC</strong><small>Timestamp is illustrative</small></div><div><span>Delivery attempts</span><strong>4 attempts</strong><small>3 responses failed, 1 timed out</small></div></div>
    </section>
    <div className="wo-detail-grid">
      <section className="ips-card wo-attempt-card">
        <div className="ips-card-heading"><span className="ips-icon"><GitBranch size={18}/></span><div><h2>Attempt timeline</h2><p>Select an attempt to inspect its response and outcome.</p></div><span className="ips-status-chip">4 attempts</span></div>
        <div className="wo-timeline">{sampleAttempts.map((attempt, index) => <button type="button" key={attempt.attempt} className={`wo-attempt ${selectedAttempt === index ? "selected" : ""}`} onClick={() => {setSelectedAttempt(index);setNotice("");}}><span className={`wo-attempt-marker ${attempt.status === "Succeeded" ? "success" : attempt.status === "Timed out" ? "timeout" : "failed"}`}>{attempt.status === "Succeeded" ? <CheckCircle2 size={15}/> : attempt.status === "Timed out" ? <Clock3 size={15}/> : <XCircle size={15}/>}</span><span className="wo-attempt-copy"><span className="wo-attempt-title"><strong>Attempt {attempt.attempt}</strong><span>{attempt.time}</span></span><span className="wo-attempt-result">{attempt.result}<i>·</i>{attempt.duration}</span><small>{attempt.note}</small></span><ChevronRight size={15} className="wo-attempt-chevron"/></button>)}</div>
        <div className="wo-attempt-selected"><div className="wo-section-kicker"><Activity size={14}/> SELECTED ATTEMPT</div><div className="wo-selected-heading"><div><span className="wo-overline">ATTEMPT {current.attempt}</span><h3>{current.result}</h3></div><span className={`wo-status-badge ${current.status === "Succeeded" ? "success" : current.status === "Timed out" ? "timeout" : "failed"}`}>{current.status}</span></div><p>{current.note}</p><div className="wo-response-grid"><div><span>Response time</span><strong>{current.duration}</strong></div><div><span>Retry eligibility</span><strong>{current.status === "Succeeded" ? "Not applicable" : "Policy-dependent"}</strong></div><div><span>Response body</span><strong>Not captured in sample</strong></div><div><span>Trace / request ID</span><strong>Not available</strong></div></div></div>
      </section>
      <aside className="wo-right-column">
        <section className="ips-side-card wo-recommendation"><span className="ips-icon"><ShieldCheck size={17}/></span><h2>Operator next steps</h2><p>Use the response class as a starting point; confirm the receiver state and retry policy before taking action.</p><ol><li><strong>Verify endpoint health</strong><small>Confirm URL ownership, TLS, and receiver availability.</small></li><li><strong>Check idempotency</strong><small>Make sure repeated event handling cannot double-process a transaction.</small></li><li><strong>Review replay eligibility</strong><small>Authorize a replay and record the operator and reason.</small></li></ol><button className="ips-btn ips-btn-primary ips-full-btn" type="button" onClick={() => onNavigate("webhook-retry")}>Open retry queue <ArrowRight size={14}/></button></section>
        <section className="ips-side-card"><div className="ips-side-heading"><span className="ips-icon"><LockKeyhole size={17}/></span><div><h2>Request metadata</h2><p>Sanitized example values</p></div></div><dl className="wo-metadata"><div><dt>HTTP method</dt><dd>POST</dd></div><div><dt>Content type</dt><dd>application/json</dd></div><div><dt>Signature validation</dt><dd><span className="wo-inline-neutral">Not verified</span></dd></div><div><dt>Idempotency key</dt><dd>Not available</dd></div><div><dt>Receiver address</dt><dd>Masked / omitted</dd></div></dl><button type="button" className="ips-text-link" onClick={() => setShowHeaders(!showHeaders)}>{showHeaders ? "Hide sample headers" : "Inspect sample headers"} <ArrowRight size={13}/></button>{showHeaders && <pre className="ips-code-sample wo-small-code">{"Content-Type: application/json\nX-Event-Id: evt_8F31A2\nX-Delivery-Id: dlv_8F31A2\nX-Signature: [redacted sample]"}</pre>}</section>
      </aside>
    </div>
    <section className="ips-card wo-payload-card"><div className="ips-card-heading"><span className="ips-icon"><Fingerprint size={18}/></span><div><h2>Event envelope</h2><p>Inspect a redacted example payload with no live tenant data.</p></div><button className="ips-btn ips-btn-secondary" type="button" onClick={() => setShowEnvelope(!showEnvelope)}>{showEnvelope ? "Hide envelope" : "Show envelope"} <ArrowRight size={14}/></button></div>{showEnvelope && <pre className="ips-code-sample wo-envelope">{JSON.stringify(event, null, 2)}</pre>}<div className="wo-payload-foot"><LockKeyhole size={13}/> Example transaction reference and amount are synthetic; do not use them as real records.</div></section>
    {notice && <div className="ips-feedback" role="status">{notice}</div>}
    <p className="ips-footnote"><LockKeyhole size={13}/> This page is an investigation UI prototype. Real traces, signatures, payload retention, and replay authorization require backend integration.</p>
  </main>;
}

type DayMetric = { day: string; delivered: number; failed: number; latency: number };
const sampleDays: DayMetric[] = [
  { day: "10 Oct", delivered: 840, failed: 38, latency: 310 },
  { day: "11 Oct", delivered: 920, failed: 31, latency: 286 },
  { day: "12 Oct", delivered: 885, failed: 45, latency: 352 },
  { day: "13 Oct", delivered: 1010, failed: 29, latency: 278 },
  { day: "14 Oct", delivered: 970, failed: 41, latency: 330 },
  { day: "15 Oct", delivered: 1120, failed: 33, latency: 294 },
  { day: "16 Oct", delivered: 1065, failed: 27, latency: 268 },
];

export function WebhookDeliveryAnalyticsPage({ workspace, onNavigate }: Props) {
  const [range, setRange] = useState("7d");
  const [metric, setMetric] = useState<"volume" | "failures" | "latency">("volume");
  const [endpoint, setEndpoint] = useState("all");
  const [notice, setNotice] = useState("");
  const days = range === "24h" ? sampleDays.slice(-1) : range === "30d" ? [...sampleDays, ...sampleDays.slice(0, 5).map((d) => ({ ...d, day: d.day.replace(" Oct", " Sep") }))] : sampleDays;
  const totals = useMemo(() => days.reduce((acc, day) => ({ delivered: acc.delivered + day.delivered, failed: acc.failed + day.failed, latency: acc.latency + day.latency }), { delivered: 0, failed: 0, latency: 0 }), [days]);
  const total = totals.delivered + totals.failed;
  const successRate = total ? (totals.delivered / total) * 100 : 0;
  const maxValue = Math.max(...days.map((day) => metric === "volume" ? day.delivered : metric === "failures" ? day.failed : day.latency), 1);
  const format = (n: number) => n.toLocaleString("en-KE");
  function exportPreview() {
    const csv = ["day,delivered,failed,illustrative_latency_ms", ...days.map((day) => [day.day, day.delivered, day.failed, day.latency].join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pesaguard-webhook-analytics-sample.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Sample analytics CSV exported. The file contains illustrative preview data only.");
  }

  return <main className="ips-page wo-page">
    <nav className="ips-breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={() => onNavigate("webhooks")}>Webhooks</button><ChevronRight size={14}/><span>Delivery analytics</span><span className="ips-preview-pill"><i/> PREVIEW</span></nav>
    <header className="ips-hero"><div><span className="ips-eyebrow"><Gauge size={14}/> DELIVERY OBSERVABILITY <b>·</b> {workspace.name}</span><h1>Delivery analytics</h1><p>Understand delivery volume, failures, and response latency with a focused webhook reliability overview.</p></div><div className="wo-hero-actions"><button type="button" className="ips-btn ips-btn-secondary" onClick={() => onNavigate("webhook-delivery-detail")}>Inspect a delivery <ArrowRight size={14}/></button><button type="button" className="ips-btn ips-btn-secondary wo-export" onClick={exportPreview}><Download size={15}/> Export sample CSV</button></div></header>
    <section className="ips-preview-notice"><span><CircleHelp size={19}/></span><div><strong>Sample analytics — not live telemetry</strong><p>All totals and charts use illustrative values created for this frontend preview. Filters and date ranges do not query a backend or represent actual PesaGuard delivery performance.</p></div><b>SAMPLE DATA</b></section>
    <div className="wo-analytics-controls"><div className="wo-range-switch" role="group" aria-label="Sample reporting range">{[{label:"24 hours",value:"24h"},{label:"7 days",value:"7d"},{label:"30 days",value:"30d"}].map((item) => <button key={item.value} type="button" className={range === item.value ? "active" : ""} onClick={() => setRange(item.value)}>{item.label}</button>)}</div><label className="wo-endpoint-select"><span>Endpoint</span><select value={endpoint} onChange={(event) => setEndpoint(event.target.value)}><option value="all">All sample endpoints</option><option value="finance">Finance operations receiver</option><option value="ops">Operations alerts</option></select></label></div>
    <div className="wo-analytics-kpis"><article className="wo-kpi"><span><Activity size={14}/> Delivery attempts</span><strong>{format(total)}</strong><small>Across selected sample range</small><div className="wo-kpi-foot"><span className="wo-kpi-dot green"/> {format(totals.delivered)} delivered records</div></article><article className="wo-kpi"><span><CheckCircle2 size={14}/> Success rate</span><strong>{successRate.toFixed(2)}<i>%</i></strong><small>Calculated from sample totals</small><div className="wo-progress"><span style={{width:`${successRate}%`}}/></div></article><article className="wo-kpi"><span><AlertTriangle size={14}/> Failed deliveries</span><strong>{format(totals.failed)}</strong><small>Illustrative failed attempts</small><div className="wo-kpi-foot"><span className="wo-kpi-dot red"/> {((totals.failed / Math.max(total, 1)) * 100).toFixed(2)}% of sample attempts</div></article><article className="wo-kpi"><span><Timer size={14}/> Mean response time</span><strong>{Math.round(totals.latency / Math.max(days.length, 1))}<i>ms</i></strong><small>Simple average of daily examples</small><div className="wo-kpi-foot"><span className="wo-kpi-dot green"/> Latency values are illustrative</div></article></div>
    <section className="ips-card wo-chart-card"><div className="ips-card-heading"><span className="ips-icon"><Activity size={18}/></span><div><h2>Delivery trend</h2><p>Compare daily delivery volume, failures, or example latency.</p></div><div className="wo-chart-toggle" role="group" aria-label="Chart metric">{[{label:"Delivered",value:"volume"},{label:"Failures",value:"failures"},{label:"Latency",value:"latency"}].map((item) => <button key={item.value} type="button" className={metric === item.value ? "active" : ""} onClick={() => setMetric(item.value as "volume" | "failures" | "latency")}>{item.label}</button>)}</div></div><div className="wo-chart-legend"><span><i className={metric === "failures" ? "red" : metric === "latency" ? "amber" : "green"}/>{metric === "volume" ? "Delivered events" : metric === "failures" ? "Failed attempts" : "Average latency (ms)"}</span><span>Daily sample values</span></div><div className="wo-bar-chart" role="img" aria-label={`${metric} chart showing illustrative values for ${days.length} days`}>{days.map((day) => {const value = metric === "volume" ? day.delivered : metric === "failures" ? day.failed : day.latency;return <div className="wo-bar-column" key={day.day}><strong>{format(value)}{metric === "latency" ? " ms" : ""}</strong><div className="wo-bar-track"><span className={metric} style={{height:`${Math.max(5, value / maxValue * 100)}%`}}/></div><small>{day.day}</small></div>})}</div><div className="wo-chart-foot"><span><Zap size={13}/> Chart is rendered from local sample data.</span><span>Endpoint filter: {endpoint === "all" ? "all sample endpoints" : endpoint === "finance" ? "finance receiver" : "operations alerts"}</span></div></section>
    <div className="wo-analytics-lower">
      <section className="ips-card"><div className="ips-card-heading"><span className="ips-icon"><Webhook size={18}/></span><div><h2>Daily delivery breakdown</h2><p>Sample counts for the selected range.</p></div></div><div className="wo-table-wrap"><table className="wo-table"><thead><tr><th>Day</th><th>Delivered</th><th>Failed</th><th>Latency</th><th>Success</th></tr></thead><tbody>{days.map((day) => <tr key={day.day}><td>{day.day}</td><td>{format(day.delivered)}</td><td><span className="wo-failure-cell">{format(day.failed)}</span></td><td>{day.latency} ms</td><td>{(day.delivered / (day.delivered + day.failed) * 100).toFixed(1)}%</td></tr>)}</tbody></table></div></section>
      <aside className="ips-side-card wo-insights"><div className="ips-side-heading"><span className="ips-icon"><ShieldCheck size={17}/></span><div><h2>Reliability signals to track</h2><p>Suggested production metrics</p></div></div><ul><li><CheckCircle2 size={15}/><span><strong>Delivery success by endpoint</strong><small>Segment by tenant, endpoint, and event class.</small></span></li><li><Clock3 size={15}/><span><strong>p50 / p95 / p99 latency</strong><small>Percentiles reveal tail-latency regressions hidden by averages.</small></span></li><li><AlertTriangle size={15}/><span><strong>Retry exhaustion & dead letters</strong><small>Alert on sustained failure ratios and oldest queue age.</small></span></li><li><LockKeyhole size={15}/><span><strong>Signature rejection rate</strong><small>Correlate failures with key rotations and receiver changes.</small></span></li></ul><button type="button" className="ips-text-link" onClick={() => onNavigate("webhook-retry")}>Investigate delivery failures <ArrowRight size={13}/></button></aside>
    </div>
    {notice && <div className="ips-feedback wo-export-feedback" role="status"><CheckCircle2 size={16}/>{notice}</div>}
    <p className="ips-footnote"><LockKeyhole size={13}/> Export and analytics use local synthetic data only. Production metrics require authorized backend queries and documented aggregation windows.</p>
  </main>;
}
