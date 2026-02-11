import { useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { api } from "../utils/api";
import type {
  ExportRequest,
  ImportRequest,
  ImportWithDetailsRequest,
} from "../types";

export function useSqlPackage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const selectFolder = async (): Promise<string | null> => {
    const result = await open({
      directory: true,
      multiple: false,
    });
    return result;
  };

  const selectBacpacFile = async (): Promise<string | null> => {
    const result = await open({
      filters: [
        {
          name: "BACPAC Files",
          extensions: ["bacpac"],
        },
      ],
      multiple: false,
    });
    return result;
  };

  const selectSaveLocation = async (
    defaultName: string
  ): Promise<string | null> => {
    const result = await save({
      defaultPath: defaultName,
      filters: [
        {
          name: "BACPAC Files",
          extensions: ["bacpac"],
        },
      ],
    });
    return result;
  };

  const exportBacpac = async (
    connectionId: number,
    databaseName: string
  ): Promise<void> => {
    setExporting(true);
    setError(null);
    setProgress("Selecting save location...");

    try {
      const outputPath = await selectSaveLocation(
        `${databaseName}_${new Date().toISOString().split("T")[0]}.bacpac`
      );

      if (!outputPath) {
        setProgress("Export cancelled");
        return;
      }

      setProgress("Exporting database...");

      const exportRequest: ExportRequest = {
        connection_id: connectionId,
        output_path: outputPath,
        database_name: databaseName,
      };

      const result = await api.exportBacpac(exportRequest);
      setProgress(`Export completed: ${result}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setProgress("");
      throw err;
    } finally {
      setExporting(false);
    }
  };

  const importBacpac = async (
    connectionId: number,
    targetDatabase: string,
    bacpacPath?: string
  ): Promise<void> => {
    setImporting(true);
    setError(null);

    try {
      let finalBacpacPath: string | null = bacpacPath || null;

      // Only open file picker if path not provided
      if (!finalBacpacPath) {
        setProgress("Selecting BACPAC file...");
        finalBacpacPath = await selectBacpacFile();

        if (!finalBacpacPath) {
          setProgress("Import cancelled");
          return;
        }
      }

      setProgress("Importing database...");

      const importRequest: ImportRequest = {
        connection_id: connectionId,
        bacpac_path: finalBacpacPath,
        target_database: targetDatabase,
      };

      const result = await api.importBacpac(importRequest);
      setProgress(`Import completed: ${result}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setProgress("");
      throw err;
    } finally {
      setImporting(false);
    }
  };

  const importBacpacWithDetails = async (
    bacpacPath: string,
    targetDatabase: string,
    server: string,
    port: string,
    username: string,
    password: string,
    useWindowsAuth: boolean,
    encrypt: boolean,
    trustServerCert: boolean
  ): Promise<void> => {
    setImporting(true);
    setError(null);
    setProgress("Importing database...");

    try {
      const importRequest: ImportWithDetailsRequest = {
        bacpac_path: bacpacPath,
        target_database: targetDatabase,
        server,
        port: port || undefined,
        username: username || undefined,
        password: password || undefined,
        use_windows_auth: useWindowsAuth,
        encrypt,
        trust_server_cert: trustServerCert,
      };

      const result = await api.importBacpacWithDetails(importRequest);
      setProgress(`Import completed: ${result}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setProgress("");
      throw err;
    } finally {
      setImporting(false);
    }
  };

  return {
    exporting,
    importing,
    progress,
    error,
    exportBacpac,
    importBacpac,
    importBacpacWithDetails,
    selectFolder,
    selectBacpacFile,
  };
}
