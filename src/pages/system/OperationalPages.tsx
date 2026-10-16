import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, ArrowLeft, ArrowRight, BadgeCheck, Building2, CalendarClock, CheckCircle2,
  ChevronDown, Clock3, Database, Download, FileClock, FileText, Filter,
  GitCompareArrows, KeyRound, Layers3, LockKeyhole, Mail, Search, ShieldAlert, TriangleAlert,
  ShieldCheck, SlidersHorizontal, UsersRound, WalletCards, Webhook, type LucideIcon,
} from "lucide-react";
import type { DashboardPage } from "../../app/config/routes";
import type { Customer, Transaction, Workspace } from "../../types/dashboard";
import { formatKes } from "../../utils/formatting";
import { downloadCsv } from "../../utils/csv";
import "./operational-pages.css";

type ExtendedPage =
  | "organization-profile" | "branches" | "user-profile" | "notification-center"
  | "failed-transactions" | "pending-transactions" | "refunds-reversals" | "transaction-import-results"
  | "reconciliation-run-detail" | "matched-transactions" | "unmatched-transactions" | "partial-matches"
  | "manual-matching" | "match-approvals" | "exception-detail" | "matching-rule-detail"
  | "settlement-detail" | "settlement-discrepancies" | "financial-summaries"
  | "data-quality-issues" | "data-quality-issue-detail" | "data-source-health" | "data-quality-trends"
  | "risk-alert-detail" | "flagged-transactions" | "fraud-investigation" | "risk-rule-detail"
  | "report-detail" | "scheduled-report-detail" | "integration-detail" | "webhook-delivery-detail"
  | "alert-detail" | "service-status" | "security-settings" | "active-sessions" | "access-history"
  | "account-closure" | "onboarding-resume" | "first-login-checklist";

