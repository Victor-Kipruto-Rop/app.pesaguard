import {
  Activity, ArrowRight, ArrowUpRight, CheckCircle2, CircleHelp,
  Clock3, Database, FileText, GitCompareArrows, ShieldAlert, Workflow,
  Zap, type LucideIcon,
} from "lucide-react";
import { navigationItems } from "../../app/config/navigation";
import type { DashboardPage } from "../../app/config/routes";
import type { Customer, Transaction, Workspace } from "../../types/dashboard";
import { formatKes } from "../../utils/formatting";
import { ModuleWorkspace } from "./ModuleWorkspace";

const descriptions: Partial<Record<DashboardPage, string>> = {
  exceptions: "Investigate records that need review and keep every resolution traceable.",
  payments: "Understand payment processing status and follow each payment through its lifecycle.",
  settlements: "Review settlement batches, expected totals, and payout progress when connected.",
  reports: "Prepare operational and financial reporting from verified workspace data.",
  "data-imports": "Bring source records into a controlled validation and reconciliation workflow.",
  integrations: "Review configured connections and their readiness before processing live traffic.",
  webhooks: "Inspect event delivery configuration, attempts, and delivery outcomes when connected.",
  "import-sync-activity": "Track source ingestion, validation, and synchronization jobs.",
  "activity-log": "Review auditable workspace events and administrative changes.",
  security: "Understand workspace access, authentication controls, and security events.",
  "system-health": "Review service availability and dependency health from verified health checks.",
  "team-members": "Manage the people who can access this tenant workspace.",
  "roles-permissions": "Define access boundaries around sensitive payment and reconciliation workflows.",
  notifications: "Set the delivery preferences for operational and account notifications.",
  "account-authentication": "Manage sign-in, sessions, and authentication settings.",
  preferences: "Configure workspace display and workflow preferences.",
  "help-support": "Find product guidance and a clear route to support.",
  "api-developer-resources": "Explore the supported API and integration documentation.",
  "reconciliation-runs": "Inspect run inputs, match results, exceptions and rule versions for each reconciliation execution.",
  "matching-rules": "Govern matching logic with explicit keys, tolerance rules, versioning and controlled activation.",
  "matching-history": "Trace match, unmatch and rematch decisions with their reasons and audit references.",
  "settlement-batches": "Review settlement batches against verified provider statements and posting evidence.",
  "scheduled-reconciliation": "Review reconciliation schedules, timezone behavior, overlap prevention and run history.",
  "data-quality": "Measure source completeness, validity, consistency, duplicate rates and freshness from documented checks.",
  "data-sources": "Review source ownership, supported formats, health checks and ingestion watermarks.",
  "validation-results": "Inspect schema validation outcomes, rejected rows and actionable data-quality errors.",
  "duplicate-detection": "Review duplicate candidates with evidence, false-positive controls and traceable resolution.",
  "schema-mapping": "Map incoming columns to the canonical transaction model and validate changes before activation.",
  "data-lineage": "Trace source records through ingestion, validation, matching and reporting transformations.",
  "processing-jobs": "Monitor ingestion and background jobs using verified lifecycle state and sanitized failure details.",
  "freshness-monitoring": "Compare verified source watermarks with configured freshness expectations and SLAs.",
  "report-builder": "Compose reports from supported datasets, documented filters and authorized fields.",
  "scheduled-reports": "Manage recurring report definitions and delivery status when the reporting service is connected.",
  "export-center": "Track authorized exports, their generation status, expiry and audit references.",
  "webhook-deliveries": "Inspect webhook delivery attempts, response metadata, signature outcomes and retry state.",
  "risk-overview": "Summarize verified risk events, unresolved review workload and exposure without invented scores.",
  "fraud-detection": "Review explainable fraud indicators as investigation signals rather than definitive findings.",
  "risk-events": "Explore risk events with severity, provenance, rule version and resolution history.",
  "suspicious-transactions": "Triage suspicious transaction candidates with evidence and controlled review outcomes.",
  alerts: "Review actionable alerts, severity, ownership, acknowledgement and escalation state.",
  investigations: "Coordinate evidence-backed investigations from assignment through a documented outcome.",
  "risk-rules": "Review risk rule definitions, simulations, version approvals and rollback history.",
  approvals: "Review sensitive workflow and configuration approvals with separation-of-duties controls.",
  "support-requests": "Track support cases and safe diagnostic context without exposing financial credentials.",
  "retention-privacy": "Review documented retention, privacy and export controls alongside evidence of enforcement.",

};

