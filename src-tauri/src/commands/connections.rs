use crate::db;
use crate::models::SqlConnection;
use chrono::Utc;

#[tauri::command]
pub async fn list_connections(app_handle: tauri::AppHandle) -> Result<Vec<SqlConnection>, String> {
    let conn = db::get_connection(&app_handle).map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, server, port, database_name, username, password, connection_string, use_windows_auth, trust_server_cert, encrypt, created_at, updated_at FROM sql_connections ORDER BY name")
        .map_err(|e| e.to_string())?;

    let connections = stmt
        .query_map([], |row| {
            Ok(SqlConnection {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                server: row.get(2)?,
                port: row.get(3)?,
                database_name: row.get(4)?,
                username: row.get(5)?,
                password: row.get(6)?,
                connection_string: row.get(7)?,
                use_windows_auth: row.get(8)?,
                trust_server_cert: row.get(9)?,
                encrypt: row.get(10)?,
                created_at: Some(row.get(11)?),
                updated_at: Some(row.get(12)?),
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(connections)
}

#[tauri::command]
pub async fn get_connection(
    app_handle: tauri::AppHandle,
    id: i64,
) -> Result<SqlConnection, String> {
    let conn = db::get_connection(&app_handle).map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, server, port, database_name, username, password, connection_string, use_windows_auth, trust_server_cert, encrypt, created_at, updated_at FROM sql_connections WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    let connection = stmt
        .query_row([id], |row| {
            Ok(SqlConnection {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                server: row.get(2)?,
                port: row.get(3)?,
                database_name: row.get(4)?,
                username: row.get(5)?,
                password: row.get(6)?,
                connection_string: row.get(7)?,
                use_windows_auth: row.get(8)?,
                trust_server_cert: row.get(9)?,
                encrypt: row.get(10)?,
                created_at: Some(row.get(11)?),
                updated_at: Some(row.get(12)?),
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(connection)
}

#[tauri::command]
pub async fn create_connection(
    app_handle: tauri::AppHandle,
    mut connection: SqlConnection,
) -> Result<SqlConnection, String> {
    let conn = db::get_connection(&app_handle).map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO sql_connections (name, server, port, database_name, username, password, connection_string, use_windows_auth, trust_server_cert, encrypt, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        (
            &connection.name,
            &connection.server,
            &connection.port,
            &connection.database_name,
            &connection.username,
            &connection.password,
            &connection.connection_string,
            connection.use_windows_auth,
            connection.trust_server_cert,
            connection.encrypt,
            &now,
            &now,
        ),
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    connection.id = Some(id);
    connection.created_at = Some(now.clone());
    connection.updated_at = Some(now);

    Ok(connection)
}

#[tauri::command]
pub async fn update_connection(
    app_handle: tauri::AppHandle,
    id: i64,
    mut connection: SqlConnection,
) -> Result<SqlConnection, String> {
    let conn = db::get_connection(&app_handle).map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE sql_connections
         SET name = ?1, server = ?2, port = ?3, database_name = ?4, username = ?5, password = ?6,
             connection_string = ?7, use_windows_auth = ?8, trust_server_cert = ?9,
             encrypt = ?10, updated_at = ?11
         WHERE id = ?12",
        (
            &connection.name,
            &connection.server,
            &connection.port,
            &connection.database_name,
            &connection.username,
            &connection.password,
            &connection.connection_string,
            connection.use_windows_auth,
            connection.trust_server_cert,
            connection.encrypt,
            &now,
            id,
        ),
    )
    .map_err(|e| e.to_string())?;

    connection.id = Some(id);
    connection.updated_at = Some(now);

    Ok(connection)
}

#[tauri::command]
pub async fn delete_connection(app_handle: tauri::AppHandle, id: i64) -> Result<(), String> {
    let conn = db::get_connection(&app_handle).map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM sql_connections WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
