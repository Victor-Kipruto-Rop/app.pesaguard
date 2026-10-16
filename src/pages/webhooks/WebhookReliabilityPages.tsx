import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, CircleHelp,
  Clock3, Copy, Fingerprint, KeyRound, LockKeyhole, RefreshCw, RotateCcw, ShieldCheck,
  Trash2, Webhook, XCircle, Zap,
} from "lucide-react";
import type { DashboardPage } from "../../app/config/routes";
import type { Workspace } from "../../types/dashboard";
import "../integrations/integration-setup-pages.css";
import "./webhook-reliability-pages.css";

interface Props { workspace: Workspace; onNavigate: (page: DashboardPage) => void; }

type SecretRecord = { id: string; label: string; environment: string; fingerprint: string; created: string; lastUsed: string; state: "Active" | "Previous" | "Pending" };

export function WebhookSigningSecretPage({ workspace, onNavigate }: Props) {
  const [secrets, setSecrets] = useState<SecretRecord[]>([
    { id: "whsec_a1", label: "Primary endpoint signing key", environment: "Sandbox", fingerprint: "whsec_••••••••7f2a", created: "16 Oct 2026", lastUsed: "Not available in preview", state: "Active" },
    { id: "whsec_b2", label: "Previous signing key", environment: "Sandbox", fingerprint: "whsec_••••••••c910", created: "02 Oct 2026", lastUsed: "Not available in preview", state: "Previous" },
  ]);
  const [rotationReason, setRotationReason] = useState("Routine security rotation");
  const [ticket, setTicket] = useState("");
  const [overlapHours, setOverlapHours] = useState("24");
  const [stage, setStage] = useState<"overview" | "review" | "prepared">("overview");
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const activeCount = secrets.filter((secret) => secret.state === "Active").length;
  const overlapValid = Number(overlapHours) >= 0 && Number(overlapHours) <= 168;

  function prepareRotation() {
    if (!rotationReason.trim() || !ticket.trim() || !overlapValid) return;
    setStage("review");
    setNotice("");
  }
  function confirmRotationPreview() {
    const next: SecretRecord = {
      id: `whsec_preview_${secrets.length + 1}`,
      label: "Prepared replacement (preview)",
      environment: "Sandbox",
      fingerprint: "Not generated — preview only",
      created: "Not created",
      lastUsed: "Not used",
      state: "Pending",
    };
    setSecrets((current) => current.map((item) => item.state === "Active" ? { ...item, state: "Previous" as const } : item).concat(next));
    setStage("prepared");
    setNotice("Rotation plan prepared in local preview state. No signing key was generated, stored, activated, or revoked.");
  }

  return <main className="ips-page wr-page">
    <nav className="ips-breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={() => onNavigate("webhooks")}>Webhooks</button><ChevronRight size={14}/><span>Signing secret management</span><span className="ips-preview-pill"><i/> PREVIEW</span></nav>
    <header className="ips-hero"><div><span className="ips-eyebrow"><Fingerprint size={14}/> WEBHOOK SECURITY <b>·</b> {workspace.name}</span><h1>Signing secret management</h1><p>Review secret references and prepare a controlled rotation plan without exposing key material in the browser.</p></div><div className="wr-header-chip"><LockKeyhole size={15}/><span>Secret values hidden</span></div></header>
    <section className="ips-preview-notice"><span><CircleHelp size={19}/></span><div><strong>Metadata-only security preview</strong><p>This screen does not retrieve, generate, reveal, store, rotate, or revoke any secret. Real secret operations must be authorized and executed by a backend connected to a managed secret store.</p></div><b>NO SECRET ACCESS</b></section>
    <div className="wr-metric-grid">
      <div className="wr-metric"><span>Active references</span><strong>{activeCount}</strong><small><i className="wr-dot wr-dot-green"/> Local sample inventory</small></div>
      <div className="wr-metric"><span>Previous references</span><strong>{secrets.filter((secret) => secret.state === "Previous").length}</strong><small>Retention/retirement not verified</small></div>
      <div className="wr-metric"><span>Last provider verification</span><strong>—</strong><small>Backend verification not connected</small></div>
    </div>
    <section className="ips-card">
      <div className="ips-card-heading"><span className="ips-icon"><KeyRound size={18}/></span><div><h2>Signing secret inventory</h2><p>Masked identifiers and metadata only. Fingerprints shown here are illustrative labels, not cryptographic fingerprints.</p></div><span className="ips-status-chip">Sample data</span></div>
      <div className="wr-secret-list">{secrets.map((secret) => <article className="wr-secret-row" key={secret.id}><span className={secret.state === "Active" ? "wr-secret-icon active" : secret.state === "Previous" ? "wr-secret-icon previous" : "wr-secret-icon pending"}>{secret.state === "Active" ? <ShieldCheck size={18}/> : secret.state === "Previous" ? <Clock3 size={18}/> : <RefreshCw size={18}/>}</span><div className="wr-secret-main"><div className="wr-secret-title"><strong>{secret.label}</strong><span className={`wr-secret-state ${secret.state.toLowerCase()}`}>{secret.state}</span></div><code>{secret.fingerprint}</code><div className="wr-secret-meta"><span>{secret.environment}</span><span>Created: {secret.created}</span><span>Last used: {secret.lastUsed}</span></div></div><button className="ips-btn ips-btn-secondary wr-icon-btn" type="button" title="Copy masked identifier" aria-label={`Copy masked identifier for ${secret.label}`} onClick={() => setNotice(`Masked identifier ${secret.id} selected for reference. No secret value was copied.`)}><Copy size={14}/></button></article>)}</div>
      <div className="wr-security-note"><ShieldCheck size={17}/><div><strong>Rotation should be staged, not abrupt</strong><p>In a real deployment, support an overlap window for old and new signing keys, verify signatures during cutover, measure adoption, then retire the old key through an audited backend operation.</p></div></div>
    </section>
    <section className="ips-card wr-rotation-card">
      <div className="ips-card-heading"><span className="ips-icon"><RefreshCw size={18}/></span><div><h2>Prepare a rotation plan</h2><p>Document the reason and operational reference before reviewing the proposed cutover.</p></div><span className="ips-status-chip">Sandbox preview</span></div>
      {stage === "overview" && <div className="ips-form-grid">
        <label className="ips-field"><span>Rotation reason <b>Required</b></span><select value={rotationReason} onChange={(event) => setRotationReason(event.target.value)}><option>Routine security rotation</option><option>Suspected exposure</option><option>Staff or access change</option><option>Compliance requirement</option><option>Endpoint migration</option></select><small>For a suspected exposure, a real system may require an expedited incident workflow.</small></label>
        <label className="ips-field"><span>Change / incident reference <b>Required</b></span><input value={ticket} onChange={(event) => setTicket(event.target.value)} placeholder="e.g. SEC-2026-014" maxLength={100}/><small>Reference only; no ticketing system is contacted.</small></label>
        <label className="ips-field ips-field-wide"><span>Planned overlap window</span><div className="wr-overlap-control"><input type="number" min="0" max="168" value={overlapHours} onChange={(event) => setOverlapHours(event.target.value)} aria-invalid={!overlapValid}/><span>hours</span><small>0–168 hours. Your backend policy must determine the allowed window.</small></div></label>
        <div className="ips-field-wide wr-rotation-callout"><AlertTriangle size={17}/><span><strong>Do not paste key material here.</strong> Rotation reason and ticket reference are the only sensitive-process metadata requested. The new secret will not be generated in this preview.</span></div>
        <div className="ips-card-footer ips-field-wide"><span><LockKeyhole size={14}/> No key material enters this page.</span><button className="ips-btn ips-btn-primary" type="button" disabled={!rotationReason.trim() || !ticket.trim() || !overlapValid} onClick={prepareRotation}>Review rotation plan <ArrowRight size={15}/></button></div>
      </div>}
      {stage === "review" && <div className="wr-review-panel"><span className="wr-review-icon"><ShieldCheck size={21}/></span><div><h3>Review before preparing</h3><p>Reason: <strong>{rotationReason}</strong></p><p>Change reference: <strong>{ticket}</strong></p><p>Proposed overlap: <strong>{overlapHours} hours</strong></p><ul><li>Backend must create the new secret in a secret manager.</li><li>Confirm dual-key verification and monitor signature failures during overlap.</li><li>Retire the old key only after the cutover is verified and authorized.</li></ul><div className="ips-action-row"><button className="ips-btn ips-btn-secondary" type="button" onClick={() => setStage("overview")}><ArrowLeft size={14}/> Edit plan</button><button className="ips-btn ips-btn-primary" type="button" onClick={confirmRotationPreview}><Check size={15}/> Prepare preview plan</button></div></div></div>}
      {stage === "prepared" && <div className="wr-prepared-panel" role="status"><CheckCircle2 size={22}/><div><h3>Rotation plan prepared in preview</h3><p>{notice}</p><button className="ips-btn ips-btn-secondary" type="button" onClick={() => {setStage("overview");setTicket("");setNotice("");}}>Prepare another plan</button></div></div>}
      {notice && stage !== "prepared" && <div className="ips-feedback" role="status"><CheckCircle2 size={17}/>{notice}</div>}
    </section>
    <section className="wr-guidance-grid"><article className="ips-side-card"><span className="ips-icon"><LockKeyhole size={17}/></span><h2>Controls a production flow needs</h2><ul><li>Tenant-scoped permission checks and re-authentication for sensitive actions.</li><li>Secret-manager storage with strict read/write policies.</li><li>Audited creation, activation, overlap, rollback, and revocation.</li><li>Key-version-aware signature validation and replay protection.</li></ul></article><article className="ips-side-card"><span className="ips-icon"><Webhook size={17}/></span><h2>Related webhook settings</h2><p>Use endpoint configuration to manage subscriptions and delivery policy before planning a secret change.</p><button className="ips-text-link" type="button" onClick={() => onNavigate("webhook-endpoint-editor")}>Open endpoint editor <ArrowRight size={13}/></button></article></section>
    <p className="ips-footnote"><LockKeyhole size={13}/> Illustrative inventory only. No secret values are exposed and no real rotation operation is performed.</p>
  </main>;
}

