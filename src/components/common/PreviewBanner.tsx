import { FlaskConical, Info } from "lucide-react";

export function PreviewBanner() {
  return (
    <div className="preview-banner" role="status">
      <FlaskConical size={16} aria-hidden="true" />
      <span><strong>Preview workspace</strong> Sample data only — no live payments or customer records.</span>
      <Info size={15} aria-hidden="true" />
    </div>
  );
}
