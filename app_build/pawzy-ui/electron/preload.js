/**
 * electron/preload.js — Secure context bridge for renderer processes.
 *
 * Exposes a minimal, safe API surface to React via contextBridge.
 * Renderer code can ONLY use window.pawzy.* — no direct Node/Electron access.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pawzy', {
  /**
   * Send an action to the Python backend (via main.js → WS)
   * @param {string} action - e.g. "pause", "resume", "reset", "update_config"
   * @param {object} data   - optional payload
   */
  sendAction: (action, data = {}) => {
    ipcRenderer.send('user_action', { action, data });
  },

  /**
   * Read the current config from ~/.pawzy/config.json
   * @returns {Promise<object>}
   */
  readConfig: () => ipcRenderer.invoke('read_config'),

  /**
   * Save an updated config object to ~/.pawzy/config.json
   * Also notifies Python backend to reload.
   * @param {object} cfg
   * @returns {Promise<void>}
   */
  saveConfig: (cfg) => ipcRenderer.invoke('save_config', cfg),

  /**
   * Signal that onboarding is complete — closes the onboarding window.
   */
  closeOnboarding: () => ipcRenderer.send('onboarding_complete'),

  /** Read whether autostart on login is enabled */
  getAutostart: () => ipcRenderer.invoke('get_autostart'),

  /** Enable or disable autostart on login */
  setAutostart: (enabled) => ipcRenderer.invoke('set_autostart', enabled),

  /**
   * Listen for events sent from the main process (originated from Python backend)
   * @param {string} channel - event name
   * @param {function} callback - (data) => void
   * @returns {function} unsubscribe function
   */
  on: (channel, callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },

  /**
   * Listen for an event exactly once
   */
  once: (channel, callback) => {
    ipcRenderer.once(channel, (_, data) => callback(data));
  },
});
