const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'public/logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.setMenuBarVisibility(false)

  // In production, load the built static files.
  // In dev, you'd point this at http://localhost:5173 instead.
  win.loadFile(path.join(__dirname, 'dist/index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
