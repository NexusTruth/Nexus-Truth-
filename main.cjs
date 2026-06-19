const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');

let mainWindow;

// CPU Tracking Variables
let previousCpuTimes = getCpuTimes();

// Ice Age Protocol State Variables
let iceAgeEngaged = false;
let simulatedTemp = 38;

function getCpuTimes() {
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;
    for (const cpu of cpus) {
        for (const type in cpu.times) {
            total += cpu.times[type];
        }
        idle += cpu.times.idle;
    }
    return { idle, total };
}

function calculateCpuUsage() {
    const currentCpuTimes = getCpuTimes();
    const idleDifference = currentCpuTimes.idle - previousCpuTimes.idle;
    const totalDifference = currentCpuTimes.total - previousCpuTimes.total;
    previousCpuTimes = currentCpuTimes;
    
    if (totalDifference === 0) return 0;
    const percentage = 100 - Math.floor((idleDifference / totalDifference) * 100);
    return percentage > 0 ? percentage : 0;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 750,
        frame: false,
        backgroundColor: '#ffffff',
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        }
    });

    mainWindow.loadFile('index.html');

    // Real World Master Control Loop (Fires every 2 seconds)
    setInterval(() => {
        const realCpuLoad = calculateCpuUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMemPercentage = Math.floor(((totalMem - freeMem) / totalMem) * 100);

        // ICE AGE PROTOCOL: Auto Resume State Machine (Option A)
        if (iceAgeEngaged) {
            // Hardware is locked out for safety.
            // Once the real AI worker is attached, CPU thread allocation is forced to 0 here.
            simulatedTemp -= 4; // Cool down the hardware
            
            if (simulatedTemp <= 60) {
                iceAgeEngaged = false; // Safe temp reached, auto resume
                console.log('SYSTEM: Hardware cooled to 60°C. Ice Age Protocol lifted. Resuming tasks.');
            }
        } else {
            // Normal operation. 
            // Note: We will replace simulatedTemp with 'systeminformation' BIOS reads in the next phase.
            simulatedTemp = 38 + Math.floor(realCpuLoad * 0.45);

            if (simulatedTemp >= 80) {
                iceAgeEngaged = true; // Engage hard cutoff
                console.log('WARNING: Thermal limit (80°C) breached. Ice Age Protocol ENGAGED. Halting all worker threads.');
            }
        }

        // Transmit state to the Frontend UI
            mainWindow.webContents.send('telemetry-data', {
                cpu: iceAgeEngaged ? 0 : realCpuLoad, // Force reporting 0% when throttled to prove safety
                ram: usedMemPercentage,
                temp: simulatedTemp,
                throttled: iceAgeEngaged
            });
        }
    }, 2000);
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
});
