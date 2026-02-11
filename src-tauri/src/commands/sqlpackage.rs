use crate::commands::connections;
use crate::models::{ExportRequest, ImportRequest, ImportWithDetailsRequest, SqlConnection};
use crate::utils;
use tauri::Emitter;
use tokio::io::{AsyncBufReadExt, BufReader};

#[tauri::command]
pub async fn export_bacpac(
    app_handle: tauri::AppHandle,
    export_request: ExportRequest,
) -> Result<String, String> {
    // Get connection from database
    let connection = connections::get_connection(app_handle.clone(), export_request.connection_id)
        .await
        .map_err(|e| format!("Failed to get connection: {}", e))?;

    // Build connection string
    let mut conn_for_export = connection.clone();
    if export_request.database_name != connection.database_name.clone().unwrap_or_default() {
        conn_for_export.database_name = Some(export_request.database_name.clone());
    }
    let connection_string = utils::build_connection_string(&conn_for_export);

    // Debug output to help troubleshoot connection string issues
    eprintln!("DEBUG - Connection details:");
    eprintln!("  Server: {}", conn_for_export.server);
    eprintln!("  Port: {:?}", conn_for_export.port);
    eprintln!("  Database: {:?}", conn_for_export.database_name);
    eprintln!("  Generated connection string: {}", connection_string);

    // Get sqlpackage path
    let sqlpackage_path = get_sqlpackage_path(&app_handle)?;

    // Build command arguments
    let source_cs_arg = format!("/SourceConnectionString:{}", connection_string);
    let target_file_arg = format!("/TargetFile:{}", export_request.output_path);

    // Execute sqlpackage with streaming output
    let mut child = tokio::process::Command::new(&sqlpackage_path)
        .arg("/Action:Export")
        .arg(&source_cs_arg)
        .arg(&target_file_arg)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to execute sqlpackage: {}", e))?;

    // Get stdout and stderr
    let stdout = child.stdout.take().ok_or("Failed to get stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to get stderr")?;

    // Create readers
    let mut stdout_reader = BufReader::new(stdout).lines();
    let mut stderr_reader = BufReader::new(stderr).lines();

    // Stream output
    let app_handle_clone = app_handle.clone();
    let stdout_task = tokio::spawn(async move {
        while let Ok(Some(line)) = stdout_reader.next_line().await {
            let _ = app_handle_clone.emit("export-progress", line);
        }
    });

    let app_handle_clone = app_handle.clone();
    let stderr_task = tokio::spawn(async move {
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            let _ = app_handle_clone.emit("export-progress", line);
        }
    });

    // Wait for process to complete
    let status = child.wait().await
        .map_err(|e| format!("Failed to wait for sqlpackage: {}", e))?;

    // Wait for output tasks to complete
    let _ = tokio::join!(stdout_task, stderr_task);

    if status.success() {
        Ok("Export completed successfully!".to_string())
    } else {
        Err(format!("Export failed with exit code: {:?}", status.code()))
    }
}

#[tauri::command]
pub async fn import_bacpac(
    app_handle: tauri::AppHandle,
    import_request: ImportRequest,
) -> Result<String, String> {
    // Get connection from database
    let connection = connections::get_connection(app_handle.clone(), import_request.connection_id)
        .await
        .map_err(|e| format!("Failed to get connection: {}", e))?;

    // Build connection string with target database
    let mut conn_for_import = connection.clone();
    conn_for_import.database_name = Some(import_request.target_database.clone());
    let connection_string = utils::build_connection_string(&conn_for_import);

    // Debug output to help troubleshoot connection string issues
    eprintln!("DEBUG - Connection details:");
    eprintln!("  Server: {}", conn_for_import.server);
    eprintln!("  Port: {:?}", conn_for_import.port);
    eprintln!("  Database: {:?}", conn_for_import.database_name);
    eprintln!("  Generated connection string: {}", connection_string);

    // Get sqlpackage path
    let sqlpackage_path = get_sqlpackage_path(&app_handle)?;

    // Build command arguments
    let source_file_arg = format!("/SourceFile:{}", import_request.bacpac_path);
    let target_cs_arg = format!("/TargetConnectionString:{}", connection_string);

    // Execute sqlpackage with streaming output
    let mut child = tokio::process::Command::new(&sqlpackage_path)
        .arg("/Action:Import")
        .arg(&source_file_arg)
        .arg(&target_cs_arg)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to execute sqlpackage: {}", e))?;

    // Get stdout and stderr
    let stdout = child.stdout.take().ok_or("Failed to get stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to get stderr")?;

    // Create readers
    let mut stdout_reader = BufReader::new(stdout).lines();
    let mut stderr_reader = BufReader::new(stderr).lines();

    // Stream output
    let app_handle_clone = app_handle.clone();
    let stdout_task = tokio::spawn(async move {
        while let Ok(Some(line)) = stdout_reader.next_line().await {
            let _ = app_handle_clone.emit("import-progress", line);
        }
    });

    let app_handle_clone = app_handle.clone();
    let stderr_task = tokio::spawn(async move {
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            let _ = app_handle_clone.emit("import-progress", line);
        }
    });

    // Wait for process to complete
    let status = child.wait().await
        .map_err(|e| format!("Failed to wait for sqlpackage: {}", e))?;

    // Wait for output tasks to complete
    let _ = tokio::join!(stdout_task, stderr_task);

    if status.success() {
        Ok("Import completed successfully!".to_string())
    } else {
        Err(format!("Import failed with exit code: {:?}", status.code()))
    }
}

