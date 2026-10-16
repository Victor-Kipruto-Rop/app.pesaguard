import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, CircleHelp, Clock3,
  ExternalLink, Fingerprint, Globe2, KeyRound, LockKeyhole, PlugZap, RefreshCw,
  Save, ShieldCheck, SlidersHorizontal, Webhook, XCircle, Zap,
} from "lucide-react";
import type { DashboardPage } from "../../app/config/routes";
import type { Workspace } from "../../types/dashboard";
import "./integration-setup-pages.css";

interface Props { workspace: Workspace; onNavigate: (page: DashboardPage) => void; }

const webhookEvents = [
  { id: "transaction.completed", title: "Transaction completed", detail: "A payment has a successful terminal outcome." },
  { id: "transaction.failed", title: "Transaction failed", detail: "A payment attempt has failed." },
  { id: "transaction.pending", title: "Transaction pending", detail: "A payment has not reached a final outcome." },
  { id: "reconciliation.exception.created", title: "Reconciliation exception created", detail: "A reconciliation item needs attention." },
  { id: "settlement.batch.updated", title: "Settlement batch updated", detail: "A settlement batch changes state." },
];

export function MpesaIntegrationSetupPage({ workspace, onNavigate }: Props) {
  const [environment, setEnvironment] = useState<"sandbox" | "production">("sandbox");
  const [shortcode, setShortcode] = useState("174379");
  const [consumerKeyReference, setConsumerKeyReference] = useState("");
  const [consumerSecretReference, setConsumerSecretReference] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("https://app.pesaguard.co.ke/api/integrations/mpesa/callback");
  const [initiatorName, setInitiatorName] = useState("");
  const [step, setStep] = useState(0);
  const [checksRun, setChecksRun] = useState(false);
  const [notice, setNotice] = useState("");
  const callbackValid = /^https:\/\//i.test(callbackUrl.trim()) && (() => { try { return new URL(callbackUrl).hostname.includes("."); } catch { return false; } })();
  const credentialReferencesPresent = Boolean(consumerKeyReference.trim() && consumerSecretReference.trim());
  const setupChecks = useMemo(() => [
    { label: "Environment selected", ready: Boolean(environment), detail: environment === "sandbox" ? "Sandbox mode selected" : "Production mode selected — approval and live credentials required" },
    { label: "Shortcode entered", ready: Boolean(shortcode.trim()), detail: shortcode.trim() ? "A shortcode value is present" : "Enter the shortcode issued for your Daraja app" },
    { label: "Credential references documented", ready: credentialReferencesPresent, detail: credentialReferencesPresent ? "References supplied (values are not verified)" : "Add safe references only; never paste secrets into this preview" },
    { label: "HTTPS callback URL", ready: callbackValid, detail: callbackValid ? "URL format passes a local check; reachability is not tested" : "Use a valid HTTPS URL" },
  ], [environment, shortcode, credentialReferencesPresent, callbackValid]);
  const readyCount = setupChecks.filter((item) => item.ready).length;

  function runPreviewChecks() {
    setChecksRun(true);
    setNotice("Local checks completed. This preview has not contacted Safaricom Daraja, verified credentials, or sent a callback.");
    setStep(2);
  }

  return <main className="ips-page">
    <nav className="ips-breadcrumb" aria-label="Breadcrumb">
      <button type="button" onClick={() => onNavigate("integrations")}>Integrations</button><ChevronRight size={14}/><span>M-Pesa setup</span><span className="ips-preview-pill"><i/> PREVIEW</span>
    </nav>
    <header className="ips-hero">
      <div><span className="ips-eyebrow"><PlugZap size={14}/> PAYMENT PROVIDER <b>·</b> {workspace.name}</span><h1>Connect M-Pesa</h1><p>Prepare your Daraja integration, confirm callback routing, and review the checks needed before a real connection can be enabled.</p></div>
      <div className="ips-provider-mark" aria-label="M-Pesa provider preview"><span>M</span><div><strong>M-Pesa</strong><small>Safaricom Daraja</small></div><span className="ips-provider-dot"/></div>
    </header>
    <section className="ips-preview-notice"><span><CircleHelp size={19}/></span><div><strong>Setup workspace only — no live connection</strong><p>Fields and checks below are local preview state. No credential is sent or stored, no Daraja request is made, and no transaction can be initiated from this page.</p></div><b>NOT CONNECTED</b></section>
    <div className="ips-stepper" aria-label="Setup steps">
      {["Environment", "Credentials & routing", "Readiness review"].map((label, index) => <button key={label} type="button" className={step === index ? "is-current" : step > index ? "is-complete" : ""} onClick={() => setStep(index)}><span className="ips-step-number">{step > index ? <Check size={14}/> : index + 1}</span><span><strong>{label}</strong><small>{index === 0 ? "Choose the safe starting mode" : index === 1 ? "Document values and callback" : "Review local checks"}</small></span></button>)}
    </div>
    {step === 0 && <section className="ips-card">
      <div className="ips-card-heading"><span className="ips-icon"><Globe2 size={18}/></span><div><h2>Choose an environment</h2><p>Start in a non-production environment while your integration is being configured.</p></div><span className="ips-status-chip">Step 1 of 3</span></div>
      <div className="ips-environment-options">
        <button type="button" className={environment === "sandbox" ? "ips-environment is-selected" : "ips-environment"} onClick={() => setEnvironment("sandbox")}><span className="ips-radio">{environment === "sandbox" && <i/>}</span><span className="ips-env-icon"><ShieldCheck size={20}/></span><span className="ips-env-copy"><strong>Sandbox</strong><small>Recommended for setup and test transactions</small><em>Isolated test environment</em></span><span className="ips-env-tag">Recommended</span></button>
        <button type="button" className={environment === "production" ? "ips-environment is-selected" : "ips-environment"} onClick={() => setEnvironment("production")}><span className="ips-radio">{environment === "production" && <i/>}</span><span className="ips-env-icon ips-env-icon-live"><LockKeyhole size={20}/></span><span className="ips-env-copy"><strong>Production</strong><small>For live payment traffic after formal checks</small><em>Requires approved access and live provider credentials</em></span><span className="ips-env-tag ips-env-tag-muted">Restricted</span></button>
      </div>
      {environment === "production" && <div className="ips-inline-warning"><LockKeyhole size={16}/><span><strong>Production is not activated by selecting it.</strong> Live access must be approved and configured server-side. This page cannot request or enable production access.</span></div>}
      <div className="ips-card-footer"><span><LockKeyhole size={14}/> Secrets belong in a backend-managed secret store.</span><button className="ips-btn ips-btn-primary" type="button" onClick={() => setStep(1)}>Continue to credentials <ArrowRight size={15}/></button></div>
    </section>}
    {step === 1 && <section className="ips-card">
      <div className="ips-card-heading"><span className="ips-icon"><KeyRound size={18}/></span><div><h2>Credentials and callback routing</h2><p>Record non-sensitive references to your Daraja credentials. Never paste actual secret values into a browser form.</p></div><span className="ips-status-chip">Step 2 of 3</span></div>
      <div className="ips-form-grid">
        <label className="ips-field"><span>Business shortcode <b>Required</b></span><input value={shortcode} onChange={(event) => setShortcode(event.target.value)} placeholder="e.g. shortcode from Daraja" maxLength={32}/><small>Use the shortcode assigned to the selected Daraja product and environment.</small></label>
        <label className="ips-field"><span>Initiator name <small>Optional</small></span><input value={initiatorName} onChange={(event) => setInitiatorName(event.target.value)} placeholder="Server-side initiator name" maxLength={80}/><small>Reference only. Do not enter a password or security credential here.</small></label>
        <label className="ips-field"><span>Consumer key reference <b>Required</b></span><input value={consumerKeyReference} onChange={(event) => setConsumerKeyReference(event.target.value)} placeholder="e.g. secret-manager://daraja/sandbox/key" autoComplete="off"/><small>Reference or secret-manager identifier only — not the key itself.</small></label>
        <label className="ips-field"><span>Consumer secret reference <b>Required</b></span><input value={consumerSecretReference} onChange={(event) => setConsumerSecretReference(event.target.value)} placeholder="e.g. secret-manager://daraja/sandbox/secret" autoComplete="off"/><small>Actual secret values must remain server-side.</small></label>
        <label className="ips-field ips-field-wide"><span>Callback URL <b>Required</b></span><input value={callbackUrl} onChange={(event) => setCallbackUrl(event.target.value)} placeholder="https://your-domain.example/api/integrations/mpesa/callback" aria-invalid={!callbackValid}/><small className={!callbackValid ? "ips-field-error" : ""}>{callbackValid ? "Local HTTPS format check only; endpoint reachability and signature validation are not tested." : "Enter a valid HTTPS URL."}</small></label>
      </div>
      <div className="ips-inline-info"><Fingerprint size={17}/><span>Callback authentication, request validation, idempotency, rate limits, and audit logging must be enforced by the server. A URL entered here is not registered with Safaricom.</span></div>
      <div className="ips-card-footer"><button className="ips-btn ips-btn-secondary" type="button" onClick={() => setStep(0)}><ArrowLeft size={15}/> Back</button><button className="ips-btn ips-btn-primary" type="button" disabled={!shortcode.trim() || !credentialReferencesPresent || !callbackValid} onClick={() => setStep(2)}>Review readiness <ArrowRight size={15}/></button></div>
    </section>}
    {step === 2 && <section className="ips-card">
      <div className="ips-card-heading"><span className="ips-icon"><ShieldCheck size={18}/></span><div><h2>Readiness review</h2><p>Review the local setup fields and distinguish format checks from provider verification.</p></div><span className={readyCount === setupChecks.length ? "ips-status-chip ips-status-chip-good" : "ips-status-chip"}>{readyCount} of {setupChecks.length} checks</span></div>
      <div className="ips-readiness-summary"><div className="ips-readiness-ring"><strong>{Math.round((readyCount / setupChecks.length) * 100)}%</strong><small>local checks</small></div><div><h3>{readyCount === setupChecks.length ? "Basic fields are present" : "More setup details needed"}</h3><p>Passing local checks does not establish a working or secure provider connection.</p><div className="ips-progress-track"><i style={{ width: `${(readyCount / setupChecks.length) * 100}%` }}/></div></div></div>
      <div className="ips-check-list">{setupChecks.map((item) => <div key={item.label} className="ips-check-row"><span className={item.ready ? "ips-check-mark is-ready" : "ips-check-mark"}>{item.ready ? <Check size={14}/> : <XCircle size={14}/>}</span><div><strong>{item.label}</strong><small>{item.detail}</small></div><span className={item.ready ? "ips-check-state is-ready" : "ips-check-state"}>{item.ready ? "Present" : "Needed"}</span></div>)}</div>
      <div className="ips-next-steps"><h3>Before enabling a real connection</h3><ul><li>Validate credentials server-side against the correct Daraja environment.</li><li>Confirm callback reachability, authenticity checks, idempotency, and replay protection.</li><li>Test approved transaction flows in sandbox and verify resulting records.</li><li>Obtain production approval before switching live traffic.</li></ul></div>
      <div className="ips-card-footer"><button className="ips-btn ips-btn-secondary" type="button" onClick={() => setStep(1)}><ArrowLeft size={15}/> Edit setup</button><button className="ips-btn ips-btn-primary" type="button" onClick={runPreviewChecks}><RefreshCw size={15}/> Run local checks</button></div>
      {checksRun && <div className="ips-feedback" role="status"><CheckCircle2 size={17}/><span>{notice}</span></div>}
    </section>}
    <aside className="ips-bottom-grid">
      <div className="ips-mini-card"><span className="ips-mini-icon"><Webhook size={17}/></span><div><strong>Callback configuration</strong><p>Review event subscriptions and delivery retry settings.</p><button type="button" onClick={() => onNavigate("callback-configuration")}>Open callback settings <ArrowRight size={13}/></button></div></div>
      <div className="ips-mini-card"><span className="ips-mini-icon"><Clock3 size={17}/></span><div><strong>Provider callback history</strong><p>Inspect the callback history preview for troubleshooting.</p><button type="button" onClick={() => onNavigate("provider-callback-history")}>View callback history <ArrowRight size={13}/></button></div></div>
    </aside>
    <p className="ips-footnote"><LockKeyhole size={13}/> This page is a frontend preview. No credentials are transmitted or persisted by this screen.</p>
  </main>;
}

