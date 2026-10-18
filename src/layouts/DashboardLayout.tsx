import { useEffect, useState, type ReactNode } from "react";
import type { DashboardPage } from "../app/config/routes";
import { PreviewBanner } from "../components/common/PreviewBanner";
import { ApiConnectionStatus } from "../components/common/ApiConnectionStatus";
import { Topbar } from "./header/Topbar";
import { Sidebar } from "./navigation/Sidebar";
import type { Workspace } from "../types/dashboard";

function readStoredTheme(): boolean {
  try {
    const isDark = window.localStorage.getItem("pesaguard-dashboard-theme") !== "light";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    return isDark;
  } catch {
    document.documentElement.dataset.theme = "dark";
    return true;
  }
}

interface DashboardLayoutProps {
  activePage: DashboardPage;
  workspace: Workspace;
  workspaces: Workspace[];
  onWorkspaceChange: (workspace: Workspace) => void;
  onNavigate: (page: DashboardPage) => void;
  onSearch: (query: string) => void;
  children: ReactNode;
  isLiveData?: boolean;
  onSignOut?: () => void;
}

export function DashboardLayout({ activePage, workspace, workspaces, onWorkspaceChange, onNavigate, onSearch, children, isLiveData = false, onSignOut }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    try {
      window.localStorage.setItem("pesaguard-dashboard-theme", isDark ? "dark" : "light");
    } catch {
      // The active theme still applies for this session when storage is unavailable.
    }
  }, [isDark]);

  function navigate(page: DashboardPage) {
    onNavigate(page);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className={`dashboard-shell${collapsed ? " dashboard-shell--collapsed" : ""}`}>
      <Sidebar
        activePage={activePage}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        workspace={workspace}
        onNavigate={navigate}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="dashboard-main">
        <PreviewBanner isLiveData={isLiveData} />
        <ApiConnectionStatus />
        <Topbar
          workspace={workspace}
          workspaces={workspaces}
          onWorkspaceChange={onWorkspaceChange}
          isDark={isDark}
          onToggleTheme={() => setIsDark((theme) => !theme)}
          onSearch={onSearch}
          onOpenMenu={() => setMobileOpen(true)}
          isLiveData={isLiveData}
          onSignOut={onSignOut}
        />
        <main id="main-content" className="page-content">
          {children}
        </main>
        <footer className="app-footer">
          <span>© 2026 PesaGuard</span>
          <span>Secure payments. Clear operations.</span>
        </footer>
      </div>
    </div>
  );
}
