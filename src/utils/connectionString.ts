import type { SqlConnection } from "../types";

/**
 * Builds a SQL Server connection string from connection properties
 */
export function buildConnectionString(connection: SqlConnection): string {
  // If connection_string is already provided, use it
  if (connection.connection_string) {
    return connection.connection_string;
  }

  // Build connection string from individual properties
  const parts: string[] = [];

  // Server and port
  if (connection.port) {
    parts.push(`Server=${connection.server},${connection.port}`);
  } else {
    parts.push(`Server=${connection.server}`);
  }

  // Database
  if (connection.database_name) {
    parts.push(`Database=${connection.database_name}`);
  }

  // Authentication
  if (connection.use_windows_auth) {
    parts.push("Integrated Security=true");
  } else {
    if (connection.username) {
      parts.push(`User Id=${connection.username}`);
    }
    if (connection.password) {
      parts.push(`Password=${connection.password}`);
    }
  }

  // Encryption and trust settings
  parts.push(`Encrypt=${connection.encrypt ? "true" : "false"}`);
  parts.push(
    `TrustServerCertificate=${connection.trust_server_cert ? "true" : "false"}`,
  );

  return parts.join(";");
}
