import { useState } from "react";
import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronRight, CircleHelp,
  Clock3, Eye, EyeOff, Fingerprint, KeyRound, LockKeyhole, RotateCw,
  Save, ShieldCheck, SlidersHorizontal, Webhook, X,
} from "lucide-react";
import type { DashboardPage } from "../../app/config/routes";
import type { Workspace } from "../../types/dashboard";
import "./callback-security-pages.css";

interface Props { workspace: Workspace; onNavigate: (page: DashboardPage) => void; }

const eventOptions = [
  { id: "transaction.completed", label: "Transaction completed", description: "A payment reaches a completed state." },
  { id: "transaction.failed", label: "Transaction failed", description: "A payment attempt is marked failed." },
  { id: "transaction.pending", label: "Transaction pending", description: "A payment is awaiting a final outcome." },
  { id: "reconciliation.exception.created", label: "Reconciliation exception created", description: "A record requires operational review." },
  { id: "settlement.batch.updated", label: "Settlement batch updated", description: "A settlement batch changes state." },
];

export function CallbackConfigurationPage({ workspace, onNavigate }: Props) {
  const [endpoint, setEndpoint] = useState("https://merchant.example/callbacks/pesaguard");
  const [description, setDescription] = useState("Primary finance operations receiver");
  const [enabled, setEnabled] = useState(true);
  const [events, setEvents] = useState(["transaction.completed", "transaction.failed", "reconciliation.exception.created"]);
  const [timeout, setTimeoutValue] = useState("10");
  const [maxAttempts, setMaxAttempts] = useState("5");
  const [backoff, setBackoff] = useState("Exponential");
  const [saved, setSaved] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [notice, setNotice] = useState("");
  const validUrl = /^https:\/\//i.test(endpoint.trim());

  function toggleEvent(id: string) {
    setEvents((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setSaved(false);
  }

  return <main className="cs-page">
    <nav className="cs-breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={() => onNavigate("webhooks")}>Webhooks</button><ChevronRight size={13}/><span>Callback configuration</span><span className="cs-preview-badge"><i/> PREVIEW</span></nav>
    <header className="cs-hero"><div><span className="cs-eyebrow"><Webhook size={14}/> DELIVERY SETTINGS <b>·</b> {workspace.name}</span><h1>Callback configuration</h1><p>Define where event notifications should be delivered, which events are subscribed, and how a delivery service should handle temporary failures.</p></div><div className="cs-hero-actions"><button className="cs-btn cs-btn-secondary" type="button" onClick={() => onNavigate("provider-callback-history")}>View delivery history <ArrowRight size={14}/></button></div></header>
    <section className="cs-banner"><span><CircleHelp size={18}/></span><div><strong>Configuration preview — changes are local to this page</strong><p>Saving below updates this screen's preview state only. It does not create or modify a real webhook endpoint, register subscriptions, or change delivery behavior on the backend.</p></div><b>NOT CONNECTED</b></section>
    <div className="cs-layout">
      <section className="cs-main-card">
        <div className="cs-section-head"><span className="cs-section-icon"><Webhook size={17}/></span><div><h2>Endpoint details</h2><p>Set the destination that should receive event payloads.</p></div><span className={`cs-state-chip ${enabled ? "is-active" : "is-disabled"}`}><i/>{enabled ? "Enabled in preview" : "Paused in preview"}</span></div>
        <div className="cs-form-grid">
          <label className="cs-field cs-field-wide"><span>Endpoint URL <b>Required</b></span><input value={endpoint} onChange={(e) => {setEndpoint(e.target.value);setSaved(false);}} placeholder="https://your-domain.example/webhooks/pesaguard" aria-invalid={!validUrl}/><small className={validUrl ? "" : "cs-field-error"}>{validUrl ? "HTTPS is required for production callback destinations." : "Enter a valid HTTPS URL to continue."}</small></label>
          <label className="cs-field cs-field-wide"><span>Internal description <small>Optional</small></span><input value={description} onChange={(e) => {setDescription(e.target.value);setSaved(false);}} maxLength={100}/></label>
        </div>
        <div className="cs-toggle-row"><span className="cs-toggle-icon"><SlidersHorizontal size={17}/></span><div><strong>Endpoint enabled</strong><p>When enabled in a connected system, selected events would be eligible for delivery.</p></div><button type="button" role="switch" aria-checked={enabled} className={`cs-switch ${enabled ? "is-on" : ""}`} onClick={() => {setEnabled(!enabled);setSaved(false);}}><i/></button></div>
        <div className="cs-divider"/>
        <div className="cs-section-head cs-events-head"><span className="cs-section-icon"><CheckCircle2 size={17}/></span><div><h2>Event subscriptions</h2><p>Choose the event types this endpoint should receive.</p></div><span className="cs-count-pill">{events.length} selected</span></div>
        <div className="cs-event-options">{eventOptions.map((event) => <label key={event.id} className={`cs-event-option ${events.includes(event.id) ? "is-checked" : ""}`}><input type="checkbox" checked={events.includes(event.id)} onChange={() => toggleEvent(event.id)}/><span className="cs-custom-check">{events.includes(event.id) && <Check size={12}/>}</span><span className="cs-event-copy"><strong>{event.label}</strong><small>{event.description}</small><code>{event.id}</code></span><span className="cs-event-status">{events.includes(event.id) ? "Subscribed" : "Not selected"}</span></label>)}</div>
        <div className="cs-divider"/>
        <div className="cs-section-head"><span className="cs-section-icon"><Clock3 size={17}/></span><div><h2>Delivery retry policy</h2><p>Preview settings for temporary receiver failures and timeouts.</p></div></div>
        <div className="cs-form-grid cs-retry-grid">
          <label className="cs-field"><span>Request timeout</span><div className="cs-input-suffix"><input type="number" min="1" max="60" value={timeout} onChange={(e) => {setTimeoutValue(e.target.value);setSaved(false);}}/><span>seconds</span></div><small>Allowed preview range: 1–60 seconds.</small></label>
          <label className="cs-field"><span>Maximum attempts</span><div className="cs-input-suffix"><input type="number" min="1" max="10" value={maxAttempts} onChange={(e) => {setMaxAttempts(e.target.value);setSaved(false);}}/><span>attempts</span></div><small>Includes the initial delivery attempt.</small></label>
          <label className="cs-field cs-field-wide"><span>Retry delay strategy</span><select value={backoff} onChange={(e) => {setBackoff(e.target.value);setSaved(false);}}><option>Exponential</option><option>Fixed interval</option></select><small>Actual retry schedule, limits and jitter must be implemented and enforced by the delivery service.</small></label>
        </div>
        <div className="cs-footer-actions"><span><LockKeyhole size={14}/> Changes are not sent to a server</span><button type="button" className="cs-btn cs-btn-primary" disabled={!validUrl || events.length === 0 || Number(timeout) < 1 || Number(timeout) > 60 || Number(maxAttempts) < 1 || Number(maxAttempts) > 10} onClick={() => {setSaved(true);setNotice("Preview saved in this page session only. No endpoint or subscription was changed on the server.");}}><Save size={15}/> Save preview configuration</button></div>
        {saved && <div className="cs-success-message" role="status"><CheckCircle2 size={16}/><span><strong>Preview configuration saved</strong><small>{events.length} event subscriptions selected for {description || "this endpoint"}.</small></span></div>}
        {notice && <div className="cs-note-message" role="status"><CircleHelp size={15}/><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss"><X size={14}/></button></div>}
      </section>
      <aside className="cs-side-column">
        <section className="cs-side-card cs-security-card"><div className="cs-side-title"><span className="cs-section-icon"><ShieldCheck size={17}/></span><div><h2>Signing & verification</h2><p>Protect the receiver from forged requests.</p></div></div><div className="cs-secret-state"><span className="cs-secret-icon"><Fingerprint size={20}/></span><div><strong>Signing secret</strong><span>Not connected to a secret store</span></div><span className="cs-unverified">UNVERIFIED</span></div><label className="cs-field"><span>Secret reference</span><div className="cs-secret-input"><input readOnly value={showSecret ? "whsec_preview_not_a_real_secret" : "••••••••••••••••••••••••••••"} aria-label="Preview signing secret reference"/><button type="button" onClick={() => setShowSecret(!showSecret)} aria-label={showSecret ? "Hide preview value" : "Show preview value"}>{showSecret ? <EyeOff size={15}/> : <Eye size={15}/>}</button></div><small>Displayed value is a placeholder, not a usable signing secret.</small></label><button type="button" className="cs-btn cs-btn-secondary cs-full" onClick={() => setNotice("Secret rotation is a separate preview flow. No secret was generated or changed.")}><RotateCw size={14}/> Review credential rotation</button><button type="button" className="cs-link-button" onClick={() => onNavigate("credential-rotation")}>Open credential rotation <ArrowRight size={13}/></button></section>
        <section className="cs-side-card"><div className="cs-side-title"><span className="cs-section-icon"><CheckCircle2 size={17}/></span><div><h2>Preflight checklist</h2><p>Before enabling live deliveries.</p></div></div><ul className="cs-checklist"><li><span className="cs-check-muted"><Check size={12}/></span><div><strong>HTTPS endpoint entered</strong><small>{validUrl ? "Format passes the basic HTTPS check." : "A valid HTTPS URL is required."}</small></div></li><li><span className="cs-check-muted"><Check size={12}/></span><div><strong>Receiver authenticates signatures</strong><small>Must be verified by a real receiver test.</small></div></li><li><span className="cs-check-muted"><Check size={12}/></span><div><strong>Idempotent event processing</strong><small>Deduplicate event IDs before side effects.</small></div></li><li><span className="cs-check-muted"><Check size={12}/></span><div><strong>Retry and alert policy tested</strong><small>Test timeouts, 4xx/5xx and duplicate delivery.</small></div></li></ul></section>
        <section className="cs-mini-callout"><AlertTriangle size={16}/><p><strong>Security note</strong> Never put signing secrets in frontend code, URLs, analytics, or client-visible logs. Store and use secrets on the server.</p></section>
      </aside>
    </div>
  </main>;
}

const credentialRows = [
  { id: "mpesa-consumer-key", name: "M-Pesa Daraja consumer key", purpose: "OAuth client authentication", environment: "Sandbox", updated: "Not recorded", state: "Placeholder only" },
  { id: "mpesa-consumer-secret", name: "M-Pesa Daraja consumer secret", purpose: "OAuth client authentication", environment: "Sandbox", updated: "Not recorded", state: "Not configured" },
  { id: "mpesa-passkey", name: "M-Pesa STK passkey", purpose: "STK password generation", environment: "Sandbox", updated: "Not recorded", state: "Not configured" },
  { id: "callback-signing", name: "Callback signing secret", purpose: "Verify inbound event authenticity", environment: "Tenant", updated: "Not recorded", state: "Not configured" },
];

type RotationStep = "select" | "prepare" | "review";
export function CredentialRotationPage({ workspace, onNavigate }: Props) {
  const [selectedCredential, setSelectedCredential] = useState("mpesa-consumer-secret");
  const [step, setStep] = useState<RotationStep>("select");
  const [reason, setReason] = useState("Scheduled rotation");
  const [operator, setOperator] = useState("");
  const [confirmImpact, setConfirmImpact] = useState(false);
  const [notice, setNotice] = useState("");
  const credential = credentialRows.find((item) => item.id === selectedCredential) ?? credentialRows[1];

  function resetFlow() {
    setStep("select"); setOperator(""); setConfirmImpact(false); setMaskedValue(""); setShowValue(false); setNotice("");
  }

  return <main className="cs-page cr-page">
    <nav className="cs-breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={() => onNavigate("integrations")}>Integrations</button><ChevronRight size={13}/><span>Credential rotation</span><span className="cs-preview-badge"><i/> PREVIEW</span></nav>
    <header className="cs-hero"><div><span className="cs-eyebrow"><KeyRound size={14}/> CREDENTIAL LIFECYCLE <b>·</b> {workspace.name}</span><h1>Credential rotation</h1><p>Review integration credentials, prepare a controlled replacement, and plan cutover without exposing secrets in the browser.</p></div><button type="button" className="cs-btn cs-btn-secondary" onClick={() => onNavigate("callback-configuration")}>Callback security <ArrowRight size={14}/></button></header>
    <section className="cs-banner"><span><LockKeyhole size={18}/></span><div><strong>Security-first preview — no real secrets are loaded</strong><p>This screen contains metadata and placeholders only. It does not fetch, generate, store, reveal, revoke, or rotate production credentials. Real rotation must run through an authenticated backend and secret manager.</p></div><b>SAFE PLACEHOLDERS</b></section>
    <section className="cr-summary-grid"><article><span className="cr-summary-icon"><KeyRound size={18}/></span><div><small>Credential records</small><strong>04</strong><span>Local catalog</span></div></article><article><span className="cr-summary-icon cr-summary-amber"><Clock3 size={18}/></span><div><small>Rotation due</small><strong>Unknown</strong><span>No verified timestamps</span></div></article><article><span className="cr-summary-icon cr-summary-muted"><ShieldCheck size={18}/></span><div><small>Secret store</small><strong>Not connected</strong><span>Backend integration required</span></div></article></section>
    <div className="cr-layout">
      <section className="cs-main-card cr-inventory"><div className="cs-section-head"><span className="cs-section-icon"><KeyRound size={17}/></span><div><h2>Credential inventory</h2><p>Metadata only. Secret values are never part of this catalog.</p></div><span className="cs-count-pill">{credentialRows.length} records</span></div>
        <div className="cr-table-wrap"><table className="cr-table"><thead><tr><th>Credential</th><th>Environment</th><th>Rotation state</th><th></th></tr></thead><tbody>{credentialRows.map((row) => <tr key={row.id} className={selectedCredential === row.id ? "is-selected" : ""} onClick={() => {setSelectedCredential(row.id);setStep("select");}}><td><strong>{row.name}</strong><small>{row.purpose}</small><code>{row.id}</code></td><td><span className="cr-env">{row.environment}</span></td><td><span className={`cr-credential-state ${row.state === "Placeholder only" ? "is-placeholder" : ""}`}><i/>{row.state}</span><small>Last rotated: {row.updated}</small></td><td><button type="button" aria-label={`Select ${row.name}`} onClick={(e) => {e.stopPropagation();setSelectedCredential(row.id);setStep("select");}}><ChevronRight size={16}/></button></td></tr>)}</tbody></table></div>
        <div className="cr-inventory-foot"><span><LockKeyhole size={13}/> Secret values intentionally excluded</span><button type="button" onClick={() => onNavigate("mpesa-setup")}>M-Pesa integration setup <ArrowRight size={13}/></button></div>
      </section>
      <section className="cs-main-card cr-rotation-card"><div className="cs-section-head"><span className="cs-section-icon"><RotateCw size={17}/></span><div><h2>Rotation workflow</h2><p>Plan a safe credential replacement.</p></div></div>
        <div className="cr-stepper"><div className={step === "select" ? "is-current" : "is-complete"}><span>{step === "select" ? "1" : <Check size={12}/>}</span><small>Select</small></div><i/><div className={step === "prepare" ? "is-current" : step === "review" ? "is-complete" : ""}><span>{step === "review" ? <Check size={12}/> : "2"}</span><small>Prepare</small></div><i/><div className={step === "review" ? "is-current" : ""}><span>3</span><small>Review</small></div></div>
        {step === "select" && <div className="cr-step-content"><span className="cs-eyebrow">STEP 1 OF 3</span><h3>Select a credential</h3><p>Confirm which integration credential is in scope before preparing a replacement.</p><div className="cr-selected-credential"><span className="cr-key-icon"><KeyRound size={17}/></span><div><strong>{credential.name}</strong><small>{credential.environment} environment · {credential.state}</small></div><span className="cr-selected-tag">Selected</span></div><label className="cs-field"><span>Rotation reason</span><select value={reason} onChange={(e) => setReason(e.target.value)}><option>Scheduled rotation</option><option>Suspected exposure</option><option>Staff or access change</option><option>Provider requested change</option><option>Environment migration</option></select></label><button type="button" className="cs-btn cs-btn-primary cs-full" onClick={() => setStep("prepare")}>Continue to preparation <ArrowRight size={14}/></button></div>}
        {step === "prepare" && <div className="cr-step-content"><span className="cs-eyebrow">STEP 2 OF 3</span><h3>Prepare replacement</h3><p>In a real flow, a privileged backend would validate the provider credential and store it securely. Never submit secrets to a client-only form.</p><div className="cr-prep-list"><div><CheckCircle2 size={16}/><span><strong>Confirm provider access</strong><small>Validate the replacement with the provider in a non-production environment first.</small></span></div><div><CheckCircle2 size={16}/><span><strong>Stage a versioned secret</strong><small>Use a server-side secret manager; never return the stored value to the UI.</small></span></div><div><AlertTriangle size={16}/><span><strong>Plan overlap and rollback</strong><small>Keep the previous credential available only as permitted by provider policy.</small></span></div></div><label className="cs-field"><span>Operator / ticket reference <b>Required</b></span><input value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="e.g. SEC-142 · operator initials" maxLength={120}/></label><div className="cr-step-actions"><button type="button" className="cs-btn cs-btn-secondary" onClick={() => setStep("select")}>Back</button><button type="button" className="cs-btn cs-btn-primary" disabled={!operator.trim()} onClick={() => setStep("review")}>Review rotation <ArrowRight size={14}/></button></div></div>}
        {step === "review" && <div className="cr-step-content"><span className="cs-eyebrow">STEP 3 OF 3</span><h3>Review rotation plan</h3><div className="cr-review-box"><div><span>Credential</span><strong>{credential.name}</strong></div><div><span>Reason</span><strong>{reason}</strong></div><div><span>Operator / ticket</span><strong>{operator}</strong></div><div><span>Execution mode</span><strong>Preview only — no rotation</strong></div></div><label className="cr-confirm-check"><input type="checkbox" checked={confirmImpact} onChange={(e) => setConfirmImpact(e.target.checked)}/><span>I understand that this review records no real change and does not rotate a credential.</span></label><div className="cr-step-actions"><button type="button" className="cs-btn cs-btn-secondary" onClick={() => setStep("prepare")}>Back</button><button type="button" className="cs-btn cs-btn-primary" disabled={!confirmImpact} onClick={() => {setNotice("Rotation plan reviewed in this page session only. No secret was generated, stored, revoked, or rotated.");setStep("select");setConfirmImpact(false);setOperator("");}}>Confirm preview plan <Check size={14}/></button></div></div>}
        {notice && <div className="cs-success-message" role="status"><CheckCircle2 size={16}/><span><strong>Preview plan complete</strong><small>{notice}</small></span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss"><X size={14}/></button></div>}
      </section>
    </div>
    <section className="cr-runbook"><span className="cr-runbook-icon"><ShieldCheck size={19}/></span><div><strong>Production rotation guardrails</strong><p>Require an authorized operator, re-authentication or MFA for sensitive actions, immutable audit records, server-side secret storage, provider validation, controlled cutover, rollback planning, and post-rotation health checks.</p></div><button type="button" onClick={() => onNavigate("activity-log")}>Review activity log <ArrowRight size={13}/></button></section>
  </main>;
}
