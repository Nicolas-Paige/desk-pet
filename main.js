const { app, BrowserWindow, ipcMain, Menu, screen } = require('electron')
const path = require('path')

const PET_WIDTH = 280
const PET_HEIGHT = 340

let mainWindow = null

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createWindow() {
  const { workAreaSize } = screen.getPrimaryDisplay()
  const x = workAreaSize.width - PET_WIDTH - 50
  const y = workAreaSize.height - PET_HEIGHT - 100

  mainWindow = new BrowserWindow({
    width: PET_WIDTH,
    height: PET_HEIGHT,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.setAlwaysOnTop(true, 'screen-saver')
  mainWindow.setVisibleOnAllWorkspaces(true)

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'))

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.on('move-window', (_, deltaX, deltaY) => {
  if (!mainWindow) return
  const [currentX, currentY] = mainWindow.getPosition()
  mainWindow.setPosition(currentX + deltaX, currentY + deltaY)
})

ipcMain.on('resize-window', (_, scale) => {
  if (!mainWindow) return
  const newWidth = Math.round(PET_WIDTH * scale)
  const newHeight = Math.round(PET_HEIGHT * scale)
  mainWindow.setSize(newWidth, newHeight)
})

ipcMain.on('get-window-size', (event) => {
  if (!mainWindow) return
  const [width, height] = mainWindow.getSize()
  event.sender.send('window-size', { width, height })
})

ipcMain.on('show-context-menu', (event) => {
  const template = [
    {
      label: '切换状态',
      submenu: [
        { label: '打招呼 (Hello)', click: () => event.sender.send('set-mood', 'hello') },
        { label: '休息 (Rest)', click: () => event.sender.send('set-mood', 'rest') },
        { label: '超级开心 (Happy)', click: () => event.sender.send('set-mood', 'happy') },
        { label: '眨眼俏皮 (Wink)', click: () => event.sender.send('set-mood', 'wink') },
      ],
    },
    { type: 'separator' },
    {
      label: '设置',
      click: () => event.sender.send('open-settings'),
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        if (mainWindow) {
          mainWindow.close()
        }
      },
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  menu.popup({ window: mainWindow })
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  app.quit()
})