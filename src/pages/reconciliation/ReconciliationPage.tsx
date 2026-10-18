import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleSlash,
  Copy,
  Download,
  Eye,
  Filter,
  ListFilter,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import type { Transaction, TransactionStatus, TransactionTimelineEntry } from "../../types/dashboard";
import { downloadCsv } from "../../utils/csv";
import { formatKes } from "../../utils/formatting";
import "./reconciliation.css";

interface ReconciliationPageProps {
  transactions: Transaction[];
  onTransactionsChange: (transactions: Transaction[]) => void;
  isLiveData?: boolean;
}

type StatusFilter = "All Transactions" | "Matched" | "Pending" | "Unmatched";
type SortColumn = "timestamp" | "amount";

const statusFilters: StatusFilter[] = ["All Transactions", "Matched", "Pending", "Unmatched"];
const pageSizes = [25, 50, 100];

function isOpenStatus(status: TransactionStatus): boolean {
  return status === "Unmatched" || status === "Disputed";
}

function statusStyle(status: TransactionStatus): string {
  if (status === "Matched" || status === "Completed") return "matched";
  if (status === "Pending") return "pending";
  if (status === "Disputed") return "disputed";
  return "unmatched";
}

function transactionDate(timestamp: string): Date {
  return new Date(timestamp);
}

function exportTransactions(rows: Transaction[], filename: string): void {
  downloadCsv(
    filename,
    ["Timestamp", "Amount (KES)", "Transaction ID", "Account Reference", "Status", "Source", "Customer", "Discrepancy ID", "Reason"],
    rows.map((transaction) => [
      transaction.timestamp,
      String(transaction.amount),
      transaction.reference,
      transaction.accountReference ?? "",
      transaction.status,
      transaction.source,
      transaction.customer,
      transaction.discrepancyId,
      transaction.notes,
    ]),
  );
}

function displayDateRange(transactions: Transaction[]): string {
  if (transactions.length === 0) return "No sample dates";
  const timestamps = transactions.map((transaction) => transactionDate(transaction.timestamp).getTime());
  const first = new Date(Math.min(...timestamps));
  const last = new Date(Math.max(...timestamps));
  const format = new Intl.DateTimeFormat("en-KE", { month: "short", day: "numeric", year: "numeric" });
  return `${format.format(first)} – ${format.format(last)}`;
}

