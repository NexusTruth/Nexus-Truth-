const { app, BrowserWindow, ipcMain } = require('electron');

// CRITICAL FIX: Disables GPU acceleration to prevent Windows laptops from going blank when rendering the interface
app.disableHardwareAcceleration();

const path = require('path');
const si = require('systeminformation');
const http = require('http');

let mainWindow;
let iceAgeEngaged = false;
let overloadCounter = 0;

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
            const isTempBlocked = (realTemp === 0);

            // Ice Age Protocol logic using real sensor data or fallback CPU
            if (!isTempBlocked) {
                if (realTemp >= 80) {
                    iceAgeEngaged = true;
                    console.log('CRITICAL: Thermal limit breached. Ice Age Protocol ENGAGED.');
                } else if (realTemp <= 60) {
                    iceAgeEngaged = false;
                }
            } else {
                // Fallback protection if Windows blocks temperature sensors
                if (realCpu >= 90) {
                    overloadCounter++;
                    if (overloadCounter >= 3) {
                        iceAgeEngaged = true;
                        console.log('CRITICAL: CPU Load limit breached while temp blocked. Ice Age Protocol ENGAGED.');
                    }
                } else {
                    overloadCounter = 0;
                    if (realCpu <= 60) {
                        iceAgeEngaged = false;
                    }
                }
            }

            // 1. Original IPC Communication for local interface
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('telemetry_data', {
                    cpu: iceAgeEngaged ? 0 : realCpu,
                    ram: realMem,
                    temp: realTemp,
                    throttled: iceAgeEngaged,
                    tempBlocked: isTempBlocked
                });
            }

            // 2. New HTTP Broadcast for external network integration
            const metrics = {
                cpuUsage: iceAgeEngaged ? 0 : realCpu,
                cpuTemperature: realTemp,
                memoryAllocated: mem.active,
                memorySystem: mem.total,
                status: "active"
            };

            const payload = JSON.stringify(metrics);
            const ports = [3000, 5173, 8080, 8000, 3001];

            ports.forEach(port => {
                const options = {
                    hostname: '127.0.0.1',
                    port: port,
                    path: '/api/metrics',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(payload)
                    }
                };

                const req = http.request(options, res => {
                    if (res.statusCode === 200) {
                        // Connection successful
                    }
                });

                req.on('error', error => {
                    // Port inactive
                });

                req.write(payload);
                req.end();
            });

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
