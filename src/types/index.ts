export interface SqlConnection {
  id?: number;
  name: string;
  server: string;
  port?: string;
  database_name?: string;
  username?: string;
  password?: string;
  connection_string?: string;
  use_windows_auth: boolean;
  trust_server_cert: boolean;
  encrypt: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExportRequest {
  connection_id: number;
  output_path: string;
  database_name: string;
}

export interface ImportRequest {
  connection_id: number;
  bacpac_path: string;
  target_database: string;
}

export interface ImportWithDetailsRequest {
  bacpac_path: string;
  target_database: string;
  server: string;
  port?: string;
  username?: string;
  password?: string;
  use_windows_auth: boolean;
  trust_server_cert: boolean;
  encrypt: boolean;
}

export interface OperationProgress {
  status: "running" | "success" | "error";
  message: string;
  progress?: number;
}

export interface Preferences {
  theme: "light" | "dark" | "system";
}

export type Theme = "light" | "dark" | "system";
