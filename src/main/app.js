import { app, ipcMain, protocol, dialog, BrowserWindow, clipboard } from 'electron'
import path from 'path'
import log from '../renderer/utils/log.js'
import MainWindow from './module/MainWindow.js'
import DockMenu from './module/DockMenu.js'
import SysTray from './module/SysTray.js'
import AppMenu from './module/AppMenu.js'
import { exec } from 'child_process'

function APP () {
  this.logined = false
  this.mainWindow = null
  this.aplWindow = null
  this.twinkle = null
  this.ready = false
  this.shouldQuit = false
  this.fileTransferring = false
  this.sysTray = new SysTray({
    login: this.login.bind(this),
    logout: this.logout.bind(this),
    showMainWindow: this.showMainWindow.bind(this)
  })
  this.dockMenu = new DockMenu({
    login: this.login.bind(this),
    logout: this.logout.bind(this)
  })
  this.appMenu = new AppMenu({
    login: this.login.bind(this),
    logout: this.logout.bind(this)
  })
}

APP.prototype.init = function () {
  this.catchMainProcessError()
  this.initApp()
  this.initIPC()
}

APP.prototype.catchMainProcessError = function () {
  var relaunch = function () {
    app.relaunch()
    app.exit(0)
  }
  process.on('uncaughtException', function (err) {
    if (process.env.NODE_ENV !== 'development') {
      log.output({
        type: 'error',
        content: err.message
      }).then(relaunch, relaunch)
    }
  })
}

