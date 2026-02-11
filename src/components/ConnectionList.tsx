import { useEffect } from "react";
import { useConnections } from "../hooks/useConnections";
import { ConnectionCard } from "./ConnectionCard";
import type { SqlConnection } from "../types";

interface ConnectionListProps {
  onEdit: (connection: SqlConnection) => void;
  onExport: (connection: SqlConnection) => void;
}

export function ConnectionList({
  onEdit,
  onExport,
}: ConnectionListProps) {
  const {
    connections,
    loading,
    error,
    refreshConnections,
    deleteConnection,
  } = useConnections();

  useEffect(() => {
    refreshConnections();
  }, [refreshConnections]);

  if (loading && connections.length === 0) {
    return <div className="loading">Loading connections...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (connections.length === 0) {
    return (
      <div className="empty-state">
        <p>No connections yet.</p>
        <p>Click "+ New Connection" to add your first SQL Server connection.</p>
      </div>
    );
  }

  return (
    <div className="connections-grid">
      {connections.map((connection) => (
        <ConnectionCard
          key={connection.id}
          connection={connection}
          onEdit={onEdit}
          onDelete={deleteConnection}
          onExport={onExport}
        />
      ))}
    </div>
  );
}
