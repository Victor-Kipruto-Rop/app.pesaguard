import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  Clock3,
  Copy,
  Download,
  Flag,
  ListFilter,
  MessageSquareText,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Transaction, TransactionStatus } from "../../types/dashboard";
import { downloadCsv } from "../../utils/csv";
import { formatKes } from "../../utils/formatting";
import "./transactions.css";

interface TransactionsPageProps {
  transactions: Transaction[];
  initialQuery: string;
  onTransactionsChange: (transactions: Transaction[]) => void;
  isLiveData?: boolean;
  liveTotal?: number;
  onRefresh?: () => void;
  loadError?: string;
}

type StatusFilter = "All" | "Matched" | "Pending" | "Unmatched" | "Disputed";
type DateFilter = "All" | "Today" | "7d" | "30d" | "Custom";
type SortColumn = "timestamp" | "amount";

const statusFilters: StatusFilter[] = ["All", "Matched", "Pending", "Unmatched", "Disputed"];
const pageSizes = [25, 50, 100];

function exportTransactions(transactions: Transaction[], filename: string) {
  downloadCsv(
    filename,
    ["Timestamp", "Amount (KES)", "Transaction ID", "Status", "Source", "Anomaly type", "Discrepancy ID", "Severity", "Reviewed"],
    transactions.map((transaction) => [
      transaction.timestamp,
      String(transaction.amount),
      transaction.reference,
      transaction.status,
      transaction.source,
      transaction.anomalyType,
      transaction.discrepancyId,
      transaction.severity,
      transaction.reviewed ? "Yes" : "No",
    ]),
  );
}

function shortId(id: string): string {
  return `${id.slice(0, 10)}…${id.slice(-6)}`;
}

function statusClass(status: TransactionStatus): string {
  if (status === "Matched" || status === "Completed") return "matched";
  if (status === "Pending") return "pending";
  if (status === "Disputed") return "disputed";
  if (status === "Unmatched" || status === "Failed") return "unmatched";
  if (status === "Refunded") return "refunded";
  return "unknown";
}