export function WebhookEndpointEditorPage({ workspace, onNavigate }: Props) {
  const [name, setName] = useState("Finance operations receiver");
  const [url, setUrl] = useState("https://merchant.example/webhooks/pesaguard");
  const [enabled, setEnabled] = useState(true);
  const [events, setEvents] = useState(["transaction.completed", "transaction.failed", "reconciliation.exception.created"]);
  const [timeout, setTimeoutValue] = useState("10");
  const [attempts, setAttempts] = useState("5");
  const [retry, setRetry] = useState("Exponential backoff");
  const [secretMode, setSecretMode] = useState("Existing signing secret reference");
  const [savedSnapshot, setSavedSnapshot] = useState({ name: "Finance operations receiver", url: "https://merchant.example/webhooks/pesaguard", enabled: true, events: ["transaction.completed", "transaction.failed", "reconciliation.exception.created"], timeout: "10", attempts: "5", retry: "Exponential backoff", secretMode: "Existing signing secret reference" });
  const [notice, setNotice] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [showPayload, setShowPayload] = useState(false);
  const urlValid = /^https:\/\//i.test(url.trim()) && (() => { try { const parsed = new URL(url); return Boolean(parsed.hostname.includes(".")); } catch { return false; } })();
  const dirty = name !== savedSnapshot.name || url !== savedSnapshot.url || enabled !== savedSnapshot.enabled || timeout !== savedSnapshot.timeout || attempts !== savedSnapshot.attempts || retry !== savedSnapshot.retry || secretMode !== savedSnapshot.secretMode || events.join("|") !== savedSnapshot.events.join("|");
  const validPolicy = Number(timeout) >= 1 && Number(timeout) <= 60 && Number(attempts) >= 1 && Number(attempts) <= 10;
  const [deliveryPreview, setDeliveryPreview] = useState<"idle" | "ready">("idle");

  function toggleEvent(id: string) {
    setEvents((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }
  function savePreview() {
    if (!urlValid || events.length === 0 || !validPolicy) return;
    setSavedSnapshot({ name, url, enabled, events: [...events], timeout, attempts, retry, secretMode });
    setNotice("Endpoint settings saved in local preview state only. Nothing was sent to the API or persisted on the server.");
    setDeliveryPreview("idle");
  }
  function leaveForWebhooks() {
    if (dirty) setConfirmLeave(true);
    else onNavigate("webhooks");
  }

  return <main className="ips-page">
    <nav className="ips-breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={leaveForWebhooks}>Webhooks</button><ChevronRight size={14}/><span>Endpoint editor</span><span className="ips-preview-pill"><i/> PREVIEW</span></nav>
    <header className="ips-hero">
      <div><span className="ips-eyebrow"><Webhook size={14}/> EVENT DELIVERY <b>·</b> {workspace.name}</span><h1>Edit webhook endpoint</h1><p>Control the receiver URL, subscribed event types, delivery timeout, retry policy, and signing-secret reference for this endpoint.</p></div>
      <div className="ips-header-actions"><span className={dirty ? "ips-dirty-chip" : "ips-status-chip"}>{dirty ? "Unsaved changes" : "All changes saved"}</span><button className="ips-btn ips-btn-secondary" type="button" onClick={leaveForWebhooks}><ArrowLeft size={14}/> Back to webhooks</button></div>
    </header>
    <section className="ips-preview-notice"><span><CircleHelp size={19}/></span><div><strong>Local editor preview</strong><p>Saving updates this page's local snapshot only. Test delivery prepares a sample payload for display; it never makes a network request.</p></div><b>NO API WRITE</b></section>
    <div className="ips-editor-layout">
      <section className="ips-card">
        <div className="ips-card-heading"><span className="ips-icon"><Globe2 size={18}/></span><div><h2>Endpoint details</h2><p>Identify the destination and decide whether it is enabled in this preview.</p></div><span className={enabled ? "ips-status-chip ips-status-chip-good" : "ips-status-chip"}>{enabled ? "Enabled in preview" : "Paused in preview"}</span></div>
        <div className="ips-form-grid">
          <label className="ips-field ips-field-wide"><span>Endpoint name <b>Required</b></span><input value={name} onChange={(event) => {setName(event.target.value);setNotice("");}} maxLength={100} placeholder="e.g. Finance operations receiver"/><small>Visible name to help operators identify this receiver.</small></label>
          <label className="ips-field ips-field-wide"><span>HTTPS endpoint URL <b>Required</b></span><input value={url} onChange={(event) => {setUrl(event.target.value);setNotice("");setDeliveryPreview("idle");}} aria-invalid={!urlValid} placeholder="https://your-domain.example/webhooks/pesaguard"/><small className={!urlValid ? "ips-field-error" : ""}>{urlValid ? "Format looks valid. DNS, TLS, reachability, and receiver behavior are not checked." : "Enter a valid HTTPS URL."}</small></label>
        </div>
        <div className="ips-toggle-row"><span className="ips-icon"><SlidersHorizontal size={17}/></span><div><strong>Endpoint enabled</strong><p>Toggle whether this endpoint should be eligible for delivery once backend persistence is connected.</p></div><button type="button" role="switch" aria-checked={enabled} className={enabled ? "ips-switch is-on" : "ips-switch"} onClick={() => {setEnabled(!enabled);setNotice("");}}><i/></button></div>
        <div className="ips-section-divider"/>
        <div className="ips-card-heading"><span className="ips-icon"><Zap size={18}/></span><div><h2>Event subscriptions</h2><p>Select the event types intended for this destination.</p></div><span className="ips-count-chip">{events.length} selected</span></div>
        <div className="ips-event-list">{webhookEvents.map((event) => <label key={event.id} className={events.includes(event.id) ? "ips-event-row is-selected" : "ips-event-row"}><input type="checkbox" checked={events.includes(event.id)} onChange={() => {toggleEvent(event.id);setNotice("");}}/><span className="ips-event-check">{events.includes(event.id) && <Check size={12}/>}</span><span className="ips-event-copy"><strong>{event.title}</strong><small>{event.detail}</small><code>{event.id}</code></span><span className="ips-event-state">{events.includes(event.id) ? "Selected" : "Not selected"}</span></label>)}</div>
        <div className="ips-section-divider"/>
        <div className="ips-card-heading"><span className="ips-icon"><RefreshCw size={18}/></span><div><h2>Delivery policy</h2><p>Preview timeout and retry limits. Enforce these on the backend in a real integration.</p></div></div>
        <div className="ips-form-grid ips-policy-grid">
          <label className="ips-field"><span>Request timeout</span><div className="ips-input-suffix"><input type="number" min="1" max="60" value={timeout} onChange={(event) => {setTimeoutValue(event.target.value);setNotice("");}}/><span>seconds</span></div><small>Allowed range: 1–60 seconds.</small></label>
          <label className="ips-field"><span>Maximum attempts</span><div className="ips-input-suffix"><input type="number" min="1" max="10" value={attempts} onChange={(event) => {setAttempts(event.target.value);setNotice("");}}/><span>attempts</span></div><small>Includes the initial attempt.</small></label>
          <label className="ips-field ips-field-wide"><span>Retry strategy</span><select value={retry} onChange={(event) => {setRetry(event.target.value);setNotice("");}}><option>Exponential backoff</option><option>Fixed interval</option></select><small>Production delivery should also define retryable responses, jitter, queue limits, and a dead-letter workflow.</small></label>
        </div>
        <div className="ips-section-divider"/>
        <div className="ips-card-heading"><span className="ips-icon"><Fingerprint size={18}/></span><div><h2>Signing secret</h2><p>Manage a secret reference, not the secret value.</p></div><span className="ips-status-chip">Value hidden</span></div>
        <label className="ips-field ips-field-wide"><span>Secret reference</span><select value={secretMode} onChange={(event) => {setSecretMode(event.target.value);setNotice("");}}><option>Existing signing secret reference</option><option>Rotation pending</option><option>Not configured</option></select><small>Actual secret creation, storage, rotation, and signature verification must be handled server-side.</small></label>
        <div className="ips-card-footer"><span><LockKeyhole size={14}/> Preview changes are not sent to the API</span><div className="ips-action-row"><button className="ips-btn ips-btn-secondary" type="button" onClick={() => {setName(savedSnapshot.name);setUrl(savedSnapshot.url);setEnabled(savedSnapshot.enabled);setEvents([...savedSnapshot.events]);setTimeoutValue(savedSnapshot.timeout);setAttempts(savedSnapshot.attempts);setRetry(savedSnapshot.retry);setSecretMode(savedSnapshot.secretMode);setNotice("Unsaved changes discarded from this local form.");setDeliveryPreview("idle");}}>Discard</button><button className="ips-btn ips-btn-primary" type="button" disabled={!name.trim() || !urlValid || events.length === 0 || !validPolicy} onClick={savePreview}><Save size={15}/> Save preview</button></div></div>
        {notice && <div className="ips-feedback" role="status"><CheckCircle2 size={17}/><span>{notice}</span></div>}
      </section>
      <aside className="ips-side-column">
        <section className="ips-side-card"><div className="ips-side-heading"><span className="ips-icon"><ShieldCheck size={17}/></span><div><h2>Security checklist</h2><p>Required for a production receiver</p></div></div><ul className="ips-security-list"><li><CheckCircle2 size={15}/><span><strong>HTTPS destination</strong><small>Required by this editor's URL validation.</small></span></li><li><LockKeyhole size={15}/><span><strong>Verify signatures</strong><small>Verify the signature server-side before processing.</small></span></li><li><RefreshCw size={15}/><span><strong>Make handlers idempotent</strong><small>Expect retries and possible duplicate deliveries.</small></span></li><li><Clock3 size={15}/><span><strong>Record delivery attempts</strong><small>Keep traceable attempt and response metadata.</small></span></li></ul><button className="ips-text-link" type="button" onClick={() => onNavigate("credential-rotation")}>Review credential rotation <ArrowRight size={13}/></button></section>
        <section className="ips-side-card"><div className="ips-side-heading"><span className="ips-icon"><PlugZap size={17}/></span><div><h2>Sample delivery</h2><p>Preview the payload shape</p></div></div><div className="ips-sample-meta"><span>POST</span><code>application/json</code></div><pre className="ips-code-sample">{JSON.stringify({ id: "evt_preview_01", type: events[0] ?? "transaction.completed", created_at: "2026-10-16T00:00:00Z", data: { transaction_id: "txn_preview_01", status: "preview_only" } }, null, 2)}</pre><button className="ips-btn ips-btn-secondary ips-full-btn" type="button" onClick={() => {setDeliveryPreview("ready");setShowPayload(!showPayload);}}><Zap size={14}/>{showPayload ? "Hide sample details" : "Prepare sample delivery"}</button>{deliveryPreview === "ready" && <div className="ips-sample-ready" role="status"><CheckCircle2 size={14}/> Sample prepared locally. No request sent.</div>}</section>
        <section className="ips-side-card ips-help-card"><CircleHelp size={17}/><div><strong>Implementation note</strong><p>When connected, protect this workflow with tenant-scoped authorization, server-side validation, audit events, and optimistic concurrency or version checks.</p></div></section>
      </aside>
    </div>
    <p className="ips-footnote"><LockKeyhole size={13}/> {dirty ? "Unsaved edits are present in this local preview." : "The local preview matches the last saved snapshot."} No backend writes or webhook requests occur.</p>
    {confirmLeave && <div className="ips-modal-backdrop" role="presentation"><section className="ips-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="ips-leave-title"><span className="ips-modal-icon"><CircleHelp size={20}/></span><h2 id="ips-leave-title">Discard unsaved changes?</h2><p>You have edits that have not been saved to the local preview snapshot. Leave this editor and lose those edits?</p><div className="ips-action-row"><button className="ips-btn ips-btn-secondary" type="button" onClick={() => setConfirmLeave(false)}>Stay here</button><button className="ips-btn ips-btn-danger" type="button" onClick={() => {setConfirmLeave(false);onNavigate("webhooks");}}>Discard and leave</button></div></section></div>}
  </main>;
}