const moduleDetails: Partial<Record<DashboardPage, { icon: LucideIcon; eyebrow: string; actions: string[]; outputs: string[] }>> = {
  exceptions: { icon: ShieldAlert, eyebrow: "PAYMENT OPERATIONS", actions: ["Filter by severity and age", "Review source and ledger evidence", "Record a resolution with an audit trail"], outputs: ["Exception queue", "Resolution history", "Escalation-ready evidence"] },
  payments: { icon: Activity, eyebrow: "PAYMENT OPERATIONS", actions: ["Inspect payment lifecycle states", "Search by provider reference", "Review failures and reversals"], outputs: ["Payment status", "Provider references", "Lifecycle history"] },
  settlements: { icon: GitCompareArrows, eyebrow: "FINANCIAL OPERATIONS", actions: ["Compare expected and reported totals", "Review settlement windows", "Trace unresolved differences"], outputs: ["Settlement batches", "Variance review", "Settlement evidence"] },
  reports: { icon: FileText, eyebrow: "REPORTING", actions: ["Choose a verified reporting period", "Filter by transaction and reconciliation status", "Export only the records visible to your role"], outputs: ["Transaction summaries", "Reconciliation results", "Exception and quality reports"] },
  "data-imports": { icon: Database, eyebrow: "DATA & QUALITY", actions: ["Select a supported source format", "Validate schema and required fields", "Review rejected rows before retrying"], outputs: ["Import history", "Validation results", "Rejected-row evidence"] },
  integrations: { icon: Zap, eyebrow: "DATA & INTEGRATIONS", actions: ["Review provider configuration", "Check connection and callback readiness", "Verify credentials through a secure server-side flow"], outputs: ["Connection status", "Last successful check", "Configuration audit"] },
  webhooks: { icon: Workflow, eyebrow: "DATA & INTEGRATIONS", actions: ["Review registered destinations", "Inspect delivery attempts", "Retry only after server-side authorization is connected"], outputs: ["Delivery history", "Response metadata", "Retry and signature status"] },
  "import-sync-activity": { icon: Activity, eyebrow: "PIPELINE MONITORING", actions: ["Filter by source and job state", "Inspect validation failures", "Trace retries and related records"], outputs: ["Job lifecycle", "Processing counts", "Sanitized failure details"] },
  "activity-log": { icon: Clock3, eyebrow: "AUDIT & OBSERVABILITY", actions: ["Filter by actor and event category", "Trace changes to related records", "Export an auditable activity window"], outputs: ["Actor and timestamp", "Action and outcome", "Related resource identifiers"] },
  security: { icon: ShieldAlert, eyebrow: "SECURITY", actions: ["Review access and session events", "Check role assignments", "Escalate suspicious activity"], outputs: ["Security event history", "Access review", "Audit evidence"] },
  "system-health": { icon: Activity, eyebrow: "OBSERVABILITY", actions: ["Inspect verified service health", "Review dependency readiness", "Separate degraded services from unknown status"], outputs: ["Health checks", "Dependency state", "Last verified timestamp"] },
  "team-members": { icon: Activity, eyebrow: "PEOPLE & ACCESS", actions: ["Invite a teammate through verified identity flow", "Review membership status", "Remove access with audit logging"], outputs: ["Membership directory", "Invitation state", "Access history"] },
  "roles-permissions": { icon: ShieldAlert, eyebrow: "PEOPLE & ACCESS", actions: ["Review each role's permissions", "Limit sensitive actions by least privilege", "Audit role changes"], outputs: ["Role definitions", "Permission matrix", "Change history"] },
  notifications: { icon: Activity, eyebrow: "WORKSPACE SETTINGS", actions: ["Choose supported alert categories", "Set delivery preferences", "Review delivery status when available"], outputs: ["Notification preferences", "Delivery history", "Escalation rules"] },
  "account-authentication": { icon: ShieldAlert, eyebrow: "ACCOUNT SECURITY", actions: ["Review active sessions", "Use the verified password reset flow", "Enable stronger authentication when supported"], outputs: ["Session list", "Sign-in activity", "Authentication settings"] },
  preferences: { icon: Activity, eyebrow: "WORKSPACE SETTINGS", actions: ["Choose display preferences", "Set date and number formatting", "Review defaults before saving"], outputs: ["Display settings", "Table preferences", "Workflow defaults"] },
  "help-support": { icon: CircleHelp, eyebrow: "SUPPORT", actions: ["Read the product documentation", "Include a request or correlation ID when contacting support", "Never send credentials or full payment secrets"], outputs: ["Guides and FAQs", "Support contact", "Troubleshooting context"] },
  "api-developer-resources": { icon: Workflow, eyebrow: "DEVELOPER RESOURCES", actions: ["Review supported endpoints and schemas", "Use sandbox credentials only in development", "Verify authentication and error contracts"], outputs: ["API reference", "Integration guides", "Error handling guidance"] },
};

