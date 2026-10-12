import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { navigationItems } from "../../app/config/navigation";
import { pathForPage, type DashboardPage } from "../../app/config/routes";
import type { Workspace } from "../../types/dashboard";

interface SidebarProps {
  activePage: DashboardPage;
  collapsed: boolean;
  mobileOpen: boolean;
  workspace: Workspace;
  onNavigate: (page: DashboardPage) => void;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({
  activePage,
  collapsed,
  mobileOpen,
  workspace,
  onNavigate,
  onToggleCollapsed,
  onCloseMobile,
}: SidebarProps) {
  const groups = [...new Set(navigationItems.map((item) => item.group))];

  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation menu"
          onClick={onCloseMobile}
        />
      )}
      <aside className={`sidebar${collapsed ? " sidebar--collapsed" : ""}${mobileOpen ? " sidebar--open" : ""}`}>
        <a className="sidebar__brand" href="/" onClick={(event) => { event.preventDefault(); onNavigate("home"); }}>
          <img src="/logo-mark.svg" alt="" width="34" height="34" />
          {!collapsed && <span>Pesa<span className="sidebar__brand-accent">Guard</span></span>}
        </a>

        {!collapsed && (
          <div className="workspace-card">
            <span className="workspace-card__avatar">{workspace.initials}</span>
            <span className="workspace-card__copy"><strong>{workspace.name}</strong><small>{workspace.category} workspace</small></span>
            <span className="workspace-card__dot" aria-label="Preview workspace" />
          </div>
        )}

        <nav className="sidebar__nav" aria-label="Main navigation">
          {groups.map((group) => (
            <div className="sidebar__group" key={group}>
              {!collapsed && <p className="sidebar__group-label">{group}</p>}
              {navigationItems.filter((item) => item.group === group).map(({ label, page, icon: Icon }) => (
                <a
                  key={page}
                  className={`sidebar__link${activePage === page ? " sidebar__link--active" : ""}`}
                  href={pathForPage(page)}
                  aria-current={activePage === page ? "page" : undefined}
                  title={collapsed ? label : undefined}
                  onClick={(event) => { event.preventDefault(); onNavigate(page); onCloseMobile(); }}
                >
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  {!collapsed && <span>{label}</span>}
                </a>
              ))}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="sidebar__help">
            <span className="sidebar__help-icon" aria-hidden="true">?</span>
            <div><strong>Need a hand?</strong><span>Our team is here to help.</span></div>
            <a href="https://pesaguard.co.ke/contact" target="_blank" rel="noreferrer">Contact</a>
          </div>
        )}

        <div className="sidebar__footer">
          <button
            className="sidebar__collapse"
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={onToggleCollapsed}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            {!collapsed && <span>Collapse menu</span>}
          </button>
          {!collapsed && <span className="sidebar__version"><LogOut size={14} aria-hidden="true" /> Tenant workspace</span>}
        </div>
      </aside>
    </>
  );
}
