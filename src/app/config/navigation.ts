import {
  Activity,
  Bell,
  Building2,
  Cable,
  ChartNoAxesCombined,
  Code2,
  CreditCard,
  FileInput,
  FileText,
  GitCompareArrows,
  HeartPulse,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  UsersRound,
  WalletCards,
  Webhook,
  BriefcaseBusiness,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { DashboardPage } from "./routes";

export interface NavigationItem {
  label: string;
  page: DashboardPage;
  icon: LucideIcon;
  group: "Overview" | "Payments" | "Data & Integrations" | "Monitoring" | "People & Access" | "Settings" | "Support";
}

export const navigationItems: NavigationItem[] = [
  { label: "Dashboard overview", page: "home", icon: LayoutDashboard, group: "Overview" },
  { label: "Executive overview", page: "executive-overview", icon: BriefcaseBusiness, group: "Overview" },
  { label: "Operational activity", page: "operational-activity", icon: Workflow, group: "Overview" },
  { label: "Transactions", page: "transactions", icon: Activity, group: "Payments" },
  { label: "Reconciliation", page: "reconciliation", icon: GitCompareArrows, group: "Payments" },
  { label: "Exceptions", page: "exceptions", icon: TriangleAlert, group: "Payments" },
  { label: "Payments", page: "payments", icon: CreditCard, group: "Payments" },
  { label: "Settlements", page: "settlements", icon: WalletCards, group: "Payments" },
  { label: "Reports", page: "reports", icon: ChartNoAxesCombined, group: "Data & Integrations" },
  { label: "Data Imports", page: "data-imports", icon: FileInput, group: "Data & Integrations" },
  { label: "Integrations", page: "integrations", icon: Cable, group: "Data & Integrations" },
  { label: "Webhooks", page: "webhooks", icon: Webhook, group: "Data & Integrations" },
  { label: "Import & Sync Activity", page: "import-sync-activity", icon: FileText, group: "Data & Integrations" },
  { label: "Activity Log", page: "activity-log", icon: ScrollText, group: "Monitoring" },
  { label: "Security", page: "security", icon: ShieldCheck, group: "Monitoring" },
  { label: "System Health", page: "system-health", icon: HeartPulse, group: "Monitoring" },
  { label: "Customers", page: "customers", icon: UsersRound, group: "People & Access" },
  { label: "Team Members", page: "team-members", icon: UsersRound, group: "People & Access" },
  { label: "Roles & Permissions", page: "roles-permissions", icon: KeyRound, group: "People & Access" },
  { label: "Tenant Profile", page: "tenant-profile", icon: Building2, group: "Settings" },
  { label: "General Settings", page: "settings", icon: SlidersHorizontal, group: "Settings" },
  { label: "Notifications", page: "notifications", icon: Bell, group: "Settings" },
  { label: "Account & Authentication", page: "account-authentication", icon: KeyRound, group: "Settings" },
  { label: "Preferences", page: "preferences", icon: SlidersHorizontal, group: "Settings" },
  { label: "Help & Support", page: "help-support", icon: LifeBuoy, group: "Support" },
  { label: "API & Developer Resources", page: "api-developer-resources", icon: Code2, group: "Support" },
];