interface ModulePageProps {
  page: DashboardPage;
  workspace: Workspace;
  transactions: Transaction[];
  customers: Customer[];
  onNavigate: (page: DashboardPage) => void;
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="page-heading module-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-heading__description">{description}</p>
      </div>
      <span className="preview-context"><span /> Sandbox preview</span>
    </div>
  );
}

function PreviewNotice() {
  return (
    <div className="module-preview__notice module-preview__notice--wide" role="note">
      <ShieldAlert size={18} aria-hidden="true" />
      <div><strong>Preview workspace — not connected to live services</strong><span>Displayed records are illustrative in-memory data. Actions here do not initiate, refund, settle, or change real payments. Authentication, tenant authorization, and server-side audit enforcement must be connected before production use.</span></div>
    </div>
  );
}

function ExecutiveOverview({ workspace, transactions, customers, onNavigate }: ModulePageProps) {
  const matched = transactions.filter((item) => item.status === "Matched" || item.status === "Completed");
  const open = transactions.filter((item) => item.status === "Pending" || item.status === "Unmatched" || item.status === "Disputed");
  const matchedValue = matched.reduce((sum, item) => sum + item.amount, 0);
  const openValue = open.reduce((sum, item) => sum + item.amount, 0);
  const matchRate = transactions.length ? Math.round((matched.length / transactions.length) * 100) : 0;
  const failedOrUnmatched = transactions.filter((item) => item.status === "Unmatched" || item.status === "Disputed");
  const currency = (value: number) => formatKes(value);

  return (
    <>
      <PageHeading eyebrow="MANAGEMENT INTELLIGENCE" title="Executive overview" description={`A management-level view of payment performance, reconciliation exposure, and operational priorities for ${workspace.name}. All figures below are calculated from the illustrative sandbox dataset.`} />
      <PreviewNotice />
      <section className="executive-summary panel">
        <div className="executive-summary__mark"><CheckCircle2 size={21} /></div>
        <div><p className="eyebrow">MANAGEMENT BRIEF · SAMPLE DATA</p><h2>Use the current picture to decide what needs attention.</h2><p>The sample dataset contains {transactions.length} transaction records. Review open reconciliation items first, then validate reporting and source health after a real API connection is available.</p></div>
        <button className="button button--secondary" type="button" onClick={() => onNavigate("reports")}><FileText size={16} /> Explore reports <ArrowRight size={15} /></button>
      </section>
      <section className="stats-grid stats-grid--executive" aria-label="Illustrative executive metrics">
        <article className="stat-card"><span className="stat-card__label">Matched value</span><strong className="stat-card__value">{currency(matchedValue)}</strong><span className="metric-footnote">Calculated from sample matched records</span><span className="metric-icon metric-icon--green"><CheckCircle2 size={18} /></span></article>
        <article className="stat-card"><span className="stat-card__label">Transaction records</span><strong className="stat-card__value">{transactions.length.toLocaleString("en-KE")}</strong><span className="metric-footnote">Illustrative dataset only</span><span className="metric-icon metric-icon--forest"><Activity size={18} /></span></article>
        <article className="stat-card"><span className="stat-card__label">Match rate</span><strong className="stat-card__value">{matchRate}%</strong><span className="metric-footnote">Matched / all sample records</span><span className="metric-icon metric-icon--green"><GitCompareArrows size={18} /></span></article>
        <article className="stat-card"><span className="stat-card__label">Open review value</span><strong className="stat-card__value">{currency(openValue)}</strong><span className="metric-footnote">{open.length} pending, unmatched or disputed</span><span className="metric-icon metric-icon--amber"><ShieldAlert size={18} /></span></article>
      </section>
      <div className="executive-grid">
        <section className="panel executive-panel">
          <div className="panel-heading"><div><h2>Reconciliation position</h2><p>Sample record distribution · not live performance</p></div><span className="sample-tag">SAMPLE</span></div>
          <div className="executive-bars">
            {[{ label: "Matched", count: matched.length, tone: "green" }, { label: "Pending", count: transactions.filter((item) => item.status === "Pending").length, tone: "amber" }, { label: "Unmatched", count: transactions.filter((item) => item.status === "Unmatched").length, tone: "red" }, { label: "Disputed", count: transactions.filter((item) => item.status === "Disputed").length, tone: "purple" }].map((row) => (
              <div className="executive-bar-row" key={row.label}><div><span>{row.label}</span><strong>{row.count}</strong></div><div className="executive-bar-track"><span className={`executive-bar-fill executive-bar-fill--${row.tone}`} style={{ width: `${transactions.length ? (row.count / transactions.length) * 100 : 0}%` }} /></div></div>
            ))}
          </div>
          <button className="text-link" type="button" onClick={() => onNavigate("reconciliation")}>Open reconciliation <ArrowRight size={15} /></button>
        </section>
        <section className="panel executive-panel">
          <div className="panel-heading"><div><h2>Priority decisions</h2><p>Evidence-led next steps for this preview</p></div></div>
          <div className="priority-list">
            <button type="button" onClick={() => onNavigate("exceptions")}><span className="priority-list__number">01</span><span><strong>Review unresolved items</strong><small>{failedOrUnmatched.length} sample unmatched or disputed records</small></span><ArrowRight size={16} /></button>
            <button type="button" onClick={() => onNavigate("data-imports")}><span className="priority-list__number">02</span><span><strong>Verify source data quality</strong><small>Import validation is not connected</small></span><ArrowRight size={16} /></button>
            <button type="button" onClick={() => onNavigate("integrations")}><span className="priority-list__number">03</span><span><strong>Confirm integration readiness</strong><small>No live provider health checks available</small></span><ArrowRight size={16} /></button>
          </div>
        </section>
      </div>
      <section className="panel executive-panel">
        <div className="panel-heading"><div><h2>Organization snapshot</h2><p>Context from the local preview model</p></div></div>
        <div className="executive-facts"><div><span>Workspace</span><strong>{workspace.name}</strong></div><div><span>Customer profiles</span><strong>{customers.length}</strong></div><div><span>Data source</span><strong>Illustrative M-Pesa records</strong></div><div><span>Live data freshness</span><strong>Unavailable</strong></div></div>
      </section>
    </>
  );
}

