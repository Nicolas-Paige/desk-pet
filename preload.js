const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('petAPI', {
  moveWindow: (deltaX, deltaY) => ipcRenderer.send('move-window', deltaX, deltaY),
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
  resizeWindow: (scale) => ipcRenderer.send('resize-window', scale),
  onSetMood: (callback) => {
    ipcRenderer.on('set-mood', (_, mood) => callback(mood))
  },
  onOpenSettings: (callback) => {
    ipcRenderer.on('open-settings', () => callback())
  },
})