const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;

const LOGS_DIR = path.join(os.homedir(), 'WinRevive_Logs');

// Ensure logs directory exists at startup
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 720,
    height: 600,
    minWidth: 620,
    minHeight: 500,
    maxWidth: 1200,
    maxHeight: 900,
    resizable: true,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    roundedCorners: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'WinRevive'
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Window controls
ipcMain.on('minimize-window', () => mainWindow.minimize());
ipcMain.on('close-window', () => app.quit());

// ─── LOG FILE SAVING ─────────────────────────────────────────────
ipcMain.on('save-log', (event, { taskName, lines }) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${taskName}_${timestamp}.log`;
    const filepath = path.join(LOGS_DIR, filename);
    const header = `WinRevive Log — Task: ${taskName}\nDate: ${new Date().toLocaleString()}\n${'─'.repeat(48)}\n\n`;
    fs.writeFileSync(filepath, header + lines.join('\n'), 'utf8');
    event.reply('log-saved', { success: true, filepath });
  } catch (err) {
    event.reply('log-saved', { success: false, error: err.message });
  }
});

// ─── RUN BAT SCRIPT ──────────────────────────────────────────────
ipcMain.handle('run-bat', async (event, scriptName) => {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '../scripts', scriptName);

    if (!fs.existsSync(scriptPath)) {
      resolve({ success: false, output: `Script not found: ${scriptName}` });
      return;
    }

    const proc = spawn('cmd.exe', ['/c', scriptPath], {
      shell: true,
      windowsHide: true
    });

    let output = '';
    let error = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
      mainWindow.webContents.send('script-output', data.toString());
    });

    proc.stderr.on('data', (data) => {
      error += data.toString();
      mainWindow.webContents.send('script-output', data.toString());
    });

    proc.on('close', (code) => {
      resolve({ success: code === 0, output: output || error });
    });
  });
});

// ─── RUN PYTHON SCRIPT ───────────────────────────────────────────
ipcMain.handle('run-python', async (event, scriptName, args = []) => {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '../scripts', scriptName);

    if (!fs.existsSync(scriptPath)) {
      resolve({ success: false, output: `Script not found: ${scriptName}` });
      return;
    }

    const proc = spawn('python', [scriptPath, ...args], { windowsHide: true });

    let output = '';
    let error = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
      mainWindow.webContents.send('script-output', data.toString());
    });

    proc.stderr.on('data', (data) => {
      error += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ success: code === 0, output: output || error });
    });
  });
});

// ─── SYSTEM INFO ─────────────────────────────────────────────────
ipcMain.handle('get-sysinfo', async () => {
  return {
    platform:  os.platform(),
    arch:      os.arch(),
    hostname:  os.hostname(),
    totalMem:  (os.totalmem()  / 1073741824).toFixed(1) + ' GB',
    freeMem:   (os.freemem()   / 1073741824).toFixed(1) + ' GB',
    cpus:      os.cpus().length,
    uptime:    Math.floor(os.uptime() / 3600) + 'h ' + Math.floor((os.uptime() % 3600) / 60) + 'm',
    osVersion: os.release()
  };
});

// ─── OPEN LOGS FOLDER ────────────────────────────────────────────
ipcMain.on('open-logs', () => {
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
  shell.openPath(LOGS_DIR);
});

// ─── DEMO MODE ───────────────────────────────────────────────────
ipcMain.handle('run-demo', async (event, taskName) => {
  return new Promise((resolve) => {
    const steps = getDemoSteps(taskName);
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        mainWindow.webContents.send('script-output', steps[i] + '\n');
        i++;
      } else {
        clearInterval(interval);
        resolve({ success: true, output: 'Task completed successfully.' });
      }
    }, 180);
  });
});

function getDemoSteps(task) {
  const steps = {
    repair: [
      'Checking system file integrity...',
      'Running DISM health scan...',
      'DISM: No component store corruption detected.',
      'Running SFC /scannow...',
      'SFC: Windows Resource Protection did not find any integrity violations.',
      'Checking Windows Update components...',
      'Resetting Windows Update cache...',
      'Repair complete. System healthy.'
    ],
    junk: [
      'Scanning Temp folders...',
      'Found 1.2 GB in %TEMP%',
      'Found 340 MB in Windows Temp',
      'Clearing browser caches...',
      'Removing prefetch files...',
      'Clearing DNS cache...',
      'Emptying Recycle Bin...',
      'Cleaned 2.1 GB of junk files.'
    ],
    internet: [
      'Resetting TCP/IP stack...',
      'Flushing DNS cache...',
      'Resetting Winsock catalog...',
      'Releasing IP address...',
      'Renewing IP address...',
      'Disabling proxy settings...',
      'Internet stack repaired. Restart may be required.'
    ],
    malware: [
      'Scanning startup entries...',
      'Checking scheduled tasks for anomalies...',
      'Scanning hosts file for hijacks...',
      'Checking browser extensions registry...',
      'Scanning running processes...',
      'No suspicious entries detected.',
      'Scan complete. System appears clean.'
    ],
    restore: [
      'Checking System Restore status...',
      'System Restore is enabled.',
      'Creating restore point: WinRevive_Backup',
      'Restore point created successfully.',
      'Label: WinRevive Auto Restore Point'
    ],
    diagnostics: [
      'Collecting system information...',
      'Reading event logs (last 24h)...',
      'Checking disk health (SMART)...',
      'Checking memory status...',
      'Analyzing startup programs...',
      'Generating report...',
      'Diagnostics report saved to WinRevive_Logs folder.'
    ]
  };
  return steps[task] || ['Running task...', 'Done.'];
}