interface PageConfig {
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  group: string;
  parent: DashboardPage | ExtendedPage;
  related: (DashboardPage | ExtendedPage)[];
  focus: string[];
  mode: "transactions" | "customers" | "configuration" | "empty";
}
const pageConfig: Record<ExtendedPage, PageConfig> = {
  "organization-profile": { title:"Organization profile", eyebrow:"WORKSPACE SETTINGS", description:"Keep the organization identity, business contact and operating context consistent across the workspace.", icon:Building2, group:"Organization", parent:"tenant-profile", related:["branches","team-members","retention-privacy"], focus:["Registered name and business identity","Primary finance and operations contacts","Organization-specific timezone and currency","Verified changes and approval history"], mode:"configuration" },
  branches: { title:"Branches & business units", eyebrow:"ORGANIZATION", description:"Organize branches and business units without mixing records between locations.", icon:Building2, group:"Organization", parent:"organization-profile", related:["team-members","roles-permissions","transactions"], focus:["Branch code and display name","Branch-specific access assignments","Effective dates and status","Tenant-scoped audit history"], mode:"configuration" },
  "user-profile": { title:"Personal profile", eyebrow:"YOUR ACCOUNT", description:"Review your personal workspace details and account preferences.", icon:UsersRound, group:"Account", parent:"account-authentication", related:["security-settings","active-sessions","preferences"], focus:["Name and verified email address","Contact details and locale","Account verification state","Profile change history"], mode:"configuration" },
  "notification-center": { title:"Notification centre", eyebrow:"WORKSPACE ACTIVITY", description:"A single place for operational alerts, account notices and reconciliation updates.", icon:Mail, group:"Monitoring", parent:"notifications", related:["alerts","notification-center","preferences"], focus:["Reconciliation exceptions needing review","Import and validation outcomes","Account and security events","Read state and delivery provenance"], mode:"empty" },
  "failed-transactions": { title:"Failed transactions", eyebrow:"PAYMENT OPERATIONS", description:"Review failed or rejected payment records and trace the reported reason before retrying through an authorized service.", icon:Activity, group:"Transactions", parent:"transactions", related:["pending-transactions","refunds-reversals","exceptions"], focus:["Provider reference and failure code","Failure time and originating source","Idempotency and retry eligibility","Resolution outcome and audit reference"], mode:"transactions" },
  "pending-transactions": { title:"Pending transactions", eyebrow:"PAYMENT OPERATIONS", description:"Track transactions awaiting a confirmed provider or reconciliation outcome.", icon:Clock3, group:"Transactions", parent:"transactions", related:["failed-transactions","reconciliation","exceptions"], focus:["Provider reference and last known state","Age since last verified update","Safe polling and timeout policy","No duplicate processing on retry"], mode:"transactions" },
  "refunds-reversals": { title:"Refunds & reversals", eyebrow:"PAYMENT OPERATIONS", description:"Review refund and reversal records separately from original payment events. This preview never initiates financial actions.", icon:WalletCards, group:"Transactions", parent:"payments", related:["transactions","approvals","activity-log"], focus:["Original transaction reference","Provider-confirmed reversal state","Amount, currency and reason","Authorized request and audit history"], mode:"transactions" },
  "transaction-import-results": { title:"Transaction import results", eyebrow:"DATA INGESTION", description:"Inspect the result of a statement import, including accepted rows and validation failures.", icon:Database, group:"Data & Integrations", parent:"data-imports", related:["validation-results","data-quality-issues","processing-jobs"], focus:["Import job and source identifiers","Accepted, rejected and duplicate counts","Row-level validation reasons","Safe error export and retry eligibility"], mode:"empty" },
  "reconciliation-run-detail": { title:"Reconciliation run details", eyebrow:"RECONCILIATION", description:"Review the inputs, matching decisions and exceptions associated with a single reconciliation run.", icon:GitCompareArrows, group:"Reconciliation", parent:"reconciliation-runs", related:["matched-transactions","unmatched-transactions","matching-history"], focus:["Run identifier and rule version","Input totals and record counts","Matched, unmatched and rejected outcomes","Retry, cancellation and audit history"], mode:"empty" },
  "matched-transactions": { title:"Matched transactions", eyebrow:"RECONCILIATION", description:"Inspect records matched by a documented rule and preserve the evidence behind each match.", icon:CheckCircle2, group:"Reconciliation", parent:"reconciliation", related:["unmatched-transactions","partial-matches","matching-history"], focus:["Payment and ledger references","Match key and rule version","Amount and timestamp tolerance","Reversal and rematch traceability"], mode:"transactions" },
  "unmatched-transactions": { title:"Unmatched transactions", eyebrow:"RECONCILIATION", description:"Triage payment or ledger records without a confirmed counterpart and keep the resolution traceable.", icon:GitCompareArrows, group:"Reconciliation", parent:"reconciliation", related:["manual-matching","partial-matches","exception-detail"], focus:["Missing counterpart and source","Amount, currency and date window","Candidate matches and confidence rationale","Reviewer decision and reason"], mode:"transactions" },
  "partial-matches": { title:"Partial matches", eyebrow:"RECONCILIATION", description:"Review candidate matches where amounts, fees, timing or split payments need explicit treatment.", icon:Layers3, group:"Reconciliation", parent:"reconciliation", related:["manual-matching","matching-rule-detail","matching-history"], focus:["Original amounts and residual balance","Split or aggregation policy","Tolerance rule and ambiguity handling","Approval and final reconciliation evidence"], mode:"transactions" },
  "manual-matching": { title:"Manual matching workspace", eyebrow:"RECONCILIATION REVIEW", description:"Compare records side by side and prepare a review decision. The preview does not persist or apply matches.", icon:GitCompareArrows, group:"Reconciliation", parent:"unmatched-transactions", related:["matched-transactions","partial-matches","match-approvals"], focus:["Select one payment and one ledger record","Compare reference, amount and timestamp","Show mismatch reasons before a decision","Require a reason and server-side authorization"], mode:"transactions" },
  "match-approvals": { title:"Match review & approval", eyebrow:"CONTROLLED WORKFLOWS", description:"Separate the person requesting a sensitive match decision from the person approving it where policy requires.", icon:BadgeCheck, group:"Reconciliation", parent:"approvals", related:["manual-matching","matching-history","roles-permissions"], focus:["Requested action and supporting evidence","Requester and required approver","Decision reason and timestamp","Execution result and audit event"], mode:"empty" },
  "exception-detail": { title:"Exception details", eyebrow:"EXCEPTION REVIEW", description:"Bring together the source evidence, discrepancy, assigned reviewer and resolution history for one exception.", icon:ShieldAlert, group:"Reconciliation", parent:"exceptions", related:["unmatched-transactions","manual-matching","activity-log"], focus:["Exception reference and severity","Source records and discrepancy amount","Assignment, notes and due date","Resolution reason and audit history"], mode:"transactions" },
  "matching-rule-detail": { title:"Matching rule details", eyebrow:"RECONCILIATION CONFIGURATION", description:"Inspect a rule's matching keys, tolerances, version and controlled activation history.", icon:SlidersHorizontal, group:"Reconciliation", parent:"matching-rules", related:["matching-history","reconciliation-runs","approvals"], focus:["Exact reference and composite matching keys","Currency and time-window tolerance","Simulation results and false-positive review","Version, approver and rollback path"], mode:"configuration" },
  "settlement-detail": { title:"Settlement batch details", eyebrow:"FINANCIAL OPERATIONS", description:"Inspect a settlement batch only when provider statement or settlement API evidence is available.", icon:WalletCards, group:"Settlements", parent:"settlement-batches", related:["settlement-discrepancies","financial-summaries","reports"], focus:["Provider batch and statement reference","Gross, fees, adjustments and net amount","Ledger posting evidence","Variance ownership and decision history"], mode:"empty" },
  "settlement-discrepancies": { title:"Settlement discrepancies", eyebrow:"FINANCIAL OPERATIONS", description:"Investigate differences between a verified settlement statement and the expected ledger outcome.", icon:TriangleAlert, group:"Settlements", parent:"settlements", related:["settlement-detail","financial-summaries","approvals"], focus:["Statement-backed expected and actual values","Fee and adjustment breakdown","Assigned owner and ageing","Resolution evidence and approval"], mode:"empty" },
  "financial-summaries": { title:"Financial summaries", eyebrow:"REPORTING", description:"Summarize reconciled transaction data using clear definitions, explicit time windows and verified source totals.", icon:FileText, group:"Reporting", parent:"reports", related:["report-builder","settlement-batches","export-center"], focus:["Period and source scope","Matched, pending and exception totals","Currency and aggregation definitions","Export scope and audit trail"], mode:"transactions" },
  "data-quality-issues": { title:"Data quality issues", eyebrow:"DATA QUALITY", description:"Prioritize data issues by source, severity and impact before records enter financial reconciliation.", icon:Database, group:"Data & Integrations", parent:"data-quality", related:["data-quality-issue-detail","validation-results","data-source-health"], focus:["Issue type and rule identifier","Affected source and record count","Severity, age and assigned owner","Resolution and revalidation evidence"], mode:"empty" },
  "data-quality-issue-detail": { title:"Data quality issue details", eyebrow:"DATA QUALITY REVIEW", description:"Inspect the failed check, affected record references and the proposed correction before reprocessing.", icon:FileText, group:"Data & Integrations", parent:"data-quality-issues", related:["validation-results","schema-mapping","data-lineage"], focus:["Failed check and rule version","Sanitized sample and affected-row count","Correction proposal and reviewer","Revalidation outcome and audit reference"], mode:"empty" },
  "data-source-health": { title:"Data source health", eyebrow:"PIPELINE MONITORING", description:"Review source availability using verified connection checks, accepted ingestion events and source watermarks.", icon:Activity, group:"Data & Integrations", parent:"data-sources", related:["freshness-monitoring","processing-jobs","integrations"], focus:["Source owner and tenant scope","Last verified health-check timestamp","Latest successful ingestion watermark","Sanitized failures and retry policy"], mode:"empty" },
  "data-quality-trends": { title:"Data quality trends", eyebrow:"DATA QUALITY", description:"Track completeness, validity, duplicate rates and freshness over comparable periods.", icon:Activity, group:"Data & Integrations", parent:"data-quality", related:["data-quality-issues","freshness-monitoring","validation-results"], focus:["Metric definition and denominator","Comparable periods and source filters","Rule changes annotated on the trend","Late-arriving data and freshness caveats"], mode:"empty" },
  "risk-alert-detail": { title:"Risk alert details", eyebrow:"RISK REVIEW", description:"Review the reason, provenance and related records behind a risk alert before recording an outcome.", icon:ShieldAlert, group:"Risk", parent:"alerts", related:["flagged-transactions","fraud-investigation","risk-events"], focus:["Severity and source event identifier","Related transaction references","Rule version and reason codes","Acknowledgement, assignment and outcome"], mode:"empty" },
  "flagged-transactions": { title:"Flagged transactions", eyebrow:"RISK REVIEW", description:"Review flagged records as investigation candidates, not as proof of fraud or wrongdoing.", icon:ShieldAlert, group:"Risk", parent:"suspicious-transactions", related:["risk-alert-detail","fraud-investigation","transactions"], focus:["Explainable flag reason and provenance","Related records and event time window","Reviewer notes and assignment","False-positive or confirmed outcome evidence"], mode:"transactions" },
  "fraud-investigation": { title:"Fraud investigation workspace", eyebrow:"RISK INVESTIGATIONS", description:"Coordinate a documented review with evidence, reviewer notes and an explicit outcome.", icon:ShieldCheck, group:"Risk", parent:"investigations", related:["flagged-transactions","risk-alert-detail","activity-log"], focus:["Case owner, priority and status","Evidence references and related events","Decision checkpoints and notes","Outcome, false-positive reason and audit trail"], mode:"empty" },
  "risk-rule-detail": { title:"Risk rule details", eyebrow:"RISK CONFIGURATION", description:"Review rule logic and governance without activating untested detection settings.", icon:SlidersHorizontal, group:"Risk", parent:"risk-rules", related:["fraud-detection","risk-events","approvals"], focus:["Rule name, version and owner","Thresholds and supported input fields","Simulation results against sample data","Approval, activation and rollback history"], mode:"configuration" },
  "report-detail": { title:"Report details", eyebrow:"REPORTING", description:"Inspect a report definition, applied filters and generation state before sharing results.", icon:FileText, group:"Reporting", parent:"reports", related:["report-builder","export-center","scheduled-reports"], focus:["Dataset and report definition","Period, filters and timezone","Role-authorized fields and rows","Generation time, expiry and audit reference"], mode:"empty" },
  "scheduled-report-detail": { title:"Scheduled report details", eyebrow:"REPORTING AUTOMATION", description:"Review the schedule, recipients and delivery history for a report definition.", icon:CalendarClock, group:"Reporting", parent:"scheduled-reports", related:["report-detail","export-center","notifications"], focus:["Schedule cadence and timezone","Authorized recipients","Delivery attempts and failures","Pause, resume and edit history"], mode:"configuration" },
  "integration-detail": { title:"Integration configuration", eyebrow:"DATA & INTEGRATIONS", description:"Review a payment-source connection's setup and verified readiness without exposing secrets.", icon:Webhook, group:"Data & Integrations", parent:"integrations", related:["data-source-health","webhooks","webhook-delivery-detail"], focus:["Provider and tenant scope","Server-side credential reference only","Callback verification and idempotency","Last verified check and audit history"], mode:"configuration" },
  "webhook-delivery-detail": { title:"Webhook delivery details", eyebrow:"INTEGRATION OPERATIONS", description:"Trace one delivery attempt using event identifiers and safe response metadata.", icon:Webhook, group:"Data & Integrations", parent:"webhook-deliveries", related:["webhooks","integration-detail","activity-log"], focus:["Event and delivery identifiers","Attempt time, response code and duration","Signature verification outcome","Retry schedule and terminal failure reason"], mode:"empty" },
  "alert-detail": { title:"Alert details", eyebrow:"MONITORING", description:"Inspect an alert's source, severity, ownership and escalation path.", icon:ShieldAlert, group:"Monitoring", parent:"alerts", related:["notification-center","risk-alert-detail","activity-log"], focus:["Affected resource and alert source","Severity and acknowledgement time","Assignment and escalation policy","Resolution note and audit event"], mode:"empty" },
  "service-status": { title:"Service status", eyebrow:"OBSERVABILITY", description:"Review only timestamped service health evidence. Unknown and stale states must never be presented as healthy.", icon:Activity, group:"Monitoring", parent:"system-health", related:["integrations","data-source-health","help-support"], focus:["Service health endpoint and check time","Dependency readiness and degraded state","Incident timeline and update source","Correlation ID for support"], mode:"empty" },
  "security-settings": { title:"Security settings", eyebrow:"ACCOUNT SECURITY", description:"Review authentication controls and account security settings without implying they are enforced before identity integration.", icon:LockKeyhole, group:"Security", parent:"account-authentication", related:["active-sessions","access-history","user-profile"], focus:["Password and recovery policy","MFA enrollment and recovery options","Session policy and revocation","Verified security event history"], mode:"configuration" },
  "active-sessions": { title:"Active sessions & devices", eyebrow:"ACCOUNT SECURITY", description:"Show sessions only from a verified identity service, with a clear way to revoke a specific session.", icon:KeyRound, group:"Security", parent:"account-authentication", related:["security-settings","access-history","user-profile"], focus:["Session identifier and device summary","Last activity and approximate location if supported","Current-session distinction","Revocation result and audit record"], mode:"empty" },
  "access-history": { title:"Organization access history", eyebrow:"AUDIT & COMPLIANCE", description:"Trace membership, role, invitation and sign-in changes using server-side audit events.", icon:FileClock, group:"Security", parent:"activity-log", related:["team-members","roles-permissions","security-settings"], focus:["Actor and affected member","Action, timestamp and outcome","Previous and resulting role","Request/correlation reference"], mode:"empty" },
  "account-closure": { title:"Account closure request", eyebrow:"ACCOUNT & PRIVACY", description:"Prepare a controlled request for account or workspace closure. No deletion occurs from this preview.", icon:ShieldCheck, group:"Account", parent:"retention-privacy", related:["organization-profile","access-history","help-support"], focus:["Requester identity and authorization","Scope of account or organization closure","Data export and retention considerations","Confirmation, review and audit history"], mode:"configuration" },
  "onboarding-resume": { title:"Resume workspace setup", eyebrow:"ONBOARDING", description:"Continue an incomplete workspace setup from the last server-confirmed step when onboarding is connected.", icon:Building2, group:"Onboarding", parent:"onboarding-status", related:["organization-profile","integrations","first-login-checklist"], focus:["Last persisted onboarding step","Outstanding required information","Integration setup readiness","Retry and resume state from the onboarding API"], mode:"empty" },
  "first-login-checklist": { title:"Workspace launch checklist", eyebrow:"GETTING STARTED", description:"A practical first-login checklist to help an administrator prepare the workspace before operational use.", icon:CheckCircle2, group:"Onboarding", parent:"home", related:["organization-profile","team-members","integrations","data-imports","reconciliation"], focus:["Confirm organization details and timezone","Invite teammates with least-privilege roles","Configure M-Pesa through the verified server flow","Import a sample statement and review validation"], mode:"configuration" },
};

