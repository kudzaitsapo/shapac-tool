import { useState, useEffect } from "react";
import { useSqlPackage } from "../hooks/useSqlPackage";
import type { SqlConnection } from "../types";
import { listen } from "@tauri-apps/api/event";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  connection: SqlConnection | null;
}

export function ExportDialog({
  isOpen,
  onClose,
  connection,
}: ExportDialogProps) {
  const { exportBacpac, exporting, progress, error } = useSqlPackage();
  const [databaseName, setDatabaseName] = useState("");
  const [outputMessages, setOutputMessages] = useState<string[]>([]);
  const [showOutput, setShowOutput] = useState(false);

  // Listen for real-time export progress events
  useEffect(() => {
    if (!isOpen) return;

    const unlisten = listen<string>("export-progress", (event) => {
      setOutputMessages((prev) => [...prev, event.payload]);
      setShowOutput(true);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [isOpen]);

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setOutputMessages([]);
      setShowOutput(false);
    }
  }, [isOpen]);

  const handleExport = async () => {
    if (!connection?.id) return;

    const dbName =
      databaseName || connection.database_name || "database";

    try {
      await exportBacpac(connection.id, dbName);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (!isOpen || !connection) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Export Database</h2>
          <button className="close-btn" onClick={onClose} disabled={exporting}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p>
            <strong>Connection:</strong> {connection.name}
          </p>

          <div className="form-group">
            <label htmlFor="database-name">Database Name*</label>
            <input
              id="database-name"
              type="text"
              value={databaseName}
              onChange={(e) => setDatabaseName(e.target.value)}
              placeholder={
                connection.database_name ||
                "Enter database name to export"
              }
              disabled={exporting}
            />
          </div>

          {progress && !showOutput && (
            <div className={`progress-message ${error ? "error" : "success"}`}>
              {progress}
            </div>
          )}

          {/* Output Display */}
          {showOutput && (
            <div className="output-section">
              <h3 className="section-title">
                {exporting ? "Export Progress" : "Export Result"}
              </h3>
              <div className="output-console">
                {outputMessages.map((msg, idx) => (
                  <div key={idx} className="output-line">
                    {msg}
                  </div>
                ))}
                {exporting && (
                  <div className="output-line loading-line">
                    <span className="loading-spinner">⚡</span> Processing...
                  </div>
                )}
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={exporting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleExport}
            disabled={exporting || (!databaseName && !connection.database_name)}
          >
            {exporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