function OperationalActivity({ workspace, transactions, onNavigate }: ModulePageProps) {
  const events = transactions.slice(0, 8).map((transaction, index) => ({
    id: transaction.id,
    reference: transaction.reference,
    status: transaction.status,
    amount: transaction.amount,
    customer: transaction.customer,
    timestamp: transaction.timestamp,
    severity: transaction.severity,
    kind: transaction.status === "Matched" || transaction.status === "Completed" ? "Reconciliation" : transaction.status === "Pending" ? "Awaiting review" : "Exception review",
    index,
  }));
  const completed = transactions.filter((item) => item.status === "Matched" || item.status === "Completed").length;
  const pending = transactions.filter((item) => item.status === "Pending").length;
  const unresolved = transactions.filter((item) => item.status === "Unmatched" || item.status === "Disputed").length;

  return (
    <>
      <PageHeading eyebrow="OPERATIONS CONTROL CENTER" title="Operational activity" description={`Follow transaction and reconciliation activity for ${workspace.name}. This timeline is derived from the local sample dataset, not from live system events.`} />
      <PreviewNotice />
      <section className="stats-grid stats-grid--executive" aria-label="Sample operational counts">
        <article className="stat-card"><span className="stat-card__label">Sample records</span><strong className="stat-card__value">{transactions.length}</strong><span className="metric-footnote">Records in local dataset</span><span className="metric-icon metric-icon--forest"><Activity size={18} /></span></article>
        <article className="stat-card"><span className="stat-card__label">Matched</span><strong className="stat-card__value">{completed}</strong><span className="metric-footnote">Sample state, not live jobs</span><span className="metric-icon metric-icon--green"><CheckCircle2 size={18} /></span></article>
        <article className="stat-card"><span className="stat-card__label">Pending</span><strong className="stat-card__value">{pending}</strong><span className="metric-footnote">Awaiting reconciliation in sample</span><span className="metric-icon metric-icon--amber"><Clock3 size={18} /></span></article>
        <article className="stat-card"><span className="stat-card__label">Needs review</span><strong className="stat-card__value">{unresolved}</strong><span className="metric-footnote">Unmatched or disputed sample records</span><span className="metric-icon metric-icon--red"><ShieldAlert size={18} /></span></article>
      </section>
      <section className="panel operational-panel">
        <div className="panel-heading"><div><h2>Activity timeline</h2><p>Latest entries from the preview transactions</p></div><span className="sample-tag">SAMPLE EVENTS</span></div>
        <div className="activity-timeline">
          {events.map((event) => (
            <article className="activity-event" key={event.id}>
              <span className={`activity-event__marker activity-event__marker--${event.status === "Matched" || event.status === "Completed" ? "green" : event.status === "Pending" ? "amber" : "red"}`}><Activity size={14} /></span>
              <div className="activity-event__body"><div className="activity-event__top"><strong>{event.kind}</strong><span className={`status-pill status-pill--${event.status.toLowerCase()}`}><i />{event.status}</span></div><p>{event.reference} · {event.customer} · {formatKes(event.amount)}</p><span className="activity-event__meta">{event.timestamp} · {event.severity} severity · local sample record</span></div>
              <button className="icon-button icon-button--small" type="button" aria-label={`Review transaction ${event.reference}`} onClick={() => onNavigate("transactions")}><ArrowRight size={16} /></button>
            </article>
          ))}
        </div>
        <div className="operational-panel__footer"><span><Clock3 size={15} /> Timeline reflects seeded preview records only.</span><button className="text-link" type="button" onClick={() => onNavigate("transactions")}>Open transactions <ArrowRight size={15} /></button></div>
      </section>
      <div className="executive-grid">
        <section className="panel executive-panel"><div className="panel-heading"><div><h2>Processing visibility</h2><p>What a live operational feed should expose</p></div></div><div className="capability-list"><div><CheckCircle2 size={17} /><span><strong>Lifecycle tracking</strong><small>Received, validated, matched, failed, retried and completed timestamps</small></span></div><div><CheckCircle2 size={17} /><span><strong>Correlation context</strong><small>Transaction, job, request and trace identifiers where supported</small></span></div><div><CheckCircle2 size={17} /><span><strong>Safe failure details</strong><small>Sanitized errors and actionable next steps without exposing secrets</small></span></div></div></section>
        <section className="panel executive-panel"><div className="panel-heading"><div><h2>Investigate a workflow</h2><p>Continue to the relevant workspace</p></div></div><div className="priority-list"><button type="button" onClick={() => onNavigate("reconciliation")}><span className="priority-list__number"><GitCompareArrows size={16} /></span><span><strong>Reconciliation runs</strong><small>Inspect match outcomes and unresolved records</small></span><ArrowRight size={16} /></button><button type="button" onClick={() => onNavigate("import-sync-activity")}><span className="priority-list__number"><Database size={16} /></span><span><strong>Import and sync jobs</strong><small>Review ingestion and validation workflow design</small></span><ArrowRight size={16} /></button><button type="button" onClick={() => onNavigate("system-health")}><span className="priority-list__number"><Activity size={16} /></span><span><strong>System health</strong><small>Live health checks are not connected in this preview</small></span><ArrowRight size={16} /></button></div></section>
      </div>
    </>
  );
}

