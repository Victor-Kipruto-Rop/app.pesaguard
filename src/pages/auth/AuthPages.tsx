import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Eye, EyeOff,
  Fingerprint, LockKeyhole, Mail, ShieldCheck, Sparkles, Building2,
  AlertTriangle, Clock3, LifeBuoy,
} from "lucide-react";
import "./auth.css";

export type AuthRoute =
  | "sign-in" | "create-account" | "verify-email" | "forgot-password"
  | "reset-password" | "accept-invite" | "onboarding" | "mfa-challenge" | "session-expired"
  | "account-locked" | "invite-expired" | "access-denied" | "not-found" | "server-error";

interface AuthPagesProps {
  route: AuthRoute;
  onNavigate: (route: AuthRoute | "dashboard") => void;
}

const routeContent: Record<AuthRoute, { eyebrow: string; title: string; description: string }> = {
  "sign-in": { eyebrow: "WELCOME BACK", title: "Sign in to your workspace", description: "Access your payment operations and reconciliation workspace." },
  "create-account": { eyebrow: "GET STARTED", title: "Create your PesaGuard account", description: "Set up a workspace for your team. You can review details before requesting access." },
  "verify-email": { eyebrow: "EMAIL VERIFICATION", title: "Verify your email address", description: "A verified email helps protect your workspace and keeps account notices going to the right place." },
  "forgot-password": { eyebrow: "ACCOUNT RECOVERY", title: "Reset your password", description: "Enter the email address associated with your account to continue the recovery process." },
  "reset-password": { eyebrow: "SECURE YOUR ACCOUNT", title: "Choose a new password", description: "Use a unique password that you do not use for another service." },
  "accept-invite": { eyebrow: "TEAM INVITATION", title: "Join your team workspace", description: "Review the invitation details and continue through the secure account flow." },
  onboarding: { eyebrow: "WORKSPACE SETUP", title: "Let’s set up your workspace", description: "Tell us a little about your organization so the workspace can be configured correctly." },
  "mfa-challenge": { eyebrow: "ADDITIONAL VERIFICATION", title: "Confirm it’s you", description: "Enter the verification code from your configured authenticator or approved delivery channel." },
  "session-expired": { eyebrow: "SESSION ENDED", title: "Your session has expired", description: "Sign in again to continue. Unsaved work may not be available." },
  "account-locked": { eyebrow: "ACCOUNT PROTECTION", title: "Sign-in temporarily restricted", description: "Your account may be temporarily locked after repeated unsuccessful sign-in attempts." },
  "invite-expired": { eyebrow: "INVITATION EXPIRED", title: "This invitation is no longer valid", description: "Ask a workspace administrator to issue a new invitation through the verified access workflow." },
  "access-denied": { eyebrow: "ACCESS RESTRICTED", title: "You don’t have access to this page", description: "Your current account or role may not have permission to open this resource." },
  "not-found": { eyebrow: "PAGE NOT FOUND", title: "We can’t find that page", description: "The address may be outdated or the page may have moved." },
  "server-error": { eyebrow: "TEMPORARY PROBLEM", title: "Something didn’t load correctly", description: "Try again in a moment. If the problem continues, contact support with the page you were opening." },
};

function BrandMark() {
  return <span className="auth-brand__mark" aria-hidden="true"><ShieldCheck size={23} strokeWidth={1.9} /></span>;
}

function AuthLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="auth-inline-link" type="button" onClick={onClick}>{children}</button>;
}

function Field({ label, id, type = "text", placeholder, value, onChange, required = true, autoComplete }: {
  label: string; id: string; type?: string; placeholder: string; value: string;
  onChange: (value: string) => void; required?: boolean; autoComplete?: string;
}) {
  return <label className="auth-field" htmlFor={id}><span>{label}</span><input id={id} name={id} type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} required={required} autoComplete={autoComplete} /></label>;
}

