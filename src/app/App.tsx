import { useCallback, useEffect, useState } from "react";
import { pageFromPath, pathForPage, type DashboardPage } from "./config/routes";
import { previewDataFor, workspaces } from "../data/preview";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { CustomersPage } from "../pages/customers/CustomersPage";
import { HomePage } from "../pages/home/HomePage";
import { OrganizationPage } from "../pages/settings/OrganizationPage";
import { TransactionsPage } from "../pages/transactions/TransactionsPage";
import { ReconciliationPage } from "../pages/reconciliation/ReconciliationPage";
import { ModulePage } from "../pages/system/ModulePage";
import type { Customer } from "../types/dashboard";

const implementedPages: DashboardPage[] = [
  "home", "executive-overview", "operational-activity", "transactions",
  "reconciliation", "customers", "tenant-profile", "settings",
];

export default function App() {
  const [page, setPage] = useState<DashboardPage>(() => pageFromPath(window.location.pathname));
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [workspaceId, setWorkspaceId] = useState(workspaces[0].id);
  const [customersByWorkspace, setCustomersByWorkspace] = useState(
    () => Object.fromEntries(workspaces.map((workspace) => [workspace.id, previewDataFor(workspace).customers])),
  );
  const [transactionsByWorkspace, setTransactionsByWorkspace] = useState(
    () => Object.fromEntries(workspaces.map((workspace) => [workspace.id, previewDataFor(workspace).transactions])),
  );
  const workspace = workspaces.find((candidate) => candidate.id === workspaceId) ?? workspaces[0];
  const customers = customersByWorkspace[workspace.id] ?? previewDataFor(workspace).customers;
  const transactions = transactionsByWorkspace[workspace.id] ?? previewDataFor(workspace).transactions;

  useEffect(() => {
    function handlePopState() {
      setPage(pageFromPath(window.location.pathname));
      setSearchQuery(new URLSearchParams(window.location.search).get("q") ?? "");
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((nextPage: DashboardPage) => {
    setPage(nextPage);
    setSearchQuery("");
    window.history.pushState({}, "", pathForPage(nextPage));
  }, []);

  function search(query: string) {
    if (!query) return;
    const normalized = query.toLowerCase();
    const matchedCustomer = customers.some((customer) =>
      `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(normalized),
    );
    const nextPage: DashboardPage = matchedCustomer ? "customers" : "transactions";
    setSearchQuery(query);
    setPage(nextPage);
    window.history.pushState({}, "", `${pathForPage(nextPage)}?q=${encodeURIComponent(query)}`);
  }

  function addCustomer(customer: Customer) {
    setCustomersByWorkspace((current) => ({
      ...current,
      [workspace.id]: [customer, ...(current[workspace.id] ?? [])],
    }));
  }

  function updateTransactions(nextTransactions: typeof transactions) {
    setTransactionsByWorkspace((current) => ({ ...current, [workspace.id]: nextTransactions }));
  }

  return (
    <DashboardLayout
      activePage={page}
      workspace={workspace}
      workspaces={workspaces}
      onWorkspaceChange={(nextWorkspace) => {
        setWorkspaceId(nextWorkspace.id);
        setSearchQuery("");
      }}
      onNavigate={navigate}
      onSearch={search}
    >
      {page === "home" && (
        <HomePage
          key={workspace.id}
          workspace={workspace}
          customers={customers}
          transactions={transactions}
          onNavigate={navigate}
        />
      )}
      {(page === "executive-overview" || page === "operational-activity") && (
        <ModulePage page={page} workspace={workspace} transactions={transactions} customers={customers} onNavigate={navigate} />
      )}
      {page === "transactions" && (
        <TransactionsPage key={workspace.id} transactions={transactions} initialQuery={searchQuery} onTransactionsChange={updateTransactions} />
      )}
      {page === "reconciliation" && (
        <ReconciliationPage key={workspace.id} transactions={transactions} onTransactionsChange={updateTransactions} />
      )}
      {page === "customers" && (
        <CustomersPage key={workspace.id} customers={customers} workspace={workspace} initialQuery={searchQuery} onCreateCustomer={addCustomer} />
      )}
      {page === "tenant-profile" && <OrganizationPage workspace={workspace} />}
      {page === "settings" && <OrganizationPage workspace={workspace} title="General settings" />}
      {!implementedPages.includes(page) && (
        <ModulePage page={page} workspace={workspace} transactions={transactions} customers={customers} onNavigate={navigate} />
      )}
    </DashboardLayout>
  );
}