type DeliveryStatus = "Retry scheduled" | "Dead-lettered" | "Delivered" | "Retrying";
type Delivery = { id: string; event: string; endpoint: string; created: string; attempts: number; status: DeliveryStatus; code: string; reason: string };
const sampleDeliveries: Delivery[] = [
  { id: "dlv_8F31A2", event: "transaction.completed", endpoint: "Finance operations receiver", created: "16 Oct, 04:12:08", attempts: 4, status: "Dead-lettered", code: "HTTP 410", reason: "Receiver returned a permanent-gone response in this sample." },
  { id: "dlv_8F319C", event: "reconciliation.exception.created", endpoint: "Finance operations receiver", created: "16 Oct, 04:08:51", attempts: 3, status: "Retry scheduled", code: "HTTP 503", reason: "Receiver unavailable; next attempt follows the configured retry policy." },
  { id: "dlv_8F318B", event: "transaction.failed", endpoint: "Operations alerts", created: "16 Oct, 03:59:24", attempts: 1, status: "Delivered", code: "HTTP 200", reason: "Sample delivery acknowledged by the receiver." },
  { id: "dlv_8F3177", event: "settlement.batch.updated", endpoint: "Finance operations receiver", created: "16 Oct, 03:44:09", attempts: 2, status: "Retrying", code: "Timeout", reason: "No response was received before the sample timeout." },
  { id: "dlv_8F3164", event: "transaction.pending", endpoint: "Operations alerts", created: "16 Oct, 03:38:17", attempts: 5, status: "Dead-lettered", code: "HTTP 429", reason: "Retry budget exhausted in this illustrative record." },
];