export function AuthPages({ route, onNavigate }: AuthPagesProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [organizationType, setOrganizationType] = useState("SACCO");
  const [phone, setPhone] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [step, setStep] = useState(1);
  const content = routeContent[route];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    if ((route === "reset-password" || route === "create-account") && password.length < 12) {
      setNotice("Use at least 12 characters for this password.");
      return;
    }
    if ((route === "reset-password" || route === "create-account") && password !== confirmPassword) {
      setNotice("The passwords do not match. Check both fields and try again.");
      return;
    }
    if (route === "onboarding" && step === 1) {
      setStep(2);
      return;
    }
    const messages: Partial<Record<AuthRoute, string>> = {
      "sign-in": "Preview only: authentication is not connected, so no sign-in session was created.",
      "mfa-challenge": "Preview only: the verification code was not checked and no authentication challenge was completed.",
      "create-account": "Preview only: no account was created. Connect the verified identity service to enable registration.",
      "verify-email": "Preview only: verification email delivery is not connected.",
      "forgot-password": "Preview only: password recovery email delivery is not connected.",
      "reset-password": "Preview only: the password was not changed. Connect the secure server-side reset-token flow.",
      "accept-invite": "Preview only: the invitation has not been accepted. Invitation validation is not connected.",
      onboarding: "Preview only: your details have not been submitted or saved.",
    };
    setNotice(messages[route] ?? "This action is not connected in the current preview.");
  }

  const formRoutes: AuthRoute[] = ["sign-in", "create-account", "verify-email", "forgot-password", "reset-password", "accept-invite", "onboarding", "mfa-challenge"];
  const showForm = formRoutes.includes(route);
  const showEmail = ["sign-in", "create-account", "verify-email", "forgot-password", "accept-invite", "onboarding"].includes(route);
  const showPasswordFields = ["sign-in", "create-account", "reset-password"].includes(route);

  return (
    <main className="auth-page">
      <aside className="auth-story" aria-label="PesaGuard product introduction">
        <button className="auth-brand" type="button" onClick={() => onNavigate("sign-in")}><BrandMark /><span>PesaGuard</span></button>
        <div className="auth-story__content">
          <span className="auth-story__eyebrow"><Sparkles size={14} /> FINANCIAL OPERATIONS, WITH CLARITY</span>
          <h2>Know what cleared.<br /><span>Know what needs attention.</span></h2>
          <p>One workspace for payment visibility, reconciliation workflows, and accountable financial operations.</p>
          <div className="auth-story__diagram" aria-label="Illustration of a reconciliation workflow">
            <div className="auth-diagram__source"><span className="auth-diagram__icon"><Building2 size={18} /></span><span><strong>Payment sources</strong><small>Verified transaction records</small></span><CheckCircle2 size={16} /></div>
            <div className="auth-diagram__connector"><span /><span /><span /></div>
            <div className="auth-diagram__source auth-diagram__source--active"><span className="auth-diagram__icon"><Fingerprint size={18} /></span><span><strong>Reconciliation</strong><small>Match, review, resolve</small></span><ArrowRight size={16} /></div>
            <div className="auth-diagram__connector"><span /><span /><span /></div>
            <div className="auth-diagram__outcomes"><span><i className="auth-dot auth-dot--green" />Matched</span><span><i className="auth-dot auth-dot--amber" />Needs review</span><span><i className="auth-dot auth-dot--red" />Exceptions</span></div>
          </div>
        </div>
        <div className="auth-story__footer"><span><LockKeyhole size={13} /> Designed for accountable operations</span><span>Kenya · East Africa</span></div>
      </aside>

      <section className="auth-panel">
        <header className="auth-panel__top"><span className="auth-panel__mobile-brand"><BrandMark /> PesaGuard</span><span>Need help? <a href="mailto:hello@pesaguard.com">Contact support</a></span></header>
        <div className="auth-card">
          <button className="auth-back" type="button" onClick={() => onNavigate(route === "not-found" || route === "access-denied" || route === "server-error" ? "sign-in" : "sign-in")}><ArrowLeft size={15} /> Back to sign in</button>
          <p className="auth-eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className="auth-description">{content.description}</p>

          {route === "verify-email" && <div className="auth-step-card"><span className="auth-step-card__icon"><Mail size={20} /></span><strong>Check your inbox</strong><p>Look for a verification message from PesaGuard. Use the original secure link to confirm your address.</p><span className="auth-step-card__meta"><Clock3 size={13} /> Verification delivery is not enabled in this preview.</span></div>}

          {showForm && (
            <form className="auth-form" onSubmit={submit}>
              {route === "create-account" && <Field label="Full name" id="full-name" placeholder="Your full name" value={fullName} onChange={setFullName} autoComplete="name" />}
              {showEmail && <Field label={route === "onboarding" ? "Work email" : "Email address"} id="email" type="email" placeholder="you@organization.co.ke" value={email} onChange={setEmail} autoComplete="email" />}
              {route === "accept-invite" && <Field label="Invitation code" id="invite-code" placeholder="Paste your invitation code" value={inviteCode} onChange={setInviteCode} />}
              {route === "mfa-challenge" && <Field label="Verification code" id="verification-code" placeholder="Enter your one-time code" value={otp} onChange={setOtp} autoComplete="one-time-code" />}
              {showPasswordFields && <label className="auth-field" htmlFor="password"><span>{route === "reset-password" ? "New password" : "Password"}</span><span className="auth-password-wrap"><input id="password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={route === "sign-in" ? "Enter your password" : "At least 12 characters"} required minLength={route === "sign-in" ? 1 : 12} autoComplete={route === "sign-in" ? "current-password" : "new-password"} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>{route !== "sign-in" && <small>Use 12 or more characters. Never reuse a password from another service.</small>}</label>}
              {(route === "create-account" || route === "reset-password") && <Field label="Confirm password" id="confirm-password" type={showPassword ? "text" : "password"} placeholder="Enter the same password again" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />}
              {route === "onboarding" && step === 1 && <><Field label="Organization name" id="organization" placeholder="Registered organization name" value={organization} onChange={setOrganization} /><label className="auth-field" htmlFor="organization-type"><span>Organization type</span><select id="organization-type" value={organizationType} onChange={(event) => setOrganizationType(event.target.value)}><option>SACCO</option><option>Merchant</option><option>Financial services</option><option>Other organization</option></select></label><Field label="Business contact phone" id="phone" type="tel" placeholder="+254 7XX XXX XXX" value={phone} onChange={setPhone} autoComplete="tel" /></>}
              {route === "onboarding" && step === 2 && <div className="auth-review-card"><strong>Review workspace request</strong><span>{organization || "Organization not entered"}</span><span>{organizationType} · {email || "Email not entered"}</span><span>{phone || "Phone not entered"}</span><p>Submitting will not create a live tenant until the onboarding service is connected.</p><button type="button" className="auth-text-button" onClick={() => setStep(1)}>Edit details</button></div>}
              {route === "sign-in" && <div className="auth-form-row"><label className="auth-checkbox"><input type="checkbox" /> <span>Remember this device</span></label><AuthLink onClick={() => onNavigate("forgot-password")}>Forgot password?</AuthLink></div>}
              {route === "create-account" && <label className="auth-checkbox auth-checkbox--legal"><input type="checkbox" required /> <span>I agree to the <a href="https://pesaguard.co.ke/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="https://pesaguard.co.ke/privacy" target="_blank" rel="noreferrer">Privacy Notice</a>.</span></label>}
              {notice && <div className="auth-notice" role="status"><AlertTriangle size={16} /><span>{notice}</span></div>}
              <button className="auth-submit" type="submit">{route === "sign-in" ? "Sign in" : route === "create-account" ? "Create account" : route === "verify-email" ? "Resend verification email" : route === "forgot-password" ? "Send recovery instructions" : route === "reset-password" ? "Set new password" : route === "accept-invite" ? "Review invitation" : route === "mfa-challenge" ? "Verify code" : step === 1 ? "Review workspace" : "Submit workspace request"} <ArrowRight size={16} /></button>
              <p className="auth-preview-note"><ShieldCheck size={14} /> Preview interface only. No credentials are sent or saved.</p>
            </form>
          )}

          {!showForm && (
            <div className="auth-recovery">
              <span className="auth-recovery__icon">{route === "access-denied" ? <LockKeyhole size={22} /> : route === "server-error" ? <AlertTriangle size={22} /> : <LifeBuoy size={22} />}</span>
              {route === "access-denied" && <p>Ask your workspace administrator to review your role and access permissions. Do not try to bypass access controls.</p>}
              {route === "not-found" && <p>Check the URL, or return to sign in and open a page from your workspace navigation.</p>}
              {route === "server-error" && <p>No live server diagnostic is available from this frontend preview. Avoid sharing passwords, API keys, or payment secrets with support.</p>}
              {route === "session-expired" && <p>For your security, continue by signing in again. This preview does not maintain a real authenticated session.</p>}
              {route === "account-locked" && <p>Use the official recovery process or contact your workspace administrator. Do not repeatedly retry credentials while the account is restricted.</p>}
              {route === "invite-expired" && <p>Invitation tokens must be checked server-side, expire according to policy and never grant access after expiry.</p>}
              {route === "mfa-challenge" && <p>Never share a one-time code with another person. The real identity service must validate the challenge and enforce expiry and attempt limits.</p>}
              <button className="auth-submit" type="button" onClick={() => onNavigate("sign-in")}>Return to sign in <ArrowRight size={16} /></button>
              <button className="auth-secondary" type="button" onClick={() => onNavigate("dashboard")}>Open dashboard preview <ChevronRight size={15} /></button>
            </div>
          )}

          {route === "sign-in" && <p className="auth-switch">New to PesaGuard? <AuthLink onClick={() => onNavigate("create-account")}>Create an account</AuthLink></p>}
          {route === "create-account" && <p className="auth-switch">Already have an account? <AuthLink onClick={() => onNavigate("sign-in")}>Sign in</AuthLink></p>}
          {route === "forgot-password" && <p className="auth-switch">Remember your password? <AuthLink onClick={() => onNavigate("sign-in")}>Back to sign in</AuthLink></p>}
          {route === "reset-password" && <p className="auth-switch">Reset links must be verified by the identity service before a password can change.</p>}
          {route === "accept-invite" && <p className="auth-switch">Invitations expire and must be validated server-side before membership is granted.</p>}
        </div>
        <footer className="auth-panel__footer"><span>© 2026 PesaGuard</span><span><a href="https://pesaguard.co.ke/privacy" target="_blank" rel="noreferrer">Privacy</a><a href="https://pesaguard.co.ke/terms" target="_blank" rel="noreferrer">Terms</a><a href="https://status.pesaguard.co.ke" target="_blank" rel="noreferrer">Service status</a></span></footer>
      </section>
    </main>
  );
}
