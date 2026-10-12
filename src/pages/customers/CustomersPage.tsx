import { Download, Plus, Search, UsersRound, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Customer, CustomerStatus, Workspace } from "../../types/dashboard";
import { downloadCsv } from "../../utils/csv";
import { formatKes, initials } from "../../utils/formatting";

interface CustomersPageProps {
  customers: Customer[];
  workspace: Workspace;
  initialQuery: string;
  onCreateCustomer: (customer: Customer) => void;
}

type StatusFilter = "All customers" | CustomerStatus;

const statusFilters: StatusFilter[] = ["All customers", "Active", "Invited", "Inactive"];

export function CustomersPage({ customers, workspace, initialQuery, onCreateCustomer }: CustomersPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<StatusFilter>("All customers");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  const filtered = useMemo(() => customers.filter((customer) => {
    const matchesQuery = `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "All customers" || customer.status === status);
  }), [customers, query, status]);

  function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    if (!name || !email) return;
    const customer: Customer = {
      id: `preview-${Date.now()}`,
      name,
      email,
      phone: phone || "Not provided",
      joined: new Intl.DateTimeFormat("en-KE", { month: "short", day: "2-digit", year: "numeric" }).format(new Date()),
      status: "Invited",
      transactions: 0,
      lifetimeValue: 0,
    };
    onCreateCustomer(customer);
    setSelected(customer);
    setAdding(false);
    setNotice("Customer added to this browser preview only. No data was sent to PesaGuard.");
    event.currentTarget.reset();
  }

  function exportCustomers() {
    downloadCsv(
      `${workspace.id}-preview-customers.csv`,
      ["Name", "Email", "Phone", "Joined", "Status", "Transactions", "Lifetime value (KES)"],
      filtered.map(({ name, email, phone, joined, status: customerStatus, transactions, lifetimeValue }) =>
        [name, email, phone, joined, customerStatus, String(transactions), String(lifetimeValue)],
      ),
    );
  }

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">PEOPLE & RELATIONSHIPS</p><h1>Customers</h1><p className="page-heading__description">Manage customer profiles for <strong>{workspace.name}</strong>.</p></div>
        <div className="page-heading__actions">
          <button className="button button--secondary" type="button" onClick={exportCustomers}><Download size={16} aria-hidden="true" />Export preview</button>
          <button className="button button--primary" type="button" onClick={() => { setAdding((value) => !value); setNotice(""); }}><Plus size={17} aria-hidden="true" />Add customer</button>
        </div>
      </div>
      <div className="notice notice--preview"><UsersRound size={16} aria-hidden="true" /><span>Sample customer records use reserved <code>example.test</code> addresses.</span></div>
      {notice && <p className="inline-notice" role="status">{notice}</p>}
      {adding && (
        <section className="panel add-customer-panel" aria-labelledby="add-customer-title">
          <div className="panel-heading"><div><h2 id="add-customer-title">Add a preview customer</h2><p>This record stays in memory and is not synced to an API.</p></div><button className="icon-button" type="button" aria-label="Close customer form" onClick={() => setAdding(false)}><X size={18} /></button></div>
          <form className="customer-form" onSubmit={createCustomer}>
            <label>Full name<input name="name" autoComplete="name" placeholder="e.g. Amina Wanjiku" required maxLength={100} /></label>
            <label>Email address<input name="email" type="email" autoComplete="email" placeholder="name@example.test" required maxLength={254} /></label>
            <label>Phone number <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" placeholder="+254 700 000 000" maxLength={30} /></label>
            <div className="customer-form__actions"><button className="button button--secondary" type="button" onClick={() => setAdding(false)}>Cancel</button><button className="button button--primary" type="submit">Add to preview</button></div>
          </form>
        </section>
      )}
      <section className="panel data-panel">
        <div className="customer-summary">
          <div><strong>{customers.length}</strong><span>sample profiles</span></div>
          <div><strong>{customers.filter((customer) => customer.status === "Active").length}</strong><span>active in preview</span></div>
          <div><strong>{formatKes(customers.reduce((total, customer) => total + customer.lifetimeValue, 0))}</strong><span>sample lifetime value</span></div>
        </div>
        <div className="data-panel__toolbar">
          <form className="table-search" role="search" onSubmit={(event) => event.preventDefault()}><Search size={16} aria-hidden="true" /><label className="visually-hidden" htmlFor="customer-search">Search customers</label><input id="customer-search" type="search" placeholder="Search name, email or phone" value={query} onChange={(event) => setQuery(event.target.value)} /></form>
          <div className="filter-tabs" aria-label="Filter customers by status">
            {statusFilters.map((filter) => <button key={filter} className={`filter-tab${status === filter ? " filter-tab--active" : ""}`} type="button" aria-pressed={status === filter} onClick={() => setStatus(filter)}>{filter}</button>)}
          </div>
          <span className="result-count">{filtered.length} shown</span>
        </div>
        <div className="customers-content">
          <div className="table-scroll">
            <table className="data-table data-table--large">
              <thead><tr><th scope="col">Customer</th><th scope="col">Phone</th><th scope="col">Joined</th><th scope="col">Transactions</th><th scope="col">Lifetime value</th><th scope="col">Status</th><th scope="col"><span className="visually-hidden">Details</span></th></tr></thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className={selected?.id === customer.id ? "table-row--selected" : ""}>
                    <td><div className="person-cell"><span className="avatar">{initials(customer.name)}</span><span className="person-cell__copy"><strong>{customer.name}</strong><small>{customer.email}</small></span></div></td>
                    <td className="muted-cell">{customer.phone}</td><td className="muted-cell">{customer.joined}</td><td>{customer.transactions}</td>
                    <td className="amount-cell">{formatKes(customer.lifetimeValue)}</td>
                    <td><span className={`status-pill status-pill--${customer.status.toLowerCase()}`}><i />{customer.status}</span></td>
                    <td><button className="row-action" type="button" aria-label={`View ${customer.name} details`} aria-pressed={selected?.id === customer.id} onClick={() => setSelected((current) => current?.id === customer.id ? null : customer)}>View</button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="empty-cell">No preview customers match your filters.</td></tr>}
              </tbody>
            </table>
          </div>
          {selected && (
            <aside className="customer-detail" aria-labelledby="customer-detail-title">
              <div className="customer-detail__top"><span className="avatar avatar--large">{initials(selected.name)}</span><button className="icon-button icon-button--small" type="button" aria-label="Close customer details" onClick={() => setSelected(null)}><X size={17} /></button></div>
              <h2 id="customer-detail-title">{selected.name}</h2><p className="customer-detail__email">{selected.email}</p>
              <span className={`status-pill status-pill--${selected.status.toLowerCase()}`}><i />{selected.status}</span>
              <dl className="detail-list">
                <div><dt>Phone</dt><dd>{selected.phone}</dd></div><div><dt>Customer since</dt><dd>{selected.joined}</dd></div>
                <div><dt>Transactions</dt><dd>{selected.transactions}</dd></div><div><dt>Lifetime value</dt><dd>{formatKes(selected.lifetimeValue)}</dd></div>
              </dl>
              <p className="detail-panel__note">Preview profile only. Customer information is not connected to a live service.</p>
            </aside>
          )}
        </div>
        <div className="data-panel__footer"><span>Preview records · Customer data is not live</span><span>{filtered.length} of {customers.length}</span></div>
      </section>
    </>
  );
}
