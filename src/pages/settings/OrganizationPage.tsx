import { useState, type FormEvent } from "react";
import { Building2, CircleCheck, CircleHelp, LockKeyhole, PlugZap, Save, ShieldCheck, Clock3, Mail } from "lucide-react";
import type { Workspace } from "../../types/dashboard";

export function OrganizationPage({ workspace, title = "Tenant profile" }: { workspace: Workspace; title?: string }) {
  const isSettings = title === "General settings";
  const [name, setName] = useState(workspace.name);
  const [category, setCategory] = useState(workspace.category);
  const [contactEmail, setContactEmail] = useState("");
  const [timezone, setTimezone] = useState("Africa/Nairobi");
  const [currency, setCurrency] = useState("KES");
  const [dateFormat, setDateFormat] = useState("DD MMM YYYY");
  const [notice, setNotice] = useState("");
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [exceptionAlerts, setExceptionAlerts] = useState(true);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(isSettings
      ? "Preview only: settings have not been saved. Connect the tenant settings API to persist changes."
      : "Preview only: profile changes have not been saved. Connect the tenant API and approval policy before editing a live organization.");
  }

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">{isSettings ? "WORKSPACE CONFIGURATION" : "TENANT ADMINISTRATION"}</p><h1>{title}</h1><p className="page-heading__description">{isSettings ? "Manage workspace defaults and operational preferences. Changes in this preview are not persisted." : "Review organization identity, workspace metadata, access requirements and integration readiness."}</p></div>
        <span className="date-chip"><span className="date-chip__dot" />Sandbox preview</span>
      </div>

      <section className="settings-profile panel">
        <div className="settings-profile__mark">{workspace.initials}</div>
        <div className="settings-profile__copy"><span className="eyebrow">CURRENT WORKSPACE</span><h2>{workspace.name}</h2><p>{workspace.category} · Local tenant preview</p></div>
        <span className="status-pill status-pill--pending"><i />Not connected</span>
      </section>

      <div className="settings-grid">
        <article className="panel settings-card">
          <span className="settings-card__icon"><Building2 size={19} /></span><h2>Organization identity</h2>
          <p>Core details shown for this local workspace.</p>
          <div className="settings-row"><span>Organization type</span><strong>{workspace.category}</strong></div>
          <div className="settings-row"><span>Workspace ID</span><code>{workspace.id}</code></div>
          <div className="settings-row"><span>Data mode</span><strong>Illustrative sample</strong></div>
          <div className="settings-card__foot"><CircleHelp size={15} /><span>Verified legal identity and tenant metadata must come from the server.</span></div>
        </article>
        <article className="panel settings-card">
          <span className="settings-card__icon settings-card__icon--amber"><LockKeyhole size={19} /></span><h2>Access &amp; security</h2>
          <p>Security status cannot be verified from the frontend alone.</p>
          <div className="connection-state"><span className="connection-state__icon"><CircleCheck size={17} /></span><div><strong>Identity service not connected</strong><span>No authenticated user session or enforced tenant permissions are available in this preview.</span></div></div>
          <div className="settings-card__foot settings-card__foot--warning"><CircleHelp size={15} /><span>Do not use this preview with real customer or payment data.</span></div>
        </article>
        <article className="panel settings-card">
          <span className="settings-card__icon settings-card__icon--blue"><PlugZap size={19} /></span><h2>Payment integration</h2>
          <p>Provider status is unknown until the connection is verified.</p>
          <div className="integration-row"><span className="integration-row__mark">M</span><div><strong>M-Pesa Daraja</strong><span>Frontend connection not configured</span></div><span className="integration-row__status">Not verified</span></div>
          <div className="settings-card__foot"><CircleHelp size={15} /><span>Credentials must be stored server-side; never paste API secrets into this screen.</span></div>
        </article>
      </div>

      <section className="panel settings-form-panel">
        <div className="panel-heading"><div><h2>{isSettings ? "Workspace defaults" : "Edit organization profile"}</h2><p>{isSettings ? "Configure locale and notification preferences for the preview." : "Review editable fields. Saving only demonstrates the interface and does not update server data."}</p></div><span className="sample-tag">PREVIEW</span></div>
        <form className="settings-edit-form" onSubmit={submit}>
          {!isSettings && <><label>Organization name<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Organization type<select value={category} onChange={(event) => setCategory(event.target.value)}><option>SACCO</option><option>Merchant</option><option>Financial services</option><option>Other</option></select></label><label>Contact email<input type="email" placeholder="finance@organization.co.ke" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} /><small>Contact email is not verified or saved.</small></label></>}
          <label>Time zone<select value={timezone} onChange={(event) => setTimezone(event.target.value)}><option>Africa/Nairobi</option><option>UTC</option><option>Europe/London</option></select></label>
          <label>Reporting currency<select value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="KES">KES — Kenyan shilling</option><option value="USD">USD — US dollar</option><option value="EUR">EUR — Euro</option></select><small>Changing this value does not convert transaction amounts.</small></label>
          <label>Date format<select value={dateFormat} onChange={(event) => setDateFormat(event.target.value)}><option>DD MMM YYYY</option><option>YYYY-MM-DD</option><option>MM/DD/YYYY</option></select></label>
          {isSettings && <div className="settings-toggle-list"><label><span><Mail size={16}/><span><strong>Daily operational digest</strong><small>Preview preference for summary email notifications</small></span></span><input type="checkbox" checked={digestEnabled} onChange={(event) => setDigestEnabled(event.target.checked)}/></label><label><span><ShieldCheck size={16}/><span><strong>Exception notifications</strong><small>Preview preference for reconciliation review alerts</small></span></span><input type="checkbox" checked={exceptionAlerts} onChange={(event) => setExceptionAlerts(event.target.checked)}/></label></div>}
          <div className="settings-form-actions"><span><Clock3 size={14}/> Local preview · not saved</span><button className="button button--primary" type="submit"><Save size={15}/> Save preview changes</button></div>
        </form>
        {notice && <p className="settings-form-notice" role="status">{notice}</p>}
      </section>
    </>
  );
}
