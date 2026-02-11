import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import type { Theme } from "../types";
import packageJson from "../../package.json";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<Theme>(theme);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync local state with context when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(theme);
      setError(null);
    }
  }, [isOpen, theme]);

  const handleSave = async () => {
    if (selectedTheme === theme) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await setTheme(selectedTheme);
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose} disabled={saving}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="section">
            <h3 className="section-title">Appearance</h3>

            <div className="form-group">
              <label htmlFor="theme-select">Theme</label>
              <select
                id="theme-select"
                className="form-select"
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as Theme)}
                disabled={saving}
              >
                <option value="system">System (Auto)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <p className="help-text">
                Choose how Shapac SQL Tool appears. System will match your operating system's theme.
              </p>
            </div>

            <div className="theme-preview-container">
              <div
                className={`theme-preview ${selectedTheme === "light" ? "active" : ""}`}
                onClick={() => setSelectedTheme("light")}
              >
                <div className="preview-card preview-light">
                  <div className="preview-header"></div>
                  <div className="preview-content">
                    <div className="preview-line"></div>
                    <div className="preview-line short"></div>
                  </div>
                </div>
                <span className="preview-label">Light</span>
              </div>

              <div
                className={`theme-preview ${selectedTheme === "dark" ? "active" : ""}`}
                onClick={() => setSelectedTheme("dark")}
              >
                <div className="preview-card preview-dark">
                  <div className="preview-header"></div>
                  <div className="preview-content">
                    <div className="preview-line"></div>
                    <div className="preview-line short"></div>
                  </div>
                </div>
                <span className="preview-label">Dark</span>
              </div>

              <div
                className={`theme-preview ${selectedTheme === "system" ? "active" : ""}`}
                onClick={() => setSelectedTheme("system")}
              >
                <div className="preview-card preview-system">
                  <div className="preview-header"></div>
                  <div className="preview-content">
                    <div className="preview-line"></div>
                    <div className="preview-line short"></div>
                  </div>
                </div>
                <span className="preview-label">System</span>
              </div>
            </div>
          </div>

          <div className="section">
            <h3 className="section-title">About</h3>
            <div className="about-info">
              <div className="info-row">
                <span className="label">Application</span>
                <span className="value">Shapac Tool</span>
              </div>
              <div className="info-row">
                <span className="label">Developer</span>
                <span className="value">Shesha.io</span>
              </div>
              <div className="info-row">
                <span className="label">Version</span>
                <span className="value">{packageJson.version}</span>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
