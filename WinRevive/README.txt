WinRevive-Mayur dhole
Windows Recovery and Optimization Suite
Version 1.0.0


OVERVIEW

WinRevive is a desktop utility built with Electron, BAT scripting, and Python that provides a clean, professional interface for common Windows maintenance and recovery tasks. The application runs at a fixed 450x500 window size and features a monospace interface with multiple color themes.

The tool is designed for both technical users who want quick access to Windows repair commands and non-technical users who benefit from the guided interface and demo mode.


FEATURES

Recovery Tools
  Windows Repair      Runs DISM health scan and SFC system file checker
  Restore Point       Creates a Windows System Restore checkpoint via PowerShell
  
Optimization Tools
  Clean Junk          Removes Temp files, Prefetch, flushes DNS, empties Recycle Bin
  Fix Internet        Resets TCP/IP stack, Winsock catalog, releases and renews IP

Security and Diagnostics
  Malware Scan        Checks startup registry entries, scheduled tasks, hosts file, and running processes for suspicious activity
  Diagnostics         Python script that generates a full system report saved to WinRevive_Logs in your home directory

Interface
  Console Output tab  Shows live output from all running scripts with timestamps and color-coded message types
  System Info tab     Displays hostname, platform, OS version, RAM, CPU cores, and uptime
  Settings tab        Theme switcher (Dark, Light, Dark Blue), toggle for auto-scroll, demo mode, and log saving


REQUIREMENTS

Node.js 18 or later
npm 9 or later
Python 3.8 or later (optional, required only for the Diagnostics tool)
Windows 10 or Windows 11 (BAT scripts require Windows; demo mode works on any OS)


INSTALLATION

1. Clone or download this repository.

2. Open a terminal in the project root folder.

3. Install dependencies:
   npm install

4. Start the application:
   npm start


BUILDING AN EXECUTABLE

To build a standalone Windows installer:

   npm run build

The output will be placed in the dist folder. The installer is a standard NSIS setup file that users can run to install WinRevive as a normal Windows application.


PROJECT STRUCTURE

WinRevive
  src
    main.js        Electron main process, IPC handlers, script execution
    preload.js     Exposes ipcRenderer to the renderer process
    index.html     Complete UI: tabs, tool buttons, log output, settings
  scripts
    repair.bat     Windows SFC and DISM repair commands
    cleanjunk.bat  Temp file and cache cleanup
    fixnet.bat     TCP/IP, DNS, and Winsock reset
    malwarescan.bat  Startup and process anomaly detection
    restore.bat    System Restore point creation via PowerShell
    diagnostics.py  Python system diagnostics and log export
  assets
    icon.png       Application icon (add your own)
  package.json     Electron app configuration and build settings
  README.txt       This file


DEMO MODE

Demo mode is enabled by default in Settings. When active, all tool buttons simulate their respective tasks without executing any real system commands. This is useful for:

  Testing the interface on non-Windows machines
  Previewing tool output before running on a production system
  Demonstrating the application without administrator privileges

To run real commands, disable Demo Mode in the Settings tab. Note that several tools (SFC, DISM, network reset, restore points) require the application to be run as Administrator.


THEMES

Three color themes are available in the Settings tab:

  Dark        Black background, white accents (default)
  Light       Light gray background, black accents
  Dark Blue   Deep navy background, blue-tinted accents

Theme preference is not currently persisted between sessions. This can be added by writing the selected theme to a local config file via the Electron main process.


LOGS

When Save Logs is enabled in Settings, the Python diagnostics script writes output to a folder called WinRevive_Logs inside your home directory. You can open this folder directly from the Output tab using the Open Folder button.

BAT script output is currently displayed in the Console Output tab only. Persistent log writing for BAT scripts can be added by redirecting script output to a file in the main process.


EXTENDING THE APPLICATION

Adding a New Tool

1. Create a new BAT or Python script in the scripts folder.
2. Add a new button in the tool-grid section of src/index.html.
3. Set data-task to a unique identifier and data-script to your script filename.
4. Add a corresponding entry in the getDemoSteps function in src/main.js to support demo mode.

Converting to an EXE

Run npm run build. Electron Builder packages the application with Chromium and Node.js into a self-contained executable. No external runtime is required on the target machine for the Electron portion, but Python must still be installed separately if you use the diagnostics script.

Integrating with a SaaS Backend

The main process can be extended to send log data to a remote API using the built-in https module in Node.js. Replace or augment the file-writing logic in diagnostics.py or add an ipcMain handler in main.js that posts results to an endpoint.


KNOWN LIMITATIONS

The application window is fixed at 450x500 and is not resizable by design.

BAT scripts that produce large volumes of output may cause the log panel to scroll slowly. The autoscroll toggle can be disabled to mitigate this.

Some Windows operations require elevation (Administrator). If a script fails silently, try running WinRevive as Administrator by right-clicking the executable and selecting Run as Administrator.

The Malware Scan tool detects symptoms and anomalies based on heuristic checks. It is not a replacement for a full antivirus solution.


LICENSE

This project is released for personal and educational use. No warranty is provided. Use at your own risk when running on production systems.
