import { invoke } from "@tauri-apps/api/core";
import type {
  SqlConnection,
  ExportRequest,
  ImportRequest,
  ImportWithDetailsRequest,
  Preferences,
  Theme,
} from "../types";

export const api = {
  // Connection CRUD operations
  listConnections: async (): Promise<SqlConnection[]> => {
    return await invoke("list_connections");
  },

  getConnection: async (id: number): Promise<SqlConnection> => {
    return await invoke("get_connection", { id });
  },

  createConnection: async (
    connection: SqlConnection
  ): Promise<SqlConnection> => {
    return await invoke("create_connection", { connection });
  },

  updateConnection: async (
    id: number,
    connection: SqlConnection
  ): Promise<SqlConnection> => {
    return await invoke("update_connection", { id, connection });
  },

  deleteConnection: async (id: number): Promise<void> => {
    return await invoke("delete_connection", { id });
  },

  // SQLPackage operations
  exportBacpac: async (exportRequest: ExportRequest): Promise<string> => {
    return await invoke("export_bacpac", { exportRequest });
  },

  importBacpac: async (importRequest: ImportRequest): Promise<string> => {
    return await invoke("import_bacpac", { importRequest });
  },

  importBacpacWithDetails: async (
    importRequest: ImportWithDetailsRequest
  ): Promise<string> => {
    return await invoke("import_bacpac_with_details", { importRequest });
  },

  // Preferences operations
  getPreferences: async (): Promise<Preferences> => {
    return await invoke("get_preferences");
  },

  updatePreference: async (key: string, value: string): Promise<void> => {
    return await invoke("update_preference", { key, value });
  },

  updateTheme: async (theme: Theme): Promise<void> => {
    return await invoke("update_theme", { theme });
  },

  // System operations
  checkSqlPackageInstalled: async (): Promise<boolean> => {
    return await invoke("check_sqlpackage_installed");
  },
};
