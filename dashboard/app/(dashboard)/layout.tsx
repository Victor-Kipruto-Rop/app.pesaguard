import { AppShell } from "@/components/shell/AppShell";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}