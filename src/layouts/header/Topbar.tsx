import { Bell, ChevronDown, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Workspace } from "../../types/dashboard";

interface TopbarProps {
  workspace: Workspace;
  workspaces: Workspace[];
  onWorkspaceChange: (workspace: Workspace) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onSearch: (query: string) => void;
  onOpenMenu: () => void;
  isLiveData?: boolean;
  onSignOut?: () => void;
}

export function Topbar({ workspace, workspaces, onWorkspaceChange, isDark, onToggleTheme, onSearch, onOpenMenu, isLiveData = false, onSignOut }: TopbarProps) {
  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setWorkspaceMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(query.trim());
  }

  return (
    <header className="topbar">
      <button className="icon-button topbar__mobile-menu" type="button" aria-label="Open navigation menu" onClick={onOpenMenu}>
        <Menu size={19} />
      </button>
      <form className="topbar__search" role="search" onSubmit={submitSearch}>
        <Search size={17} aria-hidden="true" />
        <label className="visually-hidden" htmlFor="global-search">Search customers or transactions</label>
        <input
          ref={searchRef}
          id="global-search"
          type="search"
          placeholder="Search customers, transactions..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <kbd aria-hidden="true">⌘ K</kbd>
      </form>
      <div className="topbar__right">
        <span className="topbar__environment"><i aria-hidden="true" /> {isLiveData ? "Live tenant" : "Sandbox"}</span>
        <button
          className="icon-button theme-toggle"
          type="button"
          aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
          aria-pressed={isDark}
          title={`Switch to ${isDark ? "light" : "dark"} theme`}
          onClick={onToggleTheme}
        >
          {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>
        <div className="notification-wrap">
          <button
            className="icon-button notification-button"
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell size={18} />
          </button>
          {notificationsOpen && (
            <div className="notification-popover" role="status">
              <strong>Notifications</strong>
              <p>This preview workspace has no live alerts.</p>
              <span>Sample activity is not connected to a payment service.</span>
            </div>
          )}
        </div>
        <span className="topbar__divider" aria-hidden="true" />
        <div className="workspace-switcher">
          <button
            className="topbar__profile"
            type="button"
            title={isLiveData ? "Authenticated tenant workspace" : "Switch preview workspace"}
            aria-label={isLiveData ? `Authenticated tenant: ${workspace.name}` : `Workspace: ${workspace.name}. Switch workspace`}
            aria-haspopup="listbox"
            aria-expanded={workspaceMenuOpen}
            onClick={() => setWorkspaceMenuOpen((open) => !open)}
          >
            <span className="avatar avatar--profile">{workspace.initials}</span>
            <span className="topbar__profile-copy"><strong>{workspace.name}</strong><small>{isLiveData ? "Authenticated tenant" : "Preview workspace"}</small></span>
            {!isLiveData && <ChevronDown size={15} aria-hidden="true" />}
          </button>
          {workspaceMenuOpen && !isLiveData && (
            <div className="workspace-switcher__menu" role="listbox" aria-label="Preview workspaces">
              <span className="workspace-switcher__label">SWITCH WORKSPACE</span>
              {workspaces.map((option) => (
                <button
                  key={option.id}
                  className="workspace-switcher__option"
                  type="button"
                  role="option"
                  aria-selected={option.id === workspace.id}
                  onClick={() => {
                    onWorkspaceChange(option);
                    setWorkspaceMenuOpen(false);
                  }}
                >
                  <span className="workspace-card__avatar">{option.initials}</span>
                  <span><strong>{option.name}</strong><small>{option.category} · preview only</small></span>
                  {option.id === workspace.id && <span className="workspace-switcher__selected">Current</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        {isLiveData && onSignOut && <button className="icon-button" type="button" aria-label="Sign out of PesaGuard" title="Sign out" onClick={onSignOut}><LogOut size={17} aria-hidden="true" /></button>}
      </div>
    </header>
  );
}
