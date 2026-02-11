import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  onNewConnection: () => void;
  onImport: () => void;
  onSettings: () => void;
}

export function Layout({ children, onNewConnection, onImport, onSettings }: LayoutProps) {
  return (
    <div className="layout">
      <header className="header">
        <h1>⚡ Shapac SQL Tool</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={onSettings}>
            ⚙️ Settings
          </button>
          <button className="btn-secondary" onClick={onImport}>
            📥 Import
          </button>
          <button className="btn-primary" onClick={onNewConnection}>
            ➕ New Connection
          </button>
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}
