import { useState } from "react";
import type { SqlConnection } from "../types";
import { buildConnectionString } from "../utils/connectionString";

interface ConnectionCardProps {
  connection: SqlConnection;
  onEdit: (connection: SqlConnection) => void;
  onDelete: (id: number) => void;
  onExport: (connection: SqlConnection) => void;
}

export function ConnectionCard({
  connection,
  onEdit,
  onDelete,
  onExport,
}: ConnectionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyConnectionString = async () => {
    try {
      const connectionString = buildConnectionString(connection);
      await navigator.clipboard.writeText(connectionString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy connection string:", error);
      alert("Failed to copy connection string to clipboard");
    }
  };
  return (
    <div className="connection-card">
      <div className="card-header">
        <h3>{connection.name}</h3>
      </div>
      <div className="card-body">
        <div className="info-row">
          <span className="label">🖥️ Server</span>
          <span className="value">{connection.server}</span>
        </div>
        {connection.database_name && (
          <div className="info-row">
            <span className="label">💾 Database</span>
            <span className="value">{connection.database_name}</span>
          </div>
        )}
        {connection.username && (
          <div className="info-row">
            <span className="label">👤 User</span>
            <span className="value">{connection.username}</span>
          </div>
        )}
        {connection.use_windows_auth && (
          <div className="info-row">
            <span className="label">🔐 Auth</span>
            <span className="value">Windows Authentication</span>
          </div>
        )}
      </div>
      <div className="card-actions">
        <button
          className="btn-secondary"
          onClick={handleCopyConnectionString}
          title="Copy connection string to clipboard"
        >
          {copied ? "✅ Copied!" : "📋 Copy"}
        </button>
        <button
          className="btn-secondary"
          onClick={() => onExport(connection)}
        >
          📤 Export
        </button>
        <button className="btn-secondary" onClick={() => onEdit(connection)}>
          ✏️ Edit
        </button>
        <button
          className="btn-danger"
          onClick={() => {
            if (
              connection.id &&
              confirm(
                `Are you sure you want to delete "${connection.name}"?`
              )
            ) {
              onDelete(connection.id);
            }
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
