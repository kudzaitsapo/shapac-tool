use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SqlConnection {
    pub id: Option<i64>,
    pub name: String,
    pub server: String,
    pub port: Option<String>,
    pub database_name: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub connection_string: Option<String>,
    pub use_windows_auth: bool,
    pub trust_server_cert: bool,
    pub encrypt: bool,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportRequest {
    pub connection_id: i64,
    pub output_path: String,
    pub database_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImportRequest {
    pub connection_id: i64,
    pub bacpac_path: String,
    pub target_database: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImportWithDetailsRequest {
    pub bacpac_path: String,
    pub target_database: String,
    pub server: String,
    pub port: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub use_windows_auth: bool,
    pub trust_server_cert: bool,
    pub encrypt: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppPreference {
    pub key: String,
    pub value: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Preferences {
    pub theme: String, // "light" | "dark" | "system"
}

impl Preferences {
    pub fn default() -> Self {
        Preferences {
            theme: "system".to_string(),
        }
    }
}