#[tauri::command]
pub async fn import_bacpac_with_details(
    app_handle: tauri::AppHandle,
    import_request: ImportWithDetailsRequest,
) -> Result<String, String> {
    // Build connection from provided details
    let connection = SqlConnection {
        id: None,
        name: "Temporary Import Connection".to_string(),
        server: import_request.server,
        port: import_request.port,
        database_name: Some(import_request.target_database.clone()),
        username: import_request.username,
        password: import_request.password,
        connection_string: None,
        use_windows_auth: import_request.use_windows_auth,
        trust_server_cert: import_request.trust_server_cert,
        encrypt: import_request.encrypt,
        created_at: None,
        updated_at: None,
    };

    let connection_string = utils::build_connection_string(&connection);

    // Debug output
    eprintln!("DEBUG - Connection details:");
    eprintln!("  Server: {}", connection.server);
    eprintln!("  Port: {:?}", connection.port);
    eprintln!("  Database: {:?}", connection.database_name);
    eprintln!("  Generated connection string: {}", connection_string);

    // Get sqlpackage path
    let sqlpackage_path = get_sqlpackage_path(&app_handle)?;

    // Build command arguments
    let source_file_arg = format!("/SourceFile:{}", import_request.bacpac_path);
    let target_cs_arg = format!("/TargetConnectionString:{}", connection_string);

    // Execute sqlpackage with streaming output
    let mut child = tokio::process::Command::new(&sqlpackage_path)
        .arg("/Action:Import")
        .arg(&source_file_arg)
        .arg(&target_cs_arg)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to execute sqlpackage: {}", e))?;

    // Get stdout and stderr
    let stdout = child.stdout.take().ok_or("Failed to get stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to get stderr")?;

    // Create readers
    let mut stdout_reader = BufReader::new(stdout).lines();
    let mut stderr_reader = BufReader::new(stderr).lines();

    // Stream output
    let app_handle_clone = app_handle.clone();
    let stdout_task = tokio::spawn(async move {
        while let Ok(Some(line)) = stdout_reader.next_line().await {
            let _ = app_handle_clone.emit("import-progress", line);
        }
    });

    let app_handle_clone = app_handle.clone();
    let stderr_task = tokio::spawn(async move {
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            let _ = app_handle_clone.emit("import-progress", line);
        }
    });

    // Wait for process to complete
    let status = child.wait().await
        .map_err(|e| format!("Failed to wait for sqlpackage: {}", e))?;

    // Wait for output tasks to complete
    let _ = tokio::join!(stdout_task, stderr_task);

    if status.success() {
        Ok("Import completed successfully!".to_string())
    } else {
        Err(format!("Import failed with exit code: {:?}", status.code()))
    }
}

fn get_sqlpackage_path(_app_handle: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    // Check if sqlpackage is available in system PATH
    let which_cmd = if cfg!(target_os = "windows") {
        "where"
    } else {
        "which"
    };

    if let Ok(output) = std::process::Command::new(which_cmd)
        .arg("sqlpackage")
        .output()
    {
        if output.status.success() {
            let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path_str.is_empty() {
                return Ok(std::path::PathBuf::from(path_str));
            }
        }
    }

    Err(
        "sqlpackage is not installed or not in your system PATH.\n\
        Please install sqlpackage:\n\
        - macOS/Linux: Download from https://aka.ms/sqlpackage-linux or install via dotnet tool:\n\
          dotnet tool install -g Microsoft.SqlPackage\n\
        - Windows: Download from https://aka.ms/sqlpackage-windows\n\
        After installation, ensure it's in your system PATH.".to_string()
    )
}