function StatusPill({ children }: { children: string }) {
  const tone = /^(matched|completed|verified|ready|healthy)$/i.test(children) ? "good" : /^(failed|blocked|critical|unmatched)$/i.test(children) ? "bad" : /unknown|preview|not connected|pending|not verified/i.test(children) ? "warn" : "quiet";
  return <span className={`op-status op-status--${tone}`}>{children}</span>;
}
function Panel({ title, subtitle, children, action }: { title: string; subtitle: string; children: ReactNode; action?: ReactNode }) {
  return <section className="op-panel"><header className="op-panel__head"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</header>{children}</section>;
}

interface Props {
  page: ExtendedPage;
  workspace: Workspace;
  transactions: Transaction[];
  customers: Customer[];
  onNavigate: (page: DashboardPage | ExtendedPage) => void;
}
export function isExtendedPage(page: DashboardPage): page is ExtendedPage {
  return page in pageConfig;
}

export function OperationalPages({ page, workspace, transactions, customers, onNavigate }: Props) {
  const config = pageConfig[page];
  const Icon = config.icon;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decision, setDecision] = useState("Needs review");
  const [note, setNote] = useState("");

  const visibleTransactions = useMemo(() => transactions.filter((item) => {
    const haystack = [item.reference, item.id, item.customer, item.source, item.status, item.anomalyType].join(" ").toLowerCase();
    const statusMatch = status === "All" || item.status.toLowerCase() === status.toLowerCase();
    const queryMatch = !query || haystack.includes(query.toLowerCase());
    if (!statusMatch || !queryMatch) return false;
    if (page === "failed-transactions") return item.status === "Failed";
    if (page === "pending-transactions") return item.status === "Pending";
    if (page === "matched-transactions") return item.status === "Matched" || item.status === "Completed";
    if (page === "unmatched-transactions") return item.status === "Unmatched";
    if (page === "flagged-transactions" || page === "exception-detail") return item.severity === "High" || item.severity === "Critical" || item.status === "Disputed";
    return true;
  }), [transactions, query, status, page]);

  const customerRows = useMemo(() => customers.filter((item) => `${item.name} ${item.email} ${item.phone}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);
  const isTransactionPage = config.mode === "transactions";
  const isCustomerPage = config.mode === "customers";
  const isConfiguration = config.mode === "configuration";
  const recordCount = isTransactionPage ? visibleTransactions.length : isCustomerPage ? customerRows.length : null;
  const statusOptions = ["All", "Matched", "Completed", "Pending", "Unmatched", "Disputed", "Failed"];

  function previewAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Preview only: no changes were saved and no financial or account action was performed.");
  }
  function exportVisible() {
    downloadCsv(`pesaguard-preview-${page}.csv`, ["Timestamp", "Reference", "Customer", "Amount KES", "Status", "Source", "Severity"],
      visibleTransactions.map((item) => [item.timestamp, item.reference, item.customer, String(item.amount), item.status, item.source, item.severity]));
    setNotice("Downloaded a CSV of the illustrative rows currently visible. This is not a production export.");
  }

  return (
    <div className="op-page">
      <div className="op-breadcrumb"><button type="button" onClick={() => onNavigate(config.parent as DashboardPage)}><ArrowLeft size={14}/> {String(config.parent).replaceAll("-", " ")}</button><span>/</span><span>{config.title}</span></div>
      <header className="op-hero">
        <div className="op-hero__identity">
          <span className="op-hero__icon"><Icon size={22}/></span>
          <div><p className="op-eyebrow">{config.eyebrow} <span>·</span> {workspace.name}</p><h1>{config.title}</h1><p className="op-description">{config.description}</p></div>
        </div>
        <div className="op-hero__actions">
          <StatusPill>Preview workspace</StatusPill>
          {isTransactionPage && <button className="op-button op-button--secondary" type="button" onClick={exportVisible}><Download size={15}/> Export visible</button>}
        </div>
      </header>

      <div className="op-preview-note" role="note"><ShieldCheck size={17}/><div><strong>Designed workspace · preview data only</strong><span>Live service data, account permissions and server-side actions are not connected. Values marked unknown are intentionally not estimated.</span></div></div>

      <section className="op-metrics" aria-label="Workspace summary">
        <article><span><Icon size={16}/></span><small>{isTransactionPage ? "Visible sample records" : isCustomerPage ? "Customer records" : "Live state"}</small><strong>{recordCount === null ? "Unknown" : recordCount.toLocaleString("en-KE")}</strong><p>{recordCount === null ? "No verified source connected" : "Local preview dataset"}</p></article>
        <article><span><Database size={16}/></span><small>Source evidence</small><strong>{isTransactionPage ? "Sample" : "Required"}</strong><p>{isTransactionPage ? "Illustrative records" : "API contract not connected"}</p></article>
        <article><span><ShieldCheck size={16}/></span><small>Access enforcement</small><strong>Unverified</strong><p>Must be enforced by the API</p></article>
        <article><span><Clock3 size={16}/></span><small>Last verified</small><strong>—</strong><p>No live timestamp available</p></article>
      </section>

      {isTransactionPage && <Panel title={page === "manual-matching" ? "Compare candidate records" : "Record workbench"} subtitle="Search and filter illustrative transaction records. Actions do not change financial records." action={<span className="op-row-count">{visibleTransactions.length} rows</span>}>
        <div className="op-toolbar">
          <label className="op-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reference, customer or source" aria-label="Search records"/></label>
          <label className="op-filter"><Filter size={14}/><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">{statusOptions.map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={13}/></label>
          <button className="op-button op-button--secondary" type="button" onClick={() => {setQuery("");setStatus("All");}}><SlidersHorizontal size={14}/> Clear filters</button>
        </div>
        <div className="op-table-wrap"><table className="op-table"><thead><tr><th>Reference</th><th>Customer</th><th>Amount</th><th>Status</th><th>Source</th><th>Severity</th><th></th></tr></thead><tbody>
          {visibleTransactions.map((item) => <tr key={item.id} className={selectedId === item.id ? "is-selected" : ""} onClick={() => setSelectedId(item.id)}><td><strong>{item.reference}</strong><small>{item.timestamp}</small></td><td>{item.customer}</td><td className="op-number">{formatKes(item.amount)}</td><td><StatusPill>{item.status}</StatusPill></td><td>{item.source}</td><td><StatusPill>{item.severity}</StatusPill></td><td><button type="button" className="op-row-link" onClick={(event) => {event.stopPropagation();setSelectedId(item.id);}}>Inspect <ArrowRight size={13}/></button></td></tr>)}
          {visibleTransactions.length === 0 && <tr><td colSpan={7} className="op-empty-cell">No sample records match these filters. Clear filters or return to the transaction register.</td></tr>}
        </tbody></table></div>
        {selectedId && visibleTransactions.some((item) => item.id === selectedId) && <div className="op-record-inspector"><div><span className="op-eyebrow">SELECTED RECORD</span><h3>{visibleTransactions.find((item) => item.id === selectedId)?.reference}</h3><p>Details below are read from the local preview object only.</p></div><button className="op-button op-button--quiet" type="button" onClick={() => setSelectedId(null)}>Close details</button><dl>{(() => {const item = visibleTransactions.find((row) => row.id === selectedId)!;return <><div><dt>Amount</dt><dd>{formatKes(item.amount)}</dd></div><div><dt>Timestamp</dt><dd>{item.timestamp}</dd></div><div><dt>Status</dt><dd>{item.status}</dd></div><div><dt>Source</dt><dd>{item.source}</dd></div><div><dt>Anomaly signal</dt><dd>{item.anomalyType || "Not provided"}</dd></div><div><dt>Review state</dt><dd>{item.reviewed ? "Marked reviewed in preview" : "Not reviewed in preview"}</dd></div></>;})()}</dl></div>}
      </Panel>}

      {isCustomerPage && <Panel title="Customer directory" subtitle="Customer records from the current local workspace dataset.">
        <div className="op-toolbar"><label className="op-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email or phone" aria-label="Search customers"/></label><span className="op-row-count">{customerRows.length} sample records</span></div>
        <div className="op-table-wrap"><table className="op-table"><thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th></th></tr></thead><tbody>{customerRows.map((item) => <tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.email}</td><td>{item.phone}</td><td><StatusPill>Preview</StatusPill></td></tr>)}{customerRows.length === 0 && <tr><td colSpan={4} className="op-empty-cell">No customer records match this search.</td></tr>}</tbody></table></div>
      </Panel>}

      {isConfiguration && <Panel title="Configuration workspace" subtitle="A polished configuration interface with inline validation and explicit preview-only submission.">
        <form className="op-form" onSubmit={previewAction}>
          <label>Display name<input placeholder={config.title} defaultValue={config.title}/></label>
          <label>Owner / contact<input placeholder="name@organization.co.ke"/></label>
          <label>Workspace state<select defaultValue="Draft"><option>Draft</option><option>Needs review</option><option>Ready for verification</option></select></label>
          <label>Effective date<input type="date"/></label>
          <label className="op-form__wide">Notes<textarea rows={3} placeholder="Add a concise operational note or reason for this change." value={note} onChange={(event) => setNote(event.target.value)}/></label>
          <div className="op-form__footer"><span><LockKeyhole size={14}/> Changes require server-side authorization.</span><button className="op-button op-button--primary" type="submit">Review changes <ArrowRight size={14}/></button></div>
        </form>
        {notice && <p className="op-feedback" role="status">{notice}</p>}
      </Panel>}

      {config.mode === "empty" && <Panel title={page === "first-login-checklist" ? "Before the first live workflow" : "What this workspace needs"} subtitle={page === "first-login-checklist" ? "Complete these preparation steps before using live financial records." : "These interface states are ready for the backend contract; live results are intentionally not fabricated."}>
        <div className="op-checklist">{config.focus.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2,"0")}</span><div><strong>{item}</strong><p>{index === 0 ? "Start with a verified source or authoritative account record." : index === 1 ? "Keep the outcome explainable, scoped and traceable." : index === 2 ? "Use server-side validation and role authorization." : "Record the result and its audit reference when connected."}</p></div><CheckCircle2 size={17}/></div>)}</div>
        <div className="op-empty-banner"><Icon size={21}/><div><strong>No verified records available</strong><p>Once the relevant service is connected, this area will display tenant-scoped records, loading and error states, timestamps, filters and row-level actions.</p></div><StatusPill>Not connected</StatusPill></div>
      </Panel>}

      <Panel title="Review and workflow" subtitle="Actions are intentionally safe in this frontend-only build.">
        <form className="op-review-form" onSubmit={previewAction}>
          <label>Review outcome<select value={decision} onChange={(event) => setDecision(event.target.value)}><option>Needs review</option><option>Ready for verification</option><option>Escalate to administrator</option><option>Resolved in preview</option></select></label>
          <label>Reviewer note<textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add the reason, context or follow-up required."/></label>
          <button className="op-button op-button--primary" type="submit">Save preview review <ArrowRight size={14}/></button>
        </form>
        {notice && <p className="op-feedback" role="status"><CheckCircle2 size={15}/>{notice}</p>}
      </Panel>

      <Panel title="Related workspaces" subtitle="Move between connected parts of the operational workflow.">
        <div className="op-related-grid">{config.related.map((relatedPage) => {
          const label = pageConfig[relatedPage as ExtendedPage]?.title ?? String(relatedPage).replaceAll("-", " ").replace(/^./, (value) => value.toUpperCase());
          return <button key={relatedPage} type="button" onClick={() => onNavigate(relatedPage as DashboardPage)}><span><Layers3 size={16}/></span><strong>{label}</strong><ArrowRight size={14}/></button>;
        })}</div>
      </Panel>
    </div>
  );
}
