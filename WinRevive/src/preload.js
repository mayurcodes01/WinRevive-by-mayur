const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // IPC send (fire-and-forget)
  send: (channel, data) => {
    const allowed = ['minimize-window', 'close-window', 'open-logs', 'save-log'];
    if (allowed.includes(channel)) ipcRenderer.send(channel, data);
  },
  // IPC invoke (returns promise)
  invoke: (channel, ...args) => {
    const allowed = ['run-bat', 'run-python', 'run-demo', 'get-sysinfo'];
    if (allowed.includes(channel)) return ipcRenderer.invoke(channel, ...args);
  },
  // IPC receive
  on: (channel, callback) => {
    const allowed = ['script-output', 'log-saved'];
    if (allowed.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
