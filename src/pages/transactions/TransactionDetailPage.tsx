import { useMemo, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Clock3, Copy,
  Database, FileText, GitCompareArrows, ShieldAlert, ShieldCheck, WalletCards,
} from "lucide-react";
import type { DashboardPage } from "../../app/config/routes";
import type { Transaction, Workspace } from "../../types/dashboard";
import { formatKes } from "../../utils/formatting";
import "./transaction-detail-page.css";

interface Props {
  workspace: Workspace;
  transactions: Transaction[];
  onNavigate: (page: DashboardPage) => void;
}

const timelineLabels = [
  { title: "Payment initiated", detail: "Request accepted by the local sample workflow", icon: Activity },
  { title: "Provider response", detail: "Provider acknowledgement is represented for design preview", icon: WalletCards },
  { title: "Reconciliation review", detail: "Record is available for matching and exception checks", icon: GitCompareArrows },
  { title: "Final outcome", detail: "Finality must be confirmed by the connected provider or ledger", icon: BadgeCheck },
];

export function TransactionDetailPage({ workspace, transactions, onNavigate }: Props) {
  const [selectedId, setSelectedId] = useState(transactions[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const transaction = useMemo(
    () => transactions.find((item) => item.id === selectedId) ?? transactions[0],
    [transactions, selectedId],
  );

  if (!transaction) {
    return (
      <main className="td-page">
        <div className="td-empty">
          <span className="td-icon"><Database size={22} /></span>
          <p className="td-eyebrow">TRANSACTION OPERATIONS</p>
          <h1>No sample transaction available</h1>
          <p>This preview workspace contains no local transaction records. Connect a verified API source before treating any record as live.</p>
          <button className="td-button td-button--primary" onClick={() => onNavigate("transactions")}><ArrowLeft size={15} /> Return to transactions</button>
        </div>
      </main>
    );
  }

  const isCompleted = /matched|completed|success/i.test(transaction.status);
  async function copyReference() {\n    try {\n      await navigator.clipboard.writeText(transaction.reference);\n      setCopied(true);\n    } catch {\n      setCopied(false);\n    }\n  }\n\n  const timeline = timelineLabels.map((event, index) => ({
    ...event,
    state: index === 0 ? "complete" : index === 1 && !/pending/i.test(transaction.status) ? "complete" : index === 2 && isCompleted ? "complete" : index === 3 && isCompleted ? "complete" : index === 1 ? "current" : "upcoming",
  }));

  return (
    <main className="td-page">
      <div className="td-breadcrumb">
        <button type="button" onClick={() => onNavigate("transactions")}><ArrowLeft size={14} /> Transactions</button>
        <span>/</span><span>Transaction detail</span>
        <span className="td-preview-chip"><span /> SAMPLE RECORD</span>
      </div>

      <header className="td-hero">
        <div className="td-hero__copy">
          <span className="td-eyebrow">PAYMENT OPERATIONS <span>·</span> {workspace.name}</span>
          <h1>Transaction detail</h1>
          <p>One traceable view of the payment record, its lifecycle, reconciliation context and supporting identifiers.</p>
          <div className="td-ref-line"><code>{transaction.reference}</code><span className="td-dot-separator">•</span><span>{transaction.timestamp}</span></div>
        </div>
        <div className="td-hero__actions">
          <label className="td-record-select">
            <span>Sample record</span>
            <select value={transaction.id} onChange={(event) => { setSelectedId(event.target.value); setCopied(false); }} aria-label="Choose sample transaction">
              {transactions.map((item) => <option key={item.id} value={item.id}>{item.reference} · {item.status}</option>)}
            </select>
          </label>
          <button type="button" className="td-button td-button--secondary" onClick={() => onNavigate("transactions")}><ArrowLeft size={15} /> All transactions</button>
        </div>
      </header>

      <section className="td-preview-banner" role="note">
        <span className="td-banner-icon"><ShieldCheck size={18} /></span>
        <div><strong>Illustrative preview — not a live payment record</strong><p>All values on this page come from local sample data. Provider confirmation, permissions, audit evidence and financial state must be verified by the backend.</p></div>
        <span className="td-banner-tag">PREVIEW ONLY</span>
      </section>

      <section className="td-summary-grid" aria-label="Transaction summary">
        <article className="td-summary td-summary--amount"><span className="td-summary__label">Transaction amount</span><strong>{formatKes(transaction.amount)}</strong><span className="td-summary__foot"><WalletCards size={14} /> Kenyan shillings · KES</span></article>
        <article className="td-summary"><span className="td-summary__label">Current status</span><strong className="td-status"><i className={isCompleted ? "is-good" : /fail|disput/i.test(transaction.status) ? "is-bad" : "is-warn"} />{transaction.status}</strong><span className="td-summary__foot">Sample status only</span></article>
        <article className="td-summary"><span className="td-summary__label">Source</span><strong className="td-summary__value">{transaction.source || "Not specified"}</strong><span className="td-summary__foot"><Database size={14} /> Local preview object</span></article>
        <article className="td-summary"><span className="td-summary__label">Risk / review signal</span><strong className="td-summary__value">{transaction.severity || "Not assessed"}</strong><span className="td-summary__foot"><ShieldAlert size={14} /> {transaction.anomalyType || "No sample reason provided"}</span></article>
      </section>

      <div className="td-content-grid">
        <section className="td-card td-lifecycle">
          <div className="td-card-heading"><div><span className="td-eyebrow">EVENT TRACE</span><h2>Payment lifecycle</h2><p>Stages show the intended experience, not provider-verified events.</p></div><span className="td-count-pill">4 stages</span></div>
          <div className="td-timeline">
            {timeline.map((event, index) => {
              const EventIcon = event.icon;
              return <div className={`td-timeline-item td-timeline-item--${event.state}`} key={event.title}>
                <div className="td-timeline-rail"><span><EventIcon size={15} /></span>{index < timeline.length - 1 && <i />}</div>
                <div className="td-timeline-copy"><div className="td-timeline-title"><strong>{event.title}</strong><span>{event.state === "complete" ? "Sample checkpoint" : event.state === "current" ? "Review point" : "Awaiting verification"}</span></div><p>{event.detail}</p></div>
              </div>;
            })}
          </div>
          <div className="td-card-footnote"><Clock3 size={14} /> No verified event timestamps are available in this preview.</div>
        </section>

        <section className="td-card td-evidence">
          <div className="td-card-heading"><div><span className="td-eyebrow">RECORD CONTEXT</span><h2>Identifiers & evidence</h2><p>References used to correlate provider, ledger and review records.</p></div><FileText size={19} /></div>
          <dl className="td-detail-list">
            <div><dt>Internal record ID</dt><dd><code>{transaction.id}</code></dd></div>
            <div><dt>Provider reference</dt><dd><span className="td-muted">Not verified in preview</span></dd></div>
            <div><dt>Idempotency key</dt><dd><span className="td-muted">Not connected</span></dd></div>
            <div><dt>Ledger counterpart</dt><dd><span className="td-muted">Awaiting API evidence</span></dd></div>
            <div><dt>Review state</dt><dd><span className={`td-inline-status ${transaction.reviewed ? "is-reviewed" : ""}`}>{transaction.reviewed ? "Marked reviewed in sample" : "Not marked reviewed"}</span></dd></div>
          </dl>
          <button type="button" className="td-copy-button" onClick={() => void copyReference()}><Copy size={14} /> {copied ? "Reference copied" : "Copy transaction reference"} <span>{copied ? "Copied" : "Clipboard"}</span></button>
        </section>
      </div>

      <section className="td-card td-next-steps">
        <div className="td-card-heading"><div><span className="td-eyebrow">CONTINUE INVESTIGATION</span><h2>Related workflows</h2><p>Move from this record into the next operational view.</p></div></div>
        <div className="td-related-grid">
          <button type="button" onClick={() => onNavigate("transaction-lifecycle")}><span className="td-related-icon"><Activity size={17} /></span><span><strong>Lifecycle timeline</strong><small>Inspect each expected payment stage</small></span><ArrowRight size={16} /></button>
          <button type="button" onClick={() => onNavigate("provider-callback-history")}><span className="td-related-icon"><Database size={17} /></span><span><strong>Provider callbacks</strong><small>Review callback history and verification</small></span><ArrowRight size={16} /></button>
          <button type="button" onClick={() => onNavigate("exception-detail")}><span className="td-related-icon"><ShieldAlert size={17} /></span><span><strong>Exception review</strong><small>Investigate a discrepancy or flagged state</small></span><ArrowRight size={16} /></button>
        </div>
      </section>
    </main>
  );
}
