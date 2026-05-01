/**
 * electron/main.js — Electron main process for Pawzy UI.
 *
 * Windows:
 *   - breakWindow:    Full-screen transparent overlay shown ONLY during breaks.
 *                     Contains the neko cat video + timer. Always-on-top.
 *                     Fully blocks mouse input — no click-through to desktop.
 *   - settingsWindow: Small centred panel for configuring timers. Opens from tray.
 *   - onboardingWindow: Full welcome flow shown only on first launch.
 */

const { app, BrowserWindow, ipcMain, screen, Notification, globalShortcut } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs   = require('fs');
const os   = require('os');
const WebSocket = require('ws');

// ── Single-instance lock ──────────────────────────────────────────────────────
// If a second instance is launched (e.g. desktop shortcut clicked while
// Pawzy is already running in the tray), focus/open Settings instead.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit(); // kill the second instance immediately
}
app.on('second-instance', () => {
  // User clicked the shortcut again — open Settings as a helpful response
  openSettingsWindow();
});
// ─────────────────────────────────────────────────────────────────────────────

const WS_URL          = 'ws://localhost:8765';
const LOCK_FILE       = path.join(__dirname, '../dist/lockscreen/index.html');
const SETTINGS_FILE   = path.join(__dirname, '../dist/settings/index.html');
const ONBOARDING_FILE = path.join(__dirname, '../dist/onboarding/index.html');
const CONFIG_PATH     = path.join(os.homedir(), '.pawzy', 'config.json');
const APP_ICON        = path.join(__dirname, '../assets/icon.png');

let breakWindow      = null;
let settingsWindow   = null;
let onboardingWindow = null;
let ws               = null;
let wsReconnectTimer = null;
let pythonProcess    = null;

const AUTOSTART_DIR  = path.join(os.homedir(), '.config', 'autostart');
const AUTOSTART_FILE = path.join(AUTOSTART_DIR, 'pawzy.desktop');

// -------------------------------------------------------------------------- //
// Config helpers (Node fs — runs in main process, safe)                      //
// -------------------------------------------------------------------------- //

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function writeConfig(cfg) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8');
}

// -------------------------------------------------------------------------- //
// Python backend spawner                                                      //
// -------------------------------------------------------------------------- //

function startPythonBackend() {
  if (!app.isPackaged) return; // dev mode: started by run_dev.sh

  const binary = path.join(process.resourcesPath, 'pawzy-core', 'pawzy-core');
  console.log('[Electron] Starting pawzy-core:', binary);

  pythonProcess = spawn(binary, [], {
    cwd: path.join(process.resourcesPath, 'pawzy-core'),
    stdio: 'pipe',
  });

  pythonProcess.stdout.on('data', d => console.log('[PawzyCore]', d.toString().trimEnd()));
  pythonProcess.stderr.on('data', d => console.error('[PawzyCore]', d.toString().trimEnd()));
  pythonProcess.on('exit', (code) => console.log('[PawzyCore] Exited with code', code));
}

// -------------------------------------------------------------------------- //
// Autostart helpers                                                           //
// -------------------------------------------------------------------------- //

// -------------------------------------------------------------------------- //
// Autostart helpers (Windows + Linux)                                        //
// -------------------------------------------------------------------------- //

