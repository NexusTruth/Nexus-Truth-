const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        backgroundColor: '#ffffff',
        frame: false,
        icon: path.join(__dirname, 'logo.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('close', function (event) {
        event.preventDefault();
        mainWindow.hide(); // Hides to the taskbar/tray instead of killing the node
    });
}

app.whenReady().then(() => {
    createWindow();

    // Points specifically to your globe logo file
    tray = new Tray(path.join(__dirname, 'logo.png'));
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Nexus Truth', click: () => mainWindow.show() },
        { label: 'Quit', click: () => {
            mainWindow.destroy();
            app.quit();
        }}
    ]);
    
    tray.setToolTip('Nexus Truth AI Node');
    tray.setContextMenu(contextMenu);

    // Allows users to open the UI with a simple left-click on the toolbar icon
    tray.on('click', () => {
        mainWindow.show();
    });
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
