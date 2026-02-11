mod commands;
mod db;
mod models;
mod utils;

use commands::{connections, preferences, sqlpackage, system};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Initialize database
            db::init_db(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            connections::list_connections,
            connections::get_connection,
            connections::create_connection,
            connections::update_connection,
            connections::delete_connection,
            preferences::get_preferences,
            preferences::update_preference,
            preferences::update_theme,
            sqlpackage::export_bacpac,
            sqlpackage::import_bacpac,
            sqlpackage::import_bacpac_with_details,
            system::check_sqlpackage_installed,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
