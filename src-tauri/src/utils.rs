use crate::models::SqlConnection;
use std::process::Command;

pub fn is_sqlpackage_installed() -> bool {
    // Try to run sqlpackage with --version flag
    let result = if cfg!(target_os = "windows") {
        Command::new("cmd")
            .args(&["/C", "sqlpackage", "/version"])
            .output()
    } else {
        Command::new("sqlpackage")
            .arg("/version")
            .output()
    };

    match result {
        Ok(output) => output.status.success(),
        Err(_) => false,
    }
}

pub fn build_connection_string(conn: &SqlConnection) -> String {
    // If connection_string is provided directly, use it
    if let Some(cs) = &conn.connection_string {
        if !cs.is_empty() {
            return cs.clone();
        }
    }

    // Otherwise, build from individual fields
    let server_part = if let Some(port) = &conn.port {
        if !port.is_empty() {
            format!("{},{}", conn.server, port)
        } else {
            conn.server.clone()
        }
    } else {
        conn.server.clone()
    };
    let mut parts = vec![format!("Server={}", server_part)];

    if let Some(db) = &conn.database_name {
        if !db.is_empty() {
            parts.push(format!("Database={}", db));
        }
    }

    if conn.use_windows_auth {
        parts.push("Integrated Security=true".to_string());
    } else {
        if let Some(user) = &conn.username {
            if !user.is_empty() {
                parts.push(format!("User Id={}", user));
            }
        }
        if let Some(pwd) = &conn.password {
            if !pwd.is_empty() {
                parts.push(format!("Password={}", pwd));
            }
        }
    }

    parts.push(format!("Encrypt={}", if conn.encrypt { "true" } else { "false" }));
    parts.push(format!(
        "TrustServerCertificate={}",
        if conn.trust_server_cert { "true" } else { "false" }
    ));

    parts.join(";")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_connection_string_with_manual() {
        let conn = SqlConnection {
            id: None,
            name: "Test".to_string(),
            server: "localhost".to_string(),
            port: None,
            database_name: Some("TestDB".to_string()),
            username: Some("sa".to_string()),
            password: Some("password".to_string()),
            connection_string: Some("Server=manual;Database=ManualDB".to_string()),
            use_windows_auth: false,
            trust_server_cert: true,
            encrypt: true,
            created_at: None,
            updated_at: None,
        };

        let result = build_connection_string(&conn);
        assert_eq!(result, "Server=manual;Database=ManualDB");
    }

    #[test]
    fn test_build_connection_string_from_fields() {
        let conn = SqlConnection {
            id: None,
            name: "Test".to_string(),
            server: "localhost".to_string(),
            port: None,
            database_name: Some("TestDB".to_string()),
            username: Some("sa".to_string()),
            password: Some("password".to_string()),
            connection_string: None,
            use_windows_auth: false,
            trust_server_cert: true,
            encrypt: true,
            created_at: None,
            updated_at: None,
        };

        let result = build_connection_string(&conn);
        assert!(result.contains("Server=localhost"));
        assert!(result.contains("Database=TestDB"));
        assert!(result.contains("User Id=sa"));
        assert!(result.contains("Password=password"));
    }

    #[test]
    fn test_build_connection_string_with_port() {
        let conn = SqlConnection {
            id: None,
            name: "Test".to_string(),
            server: "localhost".to_string(),
            port: Some("2022".to_string()),
            database_name: Some("TestDB".to_string()),
            username: Some("sa".to_string()),
            password: Some("password".to_string()),
            connection_string: None,
            use_windows_auth: false,
            trust_server_cert: true,
            encrypt: true,
            created_at: None,
            updated_at: None,
        };

        let result = build_connection_string(&conn);
        assert!(result.contains("Server=localhost,2022"));
        assert!(result.contains("Database=TestDB"));
        assert!(result.contains("User Id=sa"));
        assert!(result.contains("Password=password"));
    }
}
