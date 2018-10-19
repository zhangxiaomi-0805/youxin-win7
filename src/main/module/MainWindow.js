import { BrowserWindow } from 'electron'

var MainWindow = function () {
  this.init()
}

MainWindow.prototype.getWinInstance = function () {
  return this.mainWindow
}

MainWindow.prototype.init = function () {
  this.loginOpts = {
    frame: process.platform !== 'win32',
    titleBarStyle: process.platform !== 'win32' ? 'hidden' : 'default',
    width: 320,
    height: 418,
    minWidth: 320,
    minHeight: 418,
    // minimizable: false,
    maximizable: false,
    fullscreen: false,
    fullscreenable: false,
    resizable: false,
    zoomToPageWidth: false,
    webPreferences: {
      webSecurity: false
      // devTools: false
    }
  }

  // 登录后主界面窗口选项
  this.mainOpts = {
    width: 922,
    height: 645,
    minWidth: 922,
    minHeight: 596,
    minimizable: true,
    maximizable: true,
    fullscreen: true,
    fullscreenable: true,
    resizable: true,
    zoomToPageWidth: false
  }
  this.loaded = false
  this.createWindow()
  this.initIPC()
}

const loginWindowURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

MainWindow.prototype.createWindow = function () {
  if (process.platform !== 'darwin' && process.platform !== 'win32') return
  this.mainWindow = new BrowserWindow(this.loginOpts)
  this.mainWindow.loadURL(loginWindowURL)
  var _this = this
  this.mainWindow.on('ready-to-show', function () {
    _this.mainWindow.show()
  })
  this.mainWindow.on('maximize', () => {
    _this.mainWindow.webContents.send('doMax')
  })
  this.mainWindow.on('restore', () => {
    _this.mainWindow.webContents.send('doRestore')
  })
  this.mainWindow.on('unmaximize', () => {
    _this.mainWindow.webContents.send('doRestore')
  })
}

MainWindow.prototype.show = function () {
  this.mainWindow.show()
}

MainWindow.prototype.hide = function () {
  this.mainWindow.hide()
}

MainWindow.prototype.destroy = function () {
  this.mainWindow = null
}

MainWindow.prototype.initIPC = function () {

}

MainWindow.prototype.maximize = function () {
  this.mainWindow.maximize()
}

MainWindow.prototype.minimize = function () {
  this.mainWindow.minimize()
}

MainWindow.prototype.restore = function () {
  this.mainWindow.restore()
}

MainWindow.prototype.getSize = function () {
  let size = this.mainWindow.getSize()
  let isLogin = false
  if (size[0] === this.loginOpts.width && size[1] === this.loginOpts.height) {
    // 当前在登录页
    isLogin = true
  }
  return isLogin
}

/**
 * 登录后改变窗口大小
 */
MainWindow.prototype.reset = function () {
  const electron = require('electron')
  var opts, screenWidth, screenHeight, display
  display = electron.screen.getPrimaryDisplay()
  screenWidth = display.bounds.width
  screenHeight = display.bounds.height
  opts = this.mainOpts

  this.mainWindow.setBounds({
    x: Math.floor((screenWidth - opts.width) / 2),
    y: Math.floor((screenHeight - opts.height) / 2),
    width: opts.width,
    height: opts.height
  }, true)

  this.mainWindow.setResizable(opts.resizable)
  this.mainWindow.setMinimumSize(opts.minWidth, opts.minHeight)
  this.mainWindow.setMinimizable(opts.minimizable)
  this.mainWindow.setMaximizable(opts.maximizable)
  this.mainWindow.setFullScreenable(opts.fullscreenable)
}

MainWindow.prototype.sendMessage = function (message) {
  if (this.mainWindow === null) return
  this.mainWindow.webContents.send(message)
}

export default MainWindow