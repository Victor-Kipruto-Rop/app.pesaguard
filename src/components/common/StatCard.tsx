import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone?: "green" | "blue" | "amber" | "purple";
}

export function StatCard({ label, value, change, icon: Icon, tone = "green" }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${tone}`} aria-hidden="true">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__change"><span aria-hidden="true">↗</span> {change} <span className="stat-card__period">vs last month</span></p>
    </article>
  );
}