export function ReconciliationPage({ transactions, onTransactionsChange, isLiveData = false }: ReconciliationPageProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All Transactions");
  const [source, setSource] = useState("All sources");
  const [channel, setChannel] = useState("All channels");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [pageNumber, setPageNumber] = useState(0);
  const [sortColumn, setSortColumn] = useState<SortColumn>("timestamp");
  const [sortAscending, setSortAscending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [activeId, setActiveId] = useState<string | null>(
    () => transactions.find((transaction) => isOpenStatus(transaction.status))?.id ?? transactions[0]?.id ?? null,
  );
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(() => new Set());
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [rowMenuId, setRowMenuId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [copied, setCopied] = useState(false);

  const sources = useMemo(() => [...new Set(transactions.map((transaction) => transaction.source))], [transactions]);
  const channels = useMemo(() => [...new Set(transactions.map((transaction) => transaction.method))], [transactions]);
  const counts = useMemo(() => {
    const matched = transactions.filter((transaction) => transaction.status === "Matched" || transaction.status === "Completed").length;
    const pending = transactions.filter((transaction) => transaction.status === "Pending").length;
    const open = transactions.filter((transaction) => isOpenStatus(transaction.status)).length;
    return { total: transactions.length, matched, pending, open };
  }, [transactions]);

  const filtered = useMemo(() => {
    const minimum = minAmount.trim() ? Number(minAmount) : null;
    const maximum = maxAmount.trim() ? Number(maxAmount) : null;
    return transactions.filter((transaction) => {
      const searchable = [
        transaction.reference,
        transaction.id,
        transaction.discrepancyId,
        transaction.accountReference ?? "",
        transaction.amount,
        transaction.status,
        transaction.source,
        transaction.customer,
      ].join(" ").toLowerCase();
      if (query.trim() && !searchable.includes(query.trim().toLowerCase())) return false;
      if (status === "Matched" && transaction.status !== "Matched" && transaction.status !== "Completed") return false;
      if (status === "Pending" && transaction.status !== "Pending") return false;
      if (status === "Unmatched" && !isOpenStatus(transaction.status)) return false;
      if (source !== "All sources" && transaction.source !== source) return false;
      if (channel !== "All channels" && transaction.method !== channel) return false;
      if (minimum !== null && Number.isFinite(minimum) && transaction.amount < minimum) return false;
      if (maximum !== null && Number.isFinite(maximum) && transaction.amount > maximum) return false;
      const date = transactionDate(transaction.timestamp);
      if (fromDate && date < new Date(`${fromDate}T00:00:00`)) return false;
      if (toDate && date > new Date(`${toDate}T23:59:59`)) return false;
      return true;
    }).sort((left, right) => {
      const comparison = sortColumn === "amount"
        ? left.amount - right.amount
        : transactionDate(left.timestamp).getTime() - transactionDate(right.timestamp).getTime();
      return sortAscending ? comparison : -comparison;
    });
  }, [transactions, query, status, source, channel, minAmount, maxAmount, fromDate, toDate, sortColumn, sortAscending]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(pageNumber, pageCount - 1);
  const pageTransactions = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const visibleSelectedCount = pageTransactions.filter((transaction) => selectedIds.has(transaction.id)).length;
  const activeTransaction = transactions.find((transaction) => transaction.id === activeId) ?? null;
  const totalPagesShown = filtered.length;
  const matchedPercent = counts.total ? Math.round((counts.matched / counts.total) * 1000) / 10 : 0;

  function updateTransactions(ids: Set<string>, update: (transaction: Transaction) => Transaction): void {
    onTransactionsChange(transactions.map((transaction) => ids.has(transaction.id) ? update(transaction) : transaction));
  }

  function toggleSelected(id: string): void {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectVisible(checked: boolean): void {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const transaction of pageTransactions) {
        if (checked) next.add(transaction.id);
        else next.delete(transaction.id);
      }
      return next;
    });
  }

  function createMatch(transaction: Transaction): void {
    const entry: TransactionTimelineEntry = {
      id: `match-${Date.now()}`,
      label: "Match created",
      description: "Marked matched in this local reconciliation preview.",
      timestamp: new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
      status: "resolved",
    };
    updateTransactions(new Set([transaction.id]), (current) => ({
      ...current,
      status: "Matched",
      resolved: true,
      notes: "Match created in this local preview.",
      timeline: [...current.timeline, entry],
    }));
    setFeedback("Match created in this local preview.");
  }

  function addToIgnoreList(transaction: Transaction): void {
    setIgnoredIds((current) => new Set(current).add(transaction.id));
    setFeedback("Transaction added to the local ignore list.");
  }

  function clearFilters(): void {
    setQuery("");
    setStatus("All Transactions");
    setSource("All sources");
    setChannel("All channels");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    setPageNumber(0);
  }

  function sortBy(column: SortColumn): void {
    if (sortColumn === column) setSortAscending((ascending) => !ascending);
    else {
      setSortColumn(column);
      setSortAscending(false);
    }
  }

  function copyReference(reference: string): void {
    if (!navigator.clipboard) {
      setFeedback("Clipboard unavailable. Select the transaction ID to copy it.");
      return;
    }
    void navigator.clipboard.writeText(reference).then(() => {
      setCopied(true);
      setFeedback("Transaction ID copied.");
      window.setTimeout(() => setCopied(false), 1500);
    }).catch(() => {
      setCopied(false);
      setFeedback("Clipboard unavailable. Select the transaction ID to copy it.");
    });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setPageNumber(0);
  }

  const startIndex = filtered.length ? currentPage * pageSize + 1 : 0;
  const endIndex = Math.min((currentPage + 1) * pageSize, filtered.length);

  return (
    <section className="reconciliation-page">
      <div className="reconciliation-main">
        <header className="reconciliation-heading">
          <div>
            <p className="reconciliation-eyebrow">PAYMENTS <span aria-hidden="true">/</span> RECONCILIATION</p>
            <h1>Reconciliation</h1>
            <p>Match M-Pesa transactions with your records in real time.</p>
          </div>
          <div className="reconciliation-heading__actions">
            <span className="reconciliation-sample-tag"><Circle size={7} aria-hidden="true" /> {isLiveData ? "Live API · read-only" : "Sample data"}</span>
            <div className="reconciliation-export">
              <button type="button" className="reconciliation-button reconciliation-button--outline" onClick={() => exportTransactions(filtered, "pesaguard-preview-reconciliation.csv")}>
                <Download size={14} aria-hidden="true" /> Export
              </button>
              <button type="button" className="reconciliation-button reconciliation-button--outline reconciliation-export__toggle" aria-label="More export options" aria-expanded={exportMenuOpen} onClick={() => setExportMenuOpen((open) => !open)}>
                <ChevronDown size={14} aria-hidden="true" />
              </button>
              {exportMenuOpen && (
                <div className="reconciliation-menu reconciliation-menu--export">
                  <button type="button" disabled={selectedIds.size === 0} onClick={() => { exportTransactions(filtered.filter((transaction) => selectedIds.has(transaction.id)), "pesaguard-preview-selected.csv"); setExportMenuOpen(false); }}>
                    Export selected ({selectedIds.size})
                  </button>
                  <button type="button" onClick={() => { exportTransactions(filtered, "pesaguard-preview-reconciliation.csv"); setExportMenuOpen(false); }}>
                    Export filtered results
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="reconciliation-stats" aria-label="Reconciliation summary">
          <article className="reconciliation-stat reconciliation-stat--total">
            <span className="reconciliation-stat__icon"><WalletCards size={16} aria-hidden="true" /></span>
            <div className="reconciliation-stat__label">Total Transactions <small>{isLiveData ? "Loaded from tenant API" : "In sample"}</small></div>
            <strong>{counts.total.toLocaleString("en-KE")}</strong>
            <span className="reconciliation-stat__foot">{transactions.length ? displayDateRange(transactions) : isLiveData ? "No tenant dates" : "No sample dates"}</span>
          </article>
          <article className="reconciliation-stat reconciliation-stat--matched">
            <span className="reconciliation-stat__icon"><CheckCircle2 size={16} aria-hidden="true" /></span>
            <div className="reconciliation-stat__label">Matched Transactions</div>
            <strong>{counts.matched.toLocaleString("en-KE")}</strong>
            <span className="reconciliation-stat__foot">{matchedPercent}% of {isLiveData ? "loaded tenant records" : "sample records"}</span>
          </article>
          <article className="reconciliation-stat reconciliation-stat--pending">
            <span className="reconciliation-stat__icon"><CircleAlert size={16} aria-hidden="true" /></span>
            <div className="reconciliation-stat__label">Pending Review</div>
            <strong>{counts.pending.toLocaleString("en-KE")}</strong>
            <span className="reconciliation-stat__foot">{counts.total ? ((counts.pending / counts.total) * 100).toFixed(1) : "0.0"}% of {isLiveData ? "loaded tenant records" : "sample records"}</span>
          </article>
          <article className="reconciliation-stat reconciliation-stat--unmatched">
            <span className="reconciliation-stat__icon"><AlertTriangle size={16} aria-hidden="true" /></span>
            <div className="reconciliation-stat__label">Unmatched Transactions</div>
            <strong>{counts.open.toLocaleString("en-KE")}</strong>
            <span className="reconciliation-stat__foot">{counts.total ? ((counts.open / counts.total) * 100).toFixed(1) : "0.0"}% of {isLiveData ? "loaded tenant records" : "sample records"}</span>
          </article>
        </section>

        <section className="reconciliation-workbench" aria-label="Reconciliation records">
          <div className="reconciliation-tabs">
            <div className="reconciliation-tabs__list" role="group" aria-label="Filter by reconciliation status">
              {statusFilters.map((filter) => (
                <button key={filter} type="button" className={status === filter ? "is-active" : ""} aria-pressed={status === filter} onClick={() => { setStatus(filter); setPageNumber(0); }}>
                  {filter}{filter === "All Transactions" && <span>{counts.total}</span>}
                </button>
              ))}
            </div>
            <div className="reconciliation-tabs__actions">
              <div className="reconciliation-date-range">
                <label><span className="visually-hidden">From date</span><input aria-label="From date" type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPageNumber(0); }} /></label>
                <span aria-hidden="true">–</span>
                <label><span className="visually-hidden">To date</span><input aria-label="To date" type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPageNumber(0); }} /></label>
                <CalendarDays size={14} aria-hidden="true" />
              </div>
              <button type="button" className={`reconciliation-button reconciliation-button--quiet${showMoreFilters ? " is-active" : ""}`} aria-expanded={showMoreFilters} onClick={() => setShowMoreFilters((open) => !open)}>
                <Filter size={14} aria-hidden="true" /> Filters
              </button>
              <button type="button" className="reconciliation-icon-button" aria-label="More filter options" title="More filter options" onClick={() => setShowMoreFilters((open) => !open)}><SlidersHorizontal size={15} aria-hidden="true" /></button>
            </div>
          </div>

          <div className="reconciliation-filters">
            <form className="reconciliation-search" role="search" onSubmit={submitSearch}>
              <Search size={14} aria-hidden="true" />
              <label className="visually-hidden" htmlFor="reconciliation-search">Search reconciliation records</label>
              <input id="reconciliation-search" type="search" placeholder="Search by Transaction ID, Reference, customer..." value={query} onChange={(event) => { setQuery(event.target.value); setPageNumber(0); }} />
            </form>
            <label className="reconciliation-select"><span className="visually-hidden">Filter by source</span><select aria-label="Filter by source" value={source} onChange={(event) => { setSource(event.target.value); setPageNumber(0); }}><option>All sources</option>{sources.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={13} aria-hidden="true" /></label>
            <label className="reconciliation-select"><span className="visually-hidden">Filter by channel</span><select aria-label="Filter by channel" value={channel} onChange={(event) => { setChannel(event.target.value); setPageNumber(0); }}><option>All channels</option>{channels.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={13} aria-hidden="true" /></label>
            <button type="button" className={`reconciliation-button reconciliation-button--quiet${showMoreFilters ? " is-active" : ""}`} aria-expanded={showMoreFilters} onClick={() => setShowMoreFilters((open) => !open)}>More filters</button>
            {(query || status !== "All Transactions" || source !== "All sources" || channel !== "All channels" || fromDate || toDate || minAmount || maxAmount) && (
              <button type="button" className="reconciliation-clear" onClick={clearFilters}><X size={13} aria-hidden="true" /> Clear</button>
            )}
          </div>

          {showMoreFilters && (
            <div className="reconciliation-advanced-filters">
              <label>Minimum amount <input type="number" min="0" placeholder="Any" value={minAmount} onChange={(event) => { setMinAmount(event.target.value); setPageNumber(0); }} /></label>
              <label>Maximum amount <input type="number" min="0" placeholder="Any" value={maxAmount} onChange={(event) => { setMaxAmount(event.target.value); setPageNumber(0); }} /></label>
              <span>{isLiveData ? "Filters apply to the loaded read-only tenant records." : "Filters apply to the local sample only."}</span>
            </div>
          )}

          {feedback && <p className="reconciliation-feedback" role="status">{feedback}</p>}

          <div className="reconciliation-table-wrap">
            <table className="reconciliation-table">
              <thead><tr>
                <th className="reconciliation-check-cell"><input aria-label="Select visible transactions" type="checkbox" checked={pageTransactions.length > 0 && visibleSelectedCount === pageTransactions.length} onChange={(event) => selectVisible(event.target.checked)} /></th>
                <th><button type="button" onClick={() => sortBy("timestamp")}>Timestamp <span>{sortColumn === "timestamp" ? (sortAscending ? "↑" : "↓") : "↕"}</span></button></th>
                <th><button type="button" onClick={() => sortBy("amount")}>Amount <span>{sortColumn === "amount" ? (sortAscending ? "↑" : "↓") : "↕"}</span></button></th>
                <th>Transaction ID</th><th>Reference</th><th>Status</th><th>Source</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {pageTransactions.map((transaction) => (
                  <tr key={transaction.id} className={`${activeId === transaction.id ? "is-active " : ""}${selectedIds.has(transaction.id) ? "is-selected " : ""}`} onClick={() => { setActiveId(transaction.id); setFeedback(""); }}>
                    <td className="reconciliation-check-cell"><input aria-label={`Select ${transaction.reference}`} type="checkbox" checked={selectedIds.has(transaction.id)} onClick={(event) => event.stopPropagation()} onChange={() => toggleSelected(transaction.id)} /></td>
                    <td>{transaction.timestamp}</td>
                    <td>{formatKes(transaction.amount)}</td>
                    <td><button className="reconciliation-id" type="button" title="Copy transaction ID" onClick={(event) => { event.stopPropagation(); setActiveId(transaction.id); copyReference(transaction.reference); }}>{transaction.reference.slice(0, 13)}{copied && activeId === transaction.id ? <Check size={11} aria-hidden="true" /> : <Copy size={11} aria-hidden="true" />}</button></td>
                    <td>{transaction.accountReference ?? "—"}</td>
                    <td><span className={`reconciliation-status reconciliation-status--${statusStyle(transaction.status)}`}><i />{transaction.status}</span></td>
                    <td>{transaction.source}</td>
                    <td className="reconciliation-row-actions">
                      <button type="button" aria-label={`View ${transaction.reference}`} title="View details" onClick={(event) => { event.stopPropagation(); setActiveId(transaction.id); }}><Eye size={14} aria-hidden="true" /></button>
                      {!isLiveData && <button type="button" aria-label={`More actions for ${transaction.reference}`} title="More actions" aria-expanded={rowMenuId === transaction.id} onClick={(event) => { event.stopPropagation(); setActiveId(transaction.id); setRowMenuId((id) => id === transaction.id ? null : transaction.id); }}><MoreHorizontal size={15} aria-hidden="true" /></button>}
                      {!isLiveData && rowMenuId === transaction.id && (
                        <div className="reconciliation-menu reconciliation-menu--row">
                          <button type="button" disabled={transaction.status === "Matched" || transaction.status === "Completed"} onClick={() => { createMatch(transaction); setRowMenuId(null); }}>Create match</button>
                          <button type="button" onClick={() => { addToIgnoreList(transaction); setRowMenuId(null); }}>Add to ignore list</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {pageTransactions.length === 0 && <tr><td className="reconciliation-empty" colSpan={8}>{isLiveData ? "No tenant transactions match these filters." : "No sample transactions match these filters."}</td></tr>}
              </tbody>
            </table>
          </div>

          {!isLiveData && selectedIds.size > 0 && (
            <div className="reconciliation-bulkbar" aria-label="Selected transaction actions">
              <strong>{selectedIds.size} selected</strong>
              <span>Apply an action to selected sample records.</span>
              <button type="button" className="reconciliation-button reconciliation-button--outline" onClick={() => {
                updateTransactions(selectedIds, (transaction) => ({
                  ...transaction,
                  status: "Matched",
                  resolved: true,
                  timeline: [...transaction.timeline, {
                    id: `bulk-match-${Date.now()}-${transaction.id}`,
                    label: "Match created",
                    description: "Marked matched in this local reconciliation preview.",
                    timestamp: new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
                    status: "resolved",
                  }],
                }));
                setFeedback("Selected sample transactions marked as matched.");
                setSelectedIds(new Set());
              }}>Create matches</button>
              <button type="button" className="reconciliation-button reconciliation-button--quiet" onClick={() => setSelectedIds(new Set())}>Clear selection</button>
            </div>
          )}

          <footer className="reconciliation-pagination">
            <span>Showing {startIndex} to {endIndex} of {totalPagesShown.toLocaleString("en-KE")} {isLiveData ? "loaded tenant transactions" : "sample transactions"}</span>
            <div className="reconciliation-pagination__controls" aria-label="Pagination">
              <button type="button" aria-label="Previous page" disabled={currentPage === 0} onClick={() => setPageNumber((page) => Math.max(0, page - 1))}><ChevronLeft size={15} aria-hidden="true" /></button>
              {Array.from({ length: Math.min(3, pageCount) }, (_, index) => (
                <button key={index} type="button" aria-label={`Page ${index + 1}`} aria-current={currentPage === index ? "page" : undefined} className={currentPage === index ? "is-active" : ""} onClick={() => setPageNumber(index)}>{index + 1}</button>
              ))}
              {pageCount > 4 && <span aria-hidden="true">…</span>}
              {pageCount > 3 && <button type="button" aria-label={`Page ${pageCount}`} aria-current={currentPage === pageCount - 1 ? "page" : undefined} className={currentPage === pageCount - 1 ? "is-active" : ""} onClick={() => setPageNumber(pageCount - 1)}>{pageCount}</button>}
              <button type="button" aria-label="Next page" disabled={currentPage >= pageCount - 1} onClick={() => setPageNumber((page) => Math.min(pageCount - 1, page + 1))}><ChevronRight size={15} aria-hidden="true" /></button>
            </div>
            <label className="reconciliation-page-size"><select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPageNumber(0); }}>{pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}</select><span>/ page</span><ChevronDown size={12} aria-hidden="true" /></label>
          </footer>
        </section>
      </div>

      {activeTransaction ? (
        <aside className="reconciliation-detail" aria-label="Transaction details">
          <header className="reconciliation-detail__header">
            <h2>Transaction Details</h2>
            <button type="button" aria-label="Close transaction details" onClick={() => setActiveId(null)}><X size={16} aria-hidden="true" /></button>
          </header>
          <div className="reconciliation-detail__identity">
            <div><strong>{activeTransaction.reference}</strong><button type="button" title="Copy transaction ID" aria-label="Copy transaction ID" onClick={() => copyReference(activeTransaction.reference)}>{copied ? <Check size={13} /> : <Copy size={13} />}</button></div>
            <span>{activeTransaction.timestamp} · {activeTransaction.source}</span>
            <span className={`reconciliation-status reconciliation-status--${statusStyle(activeTransaction.status)}`}><i />{activeTransaction.status}</span>
          </div>
          <dl className="reconciliation-detail__fields">
            <div><dt>Amount</dt><dd>{formatKes(activeTransaction.amount)}</dd></div>
            <div><dt>Customer</dt><dd>{activeTransaction.customer}</dd></div>
            <div><dt>Payment channel</dt><dd>{activeTransaction.method}</dd></div>
            <div><dt>Transaction type</dt><dd>{activeTransaction.method}</dd></div>
            <div><dt>Account reference</dt><dd>{activeTransaction.accountReference ?? "Not provided in preview"}</dd></div>
            <div><dt>Source</dt><dd>{activeTransaction.source}</dd></div>
            <div><dt>Anomaly type</dt><dd>{activeTransaction.anomalyType.replaceAll("_", " ")}</dd></div>
            <div><dt>Resolved</dt><dd>{activeTransaction.resolved === null ? "Unknown" : activeTransaction.resolved ? "Yes" : "No"}</dd></div>
            <div><dt>Result description</dt><dd>{activeTransaction.notes}</dd></div>
          </dl>

          <section className="reconciliation-match-status" aria-labelledby="reconciliation-match-title">
            <div className="reconciliation-section-heading"><h3 id="reconciliation-match-title">Matching Status</h3><span className={`reconciliation-status reconciliation-status--${statusStyle(activeTransaction.status)}`}><i />{activeTransaction.status}</span></div>
            <dl className="reconciliation-detail__fields reconciliation-detail__fields--compact">
              <div><dt>Reason</dt><dd>{activeTransaction.status === "Matched" ? "Matched in sample data" : activeTransaction.notes}</dd></div>
              <div><dt>Expected reference</dt><dd>{activeTransaction.accountReference ?? "Not provided in preview"}</dd></div>
            </dl>
            <div className="reconciliation-suggested-action"><span>Suggested Action</span>
              {!isLiveData && <button type="button" className="reconciliation-button reconciliation-button--outline" disabled={activeTransaction.status === "Matched" || activeTransaction.status === "Completed"} onClick={() => createMatch(activeTransaction)}><Check size={13} aria-hidden="true" /> {activeTransaction.status === "Matched" ? "Already Matched" : "Create Match"}</button>}
            </div>
          </section>

          <section className="reconciliation-timeline" aria-labelledby="reconciliation-timeline-title">
            <h3 id="reconciliation-timeline-title">Timeline</h3>
            {activeTransaction.timeline.map((entry) => (
              <article className={`reconciliation-timeline__item reconciliation-timeline__item--${entry.status}`} key={entry.id}>
                <span className="reconciliation-timeline__icon">{entry.status === "resolved" ? <Check size={12} /> : entry.status === "detected" ? <AlertTriangle size={12} /> : entry.status === "assigned" ? <CircleAlert size={12} /> : <CircleSlash size={12} />}</span>
                <time>{entry.timestamp}</time>
                <div><strong>{entry.label}</strong><p>{entry.description}</p></div>
              </article>
            ))}
          </section>

          {!isLiveData && <footer className="reconciliation-detail__actions">
            <button type="button" className="reconciliation-button reconciliation-button--outline" disabled={activeTransaction.status === "Matched" || activeTransaction.status === "Completed"} onClick={() => createMatch(activeTransaction)}><Check size={14} aria-hidden="true" /> Create Match</button>
            <button type="button" className="reconciliation-button reconciliation-button--quiet" aria-pressed={ignoredIds.has(activeTransaction.id)} onClick={() => addToIgnoreList(activeTransaction)}><CircleSlash size={14} aria-hidden="true" /> {ignoredIds.has(activeTransaction.id) ? "On Ignore List" : "Add to Ignore List"}</button>
            <button type="button" className="reconciliation-icon-button" aria-label="More transaction actions" title="More transaction actions" onClick={() => setRowMenuId((id) => id === activeTransaction.id ? null : activeTransaction.id)}><ChevronDown size={14} aria-hidden="true" /></button>
            {rowMenuId === activeTransaction.id && (
              <div className="reconciliation-menu reconciliation-menu--detail">
                <button type="button" onClick={() => { addToIgnoreList(activeTransaction); setRowMenuId(null); }}>Add to ignore list</button>
                <button type="button" onClick={() => { copyReference(activeTransaction.reference); setRowMenuId(null); }}>Copy transaction ID</button>
              </div>
            )}
          </footer>}
          <p className="reconciliation-detail__disclaimer">{isLiveData ? "Live tenant API record. Reconciliation actions are disabled until a tenant-scoped reconciliation write API is connected." : "Actions change this local preview only. No live payment or ledger records are modified."}</p>
        </aside>
      ) : (
        <aside className="reconciliation-detail reconciliation-detail--empty">
          <button type="button" onClick={() => setActiveId(pageTransactions[0]?.id ?? null)}><ListFilter size={15} aria-hidden="true" /> Select a transaction to view details</button>
        </aside>
      )}
    </section>
  );
}