export function ModulePage({ page, workspace, transactions, customers, onNavigate }: ModulePageProps) {
  if (page === "executive-overview") return <ExecutiveOverview page={page} workspace={workspace} transactions={transactions} customers={customers} onNavigate={onNavigate} />;
  if (page === "operational-activity") return <OperationalActivity page={page} workspace={workspace} transactions={transactions} customers={customers} onNavigate={onNavigate} />;

  const item = navigationItems.find((navigationItem) => navigationItem.page === page);
  const title = item?.label ?? "Workspace";
  const description = descriptions[page] ?? "Manage this part of your tenant workspace.";
  const detail = moduleDetails[page];
  const relatedPages: DashboardPage[] =
    ["data-quality", "data-sources", "validation-results", "duplicate-detection", "schema-mapping", "freshness-monitoring"].includes(page) ? ["data-imports", "data-quality", "data-sources"] :
    page === "data-lineage" ? ["processing-jobs", "reconciliation-runs", "data-quality"] :
    ["processing-jobs", "import-sync-activity"].includes(page) ? ["data-imports", "activity-log", "system-health"] :
    ["risk-overview", "fraud-detection", "risk-events", "suspicious-transactions", "alerts", "investigations", "risk-rules"].includes(page) ? ["risk-overview", "alerts", "investigations"] :
    ["reconciliation-runs", "matching-rules", "matching-history", "scheduled-reconciliation"].includes(page) ? ["reconciliation", "exceptions", "matching-history"] :
    ["settlements", "settlement-batches"].includes(page) ? ["settlements", "reconciliation", "reports"] :
    ["reports", "report-builder", "scheduled-reports", "export-center"].includes(page) ? ["reports", "transactions", "export-center"] :
    ["integrations", "webhooks", "webhook-deliveries"].includes(page) ? ["integrations", "webhooks", "webhook-deliveries"] :
    ["security", "roles-permissions", "approvals", "retention-privacy"].includes(page) ? ["team-members", "roles-permissions", "activity-log"] :
    ["help-support", "support-requests"].includes(page) ? ["help-support", "support-requests", "activity-log"] :
    ["team-members"].includes(page) ? ["approvals", "roles-permissions", "activity-log"] :
    ["notifications", "account-authentication", "preferences"].includes(page) ? ["account-authentication", "security", "preferences"] :
    ["home", "transactions", "reconciliation"];

  return (
    <>
      <PageHeading eyebrow={detail?.eyebrow ?? item?.group.toUpperCase() ?? "TENANT WORKSPACE"} title={title} description={description} />
      <PreviewNotice />
      <ModuleWorkspace page={page} workspace={workspace} transactions={transactions} customers={customers} onNavigate={onNavigate} />
      <section className="panel executive-panel related-modules"><div className="panel-heading"><div><h2>Continue your workflow</h2><p>Move to a related workspace</p></div></div><div className="related-module-grid">{relatedPages.map((relatedPage) => { const related = navigationItems.find((entry) => entry.page === relatedPage); if (!related) return null; const RelatedIcon = related.icon; return <button key={relatedPage} type="button" onClick={() => onNavigate(relatedPage)}><span className="related-module-grid__icon"><RelatedIcon size={18} /></span><span><strong>{related.label}</strong><small>Open workspace</small></span><ArrowRight size={16} /></button>; })}</div></section>
      <div className="module-footer-note"><CircleHelp size={15} /><span>This workspace uses explicit preview states where live service data is not connected. No payment, account, or security action is represented as complete unless a verified backend confirms it.</span></div>
    </>
  );
}
