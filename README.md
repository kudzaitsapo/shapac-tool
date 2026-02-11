# Shapac Tool

A modern desktop application for managing SQL Server database connections and performing BACPAC export/import operations. Built with Tauri, React, and Rust for a fast, lightweight, and cross-platform experience.

## Features

- **Connection Management**: Store and manage multiple SQL Server connection profiles
- **BACPAC Export**: Export SQL Server databases to BACPAC files for backup and migration
- **BACPAC Import**: Import BACPAC files into SQL Server databases
- **Authentication Support**:
  - Windows Authentication
  - SQL Server Authentication
- **Security Options**:
  - Trust Server Certificate
  - Encrypt connection
- **Theme Support**: Light, dark, and system themes
- **Persistent Storage**: SQLite-based local storage for connection profiles
- **Cross-Platform**: Built with Tauri for native performance on Windows, macOS, and Linux

## Prerequisites

Before running Shapac Tool, ensure you have the following installed:

1. **Microsoft SqlPackage** - Required for BACPAC operations
   - **Windows**: Download from [Microsoft SqlPackage](https://docs.microsoft.com/en-us/sql/tools/sqlpackage)
   - **macOS/Linux**: Install via dotnet tool:
     ```bash
     dotnet tool install -g microsoft.sqlpackage
     ```

2. **Node.js** (v18 or higher) - For development
3. **Rust** (latest stable) - For development
4. **SQL Server** - The target database server

## Installation

### Download Pre-built Binary

Download the latest release for your platform from the [Releases](../../releases) page.

### Build from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/shapac-tool.git
   cd shapac-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build and run:
   ```bash
   npm run tauri build
   ```

## Usage

### Managing Connections

1. Click the **"New Connection"** button to add a SQL Server connection
2. Fill in the connection details:
   - Connection name (for easy identification)
   - Server address
   - Port (optional, defaults to 1433)
   - Database name (optional)
   - Authentication method (Windows or SQL Server)
   - Security options (Trust Server Certificate, Encrypt)
3. Click **"Save"** to store the connection

### Exporting a Database

1. Select a connection from your saved connections list
2. Click the **Export** button
3. Choose the database to export (if not specified in the connection)
4. Select the output location for the BACPAC file
5. Monitor the progress and wait for completion

### Importing a BACPAC

1. Click the **"Import"** button in the toolbar
2. Choose between:
   - **Use Saved Connection**: Select an existing connection profile
   - **Enter Details**: Provide connection details manually
3. Select the BACPAC file to import
4. Specify the target database name
5. Monitor the progress and wait for completion

### Settings

Access the settings dialog to customize:
- **Theme**: Choose between Light, Dark, or System theme
- Additional preferences as they become available

## Development

### Project Structure

```
shapac-tool/
├── src/                    # React frontend source
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── contexts/         # React contexts
│   └── types/            # TypeScript type definitions
├── src-tauri/            # Rust backend source
│   └── src/
│       ├── commands/     # Tauri command handlers
│       ├── db/          # Database operations
│       ├── models/      # Data models
│       └── utils/       # Utility functions
└── public/              # Static assets
```

### Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite

**Backend:**
- Rust
- Tauri 2.0
- SQLite (via rusqlite)
- Tokio (async runtime)

**Dependencies:**
- @tauri-apps/api - Frontend-backend communication
- @tauri-apps/plugin-dialog - File dialogs
- @tauri-apps/plugin-opener - System opener
- serde - Serialization/deserialization
- chrono - Date/time handling

### Development Commands

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm run tauri build
```

Run Tauri development mode:
```bash
npm run tauri dev
```

### Adding New Features

1. **Frontend**: Add components in `src/components/` and hooks in `src/hooks/`
2. **Backend**: Add commands in `src-tauri/src/commands/` and register them in `lib.rs`
3. **Database**: Update models in `src-tauri/src/models/` and migrations in `src-tauri/src/db/`

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Architecture

Shapac Tool uses a modern desktop application architecture:

1. **UI Layer**: React-based frontend provides an intuitive user interface
2. **Application Layer**: Tauri bridges the frontend with the Rust backend
3. **Business Logic**: Rust backend handles:
   - Connection management
   - SqlPackage command execution
   - Database operations (SQLite)
   - File system operations
4. **Storage Layer**: SQLite stores connection profiles and preferences locally

## Troubleshooting

### SqlPackage Not Found

If the application shows "SqlPackage is not installed":
1. Verify SqlPackage is installed: `sqlpackage /version`
2. Ensure SqlPackage is in your system PATH
3. Restart the application after installation

### Connection Failures

- Verify SQL Server is running and accessible
- Check firewall settings allow connections on the specified port
- Ensure credentials are correct
- Try enabling "Trust Server Certificate" if using self-signed certificates

### Export/Import Errors

- Check you have sufficient permissions on the SQL Server
- Ensure sufficient disk space for BACPAC files
- Verify the database name is correct
- Check SqlPackage logs for detailed error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Tauri](https://tauri.app/)
- Uses [Microsoft SqlPackage](https://docs.microsoft.com/en-us/sql/tools/sqlpackage) for BACPAC operations
- Developed by [Shesha.io](https://shesha.io)

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.
