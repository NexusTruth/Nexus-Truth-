const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('window_minimize'),
    maximize: () => ipcRenderer.send('window_maximize'),
    close: () => ipcRenderer.send('window_close'),
    onTelemetry: (callback) => ipcRenderer.on('telemetry_data', (_event, value) => callback(value))
});
