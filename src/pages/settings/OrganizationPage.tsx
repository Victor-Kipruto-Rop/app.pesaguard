import { Building2, CircleCheck, CircleHelp, LockKeyhole, PlugZap } from "lucide-react";
import type { Workspace } from "../../types/dashboard";

export function OrganizationPage({ workspace, title = "Tenant profile" }: { workspace: Workspace; title?: string }) {
  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">TENANT ADMINISTRATION</p><h1>{title}</h1><p className="page-heading__description">Workspace details and connection status for this preview.</p></div>
        <span className="date-chip"><span className="date-chip__dot" />Sandbox preview</span>
      </div>
      <section className="settings-profile panel">
        <div className="settings-profile__mark">{workspace.initials}</div>
        <div className="settings-profile__copy"><span className="eyebrow">CURRENT WORKSPACE</span><h2>{workspace.name}</h2><p>{workspace.category} · Tenant preview</p></div>
        <span className="status-pill status-pill--completed"><i />Sample workspace</span>
      </section>
      <div className="settings-grid">
        <article className="panel settings-card">
          <span className="settings-card__icon"><Building2 size={19} /></span><h2>Organization profile</h2>
          <p>Workspace identity and tenant profile settings.</p><div className="settings-row"><span>Workspace type</span><strong>{workspace.category}</strong></div>
          <div className="settings-row"><span>Workspace ID</span><code>{workspace.id}</code></div>
          <div className="settings-card__foot"><CircleHelp size={15} /><span>Profile editing will be available after the tenant API is connected.</span></div>
        </article>
        <article className="panel settings-card">
          <span className="settings-card__icon settings-card__icon--amber"><LockKeyhole size={19} /></span><h2>Access &amp; security</h2>
          <p>Production access controls must be wired to the identity service.</p>
          <div className="connection-state"><span className="connection-state__icon"><CircleCheck size={17} /></span><div><strong>Preview is not authenticated</strong><span>Sign-in and tenant authorization are not configured in this frontend preview.</span></div></div>
          <div className="settings-card__foot settings-card__foot--warning"><CircleHelp size={15} /><span>Do not use this preview with real customer or payment data.</span></div>
        </article>
        <article className="panel settings-card">
          <span className="settings-card__icon settings-card__icon--blue"><PlugZap size={19} /></span><h2>Connected services</h2>
          <p>Payment integrations and event delivery.</p>
          <div className="integration-row"><span className="integration-row__mark">M</span><div><strong>M-Pesa</strong><span>Integration not connected</span></div><span className="integration-row__status">Not connected</span></div>
          <div className="integration-row"><span className="integration-row__mark integration-row__mark--stripe">C</span><div><strong>Card payments</strong><span>Integration not connected</span></div><span className="integration-row__status">Not connected</span></div>
          <div className="settings-card__foot"><CircleHelp size={15} /><span>No payments can be submitted from this dashboard.</span></div>
        </article>
      </div>
    </>
  );
}