function getAutostartEnabled() {
  if (process.platform === 'win32') {
    // Windows: check Startup folder for our shortcut
    const startupDir = path.join(os.homedir(), 'AppData', 'Roaming',
      'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
    return fs.existsSync(path.join(startupDir, 'Pawzy.lnk'))
      || fs.existsSync(path.join(startupDir, 'Pawzy.bat'));
  }
  return fs.existsSync(AUTOSTART_FILE);
}

function setAutostart(enabled) {
  if (process.platform === 'win32') {
    const startupDir = path.join(os.homedir(), 'AppData', 'Roaming',
      'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
    const batPath = path.join(startupDir, 'Pawzy.bat');
    if (enabled && app.isPackaged) {
      // Write a .bat that launches Pawzy silently in the background
      const bat = `@echo off\nstart "" "${process.execPath}" --hidden\n`;
      fs.mkdirSync(startupDir, { recursive: true });
      fs.writeFileSync(batPath, bat, 'utf8');
      console.log('[Electron] Windows autostart enabled.');
    } else {
      if (fs.existsSync(batPath)) fs.unlinkSync(batPath);
      console.log('[Electron] Windows autostart disabled.');
    }
    return;
  }
  // Linux: .desktop autostart
  if (enabled) {
    fs.mkdirSync(AUTOSTART_DIR, { recursive: true });
    const execPath = app.isPackaged ? process.execPath : '/bin/false';
    const desktop = [
      '[Desktop Entry]', 'Type=Application', 'Name=Pawzy',
      'Comment=Productivity break companion',
      `Exec=${execPath} --hidden`, 'Icon=pawzy', 'Terminal=false',
      'Categories=Utility;', 'X-GNOME-Autostart-enabled=true',
    ].join('\n') + '\n';
    fs.writeFileSync(AUTOSTART_FILE, desktop, 'utf8');
    console.log('[Electron] Linux autostart enabled.');
  } else {
    if (fs.existsSync(AUTOSTART_FILE)) fs.unlinkSync(AUTOSTART_FILE);
    console.log('[Electron] Linux autostart disabled.');
  }
}

// -------------------------------------------------------------------------- //
// Break window                                                                //
// -------------------------------------------------------------------------- //

function createBreakWindow() {
  const { bounds } = screen.getPrimaryDisplay();

  breakWindow = new BrowserWindow({
    width:  bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,       // hide from taskbar so it can't be clicked
    resizable: false,
    movable:   false,        // prevent dragging
    minimizable: false,      // block minimize button
    maximizable: false,
    closable:  false,        // block Alt+F4 / close during break
    hasShadow: false,
    fullscreenable: true,
    show: false,
    icon: APP_ICON,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  breakWindow.loadFile(LOCK_FILE);
  breakWindow.setIgnoreMouseEvents(false);

  // Instantly reclaim focus if anything steals it
  breakWindow.on('blur', () => {
    if (breakWindow && breakWindow.isVisible()) {
      breakWindow.focus();
    }
  });

  // Prevent minimize — restore immediately
  breakWindow.on('minimize', () => {
    if (breakWindow && breakWindow.isVisible()) {
      breakWindow.restore();
      breakWindow.setAlwaysOnTop(true, 'screen-saver');
      breakWindow.focus();
    }
  });

  // Prevent hiding via any other means during a break
  breakWindow.on('hide', () => {
    if (breakWindow && breakWindow.isVisible && _breakActive) {
      setTimeout(() => {
        if (breakWindow && _breakActive) breakWindow.show();
      }, 50);
    }
  });

  // If fullscreen is somehow exited during a break, re-enter it immediately
  breakWindow.on('leave-full-screen', () => {
    if (_breakActive && breakWindow) {
      setTimeout(() => {
        if (_breakActive && breakWindow) {
          breakWindow.setFullScreen(true);
          breakWindow.focus();
        }
      }, 80);
    }
  });

  // ── HARD CLOSE PREVENTION ──────────────────────────────────────────────
  // 'close' fires before the window is actually destroyed — preventDefault()
  // here is the only reliable way to block Alt+F4 on Windows.
  breakWindow.on('close', (e) => {
    if (_breakActive) {
      e.preventDefault();
    }
  });

  // Block keyboard shortcuts at the renderer level (Alt+Tab visuals, etc.)
  breakWindow.webContents.on('before-input-event', (event, input) => {
    if (_breakActive) {
      // Block Alt, F4, Escape, and modifier combos
      if (input.alt || input.key === 'Escape' || input.key === 'F4') {
        event.preventDefault();
      }
    }
  });

  // If the window is somehow destroyed, recreate it for the next break
  breakWindow.on('closed', () => {
    breakWindow = null;
    if (_breakActive) {
      // Forcibly ended during break — reset state and reopen
      console.warn('[Electron] Break window destroyed during break — recreating.');
      _breakActive = false;
      setTimeout(() => {
        createBreakWindow();
      }, 500);
    }
  });
}


let _breakActive = false;

function showBreakWindow(data) {
  // If the window was destroyed (e.g. forced close), recreate it first
  if (!breakWindow) {
    console.warn('[Electron] breakWindow was null — recreating before showing.');
    createBreakWindow();
    // Wait for the window to load before sending break_start
    breakWindow.webContents.once('did-finish-load', () => showBreakWindow(data));
    return;
  }
  _breakActive = true;

  // Swallow Alt+F4 at the OS level during the break
  try { globalShortcut.register('Alt+F4', () => {}); } catch (_) {}

  breakWindow.webContents.send('break_start', data);
  setTimeout(() => {
    if (!breakWindow) return;
    breakWindow.setAlwaysOnTop(true, 'screen-saver');
    breakWindow.show();
    breakWindow.setFullScreen(true);
    breakWindow.focus();
  }, 300);
}

function hideBreakWindow() {
  if (!breakWindow) return;
  _breakActive = false;

  // Release the Alt+F4 global shortcut now that the break is over
  try { globalShortcut.unregister('Alt+F4'); } catch (_) {}

  breakWindow.setFullScreen(false);
  setTimeout(() => {
    if (breakWindow) {
      breakWindow.hide();
      breakWindow.webContents.send('break_end', {});
    }
  }, 150);
}


// -------------------------------------------------------------------------- //
// Settings window                                                             //
// -------------------------------------------------------------------------- //

function openSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width:  620,
    height: 560,
    resizable: false,
    frame: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    title: 'Pawzy — Dashboard',
    icon: APP_ICON,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.setMenuBarVisibility(false);
  settingsWindow.loadFile(SETTINGS_FILE);
  settingsWindow.on('closed', () => { settingsWindow = null; });
}

// -------------------------------------------------------------------------- //
// Onboarding window                                                           //
// -------------------------------------------------------------------------- //

function openOnboardingWindow() {
  if (onboardingWindow) { onboardingWindow.focus(); return; }

  const { bounds } = screen.getPrimaryDisplay();

  onboardingWindow = new BrowserWindow({
    width:  560,
    height: 720,
    x: Math.round(bounds.x + (bounds.width  - 560) / 2),
    y: Math.round(bounds.y + (bounds.height - 720) / 2),
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    title: 'Welcome to Pawzy',
    icon: APP_ICON,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  onboardingWindow.loadFile(ONBOARDING_FILE);
  onboardingWindow.on('closed', () => { onboardingWindow = null; });
}

// -------------------------------------------------------------------------- //
// WebSocket client — connects to pawzy-core Python backend                   //
// -------------------------------------------------------------------------- //

function connectWebSocket() {
  if (wsReconnectTimer) { clearTimeout(wsReconnectTimer); wsReconnectTimer = null; }

  console.log(`[Electron] Connecting to ${WS_URL}...`);
  ws = new WebSocket(WS_URL);

  ws.on('open',  () => console.log('[Electron] Connected to pawzy-core ✅'));
  ws.on('close', () => {
    console.warn('[Electron] Disconnected — retrying in 3s...');
    wsReconnectTimer = setTimeout(connectWebSocket, 3000);
  });
  ws.on('error', (err) => console.error('[Electron] WS error:', err.message));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      handleBackendEvent(msg.event, msg.data);
    } catch (e) {
      console.error('[Electron] Bad WS message:', e);
    }
  });
}

function sendToPython(event, data = {}) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ event, data }));
  }
}