APP.prototype.initApp = function () {
  var _this = this
  // 更新App版本号
  global.APPVERSION = app.getVersion()
  app.on('ready', function () {
    _this.ready = true
    protocol.registerFileProtocol('root', function (request, callback) {
      var url = request.url.split(/[?#]/)[0]
      var file = url.substr(7)
      var ret = path.join(__dirname, '/', file)
      callback(ret)
    }, function (error) {
      if (error) { console.error('Failed to register protocol') }
    })

    _this.createMainWindow()
    _this.dockMenu.setDockMenu()
    _this.appMenu.setAppMenu()

    // 监听close事件
    _this.mainWindow.getWinInstance().on('close', function (e) {
      if (_this.shouldQuit) {
        _this.mainWindow.destroy()
      } else {
        e.preventDefault()
        _this.mainWindow.hide()
      }
    })
  })

  app.on('certificate-error', function (event, webContents, url, error, certificate, callback) {
    event.preventDefault()
    var ret = true
    callback(ret)
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  app.on('activate', () => {
    if (!_this.mainWindow === null) {
      _this.createMainWindow()
    } else {
      if (!_this.ready) {
        return false
      }
      _this.mainWindow.show()
    }
  })

  app.on('before-quit', function (e) {
    // 退出前将当前窗口大小写入配置
    // 并且当前为非登录状态
    if (_this.isLogined) {
      // _this.mainWindow.setSizeToSetting()
    }

    if (!_this.fileTransferring) {
      setTimeout(function () {
        _this.shouldQuit = true
        app.quit(0)
      }, 0)
    } else {
      e.preventDefault()
      dialog.showMessageBox(_this.mainWindow.getWinInstance(), {
        type: 'warning',
        message: '有文件正在上传，确定要退出么',
        buttons: ['取消', '退出']
      }, function (index) {
        if (index === 1) {
          _this.fileTransferring = false
          app.quit(0)
        }
      })
    }
  })

  app.on('will-quit', function (e) {
    // _this.clearCookies()
  })

  app.on('show', function (e) {
    _this.mainWindow.flashFrame(false)
  })

  // app ready 之后执行删除 log 操作
  try {
    // log.deleteBefore3DaysLog()
  } catch (e) {}
}

APP.prototype.initIPC = function () {
  var _this = this
  ipcMain.on('logined', function (evt, arg) {
    _this.logined = true

    const menubarPic = process.platform === 'darwin' ? `${__static}/img/logo-mac-menu.png` : `${__static}/img/systry-logo.png`
    _this.sysTray.create(menubarPic, '江苏优信客户端')
    _this.sysTray.enableMenuItem('login', false)
    _this.sysTray.enableMenuItem('logout', true)
    _this.sysTray.enableMenuItem('status', true)
    _this.sysTray.switchClientStatus(0)

    _this.dockMenu.enableMenuItem('login', false)
    _this.dockMenu.enableMenuItem('logout', true)
    _this.dockMenu.enableMenuItem('status', true)
    _this.dockMenu.switchClientStatus(0)

    _this.appMenu.enableMenuItem('login', false)
    _this.appMenu.enableMenuItem('logout', true)
    _this.appMenu.enableMenuItem('status', true)
    _this.appMenu.switchClientStatus(0)

    // global.uid = arg
    // _this.getCookie()
    // 登录后改变窗口大小
    // _this.mainWindow.reset()
  })

  ipcMain.on('kicked', function (evt, arg) {
    _this.logined = false
    _this.afterlogout()
  })

  ipcMain.on('logout', function (evt, arg) {
    _this.logined = false
    _this.afterlogout()
  })

  ipcMain.on('quitApp', function () {
    // 退出app 先关闭所有窗口
    _this.closeAllWindows()
    app.quit()
  })

  ipcMain.on('onMax', (evt, arg) => {
    if (arg && arg.window === 'aplWindow') {
      _this.aplWindow.maximize()
      return false
    }
    _this.mainWindow.maximize()
  })

  ipcMain.on('onRestore', (evt, arg) => {
    if (arg && arg.window === 'aplWindow') {
      _this.aplWindow.restore()
      return false
    }
    _this.mainWindow.restore()
  })

  ipcMain.on('onMinimize', (evt, arg) => {
    if (arg && arg.window === 'aplWindow') {
      _this.aplWindow.minimize()
      return false
    }
    _this.mainWindow.minimize()
  })

  ipcMain.on('setBadgeCount', function (event, data) {
    if (process.platform !== 'darwin') return
    // 设置dock 未读数
    data = data || 0
    app.setBadgeCount(data)
  })

  ipcMain.on('disconnect', () => {
    this.dockMenu.enableMenuItem('login', true)
    this.dockMenu.enableMenuItem('status', false)
    this.appMenu.enableMenuItem('login', true)
    this.appMenu.enableMenuItem('status', false)
    this.sysTray.enableMenuItem('login', true)
    this.sysTray.enableMenuItem('status', false)
  })

  ipcMain.on('screenShot', () => {
    let getStrFn = () => {
      // 获取截屏图片
      let nativeImage = clipboard.readImage()
      if (nativeImage) {
        return nativeImage.toDataURL()
      }
      return ''
    }
    let bakBase64Str = getStrFn()
    var ssFile = process.platform === 'darwin' ? '/Screenshot.app/Contents/MacOS/Screenshot' : '/Screenshot'
    var testFile = require('path').join(app.getAppPath(), '/dist/electron/static/addon/', process.platform, ssFile)
    exec(testFile, {}, (error, stdout, stderr) => {
      if (error) throw error
      else {
        let isChange = 1
        let base64Str = getStrFn()
        if (bakBase64Str !== base64Str) {
          isChange = 2
        }
        _this.mainWindow.screenShot({isChange})
      }
    })
  })

  ipcMain.on('onReset', () => {
    _this.mainWindow.reset()
  })

  ipcMain.on('relaunch-app', () => {
    app.relaunch()
    app.exit(0)
  })

  ipcMain.on('onClose', () => {
    if (_this.mainWindow.getSize()) {
      _this.closeAllWindows()
      app.quit()
    } else {
      _this.mainWindow.hide()
    }
  })

  ipcMain.on('openAplWindow', function (evt, arg) {
    // 打开外部应用窗口
    if (_this.aplWindow) {
      _this.aplWindow.webContents.send('asynchronous-message', arg)
      _this.aplWindow.show()
      return
    }
    _this.aplWindow = new BrowserWindow({
      width: 899,
      height: 767,
      minWidth: 500,
      minHeight: 300,
      frame: false,
      parent: _this.mainWindow
    })
    const winURL = path.join('file://', __static, '/windows/application.html')
    _this.aplWindow.loadURL(winURL)
    _this.aplWindow.webContents.once('did-finish-load', () => {
      _this.aplWindow.webContents.send('asynchronous-message', arg)
    })
    _this.aplWindow.on('maximize', () => {
      _this.aplWindow.webContents.send('doMax')
    })
    _this.aplWindow.on('restore', () => {
      _this.aplWindow.webContents.send('doRestore')
    })
    _this.aplWindow.on('unmaximize', () => {
      _this.aplWindow.webContents.send('doRestore')
    })
    _this.aplWindow.on('closed', () => { _this.aplWindow = null })
  })

  ipcMain.on('receiveNewMsgs', function (evt, arg) {
    if (!_this.mainWindow.isFocused()) _this.mainWindow.flashFrame(true)
    _this.tryTwinkle(arg)
  })

  ipcMain.on('sessionUnreadNums', function (evt, arg) {
    _this.tryTwinkle(arg)
  })

  ipcMain.on('toggleSession', function (evt, arg) {
    if (_this.aplWindow) _this.aplWindow.webContents.send('renderSession', arg)
  })
}

APP.prototype.login = function () {
  this.mainWindow.sendMessage('relogin')
}

APP.prototype.logout = function () {
  this.mainWindow.sendMessage('logout')
}

APP.prototype.afterlogout = function () {
  // 注销时将窗口大小写入配置
  // this.mainWindow.setSizeToSetting()

  // dock 栏未读数清零
  if (process.platform === 'darwin') {
    app.setBadgeCount(0)
  }

  // dock menu
  this.dockMenu.enableMenuItem('login', false)
  this.dockMenu.enableMenuItem('logout', false)
  this.dockMenu.enableMenuItem('status', false)

  this.appMenu.enableMenuItem('login', false)
  this.appMenu.enableMenuItem('logout', false)
  this.appMenu.enableMenuItem('status', false)

  this.closeAllWindows()
  // 清空cookies
  // _this.clearCookies()
}

APP.prototype.closeAllWindows = function () {
  var _windows = BrowserWindow.getAllWindows()
  var _len = _windows.length
  for (var i = _len; i--;) {
    _windows[i].destroy()
  }

  this.sysTray.destroy()
}

APP.prototype.createMainWindow = function () {
  if (!this.ready) return false
  this.mainWindow = new MainWindow()
}

APP.prototype.showMainWindow = function () {
  if (this.mainWindow) this.mainWindow.show()
}

APP.prototype.modifyFilePath = function () {
  // 修改数据存储位置（包含应用和db数据、日志）
  let FilePath = ''
  let configPath = path.join(process.env.npm_package_author_name, app.getName().toUpperCase())
  if (process.platform === 'win32') {
    FilePath = path.join(process.env.LOCALAPPDATA, configPath)
  } else if (process.platform === 'darwin') {
    FilePath = path.join(app.getPath('home'), 'Library', 'Application Support', configPath)
  }
  if (FilePath) {
    app.setPath('appData', FilePath)
    app.setPath('userData', FilePath)
    app.setPath('logs', FilePath)
  }
}

APP.prototype.tryTwinkle = function (arg) {
  if (arg.unreadNums <= 0) {
    if (this.twinkle) {
      this.sysTray.setImage(`${__static}/img/systry-logo.png`)
      clearInterval(this.twinkle)
      this.twinkle = null
    }
    return false
  }
  // 系统托盘图标闪烁
  if (this.twinkle) {
    clearInterval(this.twinkle)
    this.twinkle = null
  }
  let count = 0
  this.twinkle = setInterval(() => {
    count++
    if (count % 2 === 0) {
      this.sysTray.setImage(`${__static}/img/systry-logo.png`)
    } else {
      this.sysTray.setImage(`${__static}/img/systry-logo-a.png`)
    }
  }, 600)
}

export default APP
