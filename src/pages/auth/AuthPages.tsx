import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Fingerprint, LockKeyhole,
  Mail, ShieldCheck, Building2, AlertTriangle, Clock3, LifeBuoy,
  KeyRound, Smartphone, Users, BadgeCheck, Activity,
} from "lucide-react";
import "./auth.css";

export type AuthRoute =
  | "sign-in" | "create-account" | "verify-email" | "verify-email-expired"
  | "forgot-password" | "reset-password" | "password-updated" | "mfa-challenge"
  | "mfa-setup" | "mfa-verify-setup" | "mfa-recovery-codes" | "mfa-recovery"
  | "security-verify" | "accept-invite" | "invite-expired" | "invite-accepted"
  | "invite-invalid" | "account-pending" | "onboarding-organization" | "onboarding-setup"
  | "onboarding-status" | "onboarding-complete" | "onboarding-problem"
  | "session-expired" | "account-locked" | "access-denied" | "signed-out"
  | "not-found" | "server-error" | "sso" | "sso-callback" | "sso-settings" | "reauthenticate";

interface AuthPagesProps {
  route: AuthRoute;
  onNavigate: (route: AuthRoute | "dashboard") => void;
  onSignIn?: (email: string, password: string, tenantId: string) => Promise<void>;
}

const routeContent: Record<AuthRoute, { eyebrow: string; title: string; description: string; action?: string }> = {
  "sign-in": { eyebrow: "SECURE WORKSPACE ACCESS", title: "Welcome back.", description: "Sign in to review payments, reconcile transactions, and keep operations moving.", action: "Sign in to PesaGuard" },
  "create-account": { eyebrow: "GET STARTED", title: "Create your account.", description: "Create your user profile and prepare a workspace request for your organization.", action: "Create account" },
  "verify-email": { eyebrow: "VERIFY YOUR EMAIL", title: "Check your inbox.", description: "Confirm the email address associated with your PesaGuard account.", action: "Resend verification email" },
  "verify-email-expired": { eyebrow: "VERIFICATION LINK EXPIRED", title: "Let’s send a fresh link.", description: "For your protection, verification links are time-limited. Request a new one to continue.", action: "Request new link" },
  "forgot-password": { eyebrow: "ACCOUNT RECOVERY", title: "Reset your password.", description: "Enter your account email. If an account matches, the identity service can send recovery instructions.", action: "Send recovery instructions" },
  "reset-password": { eyebrow: "SECURE YOUR ACCOUNT", title: "Choose a new password.", description: "Use a unique passphrase that you do not use for another service.", action: "Update password" },
  "password-updated": { eyebrow: "PASSWORD UPDATED", title: "You’re back in control.", description: "If the identity service confirmed the change, use your new password to sign in.", action: "Continue to sign in" },
  "mfa-challenge": { eyebrow: "ADDITIONAL VERIFICATION", title: "Confirm it’s you.", description: "Enter the code from your configured authenticator or approved verification channel.", action: "Verify and continue" },
  "mfa-setup": { eyebrow: "ACCOUNT SECURITY", title: "Add an authenticator.", description: "Connect an authenticator app to add another layer of protection to your account.", action: "Continue setup" },
  "mfa-verify-setup": { eyebrow: "VERIFY AUTHENTICATOR", title: "Confirm your authenticator.", description: "Enter the current code from your authenticator to complete enrollment.", action: "Verify authenticator" },
  "mfa-recovery-codes": { eyebrow: "SAVE YOUR RECOVERY OPTIONS", title: "Prepare for account recovery.", description: "A real identity service should generate one-time recovery codes after secure MFA enrollment." },
  "mfa-recovery": { eyebrow: "MFA RECOVERY", title: "Recover secure access.", description: "Use an approved recovery method. Additional identity checks may be required.", action: "Continue recovery" },
  "security-verify": { eyebrow: "SECURITY CHECK", title: "Verify this sign-in.", description: "An additional check may be required when a sign-in looks unusual.", action: "Verify identity" },
  "accept-invite": { eyebrow: "TEAM INVITATION", title: "Join your organization.", description: "Review the invitation and continue with the account that was invited.", action: "Review invitation" },
  "invite-expired": { eyebrow: "INVITATION EXPIRED", title: "This invitation has expired.", description: "Ask an organization administrator to issue a new invitation.", action: "Back to sign in" },
  "invite-accepted": { eyebrow: "INVITATION STATUS", title: "Invitation already accepted.", description: "Sign in with the account that accepted this invitation to open your workspace.", action: "Sign in" },
  "invite-invalid": { eyebrow: "INVITATION UNAVAILABLE", title: "We can’t validate this invitation.", description: "It may be invalid, revoked, or intended for a different account. Ask your administrator for help.", action: "Back to sign in" },
  "account-pending": { eyebrow: "ACCESS REVIEW", title: "Your workspace request is pending.", description: "Access may remain limited until the organization and account checks are complete.", action: "Check status" },
  "onboarding-organization": { eyebrow: "WORKSPACE SETUP · 01", title: "Tell us about your organization.", description: "These details help prepare your reconciliation workspace.", action: "Continue to setup" },
  "onboarding-setup": { eyebrow: "WORKSPACE SETUP · 02", title: "Set up reconciliation.", description: "Choose the payment source and record system you plan to reconcile first.", action: "Review setup" },
  "onboarding-status": { eyebrow: "ONBOARDING PROGRESS", title: "Your workspace journey.", description: "Track the steps that must be confirmed before the dashboard is ready." },
  "onboarding-complete": { eyebrow: "ONBOARDING SUMMARY", title: "Your next step is ready.", description: "The dashboard handoff should happen only after the backend confirms access and tenant provisioning.", action: "Open dashboard preview" },
  "onboarding-problem": { eyebrow: "SETUP NEEDS ATTENTION", title: "We couldn’t finish setup.", description: "Your request may need another attempt or assistance from support. No live provisioning status is available in this preview.", action: "Review setup again" },
  "session-expired": { eyebrow: "SESSION ENDED", title: "Your session has expired.", description: "Sign in again to continue. Unsaved work may not be available.", action: "Sign in again" },
  "account-locked": { eyebrow: "ACCOUNT PROTECTION", title: "Sign-in is temporarily restricted.", description: "Repeated unsuccessful attempts can trigger protective controls. Follow your organization’s recovery process.", action: "Recover account" },
  "access-denied": { eyebrow: "ACCESS RESTRICTED", title: "You don’t have access to this page.", description: "Your current account or role may not have permission to open this resource.", action: "Return to sign in" },
  "signed-out": { eyebrow: "SIGNED OUT", title: "You’ve left your workspace.", description: "The preview does not maintain a real session. When connected, the identity service should revoke or end the active session.", action: "Sign in again" },
  "not-found": { eyebrow: "404 · PAGE NOT FOUND", title: "This page isn’t here.", description: "The address may be outdated or the page may have moved.", action: "Return to sign in" },
  "server-error": { eyebrow: "TEMPORARY PROBLEM", title: "Something didn’t load correctly.", description: "Try again in a moment. If the problem continues, contact support with the page you were opening.", action: "Try again" },
  "sso": { eyebrow: "ENTERPRISE IDENTITY", title: "Continue with your organization.", description: "Enter your organization domain to discover its configured identity provider.", action: "Continue with SSO" },
  "sso-callback": { eyebrow: "IDENTITY PROVIDER", title: "Complete organization sign-in.", description: "The identity provider response must be validated server-side before a session is created.", action: "Return to sign in" },
  "sso-settings": { eyebrow: "ENTERPRISE SECURITY", title: "Organization SSO settings.", description: "Connection settings and identity-provider metadata must be managed by authorized administrators." },
  "reauthenticate": { eyebrow: "CONFIRM YOUR IDENTITY", title: "Confirm before continuing.", description: "Re-enter your credentials before a sensitive account or security action.", action: "Confirm identity" },
};

