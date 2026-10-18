import { FlaskConical, Info, ShieldCheck } from "lucide-react";

export function PreviewBanner({ isLiveData = false }: { isLiveData?: boolean }) {
  return (
    <div className="preview-banner" role="note">
      {isLiveData ? <ShieldCheck size={16} aria-hidden="true" /> : <FlaskConical size={16} aria-hidden="true" />}
      <span>{isLiveData
        ? <><strong>Live tenant session</strong> Transaction records are loaded from the authenticated API and remain read-only here. Customer, risk, reporting, and other modules may still be preview or empty until their tenant APIs are connected.</>
        : <><strong>Dashboard preview</strong> This workspace uses sample records. Sign in to load transactions from your authenticated tenant API.</>}</span>
      <Info size={15} aria-hidden="true" />
    </div>
  );
}