export function TransactionsPage({ transactions, initialQuery, onTransactionsChange, isLiveData = false, liveTotal, onRefresh, loadError = "" }: TransactionsPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<StatusFilter>("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dense, setDense] = useState(true);
  const [pageSize, setPageSize] = useState(25);
  const [pageNumber, setPageNumber] = useState(0);
  const [sortColumn, setSortColumn] = useState<SortColumn>("timestamp");
  const [sortAscending, setSortAscending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [disputeMenuOpen, setDisputeMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [refreshLabel, setRefreshLabel] = useState(isLiveData ? "Live API · read-only" : "Preview · static data");

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  const filtered = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const minimum = minAmount.trim() ? Number(minAmount) : null;
    const maximum = maxAmount.trim() ? Number(maxAmount) : null;

    return transactions.filter((transaction) => {
      const searchable = `${transaction.reference} ${transaction.id} ${transaction.amount} ${transaction.status} ${transaction.source}`.toLowerCase();
      if (query.trim() && !searchable.includes(query.trim().toLowerCase())) return false;
      if (status !== "All" && transaction.status !== status) return false;
      if (minimum !== null && Number.isFinite(minimum) && transaction.amount < minimum) return false;
      if (maximum !== null && Number.isFinite(maximum) && transaction.amount > maximum) return false;

      const transactionDate = new Date(transaction.timestamp);
      if (dateFilter === "Today" && transactionDate.getTime() < startOfToday) return false;
      if (dateFilter === "7d" && Date.now() - transactionDate.getTime() > 7 * 86_400_000) return false;
      if (dateFilter === "30d" && Date.now() - transactionDate.getTime() > 30 * 86_400_000) return false;
      if (fromDate && transactionDate < new Date(`${fromDate}T00:00:00`)) return false;
      if (toDate && transactionDate > new Date(`${toDate}T23:59:59`)) return false;
      return true;
    }).sort((left, right) => {
      const comparison = sortColumn === "amount"
        ? left.amount - right.amount
        : new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime();
      return sortAscending ? comparison : -comparison;
    });
  }, [transactions, query, status, minAmount, maxAmount, dateFilter, fromDate, toDate, sortColumn, sortAscending]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(pageNumber, pageCount - 1);
  const pageTransactions = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const visibleSelected = pageTransactions.filter((transaction) => selectedIds.has(transaction.id));
  const selectedTransactions = filtered.filter((transaction) => selectedIds.has(transaction.id));
  const activeTransaction = transactions.find((transaction) => transaction.id === activeId) ?? null;

  function updateTransactions(ids: Set<string>, update: (transaction: Transaction) => Transaction) {
    onTransactionsChange(transactions.map((transaction) => ids.has(transaction.id) ? update(transaction) : transaction));
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectVisible(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const transaction of pageTransactions) {
        if (checked) next.add(transaction.id);
        else next.delete(transaction.id);
      }
      return next;
    });
  }

  function markReviewed(ids: Set<string>) {
    updateTransactions(ids, (transaction) => ({
      ...transaction,
      reviewed: true,
      timeline: [
        ...transaction.timeline,
        {
          id: `reviewed-${Date.now()}`,
          label: "Marked reviewed",
          description: "Marked as reviewed in this local preview.",
          timestamp: new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
          status: "resolved",
        },
      ],
    }));
  }

  function markDisputed(transaction: Transaction) {
    updateTransactions(new Set([transaction.id]), (current) => ({
      ...current,
      status: "Disputed",
      reviewed: true,
      severity: current.severity === "Low" ? "Medium" : current.severity,
      notes: "Flagged for manual review in this local preview.",
      timeline: [
        ...current.timeline,
        {
          id: `disputed-${Date.now()}`,
          label: "Flagged for review",
          description: "Flagged as disputed in this local preview.",
          timestamp: new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
          status: "note",
        },
      ],
    }));
    setDisputeMenuOpen(false);
  }

  function clearFilters() {
    setQuery("");
    setStatus("All");
    setDateFilter("All");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    setPageNumber(0);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageNumber(0);
  }

  function copyId(transaction: Transaction) {
    void navigator.clipboard.writeText(transaction.reference).then(() => {
      setCopied(true);
      setCopyFeedback("Transaction ID copied.");
      window.setTimeout(() => setCopied(false), 1600);
    }).catch(() => {
      setCopied(false);
      setCopyFeedback("Clipboard unavailable. Select the transaction ID to copy it.");
    });
  }

  function sortBy(column: SortColumn) {
    if (sortColumn === column) setSortAscending((ascending) => !ascending);
    else {
      setSortColumn(column);
      setSortAscending(false);
    }
  }

  function updateStatus(id: string, nextStatus: TransactionStatus) {
    updateTransactions(new Set([id]), (transaction) => ({
      ...transaction,
      status: nextStatus,
      resolved: nextStatus === "Matched" || nextStatus === "Completed",
    }));
  }

  return (
    <section className={`transaction-page${dense ? " transaction-page--dense" : " transaction-page--comfortable"}`}>
      <div className="transaction-main">
        <header className="transaction-heading">
          <div>
            <p className="transaction-eyebrow"><span aria-hidden="true">›</span> TRANSACTIONS</p>
            <h1>Transactions</h1>
            <p>Browse M-Pesa Daraja transactions and their reconciliation status.</p>
          </div>
          <div className="transaction-refresh" role="status">
            <span className="transaction-refresh__dot" />
            <span>{refreshLabel}</span>
            <button type="button" aria-label={isLiveData ? "Refresh live tenant transactions" : "Refresh preview records"} title={isLiveData ? "Refresh from authenticated tenant API" : "Refresh static sample data"} onClick={() => { if (isLiveData) { onRefresh?.(); setRefreshLabel("Live API · refresh requested"); } else setRefreshLabel("Preview · refreshed just now"); }}>
              <RefreshCw size={13} aria-hidden="true" />
            </button>
          </div>
        </header>

        <section className="transaction-workbench" aria-label="Transaction filters and results">
          <div className="transaction-toolbar">
            <div className="transaction-toolbar__row transaction-toolbar__row--search">
              <form className="transaction-search" role="search" onSubmit={submitSearch}>
                <Search size={15} aria-hidden="true" />
                <label className="visually-hidden" htmlFor="transaction-search">Search transaction ID or amount</label>
                <input id="transaction-search" type="search" placeholder="Search by Transaction ID or amount..." value={query} onChange={(event) => { setQuery(event.target.value); setPageNumber(0); }} />
              </form>
              <div className="density-toggle" role="group" aria-label="Table density">
                <button type="button" aria-pressed={dense} className={dense ? "is-active" : ""} onClick={() => setDense(true)}>Dense</button>
                <button type="button" aria-pressed={!dense} className={!dense ? "is-active" : ""} onClick={() => setDense(false)}>Comfortable</button>
              </div>
            </div>

            <div className="transaction-toolbar__row transaction-toolbar__row--filters">
              <div className="transaction-status-filters" role="group" aria-label="Filter by reconciliation status">
                {statusFilters.map((filter) => (
                  <button key={filter} type="button" className={`transaction-filter-chip${status === filter ? " is-active" : ""}${filter !== "All" ? ` transaction-filter-chip--${filter.toLowerCase()}` : ""}`} aria-pressed={status === filter} onClick={() => { setStatus(filter); setPageNumber(0); }}>{filter}</button>
                ))}
              </div>
              <div className="transaction-date-filters" role="group" aria-label="Filter by date">
                {(["All", "Today", "7d", "30d", "Custom"] as const).map((filter) => (
                  <button key={filter} type="button" className={dateFilter === filter ? "is-active" : ""} aria-pressed={dateFilter === filter} onClick={() => { setDateFilter(filter); setPageNumber(0); }}>{filter}</button>
                ))}
              </div>
              <label className="transaction-date-input"><span>From date</span><input aria-label="From date" type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setDateFilter("Custom"); setPageNumber(0); }} /><CalendarDays size={13} aria-hidden="true" /></label>
              <label className="transaction-date-input"><span>To date</span><input aria-label="To date" type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setDateFilter("Custom"); setPageNumber(0); }} /><CalendarDays size={13} aria-hidden="true" /></label>
            </div>

            <div className="transaction-toolbar__row transaction-toolbar__row--amount">
              <span className="amount-filter"><span>Amount range</span><ChevronDown size={13} aria-hidden="true" /></span>
              <label className="amount-input"><span className="visually-hidden">Minimum amount</span><input inputMode="numeric" type="number" min="0" placeholder="Min amount" value={minAmount} onChange={(event) => { setMinAmount(event.target.value); setPageNumber(0); }} /><ChevronsUpDown size={13} aria-hidden="true" /></label>
              <span className="amount-separator">–</span>
              <label className="amount-input"><span className="visually-hidden">Maximum amount</span><input inputMode="numeric" type="number" min="0" placeholder="Max amount" value={maxAmount} onChange={(event) => { setMaxAmount(event.target.value); setPageNumber(0); }} /><ChevronsUpDown size={13} aria-hidden="true" /></label>
              <button className="tx-button tx-button--outline transaction-export" type="button" onClick={() => exportTransactions(filtered, isLiveData ? "pesaguard-tenant-transactions.csv" : "pesaguard-preview-transactions.csv")}><Download size={14} aria-hidden="true" /> Export CSV</button>
            </div>
          </div>

          <div className="transaction-result-meta">
            <span>{isLiveData ? `${liveTotal ?? filtered.length} tenant records in the API · ${transactions.length} loaded locally; filters apply only to loaded records` : `Showing ${filtered.length} sample transactions`}</span>
            <button type="button" onClick={clearFilters}>Clear filters <ListFilter size={14} aria-hidden="true" /></button>
          </div>
          {loadError && <p className="transaction-copy-feedback" role="alert">{loadError}</p>}
          {copyFeedback && <p className="transaction-copy-feedback" role="status">{copyFeedback}</p>}

          <div className="transaction-table-wrap">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th className="transaction-check-cell"><input aria-label="Select visible transactions" type="checkbox" checked={pageTransactions.length > 0 && visibleSelected.length === pageTransactions.length} onChange={(event) => selectVisible(event.target.checked)} /></th>
                  <th><button type="button" onClick={() => sortBy("timestamp")}>Timestamp <span>{sortColumn === "timestamp" ? (sortAscending ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button type="button" onClick={() => sortBy("amount")}>Amount <span>{sortColumn === "amount" ? (sortAscending ? "↑" : "↓") : "↕"}</span></button></th>
                  <th>Transaction ID</th><th>Status</th><th>Source</th>
                </tr>
              </thead>
              <tbody>
                {pageTransactions.map((transaction) => (
                  <tr key={transaction.id} className={`${selectedIds.has(transaction.id) ? "is-selected " : ""}${activeId === transaction.id ? "is-active " : ""}${transaction.reviewed ? "is-reviewed" : ""}`} onClick={() => setActiveId(transaction.id)}>
                    <td className="transaction-check-cell"><input aria-label={`Select ${transaction.reference}`} type="checkbox" checked={selectedIds.has(transaction.id)} onClick={(event) => event.stopPropagation()} onChange={() => toggleSelected(transaction.id)} /></td>
                    <td>{transaction.timestamp}</td>
                    <td>{formatKes(transaction.amount)}</td>
                    <td>
                      <button className="transaction-id-copy" type="button" title={`Copy ${transaction.reference}`} onClick={(event) => { event.stopPropagation(); copyId(transaction); }}>
                        <span>{shortId(transaction.reference)}</span>{copied ? <Check size={13} aria-label="Copied" /> : <Copy size={13} aria-hidden="true" />}
                      </button>
                    </td>
                    <td><span className={`transaction-status transaction-status--${statusClass(transaction.status)}`}><i />{transaction.status}</span></td>
                    <td>{transaction.source}</td>
                  </tr>
                ))}
                {pageTransactions.length === 0 && <tr><td className="transaction-empty" colSpan={6}>{isLiveData ? "No tenant transactions match these filters." : "No sample transactions match these filters."}</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="transaction-pagination">
            <label>Rows
              <select aria-label="Transactions per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPageNumber(0); }}>
                {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <span>Showing {filtered.length === 0 ? 0 : currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length} {isLiveData ? "loaded API records" : "sample transactions"}{isLiveData && liveTotal !== undefined ? ` · ${liveTotal} total in API` : ""}</span>
            <div className="transaction-pagination__controls">
              <button type="button" aria-label="Previous page" disabled={currentPage === 0} onClick={() => setPageNumber((page) => Math.max(0, page - 1))}><ChevronLeft size={14} /></button>
              <span>Page {currentPage + 1} of {pageCount}</span>
              <button type="button" aria-label="Next page" disabled={currentPage + 1 >= pageCount} onClick={() => setPageNumber((page) => Math.min(pageCount - 1, page + 1))}><ChevronRight size={14} /></button>
            </div>
          </div>
        </section>

        {!isLiveData && selectedIds.size > 0 && (
          <section className="transaction-bulkbar" aria-label="Bulk transaction actions">
            <div className="transaction-bulkbar__summary"><strong>{selectedIds.size} selected</strong><span>Select transactions to perform bulk actions.</span></div>
            <div className="transaction-bulkbar__actions">
              <button className="tx-button tx-button--primary" type="button" onClick={() => markReviewed(selectedIds)}><Check size={15} />Mark Reviewed</button>
              <button className="tx-button tx-button--outline" type="button" onClick={() => exportTransactions(selectedTransactions, isLiveData ? "pesaguard-tenant-selected-transactions.csv" : "pesaguard-preview-selected-transactions.csv")}><Download size={14} />Export Selected</button>
              <button className="tx-button tx-button--quiet" type="button" onClick={() => setSelectedIds(new Set())}>Clear Selection <X size={14} /></button>
            </div>
          </section>
        )}
      </div>

      {activeTransaction ? (
        <aside className="transaction-detail" aria-label="Transaction details">
          <header className="transaction-detail__header">
            <h2>Transaction Details</h2>
            <button type="button" aria-label="Close transaction details" onClick={() => setActiveId(null)}><X size={17} /></button>
          </header>
          <div className="transaction-detail__identity">
            <div><strong>{activeTransaction.reference}</strong><button type="button" title="Copy transaction ID" onClick={() => copyId(activeTransaction)}>{copied ? <Check size={13} /> : <Copy size={13} />}</button></div>
            <span>Detected {activeTransaction.timestamp}</span>
            <span className={`transaction-status transaction-status--${statusClass(activeTransaction.status)}`}><i />{activeTransaction.status}</span>
          </div>
          <dl className="transaction-detail__fields">
            <div><dt>Amount</dt><dd>{formatKes(activeTransaction.amount)}</dd></div>
            <div><dt>Timestamp</dt><dd>{activeTransaction.timestamp}</dd></div>
            <div><dt>Source</dt><dd>{activeTransaction.source}</dd></div>
            <div><dt>Status</dt><dd><span className={`transaction-status transaction-status--${statusClass(activeTransaction.status)}`}><i />{activeTransaction.status}</span></dd></div>
            <div><dt>Anomaly Type</dt><dd>{activeTransaction.anomalyType}</dd></div>
            <div><dt>Discrepancy ID</dt><dd className="transaction-detail__mono">{activeTransaction.discrepancyId}</dd></div>
            <div><dt>Created At</dt><dd>{activeTransaction.timestamp}</dd></div>
            <div><dt>Resolved</dt><dd>{activeTransaction.resolved ? "Yes" : "No"}</dd></div>
            <div><dt>Severity</dt><dd><span className={`transaction-severity transaction-severity--${activeTransaction.severity.toLowerCase()}`}><i />{activeTransaction.severity}</span></dd></div>
            <div className="transaction-detail__notes"><dt>Notes</dt><dd>{activeTransaction.notes}</dd></div>
          </dl>
          <section className="transaction-timeline" aria-labelledby="transaction-timeline-title">
            <h3 id="transaction-timeline-title">Timeline</h3>
            <ol>
              {activeTransaction.timeline.map((entry) => (
                <li key={entry.id} className={`transaction-timeline__item transaction-timeline__item--${entry.status}`}>
                  <span className="transaction-timeline__marker" aria-hidden="true">
                    {entry.status === "detected" ? <CircleAlert size={14} /> : entry.status === "assigned" ? <Clock3 size={14} /> : <MessageSquareText size={14} />}
                  </span>
                  <div><time>{entry.timestamp}</time><strong>{entry.label}</strong><p>{entry.description}</p></div>
                </li>
              ))}
            </ol>
          </section>
          {!isLiveData && <footer className="transaction-detail__actions">
            <button className="tx-button tx-button--outline" type="button" onClick={() => markReviewed(new Set([activeTransaction.id]))}><Check size={15} />Mark Reviewed</button>
            <div className="transaction-dispute">
              <button className="tx-button tx-button--danger" type="button" onClick={() => markDisputed(activeTransaction)}><Flag size={14} />Flag as Disputed</button>
              <button className="tx-button tx-button--danger transaction-dispute__more" type="button" aria-label="More dispute actions" aria-expanded={disputeMenuOpen} onClick={() => setDisputeMenuOpen((open) => !open)}><ChevronDown size={14} /></button>
              {disputeMenuOpen && (
                <div className="transaction-dispute__menu">
                  <button type="button" onClick={() => updateStatus(activeTransaction.id, "Unmatched")}>Mark unmatched</button>
                  <button type="button" onClick={() => updateStatus(activeTransaction.id, "Matched")}>Mark matched</button>
                  <button type="button" onClick={() => setDisputeMenuOpen(false)}>Cancel</button>
                </div>
              )}
            </div>
          </footer>}
          <p className="transaction-detail__disclaimer">{isLiveData ? "Live tenant API record. This view is read-only; no payment, ledger, or reconciliation mutations are sent from this screen." : "Preview record only. Actions do not change payment or ledger data."}</p>
        </aside>
      ) : (
        <aside className="transaction-detail transaction-detail--empty"><button type="button" aria-label="Open selected transaction details" onClick={() => setActiveId(pageTransactions[0]?.id ?? null)}><SlidersHorizontal size={17} />Select a transaction to view its details.</button></aside>
      )}
    </section>
  );
}
