import { useState, useCallback } from "react";
import { api } from "../utils/api";
import type { SqlConnection } from "../types";

export function useConnections() {
  const [connections, setConnections] = useState<SqlConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshConnections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listConnections();
      setConnections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createConnection = useCallback(
    async (connection: SqlConnection) => {
      setLoading(true);
      setError(null);
      try {
        await api.createConnection(connection);
        await refreshConnections();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshConnections]
  );

  const updateConnection = useCallback(
    async (id: number, connection: SqlConnection) => {
      setLoading(true);
      setError(null);
      try {
        await api.updateConnection(id, connection);
        await refreshConnections();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshConnections]
  );

  const deleteConnection = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        await api.deleteConnection(id);
        await refreshConnections();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshConnections]
  );

  return {
    connections,
    loading,
    error,
    refreshConnections,
    createConnection,
    updateConnection,
    deleteConnection,
  };
}
