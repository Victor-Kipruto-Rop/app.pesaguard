import { useMemo, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, CircleDashed,
  Clock3, Database, GitCompareArrows, ShieldAlert, WalletCards, Workflow,
} from "lucide-react";
import type { DashboardPage } from "../../app/config/routes";
import type { Transaction, Workspace } from "../../types/dashboard";
import { formatKes } from "../../utils/formatting";
import "./transaction-lifecycle-page.css";

interface Props {
  workspace: Workspace;
  transactions: Transaction[];
  onNavigate: (page: DashboardPage) => void;
}

const stageCatalog = [
  { key: "received", label: "Transaction received", eyebrow: "INGESTION", description: "The payment event enters the tenant workflow and receives an internal reference.", icon: WalletCards },
  { key: "validated", label: "Source validation", eyebrow: "DATA QUALITY", description: "Required identifiers, amount, currency and event shape are checked before matching.", icon: CheckCircle2 },
  { key: "reconciliation", label: "Reconciliation", eyebrow: "MATCHING ENGINE", description: "The payment is compared with available ledger evidence under the configured matching policy.", icon: GitCompareArrows },
  { key: "review", label: "Exception review", eyebrow: "OPERATIONS", description: "Unmatched or disputed records are routed for a reasoned review rather than silently accepted.", icon: ShieldAlert },
  { key: "outcome", label: "Confirmed outcome", eyebrow: "FINAL STATE", description: "A final status should be shown only when supported by verified provider or ledger evidence.", icon: BadgeCheck },
];

