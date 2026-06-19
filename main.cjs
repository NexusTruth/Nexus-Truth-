const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const si = require('systeminformation');

let mainWindow;
let iceAgeEngaged = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 750,
        frame: false,
        backgroundColor: '#ffffff',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        }
    });

    mainWindow.loadFile('index.html');

    // Real hardware monitoring loop reading physical motherboard sensors
    setInterval(async () => {
        try {
            const cpuLoad = await si.currentLoad();
            const mem = await si.mem();
            const temp = await si.cpuTemperature();

            const realCpu = Math.floor(cpuLoad.currentLoad);
            const realMem = Math.floor((mem.active / mem.total) * 100);
            const realTemp = temp.main || 0; 

            // Ice Age Protocol logic using real sensor data
            if (realTemp >= 80) {
                iceAgeEngaged = true;
                console.log('CRITICAL: Thermal limit 80C breached. Ice Age Protocol ENGAGED.');
            } else if (realTemp <= 60) {
                iceAgeEngaged = false;
            }

            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('telemetry_data', {
                    cpu: iceAgeEngaged ? 0 : realCpu,
                    ram: realMem,
                    temp: realTemp,
                    throttled: iceAgeEngaged
                });
            }
        } catch (error) {
            console.error('Hardware telemetry error:', error);
        }
    }, 2000);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('window_minimize', () => mainWindow.minimize());
ipcMain.on('window_maximize', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
});
ipcMain.on('window_close', () => mainWindow.close());
