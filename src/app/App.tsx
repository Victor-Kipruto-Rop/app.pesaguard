import { useCallback, useEffect, useState } from "react";
import { pageFromPath, pathForPage, type DashboardPage } from "./config/routes";
import { previewDataFor, workspaces } from "../data/preview";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { CustomersPage } from "../pages/customers/CustomersPage";
import { HomePage } from "../pages/home/HomePage";
import { OrganizationPage } from "../pages/settings/OrganizationPage";
import { TransactionsPage } from "../pages/transactions/TransactionsPage";
import { TransactionDetailPage } from "../pages/transactions/TransactionDetailPage";
import { TransactionLifecyclePage } from "../pages/transactions/TransactionLifecyclePage";
import { ReconciliationPage } from "../pages/reconciliation/ReconciliationPage";
import { ModulePage } from "../pages/system/ModulePage";
import { isExtendedPage, OperationalPages } from "../pages/system/OperationalPages";
import { AuthPages, type AuthRoute } from "../pages/auth/AuthPages";
import { fetchTenantTransactions, loginToApi, logoutFromApi, refreshApiSession, PesaguardApiError, type ApiTransactionPage, type LoginResult } from "../lib/api";
import type { Customer, Transaction } from "../types/dashboard";

const implementedPages: DashboardPage[] = [
  "home", "executive-overview", "operational-activity", "transactions",
  "reconciliation", "customers", "tenant-profile", "settings",
];

const knownDashboardPaths = new Set([
  "/",
  "/executive-overview",
  "/operational-activity",
  "/transactions",
  "/reconciliation",
  "/exceptions",
  "/payments",
  "/settlements",
  "/reports",
  "/data-imports",
  "/integrations",
  "/webhooks",
  "/import-sync-activity",
  "/activity-log",
  "/security",
  "/system-health",
  "/customers",
  "/team-members",
  "/roles-permissions",
  "/tenant-profile",
  "/settings",
  "/notifications",
  "/account-authentication",
  "/preferences",
  "/help-support",
  "/api-developer-resources",
  "/data-quality",
  "/data-sources",
  "/validation-results",
  "/duplicate-detection",
  "/schema-mapping",
  "/data-lineage",
  "/processing-jobs",
  "/freshness-monitoring",
  "/risk-overview",
  "/fraud-detection",
  "/risk-events",
  "/suspicious-transactions",
  "/alerts",
  "/investigations",
  "/risk-rules",
  "/reconciliation-runs",
  "/matching-rules",
  "/matching-history",
  "/settlement-batches",
  "/scheduled-reconciliation",
  "/report-builder",
  "/scheduled-reports",
  "/export-center",
  "/approvals",
  "/webhook-deliveries",
  "/support-requests",
  "/retention-privacy",
  "/organization-profile",
  "/branches",
  "/user-profile",
  "/notification-center",
  "/failed-transactions",
  "/pending-transactions",
  "/refunds-reversals",
  "/transaction-import-results",
  "/reconciliation-run-detail",
  "/matched-transactions",
  "/unmatched-transactions",
  "/partial-matches",
  "/manual-matching",
  "/match-approvals",
  "/exception-detail",
  "/matching-rule-detail",
  "/settlement-detail",
  "/settlement-discrepancies",
  "/financial-summaries",
  "/data-quality-issues",
  "/data-quality-issue-detail",
  "/data-source-health",
  "/data-quality-trends",
  "/risk-alert-detail",
  "/flagged-transactions",
  "/fraud-investigation",
  "/risk-rule-detail",
  "/report-detail",
  "/scheduled-report-detail",
  "/integration-detail",
  "/webhook-delivery-detail",
  "/alert-detail",
  "/service-status",
  "/security-settings",
  "/active-sessions",
  "/access-history",
  "/account-closure",
  "/onboarding-resume",
  "/first-login-checklist",
  "/transaction-detail",
  "/transaction-lifecycle",
  "/provider-callback-history",
  "/create-reconciliation-run",
  "/reconciliation-results",
  "/rematch-confirmation",
  "/exception-resolution",
  "/import-wizard",
  "/column-mapping",
  "/validation-review",
  "/mpesa-setup",
  "/callback-configuration",
  "/credential-rotation",
  "/settlement-statement-upload",
  "/settlement-comparison",
  "/settlement-variance-review",
  "/customer-detail",
  "/team-invitations",
  "/member-detail",
  "/role-editor",
  "/webhook-endpoint-editor",
  "/webhook-signing-secret",
  "/webhook-retry",
  "/report-create",
  "/report-schedule-config",
  "/report-recipients",
  "/export-history",
  "/branch-detail",
  "/validation-rule-editor",
  "/pipeline-failure-detail",
  "/lineage-record-detail",
  "/investigation-evidence",
  "/investigation-notes",
  "/risk-rule-simulation",
  "/audit-event-detail",
  "/data-export-request",
  "/deletion-request-status",
  "/notification-preferences",
  "/notification-delivery-history",
  "/support-case-detail",
  "/diagnostic-attachments",
]);

