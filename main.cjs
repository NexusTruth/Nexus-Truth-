const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        show: false, // Starts hidden to keep it sleek and non intrusive
        frame: false, // Removes standard operating system window borders
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // We will create index.html in the next step
    mainWindow.loadFile('index.html');

    // Hide the window when it loses focus so it behaves like a true tray app
    mainWindow.on('blur', () => {
        if (mainWindow) mainWindow.hide();
    });
}

function createTray() {
    // For now we use a basic placeholder icon path
    // We will supply real assets during compilation phase
    tray = new Tray(path.join(__dirname, 'icon.png'));
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Nexus Dashboard', click: () => mainWindow.show() },
        { type: 'separator' },
        { label: 'Exit', click: () => { app.quit(); } }
    ]);

    tray.setToolTip('Nexus Truth Core');
    tray.setContextMenu(contextMenu);

    // Toggle window visibility on tray single click
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();
    
    // Hide application from the dock on Mac systems for absolute secrecy
    if (app.dock) app.dock.hide();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