function BrandMark() {
  return <span className="auth-brand__mark" aria-hidden="true"><ShieldCheck size={21} strokeWidth={1.9} /></span>;
}

function AuthLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="auth-inline-link" type="button" onClick={onClick}>{children}</button>;
}

function Field({ label, id, type = "text", placeholder, value, onChange, required = true, autoComplete, hint }: {
  label: string; id: string; type?: string; placeholder: string; value: string;
  onChange: (value: string) => void; required?: boolean; autoComplete?: string; hint?: string;
}) {
  return <label className="auth-field" htmlFor={id}><span>{label}</span><input id={id} name={id} type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} required={required} autoComplete={autoComplete} />{hint && <small>{hint}</small>}</label>;
}

export function AuthPages({ route, onNavigate, onSignIn }: AuthPagesProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [organizationType, setOrganizationType] = useState("SACCO");
  const [phone, setPhone] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [otp, setOtp] = useState("");
  const [domain, setDomain] = useState("");
  const [tenantId, setTenantId] = useState("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordSource, setRecordSource] = useState("Spreadsheet / CSV");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const [step, setStep] = useState(1);
  const content = routeContent[route];
  const passwordRoutes: AuthRoute[] = ["sign-in", "create-account", "reset-password", "reauthenticate"];
  const emailRoutes: AuthRoute[] = ["sign-in", "create-account", "verify-email", "verify-email-expired", "forgot-password", "accept-invite", "mfa-recovery"];
  const codeRoutes: AuthRoute[] = ["mfa-challenge", "mfa-verify-setup", "security-verify"];
  const formRoutes: AuthRoute[] = [
    "sign-in", "create-account", "verify-email", "verify-email-expired", "forgot-password", "reset-password",
    "mfa-challenge", "mfa-setup", "mfa-verify-setup", "mfa-recovery", "security-verify", "accept-invite",
    "onboarding-organization", "onboarding-setup", "sso", "reauthenticate",
  ];
  const infoRoutes: AuthRoute[] = [
    "password-updated", "mfa-recovery-codes", "invite-expired", "invite-accepted", "invite-invalid",
    "account-pending", "onboarding-status", "onboarding-complete", "onboarding-problem", "session-expired",
    "account-locked", "access-denied", "signed-out", "not-found", "server-error", "sso-callback", "sso-settings",
  ];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    if (route === "sign-in" && onSignIn) {
      setIsSubmitting(true);
      try {
        await onSignIn(email, password, tenantId);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Sign-in failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    if ((route === "reset-password" || route === "create-account") && password.length < 12) {
      setNotice("Use at least 12 characters for this password.");
      return;
    }
    if ((route === "reset-password" || route === "create-account") && password !== confirmPassword) {
      setNotice("The passwords do not match. Check both fields and try again.");
      return;
    }
    if (route === "onboarding-organization" && step === 1) {
      setStep(2);
      return;
    }
    const messages: Partial<Record<AuthRoute, string>> = {
      "sign-in": "Authentication is not configured for this page. No session was created.",
      "create-account": "Account registration is not yet connected to the live identity flow. No account was created.",
      "verify-email": "Email verification is not connected to this screen.",
      "verify-email-expired": "A new verification email was not sent.",
      "forgot-password": "Password recovery is not connected to this screen.",
      "reset-password": "The password was not changed; a valid server-verified reset token is required.",
      "mfa-challenge": "The MFA challenge is not connected to this screen.",
      "mfa-setup": "Authenticator enrollment is not connected to this screen.",
      "mfa-verify-setup": "The authenticator code was not checked.",
      "mfa-recovery": "Recovery has not been verified by the identity service.",
      "security-verify": "Identity verification is not connected to this screen.",
      "accept-invite": "The invitation was not accepted or validated.",
      "onboarding-organization": "Workspace details have not been submitted or saved.",
      "onboarding-setup": "Reconciliation preferences have not been saved.",
      "sso": "No identity provider discovery or redirect was performed.",
      "reauthenticate": "Credentials were not checked and no sensitive action was authorized.",
    };
    setNotice(messages[route] ?? "This action is not connected to a backend service.");
  }

  function primaryAction() {
    if (route === "password-updated" || route === "session-expired" || route === "signed-out" || route === "access-denied" || route === "not-found" || route === "server-error" || route === "invite-expired" || route === "invite-accepted" || route === "invite-invalid" || route === "sso-callback") onNavigate("sign-in");
    else if (route === "mfa-recovery-codes") onNavigate("sign-in");
    else if (route === "onboarding-complete") onNavigate("dashboard");
    else if (route === "onboarding-problem") onNavigate("onboarding-setup");
    else if (route === "account-pending" || route === "onboarding-status") setNotice("Preview only: live account and tenant status are not available.");
    else if (route === "account-locked") onNavigate("forgot-password");
    else if (route === "mfa-setup") onNavigate("mfa-verify-setup");
    else if (route === "sso-settings") onNavigate("sso");
    else if (route === "verify-email-expired") onNavigate("verify-email");
    else onNavigate("sign-in");
  }

  const showForm = formRoutes.includes(route);
  const showEmail = emailRoutes.includes(route);
  const showPasswordFields = passwordRoutes.includes(route);
  const titleIcon = route.startsWith("mfa") || route === "security-verify" ? <Fingerprint size={22} /> : route.startsWith("onboarding") ? <Building2 size={22} /> : route.startsWith("invite") || route === "accept-invite" ? <Users size={22} /> : route === "sso" || route === "sso-settings" ? <KeyRound size={22} /> : route === "account-locked" || route === "access-denied" || route === "reauthenticate" ? <LockKeyhole size={22} /> : route === "server-error" ? <AlertTriangle size={22} /> : route === "onboarding-status" ? <Activity size={22} /> : <ShieldCheck size={22} />;

  return (
    <main className="auth-page">
      <div className="auth-background-glow auth-background-glow--one" aria-hidden="true" />
      <div className="auth-background-glow auth-background-glow--two" aria-hidden="true" />
      <header className="auth-topbar">
        <button className="auth-brand" type="button" onClick={() => onNavigate("sign-in")} aria-label="PesaGuard home"><BrandMark /><span>PesaGuard</span></button>
        <span className="auth-topbar__help">Need help? <a href="mailto:hello@pesaguard.com">Contact support</a></span>
      </header>

      <section className="auth-main">
        <div className="auth-card">
          <div className="auth-card__icon" aria-hidden="true">{titleIcon}</div>
          <button className="auth-back" type="button" onClick={() => onNavigate("sign-in")}><ArrowLeft size={14} /> Back to sign in</button>
          <p className="auth-eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className="auth-description">{content.description}</p>

          {route === "verify-email" && <div className="auth-step-card"><span className="auth-step-card__icon"><Mail size={19} /></span><strong>Check your inbox</strong><p>Open the secure verification link sent to your email address.</p><span className="auth-step-card__meta"><Clock3 size={13} /> Email delivery is not enabled in this preview.</span></div>}
          {route === "mfa-setup" && <div className="auth-step-card"><span className="auth-step-card__icon"><Smartphone size={19} /></span><strong>Authenticator enrollment</strong><p>A connected backend should create a unique enrollment secret and QR code. No real secret is displayed in this preview.</p><span className="auth-step-card__meta"><LockKeyhole size={13} /> Never use a placeholder QR code for a real account.</span></div>}
          {route === "mfa-recovery-codes" && <div className="auth-step-card"><span className="auth-step-card__icon"><KeyRound size={19} /></span><strong>Recovery codes are not generated in preview</strong><p>Once connected, codes should be one-time use, displayed only after enrollment, and stored by the user in a safe place.</p><span className="auth-step-card__meta"><ShieldCheck size={13} /> Do not treat this screen as a source of real recovery codes.</span></div>}
          {route === "onboarding-status" && <div className="auth-status-list"><span><CheckCircle2 size={16} /> Account details <small>Preview step</small></span><span><Clock3 size={16} /> Email verification <small>Awaiting backend</small></span><span><Clock3 size={16} /> Organization review <small>Not connected</small></span><span><Clock3 size={16} /> Workspace provisioning <small>Not connected</small></span></div>}
          {route === "onboarding-complete" && <div className="auth-step-card"><span className="auth-step-card__icon"><BadgeCheck size={20} /></span><strong>Handoff is gated by backend confirmation</strong><p>This preview can demonstrate navigation, but production access must wait for a verified identity, tenant membership, and provisioning result.</p></div>}
          {route === "sso-settings" && <div className="auth-step-card"><span className="auth-step-card__icon"><KeyRound size={20} /></span><strong>No SSO connection configured in this preview</strong><p>Only authorized organization administrators should be able to change identity-provider settings.</p></div>}

          {showForm && <form className="auth-form" onSubmit={submit}>
            {route === "create-account" && <Field label="Full name" id="full-name" placeholder="Your full name" value={fullName} onChange={setFullName} autoComplete="name" />}
            {showEmail && <Field label={route === "onboarding-organization" ? "Work email" : "Email address"} id="email" type="email" placeholder="you@organization.co.ke" value={email} onChange={setEmail} autoComplete="email" />}
            {route === "sign-in" && <Field label="Workspace / tenant ID" id="tenant-id" placeholder="default or your assigned tenant ID" value={tenantId} onChange={setTenantId} hint="Use the tenant ID supplied by your PesaGuard administrator. It is not a password." />}
            {route === "accept-invite" && <Field label="Invitation token" id="invite-code" placeholder="Paste invitation token" value={inviteCode} onChange={setInviteCode} hint="Invitation tokens are validated by the server, never trusted from the browser." />}
            {codeRoutes.includes(route) && <Field label="Verification code" id="verification-code" placeholder="Enter your one-time code" value={otp} onChange={setOtp} autoComplete="one-time-code" hint="Codes are checked and rate-limited by the identity service when connected." />}
            {route === "sso" && <Field label="Organization domain" id="organization-domain" placeholder="organization.co.ke" value={domain} onChange={setDomain} hint="Enter the domain your organization uses for sign-in." />}
            {route === "onboarding-organization" && step === 1 && <>
              <Field label="Organization name" id="organization" placeholder="Registered organization name" value={organization} onChange={setOrganization} autoComplete="organization" />
              <label className="auth-field" htmlFor="organization-type"><span>Organization type</span><select id="organization-type" value={organizationType} onChange={(event) => setOrganizationType(event.target.value)}><option>SACCO</option><option>Merchant</option><option>Financial services</option><option>Other organization</option></select></label>
              <Field label="Business contact phone" id="phone" type="tel" placeholder="+254 7XX XXX XXX" value={phone} onChange={setPhone} autoComplete="tel" />
            </>}
            {route === "onboarding-organization" && step === 2 && <div className="auth-review-card"><strong>Review workspace details</strong><span>{organization || "Organization not entered"}</span><span>{organizationType} · {email || "Email not entered"}</span><span>{phone || "Phone not entered"}</span><button type="button" className="auth-text-button" onClick={() => setStep(1)}>Edit details</button></div>}
            {route === "onboarding-setup" && <>
              <label className="auth-field" htmlFor="payment-source"><span>Payment source</span><select id="payment-source" defaultValue="M-Pesa"><option>M-Pesa</option><option disabled>Airtel Money · Not available yet</option><option disabled>Bank feeds · Not available yet</option></select><small>M-Pesa is the currently scoped payment integration.</small></label>
              <label className="auth-field" htmlFor="record-source"><span>Internal record source</span><select id="record-source" value={recordSource} onChange={(event) => setRecordSource(event.target.value)}><option>Spreadsheet / CSV</option><option>Accounting export</option><option>POS export</option><option>Other ledger export</option></select></label>
            </>}
            {showPasswordFields && <label className="auth-field" htmlFor="password"><span>{route === "reset-password" ? "New password" : route === "reauthenticate" ? "Confirm password" : "Password"}</span><span className="auth-password-wrap"><input id="password" name="password" type={passwordVisible ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={route === "sign-in" || route === "reauthenticate" ? "Enter your password" : "At least 12 characters"} required minLength={route === "sign-in" || route === "reauthenticate" ? 1 : 12} autoComplete={route === "sign-in" ? "current-password" : "new-password"} /><button type="button" aria-label={passwordVisible ? "Hide password" : "Show password"} onClick={() => setPasswordVisible((value) => !value)}>{passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>{route !== "sign-in" && route !== "reauthenticate" && <small>Use 12 or more characters. Never reuse a password from another service.</small>}</label>}
            {(route === "create-account" || route === "reset-password") && <Field label="Confirm password" id="confirm-password" type={passwordVisible ? "text" : "password"} placeholder="Enter the same password again" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />}
            {route === "sign-in" && <div className="auth-form-row"><label className="auth-checkbox"><input type="checkbox" /> <span>Remember this device</span></label><AuthLink onClick={() => onNavigate("forgot-password")}>Forgot password?</AuthLink></div>}
            {route === "create-account" && <label className="auth-checkbox auth-checkbox--legal"><input type="checkbox" required /> <span>I agree to the <a href="https://pesaguard.co.ke/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="https://pesaguard.co.ke/privacy" target="_blank" rel="noreferrer">Privacy Notice</a>.</span></label>}
            {notice && <div className="auth-notice" role="status"><AlertTriangle size={16} /><span>{notice}</span></div>}
            <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in securely…" : route === "onboarding-organization" && step === 1 ? "Continue to setup" : content.action ?? "Continue"} <ArrowRight size={16} /></button>
            {route === "sign-in" ? <p className="auth-preview-note"><ShieldCheck size={14} /> Authentication uses the PesaGuard API. Access tokens stay in memory and are not written to browser storage.</p> : <p className="auth-preview-note"><ShieldCheck size={14} /> This workflow is not fully connected. No credentials are saved by this preview.</p>}
          </form>}

          {infoRoutes.includes(route) && <div className="auth-recovery">
            <span className="auth-recovery__icon">{route === "access-denied" || route === "account-locked" || route === "reauthenticate" ? <LockKeyhole size={22} /> : route === "server-error" ? <AlertTriangle size={22} /> : route === "session-expired" ? <Clock3 size={22} /> : route.startsWith("onboarding") ? <Building2 size={22} /> : route.startsWith("invite") ? <Users size={22} /> : <LifeBuoy size={22} />}</span>
            {route === "access-denied" && <p>Ask your workspace administrator to review your role and permissions. Do not attempt to bypass access controls.</p>}
            {route === "not-found" && <p>Check the URL, or return to sign in and open a page from your workspace navigation.</p>}
            {route === "server-error" && <p>No live server diagnostic is available in this frontend preview. Never share passwords, API keys, or payment secrets with support.</p>}
            {route === "session-expired" && <p>When connected, the identity service should safely revoke or expire sessions and preserve no secrets in client storage.</p>}
            {route === "account-locked" && <p>Use the official recovery process or contact your workspace administrator. Avoid repeated login attempts while restricted.</p>}
            {route.startsWith("invite-") && <p>Invitation status and membership must be validated server-side before access is granted.</p>}
            {route === "account-pending" && <p>Current review status is illustrative only. A live status must come from the onboarding service.</p>}
            {route === "onboarding-problem" && <p>Your submitted credentials are not stored here. You can return to setup or contact support for help.</p>}
            {route === "signed-out" && <p>When backend authentication is connected, this route should be reached only after the session is ended or revoked.</p>}
            {route === "sso-callback" && <p>Never accept identity claims from URL parameters alone. Validate issuer, audience, signature, state, nonce, and callback transaction server-side.</p>}
            {route === "password-updated" && <p>This preview cannot verify whether a password was changed. The live page should appear only after server confirmation.</p>}
            {route === "mfa-recovery-codes" && null}
            <button className="auth-submit" type="button" onClick={primaryAction}>{content.action ?? "Continue"} <ArrowRight size={16} /></button>
            {route !== "password-updated" && route !== "signed-out" && <button className="auth-secondary" type="button" onClick={() => onNavigate("sign-in")}>Return to sign in <ArrowLeft size={14} /></button>}
          </div>}

          {route === "sign-in" && <p className="auth-switch">New to PesaGuard? <AuthLink onClick={() => onNavigate("create-account")}>Create an account</AuthLink><span className="auth-switch__separator">·</span><AuthLink onClick={() => onNavigate("sso")}>Organization SSO</AuthLink></p>}
          {route === "create-account" && <p className="auth-switch">Already registered? <AuthLink onClick={() => onNavigate("sign-in")}>Sign in</AuthLink></p>}
          {route === "forgot-password" && <p className="auth-switch">Remember your password? <AuthLink onClick={() => onNavigate("sign-in")}>Back to sign in</AuthLink></p>}
          {route === "accept-invite" && <p className="auth-switch">Invitation tokens must be validated server-side before membership is granted.</p>}
          <footer className="auth-card__footer"><span>© 2026 PesaGuard</span><span><a href="https://pesaguard.co.ke/privacy" target="_blank" rel="noreferrer">Privacy</a><a href="https://pesaguard.co.ke/terms" target="_blank" rel="noreferrer">Terms</a><a href="https://status.pesaguard.co.ke" target="_blank" rel="noreferrer">Status</a></span></footer>
        </div>
        <p className="auth-main__trust"><LockKeyhole size={13} /> Built for accountable financial operations <span>·</span> Kenya and East Africa</p>
      </section>
      <div className="auth-bottom-note"><span><Activity size={13} /> PesaGuard access</span><span>Secure workspace entry</span></div>
    </main>
  );
}
