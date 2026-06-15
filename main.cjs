const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        show: true,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('close', function (event) {
        event.preventDefault();
        mainWindow.hide();
    });
}

app.whenReady().then(() => {
    createWindow();

    tray = new Tray(path.join(__dirname, 'icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Dashboard', click: () => mainWindow.show() },
        { label: 'Quit Nexus Truth', click: () => {
            mainWindow.destroy();
            app.quit();
        }}
    ]);
    
    tray.setToolTip('Nexus Truth Node');
    tray.setContextMenu(contextMenu);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
