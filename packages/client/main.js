const { app, BrowserWindow } = require('electron');

const isDev = (() => {
    // copied from https://github.com/sindresorhus/electron-is-dev/blob/main/index.js
    
    const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
    const getFromEnv = Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
    
    return isEnvSet ? getFromEnv : !app.isPackaged;
})();

let appWindow;

function initWindow() {
    appWindow = new BrowserWindow({
        // fullscreen: true,
        height: 800,
        width: 1000,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // Electron Build Path
    appWindow.loadURL(
        isDev
            ? 'http://localhost:4200'
            : `file://${__dirname}/dist/client/index.html`
    );
    

    appWindow.setMenuBarVisibility(false)

    // Initialize the DevTools.
    // appWindow.webContents.openDevTools()

    appWindow.on('closed', function () {
        appWindow = null;
    });
}

app.on('ready', initWindow);

// Close when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (appWindow === null) {
        initWindow();
    }
});