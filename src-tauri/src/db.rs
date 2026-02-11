use anyhow::Result;
use rusqlite::Connection;
use tauri::Manager;

pub fn init_db(app_handle: &tauri::AppHandle) -> Result<()> {
    let app_data_dir = app_handle.path().app_data_dir()?;
    std::fs::create_dir_all(&app_data_dir)?;

    let db_path = app_data_dir.join("shapac.db");
    let conn = Connection::open(db_path)?;

    create_tables(&conn)?;
    Ok(())
}

pub fn get_connection(app_handle: &tauri::AppHandle) -> Result<Connection> {
    let app_data_dir = app_handle.path().app_data_dir()?;
    let db_path = app_data_dir.join("shapac.db");
    let conn = Connection::open(db_path)?;
    Ok(conn)
}

fn create_tables(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sql_connections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            server TEXT NOT NULL,
            port TEXT,
            database_name TEXT,
            username TEXT,
            password TEXT,
            connection_string TEXT,
            use_windows_auth BOOLEAN DEFAULT 0,
            trust_server_cert BOOLEAN DEFAULT 1,
            encrypt BOOLEAN DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // Migration: Add port column if it doesn't exist (for existing databases)
    let column_exists: Result<i32, _> = conn.query_row(
        "SELECT COUNT(*) FROM pragma_table_info('sql_connections') WHERE name='port'",
        [],
        |row| row.get(0),
    );

    if let Ok(0) = column_exists {
        conn.execute("ALTER TABLE sql_connections ADD COLUMN port TEXT", [])?;
    }

    // Create app_preferences table for storing user preferences
    conn.execute(
        "CREATE TABLE IF NOT EXISTS app_preferences (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // Initialize default theme preference
    conn.execute(
        "INSERT OR IGNORE INTO app_preferences (key, value, created_at, updated_at)
         VALUES ('theme', 'system', datetime('now'), datetime('now'))",
        [],
    )?;

    Ok(())
}