const authPaths: Record<string, AuthRoute> = {
  "/login": "sign-in", "/sign-in": "sign-in",
  "/signup": "create-account", "/register": "create-account", "/create-account": "create-account",
  "/verify-email": "verify-email", "/verify-email/expired": "verify-email-expired",
  "/forgot-password": "forgot-password", "/reset-password": "reset-password", "/password-updated": "password-updated",
  "/accept-invite": "accept-invite", "/invite/accept": "accept-invite", "/invite-expired": "invite-expired",
  "/invite/expired": "invite-expired", "/invite/accepted": "invite-accepted", "/invite/invalid": "invite-invalid",
  "/onboarding": "onboarding-organization", "/onboarding/organization": "onboarding-organization",
  "/onboarding/setup": "onboarding-setup", "/onboarding/status": "onboarding-status",
  "/onboarding/complete": "onboarding-complete", "/onboarding/problem": "onboarding-problem",
  "/mfa-challenge": "mfa-challenge", "/mfa/setup": "mfa-setup", "/mfa/verify-setup": "mfa-verify-setup",
  "/mfa/recovery-codes": "mfa-recovery-codes", "/mfa/recovery": "mfa-recovery",
  "/security/verify": "security-verify", "/session-expired": "session-expired",
  "/account-locked": "account-locked", "/account/pending": "account-pending",
  "/access-denied": "access-denied", "/signed-out": "signed-out",
  "/sso": "sso", "/sso/callback": "sso-callback", "/settings/security/sso": "sso-settings",
  "/reauthenticate": "reauthenticate", "/404": "not-found", "/500": "server-error",
};

function authRouteFromPath(pathname: string): AuthRoute | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  return authPaths[path] ?? (knownDashboardPaths.has(path) ? null : "not-found");
}

function authPathForRoute(route: AuthRoute): string {
  const paths: Record<AuthRoute, string> = {
    "sign-in": "/login", "create-account": "/signup", "verify-email": "/verify-email",
    "verify-email-expired": "/verify-email/expired", "forgot-password": "/forgot-password",
    "reset-password": "/reset-password", "password-updated": "/password-updated",
    "mfa-challenge": "/mfa-challenge", "mfa-setup": "/mfa/setup", "mfa-verify-setup": "/mfa/verify-setup",
    "mfa-recovery-codes": "/mfa/recovery-codes", "mfa-recovery": "/mfa/recovery",
    "security-verify": "/security/verify", "accept-invite": "/accept-invite",
    "invite-expired": "/invite-expired", "invite-accepted": "/invite/accepted",
    "invite-invalid": "/invite/invalid", "account-pending": "/account/pending",
    "onboarding-organization": "/onboarding/organization", "onboarding-setup": "/onboarding/setup",
    "onboarding-status": "/onboarding/status", "onboarding-complete": "/onboarding/complete",
    "onboarding-problem": "/onboarding/problem", "session-expired": "/session-expired",
    "account-locked": "/account-locked", "access-denied": "/access-denied", "signed-out": "/signed-out",
    "not-found": "/404", "server-error": "/500", "sso": "/sso", "sso-callback": "/sso/callback",
    "sso-settings": "/settings/security/sso", "reauthenticate": "/reauthenticate",
  };
  return paths[route];
}

