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
import { AuthPages, type AuthRoute } from "../pages/auth/AuthPages";
import type { Customer } from "../types/dashboard";

const implementedPages: DashboardPage[] = [
  "home", "executive-overview", "operational-activity", "transactions",
  "reconciliation", "customers", "tenant-profile", "settings",
];

const knownDashboardPaths = new Set([
  "/", "/executive-overview", "/operational-activity", "/transactions", "/reconciliation",
  "/exceptions", "/payments", "/settlements", "/reports", "/data-imports", "/integrations",
  "/webhooks", "/import-sync-activity", "/activity-log", "/security", "/system-health",
  "/customers", "/team-members", "/roles-permissions", "/tenant-profile", "/settings",
  "/notifications", "/account-authentication", "/preferences", "/help-support", "/api-developer-resources",
  "/data-quality", "/data-sources", "/validation-results", "/duplicate-detection", "/schema-mapping", "/data-lineage", "/processing-jobs", "/freshness-monitoring",
  "/risk-overview", "/fraud-detection", "/risk-events", "/suspicious-transactions", "/alerts", "/investigations", "/risk-rules",
  "/reconciliation-runs", "/matching-rules", "/matching-history", "/settlement-batches", "/scheduled-reconciliation",
  "/report-builder", "/scheduled-reports", "/export-center", "/approvals", "/webhook-deliveries", "/support-requests", "/retention-privacy",
]);

const authPaths: Record<string, AuthRoute> = {
  "/login": "sign-in", "/sign-in": "sign-in",
  "/signup": "create-account", "/register": "create-account", "/create-account": "create-account",
  "/verify-email": "verify-email", "/forgot-password": "forgot-password",
  "/reset-password": "reset-password", "/accept-invite": "accept-invite",
  "/invite/accept": "accept-invite", "/invite-expired": "invite-expired", "/onboarding": "onboarding",
  "/mfa-challenge": "mfa-challenge", "/session-expired": "session-expired", "/account-locked": "account-locked", "/access-denied": "access-denied",
  "/404": "not-found", "/500": "server-error",
};

function authRouteFromPath(pathname: string): AuthRoute | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  return authPaths[path] ?? (knownDashboardPaths.has(path) ? null : "not-found");
}

function authPathForRoute(route: AuthRoute): string {
  const paths: Record<AuthRoute, string> = {
    "sign-in": "/login", "create-account": "/signup", "verify-email": "/verify-email",
    "forgot-password": "/forgot-password", "reset-password": "/reset-password",
    "accept-invite": "/accept-invite", onboarding: "/onboarding", "mfa-challenge": "/mfa-challenge",
    "session-expired": "/session-expired", "account-locked": "/account-locked", "invite-expired": "/invite-expired", "access-denied": "/access-denied",
    "not-found": "/404", "server-error": "/500",
  };
  return paths[route];
}

export default function App() {
  const [page, setPage] = useState<DashboardPage>(() => pageFromPath(window.location.pathname));
  const [authRoute, setAuthRoute] = useState<AuthRoute | null>(() => authRouteFromPath(window.location.pathname));
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
      const path = window.location.pathname;
      setAuthRoute(authRouteFromPath(path));
      setPage(pageFromPath(path));
      setSearchQuery(new URLSearchParams(window.location.search).get("q") ?? "");
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((nextPage: DashboardPage) => {
    setAuthRoute(null);
    setPage(nextPage);
    setSearchQuery("");
    window.history.pushState({}, "", pathForPage(nextPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const navigateAuth = useCallback((nextRoute: AuthRoute | "dashboard") => {
    if (nextRoute === "dashboard") {
      setAuthRoute(null);
      setPage("home");
      setSearchQuery("");
      window.history.pushState({}, "", "/");
    } else {
      setAuthRoute(nextRoute);
      window.history.pushState({}, "", authPathForRoute(nextRoute));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function search(query: string) {
    if (!query) return;
    const normalized = query.toLowerCase();
    const matchedCustomer = customers.some((customer) =>
      `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(normalized),
    );
    const nextPage: DashboardPage = matchedCustomer ? "customers" : "transactions";
    setAuthRoute(null);
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

  if (authRoute) return <AuthPages route={authRoute} onNavigate={navigateAuth} />;

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
      {page === "home" && <HomePage key={workspace.id} workspace={workspace} customers={customers} transactions={transactions} onNavigate={navigate} />}
      {(page === "executive-overview" || page === "operational-activity") && <ModulePage page={page} workspace={workspace} transactions={transactions} customers={customers} onNavigate={navigate} />}
      {page === "transactions" && <TransactionsPage key={workspace.id} transactions={transactions} initialQuery={searchQuery} onTransactionsChange={updateTransactions} />}
      {page === "reconciliation" && <ReconciliationPage key={workspace.id} transactions={transactions} onTransactionsChange={updateTransactions} />}
      {page === "customers" && <CustomersPage key={workspace.id} customers={customers} workspace={workspace} initialQuery={searchQuery} onCreateCustomer={addCustomer} />}
      {page === "tenant-profile" && <OrganizationPage workspace={workspace} />}
      {page === "settings" && <OrganizationPage workspace={workspace} title="General settings" />}
      {!implementedPages.includes(page) && <ModulePage page={page} workspace={workspace} transactions={transactions} customers={customers} onNavigate={navigate} />}
    </DashboardLayout>
  );
}
