import { FlaskConical, Info } from "lucide-react";

export function PreviewBanner() {
  return (
    <div className="preview-banner" role="note">
      <FlaskConical size={16} aria-hidden="true" />
      <span><strong>Dashboard preview</strong> Operational records and metrics remain sample data until authenticated tenant APIs are connected.</span>
      <Info size={15} aria-hidden="true" />
    </div>
  );
}
