use crate::db;
use crate::models::{AppPreference, Preferences};
use chrono::Utc;

#[tauri::command]
pub async fn get_preferences(app_handle: tauri::AppHandle) -> Result<Preferences, String> {
    let conn = db::get_connection(&app_handle).map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT key, value FROM app_preferences")
        .map_err(|e| e.to_string())?;

    let preferences = stmt
        .query_map([], |row| {
            Ok(AppPreference {
                key: row.get(0)?,
                value: row.get(1)?,
                created_at: None,
                updated_at: None,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    // Convert to typed Preferences struct
    let mut prefs = Preferences::default();
    for pref in preferences {
        match pref.key.as_str() {
            "theme" => prefs.theme = pref.value,
            _ => {}
        }
    }

    Ok(prefs)
}

#[tauri::command]
pub async fn update_preference(
    app_handle: tauri::AppHandle,
    key: String,
    value: String,
) -> Result<(), String> {
    let conn = db::get_connection(&app_handle).map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT OR REPLACE INTO app_preferences (key, value, created_at, updated_at)
         VALUES (
             ?1,
             ?2,
             COALESCE((SELECT created_at FROM app_preferences WHERE key = ?1), ?3),
             ?3
         )",
        (&key, &value, &now),
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn update_theme(
    app_handle: tauri::AppHandle,
    theme: String,
) -> Result<(), String> {
    // Validate theme value
    if !["light", "dark", "system"].contains(&theme.as_str()) {
        return Err("Invalid theme value. Must be 'light', 'dark', or 'system'".to_string());
    }

    update_preference(app_handle, "theme".to_string(), theme).await
}
