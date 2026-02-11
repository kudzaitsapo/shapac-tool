export function SqlPackageNotInstalled() {
  const handleOpenMicrosoftDocs = () => {
    // Open Microsoft SqlPackage documentation in default browser
    window.open("https://learn.microsoft.com/en-us/sql/tools/sqlpackage/sqlpackage-download", "_blank");
  };

  return (
    <div className="sqlpackage-missing-container">
      <div className="sqlpackage-missing-content">
        <div className="icon-container">
          <span className="warning-icon">⚠️</span>
        </div>

        <h1 className="missing-title">Microsoft SqlPackage Not Found</h1>

        <p className="missing-message">
          Microsoft SqlPackage is not installed on your computer. SqlPackage is required
          for Shapac Tool to import and export SQL Server BACPAC files.
        </p>

        <div className="instructions">
          <h2>Installation Instructions:</h2>
          <ol>
            <li>Visit the Microsoft website to download SqlPackage</li>
            <li>Follow the installation instructions for your operating system</li>
            <li>Once installed, restart this application</li>
          </ol>
        </div>

        <button
          className="btn-primary install-button"
          onClick={handleOpenMicrosoftDocs}
        >
          📥 Download SqlPackage from Microsoft
        </button>

        <p className="help-note">
          Need help? Visit the{" "}
          <a
            href="https://learn.microsoft.com/en-us/sql/tools/sqlpackage"
            target="_blank"
            rel="noopener noreferrer"
            className="help-link"
          >
            SqlPackage documentation
          </a>
        </p>
      </div>
    </div>
  );
}
