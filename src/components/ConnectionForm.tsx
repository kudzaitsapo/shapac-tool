import { useState, useEffect } from "react";
import { useConnections } from "../hooks/useConnections";
import type { SqlConnection } from "../types";

interface ConnectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editConnection?: SqlConnection | null;
  onSave?: () => void;
}

export function ConnectionForm({
  isOpen,
  onClose,
  editConnection,
  onSave,
}: ConnectionFormProps) {
  const { createConnection, updateConnection } = useConnections();
  const [activeTab, setActiveTab] = useState<"quick" | "advanced">("advanced");
  const [formData, setFormData] = useState<SqlConnection>({
    name: "",
    server: "",
    database_name: "",
    username: "",
    password: "",
    connection_string: "",
    use_windows_auth: false,
    trust_server_cert: true,
    encrypt: true,
  });

  useEffect(() => {
    if (editConnection) {
      setFormData(editConnection);
      setActiveTab(
        editConnection.connection_string && !editConnection.server
          ? "quick"
          : "advanced"
      );
    } else {
      setFormData({
        name: "",
        server: "",
        database_name: "",
        username: "",
        password: "",
        connection_string: "",
        use_windows_auth: false,
        trust_server_cert: true,
        encrypt: true,
      });
    }
  }, [editConnection, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editConnection?.id) {
        await updateConnection(editConnection.id, formData);
      } else {
        await createConnection(formData);
      }
      onSave?.();
      onClose();
    } catch (error) {
      console.error("Failed to save connection:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editConnection ? "Edit Connection" : "New Connection"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === "quick" ? "active" : ""}`}
            onClick={() => setActiveTab("quick")}
          >
            Quick (Connection String)
          </button>
          <button
            className={`tab ${activeTab === "advanced" ? "active" : ""}`}
            onClick={() => setActiveTab("advanced")}
          >
            Advanced (Individual Fields)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
            <label htmlFor="name">Connection Name*</label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Production SQL Server"
            />
          </div>

          {activeTab === "quick" ? (
            <div className="form-group">
              <label htmlFor="connection_string">Connection String*</label>
              <textarea
                id="connection_string"
                required
                rows={4}
                value={formData.connection_string || ""}
                onChange={(e) =>
                  setFormData({ ...formData, connection_string: e.target.value })
                }
                placeholder="Server=localhost;Database=MyDB;User Id=sa;Password=pass;..."
              />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="server">Server*</label>
                <input
                  id="server"
                  type="text"
                  required
                  value={formData.server}
                  onChange={(e) =>
                    setFormData({ ...formData, server: e.target.value })
                  }
                  placeholder="localhost or server.example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="port">Port</label>
                <input
                  id="port"
                  type="text"
                  value={formData.port || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, port: e.target.value })
                  }
                  placeholder="e.g., 1433 (default) or 2022"
                />
              </div>

              <div className="form-group">
                <label htmlFor="database_name">Database Name</label>
                <input
                  id="database_name"
                  type="text"
                  value={formData.database_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, database_name: e.target.value })
                  }
                  placeholder="Optional - can be specified during export/import"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.use_windows_auth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        use_windows_auth: e.target.checked,
                      })
                    }
                  />
                  Use Windows Authentication
                </label>
              </div>

              {!formData.use_windows_auth && (
                <>
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      id="username"
                      type="text"
                      value={formData.username || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="SQL Server username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      id="password"
                      type="password"
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="SQL Server password"
                    />
                  </div>
                </>
              )}

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.encrypt}
                    onChange={(e) =>
                      setFormData({ ...formData, encrypt: e.target.checked })
                    }
                  />
                  Encrypt Connection
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.trust_server_cert}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trust_server_cert: e.target.checked,
                      })
                    }
                  />
                  Trust Server Certificate
                </label>
              </div>
            </>
          )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editConnection ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
