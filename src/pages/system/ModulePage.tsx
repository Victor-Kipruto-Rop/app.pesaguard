import { ArrowUpRight, CircleHelp, Database, ShieldAlert } from "lucide-react";
import { navigationItems } from "../../app/config/navigation";
import type { DashboardPage } from "../../app/config/routes";

const descriptions: Partial<Record<DashboardPage, string>> = {
  exceptions: "Investigate records that need review and track their resolution.",
  payments: "Manage payment processing channels and payment operations.",
  settlements: "Review settlement batches, balances, and payout status.",
  reports: "Create operational and financial reports for your tenant.",
  "data-imports": "Import transaction data and manage source files.",
  integrations: "Connect payment providers and external services.",
  webhooks: "Configure event destinations and inspect delivery status.",
  "import-sync-activity": "Monitor import jobs and external data synchronization.",
  "activity-log": "Review auditable changes and operational activity.",
  security: "Review tenant access controls and security events.",
  "system-health": "Check service availability and connected system health.",
  "team-members": "Manage tenant members and invitations.",
  "roles-permissions": "Review access roles and tenant permissions.",
  notifications: "Configure alerts and notification delivery preferences.",
  "account-authentication": "Manage your sign-in, sessions, and authentication methods.",
  preferences: "Set workspace display and workflow preferences.",
  "help-support": "Find help and contact PesaGuard support.",
  "api-developer-resources": "Explore the API, integration guides, and developer references.",
};

interface ModulePageProps {
  page: DashboardPage;
}

export function ModulePage({ page }: ModulePageProps) {
  const item = navigationItems.find((navigationItem) => navigationItem.page === page);
  const title = item?.label ?? "Workspace";
  const description = descriptions[page] ?? "Manage this part of your tenant workspace.";

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{item?.group.toUpperCase() ?? "TENANT WORKSPACE"}</p>
          <h1>{title}</h1>
          <p className="page-heading__description">{description}</p>
        </div>
      </div>
      <section className="module-preview panel" aria-labelledby="module-preview-title">
        <div className="module-preview__icon"><Database size={21} aria-hidden="true" /></div>
        <span className="sample-tag">PREVIEW</span>
        <h2 id="module-preview-title">{title} is ready for integration</h2>
        <p>
          This dashboard is a frontend preview. This module does not yet connect to a
          tenant service, so it shows no live records and cannot make changes.
        </p>
        <div className="module-preview__notice">
          <ShieldAlert size={17} aria-hidden="true" />
          <span>Tenant permissions and server-side data isolation must be enabled before production use.</span>
        </div>
        <a className="module-preview__link" href="https://docs.pesaguard.co.ke/" target="_blank" rel="noreferrer">
          Browse PesaGuard documentation <ArrowUpRight size={15} aria-hidden="true" />
        </a>
        <div className="module-preview__footer"><CircleHelp size={14} aria-hidden="true" /><span>No sample activity is presented as live data.</span></div>
      </section>
    </>
  );
}
