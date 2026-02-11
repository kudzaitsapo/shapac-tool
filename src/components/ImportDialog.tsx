import { useState, useEffect } from "react";
import { useConnections } from "../hooks/useConnections";
import { useSqlPackage } from "../hooks/useSqlPackage";
import { listen } from "@tauri-apps/api/event";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const { connections, refreshConnections } = useConnections();
  const {
    importBacpac,
    importBacpacWithDetails,
    importing,
    progress,
    error,
    selectBacpacFile,
  } = useSqlPackage();

  // Source configuration
  const [sourceType, setSourceType] = useState<"bacpac" | "connection" | "url">(
    "bacpac",
  );
  const [sourceBacpacPath, setSourceBacpacPath] = useState("");
  const [sourceConnectionId, setSourceConnectionId] = useState<number | "">("");
  const [sourceConnectionString, setSourceConnectionString] = useState("");

  // Target configuration (for BACPAC source)
  const [bacpacTargetType, setBacpacTargetType] = useState<
    "connection" | "details"
  >("connection");

  // Target configuration (for connection/url sources)
  const [targetType, setTargetType] = useState<"details" | "connection_string">(
    "details",
  );
  const [targetConnectionId, setTargetConnectionId] = useState<number | "">("");
  const [targetDatabase, setTargetDatabase] = useState("");

  // Target details (when targetType is "details")
  const [targetServer, setTargetServer] = useState("");
  const [targetPort, setTargetPort] = useState("");
  const [targetUsername, setTargetUsername] = useState("");
  const [targetPassword, setTargetPassword] = useState("");
  const [targetUseWindowsAuth, setTargetUseWindowsAuth] = useState(false);
  const [targetEncrypt, setTargetEncrypt] = useState(true);
  const [targetTrustServerCert, setTargetTrustServerCert] = useState(true);

  // Target connection string (when targetType is "connection_string")
  const [targetConnectionString, setTargetConnectionString] = useState("");

  // Output display
  const [outputMessages, setOutputMessages] = useState<string[]>([]);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      setSourceType("bacpac");
      setSourceBacpacPath("");
      setSourceConnectionId("");
      setSourceConnectionString("");
      setBacpacTargetType("connection");
      setTargetType("details");
      setTargetConnectionId("");
      setTargetDatabase("");
      setTargetServer("");
      setTargetPort("");
      setTargetUsername("");
      setTargetPassword("");
      setTargetUseWindowsAuth(false);
      setTargetEncrypt(true);
      setTargetTrustServerCert(true);
      setTargetConnectionString("");
      setOutputMessages([]);
      setShowOutput(false);
      // Fetch connections
      refreshConnections();
    }
  }, [isOpen, refreshConnections]);

  useEffect(() => {
    if (progress) {
      setOutputMessages((prev) => [...prev, progress]);
      setShowOutput(true);
    }
  }, [progress]);

  // Listen for real-time import progress events
  useEffect(() => {
    if (!isOpen) return;

    const unlisten = listen<string>("import-progress", (event) => {
      setOutputMessages((prev) => [...prev, event.payload]);
      setShowOutput(true);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [isOpen]);

  const handleSelectBacpac = async () => {
    const path = await selectBacpacFile();
    if (path) {
      setSourceBacpacPath(path);
    }
  };

  const handleImport = async () => {
    if (sourceType === "bacpac" && !sourceBacpacPath) {
      alert("Please select a BACPAC file");
      return;
    }

    if (sourceType === "connection" && !sourceConnectionId) {
      alert("Please select a source connection");
      return;
    }

    if (sourceType === "url" && !sourceConnectionString) {
      alert("Please enter a source connection string");
      return;
    }

    // For BACPAC source, validate based on target type
    if (sourceType === "bacpac") {
      if (!targetDatabase) {
        alert("Please enter a target database name");
        return;
      }

      if (bacpacTargetType === "connection") {
        if (!targetConnectionId) {
          alert("Please select a target connection");
          return;
        }
      } else if (bacpacTargetType === "details") {
        if (!targetServer) {
          alert("Please enter a target server");
          return;
        }
      }
    } else {
      // For connection/url sources
      if (!targetDatabase) {
        alert("Please enter a target database name");
        return;
      }

      if (targetType === "details" && !targetServer) {
        alert("Please enter a target server");
        return;
      }

      if (targetType === "connection_string" && !targetConnectionString) {
        alert("Please enter a target connection string");
        return;
      }
    }

    const confirmMsg = `This will import/restore the BACPAC file to database "${targetDatabase}". This may overwrite existing data. Are you sure?`;

    if (!confirm(confirmMsg)) return;

    setShowOutput(true);
    setOutputMessages([]);

    try {
      if (sourceType === "bacpac") {
        // Import from BACPAC file
        if (bacpacTargetType === "connection") {
          // Import to an existing connection
          await importBacpac(
            targetConnectionId as number,
            targetDatabase,
            sourceBacpacPath,
          );
        } else {
          // Import with server details
          await importBacpacWithDetails(
            sourceBacpacPath,
            targetDatabase,
            targetServer,
            targetPort,
            targetUsername,
            targetPassword,
            targetUseWindowsAuth,
            targetEncrypt,
            targetTrustServerCert,
          );
        }
      } else if (sourceType === "connection" && sourceConnectionId) {
        await importBacpac(sourceConnectionId as number, targetDatabase);
      } else {
        // Handle custom connection string scenario
        // This would require backend API updates
        alert(
          "Custom connection string import not yet implemented in backend API",
        );
      }
    } catch (error) {
      console.error("Import failed:", error);
      setOutputMessages((prev) => [
        ...prev,
        `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content import-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📥 Import Database</h2>
          <button className="close-btn" onClick={onClose} disabled={importing}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Source Configuration */}
          <div className="section">
            <h3 className="section-title">Source</h3>

            <div className="tabs tabs-small">
              <button
                className={`tab ${sourceType === "bacpac" ? "active" : ""}`}
                onClick={() => setSourceType("bacpac")}
                disabled={importing}
              >
                BACPAC File
              </button>
              <button
                className={`tab ${sourceType === "connection" ? "active" : ""}`}
                onClick={() => setSourceType("connection")}
                disabled={importing}
              >
                Existing Connection
              </button>
              <button
                className={`tab ${sourceType === "url" ? "active" : ""}`}
                onClick={() => setSourceType("url")}
                disabled={importing}
              >
                Connection String
              </button>
            </div>

            {sourceType === "bacpac" ? (
              <div className="form-group">
                <label htmlFor="source-bacpac">BACPAC File*</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    id="source-bacpac"
                    type="text"
                    value={sourceBacpacPath}
                    readOnly
                    placeholder="Click 'Browse' to select a BACPAC file"
                    disabled={importing}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleSelectBacpac}
                    disabled={importing}
                  >
                    Browse...
                  </button>
                </div>
              </div>
            ) : sourceType === "connection" ? (
              <div className="form-group">
                <label htmlFor="source-connection">Select Connection*</label>
                <select
                  id="source-connection"
                  className="form-select"
                  value={sourceConnectionId}
                  onChange={(e) =>
                    setSourceConnectionId(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  disabled={importing}
                >
                  <option value="">-- Select a connection --</option>
                  {connections.map((conn) => (
                    <option key={conn.id} value={conn.id}>
                      {conn.name} ({conn.server})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="source-connection-string">
                  Connection String*
                </label>
                <textarea
                  id="source-connection-string"
                  rows={3}
                  value={sourceConnectionString}
                  onChange={(e) => setSourceConnectionString(e.target.value)}
                  placeholder="Server=localhost;Database=MyDB;User Id=sa;Password=pass;..."
                  disabled={importing}
                />
              </div>
            )}
          </div>

          {/* Target Configuration */}
          <div className="section">
            <h3 className="section-title">Target</h3>

            {sourceType === "bacpac" ? (
              <>
                <div className="form-group">
                  <label htmlFor="target-database">Target Database Name*</label>
                  <input
                    id="target-database"
                    type="text"
                    value={targetDatabase}
                    onChange={(e) => setTargetDatabase(e.target.value)}
                    placeholder="Enter name for the restored database"
                    disabled={importing}
                  />
                </div>

                <div className="tabs tabs-small">
                  <button
                    className={`tab ${bacpacTargetType === "connection" ? "active" : ""}`}
                    onClick={() => setBacpacTargetType("connection")}
                    disabled={importing}
                  >
                    Existing Connection
                  </button>
                  <button
                    className={`tab ${bacpacTargetType === "details" ? "active" : ""}`}
                    onClick={() => setBacpacTargetType("details")}
                    disabled={importing}
                  >
                    Server Details
                  </button>
                </div>

                {bacpacTargetType === "connection" ? (
                  <div className="form-group">
                    <label htmlFor="target-connection">
                      Target Connection*
                    </label>
                    <select
                      id="target-connection"
                      className="form-select"
                      value={targetConnectionId}
                      onChange={(e) =>
                        setTargetConnectionId(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      disabled={importing}
                    >
                      <option value="">-- Select a connection --</option>
                      {connections.map((conn) => (
                        <option key={conn.id} value={conn.id}>
                          {conn.name} ({conn.server})
                        </option>
                      ))}
                    </select>
                    <small
                      style={{
                        color: "#666",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      Select the server where the database will be imported
                    </small>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label htmlFor="target-server">Server*</label>
                      <input
                        id="target-server"
                        type="text"
                        value={targetServer}
                        onChange={(e) => setTargetServer(e.target.value)}
                        placeholder="localhost or server.example.com"
                        disabled={importing}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="target-port">Port</label>
                      <input
                        id="target-port"
                        type="text"
                        value={targetPort}
                        onChange={(e) => setTargetPort(e.target.value)}
                        placeholder="1433 (default)"
                        disabled={importing}
                      />
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={targetUseWindowsAuth}
                          onChange={(e) =>
                            setTargetUseWindowsAuth(e.target.checked)
                          }
                          disabled={importing}
                        />
                        Use Windows Authentication
                      </label>
                    </div>

                    {!targetUseWindowsAuth && (
                      <>
                        <div className="form-group">
                          <label htmlFor="target-username">Username</label>
                          <input
                            id="target-username"
                            type="text"
                            value={targetUsername}
                            onChange={(e) => setTargetUsername(e.target.value)}
                            placeholder="SQL Server username"
                            disabled={importing}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="target-password">Password</label>
                          <input
                            id="target-password"
                            type="password"
                            value={targetPassword}
                            onChange={(e) => setTargetPassword(e.target.value)}
                            placeholder="SQL Server password"
                            disabled={importing}
                          />
                        </div>
                      </>
                    )}

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={targetEncrypt}
                          onChange={(e) => setTargetEncrypt(e.target.checked)}
                          disabled={importing}
                        />
                        Encrypt Connection
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={targetTrustServerCert}
                          onChange={(e) =>
                            setTargetTrustServerCert(e.target.checked)
                          }
                          disabled={importing}
                        />
                        Trust Server Certificate
                      </label>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="target-database">Target Database Name*</label>
                  <input
                    id="target-database"
                    type="text"
                    value={targetDatabase}
                    onChange={(e) => setTargetDatabase(e.target.value)}
                    placeholder="Enter name for the restored database"
                    disabled={importing}
                  />
                </div>

                <div className="tabs tabs-small">
                  <button
                    className={`tab ${targetType === "details" ? "active" : ""}`}
                    onClick={() => setTargetType("details")}
                    disabled={importing}
                  >
                    Server Details
                  </button>
                  <button
                    className={`tab ${targetType === "connection_string" ? "active" : ""}`}
                    onClick={() => setTargetType("connection_string")}
                    disabled={importing}
                  >
                    Connection String
                  </button>
                </div>

                {targetType === "details" ? (
                  <>
                    <div className="form-group">
                      <label htmlFor="target-server">Server*</label>
                      <input
                        id="target-server"
                        type="text"
                        value={targetServer}
                        onChange={(e) => setTargetServer(e.target.value)}
                        placeholder="localhost or server.example.com"
                        disabled={importing}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="target-port">Port</label>
                      <input
                        id="target-port"
                        type="text"
                        value={targetPort}
                        onChange={(e) => setTargetPort(e.target.value)}
                        placeholder="1433 (default)"
                        disabled={importing}
                      />
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={targetUseWindowsAuth}
                          onChange={(e) =>
                            setTargetUseWindowsAuth(e.target.checked)
                          }
                          disabled={importing}
                        />
                        Use Windows Authentication
                      </label>
                    </div>

                    {!targetUseWindowsAuth && (
                      <>
                        <div className="form-group">
                          <label htmlFor="target-username">Username</label>
                          <input
                            id="target-username"
                            type="text"
                            value={targetUsername}
                            onChange={(e) => setTargetUsername(e.target.value)}
                            placeholder="SQL Server username"
                            disabled={importing}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="target-password">Password</label>
                          <input
                            id="target-password"
                            type="password"
                            value={targetPassword}
                            onChange={(e) => setTargetPassword(e.target.value)}
                            placeholder="SQL Server password"
                            disabled={importing}
                          />
                        </div>
                      </>
                    )}

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={targetEncrypt}
                          onChange={(e) => setTargetEncrypt(e.target.checked)}
                          disabled={importing}
                        />
                        Encrypt Connection
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={targetTrustServerCert}
                          onChange={(e) =>
                            setTargetTrustServerCert(e.target.checked)
                          }
                          disabled={importing}
                        />
                        Trust Server Certificate
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="form-group">
                    <label htmlFor="target-connection-string">
                      Connection String*
                    </label>
                    <textarea
                      id="target-connection-string"
                      rows={3}
                      value={targetConnectionString}
                      onChange={(e) =>
                        setTargetConnectionString(e.target.value)
                      }
                      placeholder="Server=localhost;User Id=sa;Password=pass;..."
                      disabled={importing}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Warning Message */}
          {!importing && !showOutput && (
            <div className="warning-message">
              ⚠️ Warning: Importing will create or overwrite the specified
              database.
            </div>
          )}

          {/* Output Display */}
          {showOutput && (
            <div className="output-section">
              <h3 className="section-title">
                {importing ? "Import Progress" : "Import Result"}
              </h3>
              <div className="output-console">
                {outputMessages.map((msg, idx) => (
                  <div key={idx} className="output-line">
                    {msg}
                  </div>
                ))}
                {importing && (
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
            disabled={importing}
          >
            Close
          </button>
          {!showOutput && (
            <button
              type="button"
              className="btn-primary"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? "Importing..." : "Start Import"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