export default function App() {
  const [page, setPage] = useState<DashboardPage>(() => pageFromPath(window.location.pathname));
  const [authRoute, setAuthRoute] = useState<AuthRoute | null>(() => authRouteFromPath(window.location.pathname) ?? "sign-in");
  const [session, setSession] = useState<LoginResult | null>(null);
  const [liveTransactions, setLiveTransactions] = useState<Transaction[] | null>(null);
  const [liveTransactionTotal, setLiveTransactionTotal] = useState(0);
  const [transactionError, setTransactionError] = useState("");
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [workspaceId, setWorkspaceId] = useState(workspaces[0].id);
  const [customersByWorkspace, setCustomersByWorkspace] = useState(
    () => Object.fromEntries(workspaces.map((workspace) => [workspace.id, previewDataFor(workspace).customers])),
  );
  const [transactionsByWorkspace, setTransactionsByWorkspace] = useState(
    () => Object.fromEntries(workspaces.map((workspace) => [workspace.id, previewDataFor(workspace).transactions])),
  );
  const previewWorkspace = workspaces.find((candidate) => candidate.id === workspaceId) ?? workspaces[0];
  const workspace = session ? { ...previewWorkspace, id: session.tenantId, name: session.tenantId, category: "Live tenant", initials: session.tenantId.slice(0, 2).toUpperCase() } : previewWorkspace;
  const customers = session ? [] : (customersByWorkspace[previewWorkspace.id] ?? previewDataFor(previewWorkspace).customers);
  const transactions = session ? (liveTransactions ?? []) : (transactionsByWorkspace[previewWorkspace.id] ?? previewDataFor(previewWorkspace).transactions);

  useEffect(() => {
    if (!session && authRoute === "sign-in" && authRouteFromPath(window.location.pathname) === null) {
      window.history.replaceState({}, "", "/login");
    }
    function handlePopState() {
      const path = window.location.pathname;
      const route = authRouteFromPath(path);
      if (!session && route === null) {
        setAuthRoute("sign-in");
        window.history.replaceState({}, "", "/login");
        return;
      }
      setAuthRoute(route);
      setPage(pageFromPath(path));
      setSearchQuery(new URLSearchParams(window.location.search).get("q") ?? "");
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [session, authRoute]);

  const handleSignIn = useCallback(async (email: string, password: string, requestedTenantId: string) => {
    const nextSession = await loginToApi(email, password, requestedTenantId);
    // Access and refresh tokens stay in memory only; they are never written to browser storage.
    setSession(nextSession);
    setLiveTransactions([]);
    setLiveTransactionTotal(0);
    setTransactionError("");
    setAuthRoute(null);
    setPage("home");
    setSearchQuery("");
    window.history.pushState({}, "", "/");

    // Authentication can succeed even when this account lacks transaction-read permission.
    // Keep the verified session, report the data error, and never substitute sample rows.
    try {
      const result = await fetchTenantTransactions(nextSession.accessToken);
      const mapped: Transaction[] = result.items.map((item) => {
        const amount = Number(item.trans_amount);
        const date = new Date(item.created_at);
        const normalizedStatus = String(item.status ?? "").toLowerCase();
        const status: Transaction["status"] = normalizedStatus === "matched" ? "Matched"
          : normalizedStatus === "completed" ? "Completed"
          : normalizedStatus === "failed" ? "Failed"
          : normalizedStatus === "refunded" ? "Refunded"
          : normalizedStatus === "disputed" || normalizedStatus === "mismatch" ? "Disputed"
          : normalizedStatus === "unmatched" || normalizedStatus === "duplicate" ? "Unmatched" : "Pending";
        return {
          id: item.id, customerId: "", customer: "Not supplied by transaction endpoint",
          reference: item.trans_id, method: "M-Pesa", amount: Number.isFinite(amount) ? amount : 0,
          status, createdAt: date.toISOString(), timestamp: date.toISOString(), source: "M-Pesa API",
          anomalyType: "", discrepancyId: "", severity: "Low",
          notes: "Read-only transaction record from the authenticated tenant API.",
          resolved: status === "Matched" || status === "Completed", reviewed: false, timeline: [],
        };
      });
      setLiveTransactions(mapped);
      setLiveTransactionTotal(result.total);
    } catch (error) {
      setTransactionError(error instanceof Error ? error.message : "Unable to load tenant transactions.");
    }
  }, []);

  const refreshLiveTransactions = useCallback(async () => {
    if (!session) return;
    try {
      let activeSession = session;
      let result: ApiTransactionPage;
      try {
        result = await fetchTenantTransactions(activeSession.accessToken);
      } catch (error) {
        if (!(error instanceof PesaguardApiError) || error.status !== 401) throw error;
        activeSession = await refreshApiSession(activeSession);
        setSession(activeSession);
        result = await fetchTenantTransactions(activeSession.accessToken);
      }
      const mapped: Transaction[] = result.items.map((item) => {
        const amount = Number(item.trans_amount);
        const date = new Date(item.created_at);
        const normalizedStatus = String(item.status ?? "").toLowerCase();
        const status: Transaction["status"] = normalizedStatus === "matched" ? "Matched"
          : normalizedStatus === "completed" ? "Completed"
          : normalizedStatus === "failed" ? "Failed"
          : normalizedStatus === "refunded" ? "Refunded"
          : normalizedStatus === "disputed" || normalizedStatus === "mismatch" ? "Disputed"
          : normalizedStatus === "unmatched" || normalizedStatus === "duplicate" ? "Unmatched" : "Pending";
        return { id: item.id, customerId: "", customer: "Not supplied by transaction endpoint", reference: item.trans_id,
          method: "M-Pesa", amount: Number.isFinite(amount) ? amount : 0, status, createdAt: date.toISOString(), timestamp: date.toISOString(),
          source: "M-Pesa API", anomalyType: "", discrepancyId: "", severity: "Low", notes: "Read-only transaction record from the authenticated tenant API.",
          resolved: status === "Matched" || status === "Completed", reviewed: false, timeline: [] };
      });
      setLiveTransactions(mapped);
      setLiveTransactionTotal(result.total);
      setTransactionError("");
    } catch (error) {
      if (error instanceof PesaguardApiError && error.status === 401) {
        setSession(null);
        setLiveTransactions(null);
        setAuthRoute("session-expired");
        window.history.pushState({}, "", "/session-expired");
      }
      setTransactionError(error instanceof Error ? error.message : "Unable to refresh tenant transactions.");
    }
  }, [session]);

  const handleSignOut = useCallback(async () => {
    const activeSession = session;
    try {
      if (activeSession) await logoutFromApi(activeSession);
    } catch {
      // Clear this browser session even if the API cannot confirm remote revocation.
    } finally {
      setSession(null);
      setLiveTransactions(null);
      setLiveTransactionTotal(0);
      setTransactionError("");
      setAuthRoute("signed-out");
      setPage("home");
      window.history.pushState({}, "", "/signed-out");
    }
  }, [session]);

  const navigate = useCallback((nextPage: DashboardPage) => {
    setAuthRoute(null);
    setPage(nextPage);
    setSearchQuery("");
    window.history.pushState({}, "", pathForPage(nextPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const navigateAuth = useCallback((nextRoute: AuthRoute | "dashboard") => {
    if (nextRoute === "dashboard" && !session) {
      setAuthRoute("sign-in");
      window.history.replaceState({}, "", "/login");
      return;
    }
    if (nextRoute === "dashboard") {
      setAuthRoute(null);
      setPage("home");
      setSearchQuery("");
      window.history.pushState({}, "", "/");
    } else {
      setAuthRoute(nextRoute);
      window.history.pushState({}, "", ({
        "sign-in": "/login", "create-account": "/signup", "verify-email": "/verify-email",
        "verify-email-expired": "/verify-email/expired", "forgot-password": "/forgot-password",
        "reset-password": "/reset-password", "password-updated": "/password-updated",
        "mfa-challenge": "/mfa-challenge", "mfa-setup": "/mfa/setup", "mfa-verify-setup": "/mfa/verify-setup",
        "mfa-recovery-codes": "/mfa/recovery-codes", "mfa-recovery": "/mfa/recovery",
        "security-verify": "/security/verify", "accept-invite": "/accept-invite",
        "invite-expired": "/invite-expired", "invite-accepted": "/invite/accepted", "invite-invalid": "/invite/invalid",
        "account-pending": "/account/pending", "onboarding-organization": "/onboarding/organization",
        "onboarding-setup": "/onboarding/setup", "onboarding-status": "/onboarding/status",
        "onboarding-complete": "/onboarding/complete", "onboarding-problem": "/onboarding/problem",
        "session-expired": "/session-expired", "account-locked": "/account-locked", "access-denied": "/access-denied",
        "signed-out": "/signed-out", "not-found": "/404", "server-error": "/500",
        "sso": "/sso", "sso-callback": "/sso/callback", "sso-settings": "/settings/security/sso",
        "reauthenticate": "/reauthenticate",
      } as Record<AuthRoute, string>)[nextRoute]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [session]);

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

  if (authRoute) return <AuthPages route={authRoute} onNavigate={navigateAuth} onSignIn={handleSignIn} />;

  return (
    <DashboardLayout
      activePage={page}
      workspace={workspace}
      workspaces={session ? [workspace] : workspaces}
      isLiveData={Boolean(session)}
      onSignOut={handleSignOut}
      onWorkspaceChange={(nextWorkspace) => {
        if (!session) setWorkspaceId(nextWorkspace.id);
        setSearchQuery("");
      }}
      onNavigate={navigate}
      onSearch={search}
    >
      {page === "home" && <HomePage key={workspace.id} workspace={workspace} customers={customers} transactions={transactions} onNavigate={navigate} />}
      {(page === "executive-overview" || page === "operational-activity") && <ModulePage page={page} workspace={workspace} transactions={transactions} customers={customers} onNavigate={navigate} />}
      {page === "transactions" && <TransactionsPage key={workspace.id} transactions={transactions} initialQuery={searchQuery} onTransactionsChange={updateTransactions} isLiveData={Boolean(session)} liveTotal={liveTransactionTotal} onRefresh={refreshLiveTransactions} loadError={transactionError} />}
      {page === "reconciliation" && <ReconciliationPage key={workspace.id} transactions={transactions} onTransactionsChange={updateTransactions} />}
      {page === "customers" && <CustomersPage key={workspace.id} customers={customers} workspace={workspace} initialQuery={searchQuery} onCreateCustomer={addCustomer} />}
      {page === "tenant-profile" && <OrganizationPage workspace={workspace} />}
      {page === "settings" && <OrganizationPage workspace={workspace} title="General settings" />}
      {page === "transaction-lifecycle" && <TransactionLifecyclePage workspace={workspace} transactions={transactions} onNavigate={navigate} />}
      {page === "transaction-detail" && <TransactionDetailPage workspace={workspace} transactions={transactions} onNavigate={navigate} />}
      {page !== "transaction-detail" && page !== "transaction-lifecycle" && isExtendedPage(page) && <OperationalPages page={page} workspace={workspace} transactions={transactions} customers={customers} onNavigate={navigate} />}
      {!implementedPages.includes(page) && !isExtendedPage(page) && <ModulePage page={page} workspace={workspace} transactions={transactions} customers={customers} onNavigate={navigate} />}
    </DashboardLayout>
  );
}