export function WebhookRetryDeadLetterPage({ workspace, onNavigate }: Props) {
  const [deliveries, setDeliveries] = useState(sampleDeliveries);
  const [filter, setFilter] = useState<"All" | DeliveryStatus>("All");
  const [selected, setSelected] = useState<string | null>(sampleDeliveries[0].id);
  const [query, setQuery] = useState("");
  const [confirmReplay, setConfirmReplay] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [showPayload, setShowPayload] = useState(false);
  const visible = useMemo(() => deliveries.filter((item) => (filter === "All" || item.status === filter) && `${item.id} ${item.event} ${item.endpoint} ${item.code}`.toLowerCase().includes(query.toLowerCase())), [deliveries, filter, query]);
  const current = deliveries.find((item) => item.id === selected) ?? visible[0] ?? null;
  const deadLetterCount = deliveries.filter((item) => item.status === "Dead-lettered").length;
  const retryingCount = deliveries.filter((item) => item.status === "Retry scheduled" || item.status === "Retrying").length;

  function previewReplay(id: string) {
    setDeliveries((items) => items.map((item) => item.id === id ? { ...item, status: "Retry scheduled", attempts: item.attempts + 1 } : item));
    setSelected(id);
    setConfirmReplay(null);
    setNotice(`Replay of ${id} has been simulated locally. No webhook was sent and no backend delivery record changed.`);
  }

  return <main className="ips-page wr-page">
    <nav className="ips-breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={() => onNavigate("webhooks")}>Webhooks</button><ChevronRight size={14}/><span>Retry & dead-letter queue</span><span className="ips-preview-pill"><i/> PREVIEW</span></nav>
    <header className="ips-hero"><div><span className="ips-eyebrow"><RefreshCw size={14}/> DELIVERY RELIABILITY <b>·</b> {workspace.name}</span><h1>Retry & dead-letter queue</h1><p>Investigate failed deliveries, inspect retry history, and review replay safeguards with an operator-focused queue workspace.</p></div><div className="wr-header-chip"><Webhook size={15}/><span>Sample delivery records</span></div></header>
    <section className="ips-preview-notice"><span><CircleHelp size={19}/></span><div><strong>Queue operations are simulated</strong><p>Records are illustrative frontend data. Retry, replay, and filtering actions update local preview state only. No delivery worker, endpoint, or queue is contacted.</p></div><b>NO NETWORK SEND</b></section>
    <div className="wr-metric-grid wr-metric-grid-four"><div className="wr-metric"><span>Dead-lettered</span><strong>{deadLetterCount}</strong><small><i className="wr-dot wr-dot-red"/> Requires operator review</small></div><div className="wr-metric"><span>Retrying / scheduled</span><strong>{retryingCount}</strong><small><i className="wr-dot wr-dot-amber"/> Local sample queue</small></div><div className="wr-metric"><span>Delivered</span><strong>{deliveries.filter((item) => item.status === "Delivered").length}</strong><small>Sample acknowledgements</small></div><div className="wr-metric"><span>Oldest sample record</span><strong>28 min</strong><small>Example age, not live telemetry</small></div></div>
    <div className="wr-queue-layout">
      <section className="ips-card wr-queue-card">
        <div className="ips-card-heading"><span className="ips-icon"><Webhook size={18}/></span><div><h2>Delivery queue</h2><p>Search sample deliveries and select a record to inspect its details.</p></div><span className="ips-status-chip">{visible.length} records</span></div>
        <div className="wr-queue-controls"><label className="wr-search"><span className="sr-only">Search deliveries</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ID, event, endpoint…"/></label><label className="wr-filter"><span className="sr-only">Filter by status</span><select value={filter} onChange={(event) => setFilter(event.target.value as "All" | DeliveryStatus)}><option>All</option><option>Retry scheduled</option><option>Dead-lettered</option><option>Delivered</option><option>Retrying</option></select></label></div>
        <div className="wr-delivery-list">{visible.map((item) => <button key={item.id} type="button" className={`wr-delivery-row ${selected === item.id ? "is-selected" : ""}`} onClick={() => {setSelected(item.id);setNotice("");}}><span className={`wr-status-mark ${item.status === "Dead-lettered" ? "is-dead" : item.status === "Delivered" ? "is-delivered" : "is-retrying"}`}>{item.status === "Dead-lettered" ? <XCircle size={16}/> : item.status === "Delivered" ? <CheckCircle2 size={16}/> : <RefreshCw size={16}/>}</span><span className="wr-delivery-copy"><span className="wr-delivery-title"><strong>{item.id}</strong><span className={`wr-delivery-status ${item.status.toLowerCase().replaceAll(" ", "-")}`}>{item.status}</span></span><code>{item.event}</code><small>{item.endpoint} · {item.created}</small></span><span className="wr-delivery-attempts"><strong>{item.attempts}</strong><small>attempts</small></span></button>)}
          {visible.length === 0 && <div className="wr-empty"><Webhook size={20}/><strong>No sample deliveries match</strong><p>Try a different search or status filter.</p></div>}
        </div>
      </section>
      <aside className="wr-detail-column">
        {current ? <section className="ips-side-card wr-delivery-detail"><div className="ips-side-heading"><span className="ips-icon"><Fingerprint size={17}/></span><div><h2>Delivery detail</h2><p>{current.id}</p></div></div><span className={`wr-detail-status ${current.status.toLowerCase().replaceAll(" ", "-")}`}>{current.status}</span><dl className="wr-detail-list"><div><dt>Event type</dt><dd><code>{current.event}</code></dd></div><div><dt>Endpoint</dt><dd>{current.endpoint}</dd></div><div><dt>Last response</dt><dd>{current.code}</dd></div><div><dt>Attempts recorded</dt><dd>{current.attempts}</dd></div><div><dt>Created</dt><dd>{current.created}</dd></div></dl><div className="wr-reason"><strong>Latest outcome</strong><p>{current.reason}</p></div><button className="ips-btn ips-btn-secondary ips-full-btn" type="button" onClick={() => setShowPayload(!showPayload)}><Copy size={14}/>{showPayload ? "Hide event envelope" : "Inspect sample event envelope"}</button>{showPayload && <pre className="ips-code-sample wr-event-payload">{JSON.stringify({ id: `evt_${current.id}`, type: current.event, delivery_id: current.id, data: { status: "sample_only" } }, null, 2)}</pre>}
          {current.status !== "Delivered" && <button className="ips-btn ips-btn-primary ips-full-btn wr-replay-button" type="button" onClick={() => setConfirmReplay(current.id)}><RotateCcw size={14}/> Prepare replay preview</button>}
          {current.status === "Dead-lettered" && <div className="wr-deadletter-note"><AlertTriangle size={15}/><span>Review the destination, response class, idempotency, and event age before replaying in a real system.</span></div>}
        </section> : <section className="ips-side-card wr-empty"><Webhook size={22}/><strong>Select a delivery</strong><p>Choose a row to inspect its metadata.</p></section>}
        <section className="ips-side-card"><div className="ips-side-heading"><span className="ips-icon"><ShieldCheck size={17}/></span><div><h2>Operational safeguards</h2><p>Recommended backend behavior</p></div></div><ul className="ips-security-list"><li><CheckCircle2 size={15}/><span><strong>Bounded retries</strong><small>Use capped attempts with exponential backoff and jitter.</small></span></li><li><LockKeyhole size={15}/><span><strong>Tenant isolation</strong><small>Authorize every queue action for the active tenant.</small></span></li><li><Clock3 size={15}/><span><strong>Replay audit trail</strong><small>Record actor, reason, prior state, and resulting delivery ID.</small></span></li><li><Trash2 size={15}/><span><strong>Retention policy</strong><small>Define retention, access, and deletion rules for payload data.</small></span></li></ul><button className="ips-text-link" type="button" onClick={() => onNavigate("webhook-signing-secret")}>Review signing secret management <ArrowRight size={13}/></button></section>
      </aside>
    </div>
    {notice && <div className="ips-feedback wr-global-feedback" role="status"><CheckCircle2 size={17}/>{notice}</div>}
    <p className="ips-footnote"><LockKeyhole size={13}/> Sample records only. No retry worker, dead-letter queue, endpoint, or backend operation is connected.</p>
    {confirmReplay && <div className="ips-modal-backdrop" role="presentation"><section className="ips-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="wr-replay-title"><span className="ips-modal-icon"><AlertTriangle size={20}/></span><h2 id="wr-replay-title">Prepare replay preview?</h2><p>This changes only the local sample record's status and attempt count. In production, verify tenant authorization, payload integrity, duplicate-processing safety, and replay reason before queueing a new delivery.</p><div className="ips-action-row"><button className="ips-btn ips-btn-secondary" type="button" onClick={() => setConfirmReplay(null)}>Cancel</button><button className="ips-btn ips-btn-primary" type="button" onClick={() => previewReplay(confirmReplay)}><RotateCcw size={14}/> Simulate replay</button></div></section></div>}
  </main>;
}