export function TransactionLifecyclePage({ workspace, transactions, onNavigate }: Props) {
  const [selectedId, setSelectedId] = useState(transactions[0]?.id ?? "");
  const [expandedStage, setExpandedStage] = useState<string | null>("reconciliation");
  const transaction = useMemo(
    () => transactions.find((item) => item.id === selectedId) ?? transactions[0],
    [transactions, selectedId],
  );

  if (!transaction) {
    return <main className="tl-page"><section className="tl-empty"><span><Database size={22} /></span><h1>No lifecycle sample available</h1><p>This workspace has no local transaction record to demonstrate. Connect a verified API before presenting live lifecycle events.</p><button className="tl-button tl-button--primary" onClick={() => onNavigate("transactions")}><ArrowLeft size={15} /> Back to transactions</button></section></main>;
  }

  const finalStatus = /matched|completed|refunded/i.test(transaction.status);
  const hasException = /unmatched|disputed|failed/i.test(transaction.status) || Boolean(transaction.anomalyType && transaction.anomalyType !== "none");
  const currentIndex = finalStatus ? 4 : hasException ? 3 : /pending/i.test(transaction.status) ? 2 : 1;
  const sampleEvents = transaction.timeline ?? [];
  const stageState = (index: number) => index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming";

  return (
    <main className="tl-page">
      <nav className="tl-breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={() => onNavigate("transactions")}><ArrowLeft size={14} /> Transactions</button><span>/</span>
        <button type="button" onClick={() => onNavigate("transaction-detail")}>Transaction detail</button><span>/</span><span>Lifecycle</span>
        <span className="tl-preview-tag"><i /> SYNTHETIC EVENT VIEW</span>
      </nav>

      <header className="tl-hero">
        <div><span className="tl-eyebrow">PAYMENT TRACE <b>·</b> {workspace.name}</span><h1>Transaction lifecycle</h1><p>Follow the expected journey from ingestion to reconciliation and final outcome, with each checkpoint separated from verified event evidence.</p></div>
        <div className="tl-controls"><label><span>Choose sample transaction</span><select value={transaction.id} onChange={(event) => {setSelectedId(event.target.value);setExpandedStage("reconciliation");}} aria-label="Choose sample transaction">{transactions.slice(0, 30).map((item) => <option key={item.id} value={item.id}>{item.reference} · {item.status}</option>)}</select></label><button className="tl-button" type="button" onClick={() => onNavigate("transaction-detail")}>Transaction detail <ArrowRight size={14}/></button></div>
      </header>

      <section className="tl-notice" role="note"><span><ShieldAlert size={18}/></span><div><strong>Preview timeline — not an event log</strong><p>The stages below describe the intended workflow. Existing sample timestamps and notes are illustrative; callback receipts, retries and finality require verified backend events.</p></div><b>LOCAL DATA</b></section>

      <section className="tl-transaction-card">
        <div className="tl-transaction-main"><span className="tl-kicker">SELECTED TRANSACTION</span><h2>{transaction.reference}</h2><p>{transaction.customer} <span>·</span> {transaction.source || transaction.method}</p></div>
        <div className="tl-amount"><span>Amount</span><strong>{formatKes(transaction.amount)}</strong></div>
        <div className="tl-status"><span>Status in sample</span><strong className={finalStatus ? "is-good" : hasException ? "is-attention" : "is-pending"}><i />{transaction.status}</strong></div>
        <div className="tl-created"><span>Sample timestamp</span><strong>{transaction.timestamp}</strong></div>
      </section>

      <div className="tl-main-grid">
        <section className="tl-card tl-stage-card">
          <header className="tl-card-heading"><div><span className="tl-eyebrow">EXPECTED PROCESS</span><h2>Lifecycle checkpoints</h2><p>Select a stage to inspect its purpose and evidence requirements.</p></div><span className="tl-count">{stageCatalog.length} stages</span></header>
          <div className="tl-stage-list">
            {stageCatalog.map((stage, index) => {
              const StageIcon = stage.icon;
              const state = stageState(index);
              const open = expandedStage === stage.key;
              const event = sampleEvents[index];
              return <article className={`tl-stage tl-stage--${state} ${open ? "is-expanded" : ""}`} key={stage.key}>
                <div className="tl-stage-rail"><span className="tl-stage-icon">{state === "complete" ? <CheckCircle2 size={17}/> : state === "current" ? <StageIcon size={17}/> : <CircleDashed size={17}/>}</span>{index < stageCatalog.length - 1 && <i/>}</div>
                <div className="tl-stage-body">
                  <button type="button" className="tl-stage-toggle" aria-expanded={open} onClick={() => setExpandedStage(open ? null : stage.key)}>
                    <span className="tl-stage-copy"><small>{stage.eyebrow}</small><strong>{stage.label}</strong><em>{state === "complete" ? "Earlier stage · illustrative" : state === "current" ? "Review point · not verified" : "Awaiting verified evidence"}</em></span>
                    <span className="tl-stage-chevron">{open ? "−" : "+"}</span>
                  </button>
                  {open && <div className="tl-stage-detail"><p>{stage.description}</p><div className="tl-evidence-box"><span className="tl-evidence-icon"><Activity size={15}/></span><div><strong>{event?.label ?? "Evidence not connected"}</strong><small>{event?.description ?? "No provider receipt, validation result or server-side event was supplied for this stage."}</small></div><span className="tl-evidence-state">{event ? "SAMPLE" : "UNKNOWN"}</span></div><div className="tl-requirements"><strong>Evidence needed</strong><ul><li>Server-generated event ID and tenant scope</li><li>Event timestamp with timezone and source</li><li>Outcome, reason code and correlation reference</li></ul></div></div>}
                </div>
              </article>;
            })}
          </div>
          <footer className="tl-stage-foot"><Clock3 size={14}/> Stage progress is inferred from the selected sample status, not a live workflow engine.</footer>
        </section>

        <aside className="tl-side-stack">
          <section className="tl-card tl-overview-card"><header className="tl-card-heading"><div><span className="tl-eyebrow">TRACE SUMMARY</span><h2>What we know</h2></div><Workflow size={18}/></header>
            <dl className="tl-facts"><div><dt>Internal ID</dt><dd><code>{transaction.id}</code></dd></div><div><dt>Provider reference</dt><dd>Not verified</dd></div><div><dt>Idempotency</dt><dd>Not connected</dd></div><div><dt>Reconciliation signal</dt><dd>{transaction.anomalyType || "Not supplied"}</dd></div><div><dt>Review severity</dt><dd>{transaction.severity || "Unknown"}</dd></div></dl>
          </section>
          <section className="tl-card tl-next-card"><span className="tl-eyebrow">NEXT WORKFLOW</span><h2>{hasException ? "Review the exception" : finalStatus ? "Inspect reconciliation evidence" : "Inspect provider callbacks"}</h2><p>{hasException ? "Understand the discrepancy reason and record a review outcome when connected to the API." : finalStatus ? "Check the matching record, rule version and ledger counterpart." : "Confirm whether callback events were received, verified and processed."}</p><button type="button" className="tl-button tl-button--primary" onClick={() => onNavigate(hasException ? "exception-detail" : finalStatus ? "reconciliation-results" : "provider-callback-history")}>{hasException ? "Open exception review" : finalStatus ? "Reconciliation results" : "Callback history"} <ArrowRight size={15}/></button></section>
          <section className="tl-integrity-note"><span><ShieldAlert size={16}/></span><p><strong>Do not infer payment success.</strong> A final outcome must be backed by trusted provider confirmation and/or reconciled ledger evidence.</p></section>
        </aside>
      </div>
    </main>
  );
}
