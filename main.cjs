const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 450,
        resizable: false,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        icon: path.join(__dirname, 'logo.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    // Handles window close events by hiding to system tray
    mainWindow.on('close', function (event) {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
}

app.whenReady().then(() => {
    createWindow();

    // Sets the toolbar tray icon to your globe logo
    tray = new Tray(path.join(__dirname, 'logo.png'));
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Nexus Truth', click: () => mainWindow.show() },
        { label: 'Quit Node', click: () => {
            app.isQuitting = true;
            mainWindow.destroy();
            app.quit();
        }}
    ]);
    
    tray.setToolTip('Nexus Truth AI Node');
    tray.setContextMenu(contextMenu);

    // Restores the interface immediately when clicking the globe icon in the toolbar
    tray.on('click', () => {
        mainWindow.show();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
