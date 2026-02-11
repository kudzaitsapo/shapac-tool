use crate::utils;

#[tauri::command]
pub async fn check_sqlpackage_installed() -> Result<bool, String> {
    Ok(utils::is_sqlpackage_installed())
}
