const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');

let mainWindow;

let previousCpuTimes = getCpuTimes();

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
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        }
    });

    mainWindow.loadFile('index.html');

    setInterval(() => {
        const cpuLoad = calculateCpuUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMemPercentage = Math.floor(((totalMem - freeMem) / totalMem) * 100);

        const baseTemp = 38;
        const tempFluctuation = Math.floor(Math.random() * 4);
        const temperature = baseTemp + Math.floor(cpuLoad * 0.45) + tempFluctuation;

        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('telemetry-data', {
                cpu: cpuLoad,
                ram: usedMemPercentage,
                temp: temperature
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