// -------------------------------------------------------------------------- //
// Event routing — backend → windows                                          //
// -------------------------------------------------------------------------- //

function handleBackendEvent(event, data) {
  switch (event) {
    case 'break_start':
      console.log('[Electron] Break started — showing cat overlay');
      showBreakWindow(data);
      break;

    case 'break_tick':
      if (breakWindow) breakWindow.webContents.send('break_tick', data);
      break;

    case 'break_end':
      console.log('[Electron] Break ended — hiding cat overlay');
      hideBreakWindow();
      break;

    case 'open_settings':
      openSettingsWindow();
      break;

    default:
      break;
  }
}

// -------------------------------------------------------------------------- //
// IPC handlers — renderer → main                                             //
// -------------------------------------------------------------------------- //

// Forward user actions to Python backend
ipcMain.on('user_action', (_, payload) => sendToPython('user_action', payload));

// Config read/write (invokable — returns a value)
ipcMain.handle('read_config', () => readConfig());

ipcMain.handle('save_config', (_, newCfg) => {
  writeConfig(newCfg);
  // Tell Python to reload its config
  sendToPython('user_action', { action: 'update_config' });
  console.log('[Electron] Config saved and Python notified.');
});

// Onboarding complete — close onboarding window
ipcMain.on('onboarding_complete', () => {
  console.log('[Electron] Onboarding complete.');
  if (onboardingWindow) { onboardingWindow.close(); onboardingWindow = null; }
});

// Autostart read / write
ipcMain.handle('get_autostart', () => getAutostartEnabled());
ipcMain.handle('set_autostart', (_, enabled) => setAutostart(enabled));

// -------------------------------------------------------------------------- //
// App lifecycle                                                               //
// -------------------------------------------------------------------------- //

app.whenReady().then(() => {
  if (!gotLock) return; // second instance already quit above

  createBreakWindow();

  // Start bundled Python backend (production only)
  startPythonBackend();

  // Auto-enable startup on login the very first time (packaged only)
  if (app.isPackaged && !getAutostartEnabled()) {
    setAutostart(true);
    console.log('[Electron] Autostart enabled automatically on first run.');
  }

  // Check first_launch flag
  const cfg = readConfig();
  if (cfg.first_launch !== false) {
    setTimeout(openOnboardingWindow, 800);
  } else {
    // If not launched via autostart (no --hidden flag), open the dashboard immediately
    if (!process.argv.includes('--hidden')) {
      setTimeout(openSettingsWindow, 800);
    } else {
      // Show a tray notification so the user knows Pawzy started in background
      setTimeout(() => {
        if (Notification.isSupported()) {
          new Notification({
            title: 'Pawzy is running 🐾',
            body: 'Look for the paw icon in your system tray.',
            silent: true,
          }).show();
        }
      }, 3000);
    }
  }

  // In production give binary 2s to start; in dev it's already running
  const wsDelay = app.isPackaged ? 2000 : 1500;
  setTimeout(connectWebSocket, wsDelay);

  app.on('activate', () => { if (!breakWindow) createBreakWindow(); });
});

app.on('window-all-closed', () => {
  // Stay alive on Linux/Windows (tray keeps running)
  if (process.platform === 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (ws) ws.close();
  if (pythonProcess) { pythonProcess.kill('SIGTERM'); }
});
