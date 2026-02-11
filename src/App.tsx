import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { ConnectionList } from "./components/ConnectionList";
import { ConnectionForm } from "./components/ConnectionForm";
import { ExportDialog } from "./components/ExportDialog";
import { ImportDialog } from "./components/ImportDialog";
import { SettingsDialog } from "./components/SettingsDialog";
import { SqlPackageNotInstalled } from "./components/SqlPackageNotInstalled";
import { api } from "./utils/api";
import type { SqlConnection } from "./types";
import "./App.css";

function App() {
  const [sqlPackageInstalled, setSqlPackageInstalled] = useState<boolean | null>(null);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [editConnection, setEditConnection] = useState<SqlConnection | null>(
    null
  );
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedConnection, setSelectedConnection] =
    useState<SqlConnection | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check if SqlPackage is installed on startup
  useEffect(() => {
    const checkSqlPackage = async () => {
      try {
        const installed = await api.checkSqlPackageInstalled();
        setSqlPackageInstalled(installed);
      } catch (error) {
        console.error("Failed to check SqlPackage installation:", error);
        setSqlPackageInstalled(false);
      }
    };

    checkSqlPackage();
  }, []);

  const handleNewConnection = () => {
    setEditConnection(null);
    setShowConnectionForm(true);
  };

  const handleEditConnection = (connection: SqlConnection) => {
    setEditConnection(connection);
    setShowConnectionForm(true);
  };

  const handleExport = (connection: SqlConnection) => {
    setSelectedConnection(connection);
    setShowExportDialog(true);
  };

  const handleImport = () => {
    setShowImportDialog(true);
  };

  const handleSettings = () => {
    setShowSettingsDialog(true);
  };

  const handleCloseForm = () => {
    setShowConnectionForm(false);
    setEditConnection(null);
  };

  const handleConnectionSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCloseExport = () => {
    setShowExportDialog(false);
    setSelectedConnection(null);
  };

  const handleCloseImport = () => {
    setShowImportDialog(false);
  };

  const handleCloseSettings = () => {
    setShowSettingsDialog(false);
  };

  // Show loading state while checking SqlPackage
  if (sqlPackageInstalled === null) {
    return null;
  }

  // Show SqlPackage not installed screen if it's missing
  if (!sqlPackageInstalled) {
    return <SqlPackageNotInstalled />;
  }

  return (
    <Layout onNewConnection={handleNewConnection} onImport={handleImport} onSettings={handleSettings}>
      <ConnectionList
        key={refreshKey}
        onEdit={handleEditConnection}
        onExport={handleExport}
      />

      <ConnectionForm
        isOpen={showConnectionForm}
        onClose={handleCloseForm}
        editConnection={editConnection}
        onSave={handleConnectionSaved}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={handleCloseExport}
        connection={selectedConnection}
      />

      <ImportDialog isOpen={showImportDialog} onClose={handleCloseImport} />

      <SettingsDialog
        isOpen={showSettingsDialog}
        onClose={handleCloseSettings}
      />
    </Layout>
  );
}

export default App;
