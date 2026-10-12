import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  CreditCard,
  Download,
  Ellipsis,
  UsersRound,
} from "lucide-react";
import { StatCard } from "../../components/common/StatCard";
import type { Customer, Transaction, Workspace } from "../../types/dashboard";
import { downloadCsv } from "../../utils/csv";
import { formatKes } from "../../utils/formatting";

interface HomePageProps {
  workspace: Workspace;
  customers: Customer[];
  transactions: Transaction[];
  onNavigate: (page: "transactions" | "customers") => void;
}

const chartValues = [43, 59, 50, 78, 66, 92, 74];
const chartLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function exportSummary(workspace: Workspace, transactions: Transaction[]) {
  downloadCsv(
    `${workspace.id}-preview-transactions.csv`,
    ["Reference", "Customer", "Method", "Amount (KES)", "Status", "Created"],
    transactions.map((transaction) => [
      transaction.reference,
      transaction.customer,
      transaction.method,
      String(transaction.amount),
      transaction.status,
      transaction.createdAt,
    ]),
  );
}

export function HomePage({ workspace, customers, transactions, onNavigate }: HomePageProps) {
  const matched = transactions.filter((transaction) => transaction.status === "Matched");
  const volume = matched.reduce((total, transaction) => total + transaction.amount, 0);
  const activeCustomers = customers.filter((customer) => customer.status === "Active").length;
  const successRate = transactions.length ? Math.round((matched.length / transactions.length) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <div className="page-heading page-heading--dashboard">
        <div>
          <p className="eyebrow">TENANT WORKSPACE <span>·</span> SANDBOX</p>
          <h1>{greeting}</h1>
          <p className="page-heading__description">Here’s how things are looking for <strong>{workspace.name}</strong>.</p>
        </div>
        <div className="page-heading__actions">
          <span className="date-chip"><span className="date-chip__dot" /> Sample period · 7 days</span>
          <button className="button button--secondary" type="button" onClick={() => exportSummary(workspace, transactions)}>
            <Download size={16} aria-hidden="true" /> Export preview
          </button>
        </div>
      </div>

      <section className="stats-grid" aria-label="Preview workspace metrics">
        <StatCard label="Payment volume" value={formatKes(volume)} change="12.8%" icon={CircleDollarSign} />
        <StatCard label="Transactions" value={transactions.length.toLocaleString("en-KE")} change="8.2%" icon={CreditCard} tone="blue" />
        <StatCard label="Success rate" value={`${successRate}%`} change="2.4%" icon={ArrowUpRight} tone="purple" />
        <StatCard label="Active customers" value={activeCustomers.toLocaleString("en-KE")} change="6.1%" icon={UsersRound} tone="amber" />
      </section>

      <section className="dashboard-grid" aria-label="Workspace activity">
        <article className="panel volume-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-heading__title-row"><h2>Payment volume</h2><span className="sample-tag">SAMPLE</span></div>
              <p>Illustrative activity for the last 7 days</p>
            </div>
            <button className="icon-button icon-button--small" type="button" aria-label="Volume chart information" title="Illustrative sample data only">
              <Ellipsis size={18} />
            </button>
          </div>
          <div className="chart-summary">
            <strong>{formatKes(volume)}</strong>
            <span className="positive-change"><ArrowUpRight size={15} aria-hidden="true" /> 12.8%</span>
            <span className="chart-summary__note">from sample transactions</span>
          </div>
          <div className="bar-chart" role="img" aria-label="Illustrative payment volume chart, Monday through Sunday">
            <div className="bar-chart__grid" aria-hidden="true"><span /><span /><span /><span /></div>
            <div className="bar-chart__bars" aria-hidden="true">
              {chartValues.map((height, index) => (
                <div className="bar-chart__group" key={`${height}-${index}`}>
                  <span className={`bar-chart__bar${index === chartValues.length - 1 ? " bar-chart__bar--current" : ""}`} style={{ height: `${height}%` }} />
                  <span className="bar-chart__label">{chartLabels[index]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-legend"><span /><span>Preview activity</span><span className="chart-legend__sample">Not connected to live payment data</span></div>
        </article>

        <article className="panel health-panel">
          <div className="panel-heading">
            <div><h2>Workspace snapshot</h2><p>Sample overview · sandbox</p></div>
            <span className="health-badge"><span />Preview</span>
          </div>
          <div className="health-score"><div className="health-score__ring"><strong>98</strong><span>/100</span></div><div><strong>All systems ready</strong><span>Preview configuration</span></div></div>
          <div className="health-list">
            <div><span className="health-list__icon health-list__icon--green"><CreditCard size={15} /></span><span>Payment processing</span><strong>Sandbox</strong></div>
            <div><span className="health-list__icon health-list__icon--blue"><UsersRound size={15} /></span><span>Customer directory</span><strong>{customers.length} samples</strong></div>
            <div><span className="health-list__icon health-list__icon--amber"><ArrowDownRight size={15} /></span><span>Live connections</span><strong>Not connected</strong></div>
          </div>
        </article>
      </section>

      <section className="panel activity-panel">
        <div className="panel-heading">
          <div><div className="panel-heading__title-row"><h2>Recent transactions</h2><span className="sample-tag">SAMPLE</span></div><p>Latest payment activity in this preview workspace</p></div>
          <button className="text-link" type="button" onClick={() => onNavigate("transactions")}>View all <ArrowRight size={15} aria-hidden="true" /></button>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th scope="col">Customer</th><th scope="col">Reference</th><th scope="col">Method</th><th scope="col">Date</th><th scope="col">Amount</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {transactions.slice(0, 5).map((transaction) => (
                <tr key={transaction.id}>
                  <td><div className="person-cell"><span className="avatar">{transaction.customer.slice(0, 1)}</span><strong>{transaction.customer}</strong></div></td>
                  <td><span className="mono-text">{transaction.reference}</span></td>
                  <td>{transaction.method}</td><td className="muted-cell">{transaction.createdAt}</td>
                  <td className="amount-cell">{formatKes(transaction.amount)}</td>
                  <td><span className={`status-pill status-pill--${transaction.status.toLowerCase()}`}><i />{transaction.status}</span></td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={6} className="empty-cell">No preview transactions in this workspace yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="activity-panel__footer"><span>Showing sample records only</span><button className="text-link" type="button" onClick={() => onNavigate("customers")}>Browse customers <ArrowRight size={15} aria-hidden="true" /></button></div>
      </section>
    </>
  );
}
