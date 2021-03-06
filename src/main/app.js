import { app, ipcMain, protocol, dialog, BrowserWindow, clipboard, globalShortcut } from 'electron'
import path from 'path'
import log from '../renderer/utils/log.js'
import MainWindow from './module/MainWindow.js'
import DockMenu from './module/DockMenu.js'
import SysTray from './module/SysTray.js'
import AppMenu from './module/AppMenu.js'
import { exec } from 'child_process'

function APP () {
  this.screenShoted = false
  this.logined = false
  this.mainWindow = null
  this.aplWindow = null
  this.twinkle = null
  this.ready = false
  this.shouldQuit = false
  this.fileTransferring = false
  this.remoteWindow = null
  this.remoteConnection = null
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
    app.quit()
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

  if (process.platform === 'win32') {
    // 修改数据存储位置（包含应用和db数据、日志）
    let filePath = path.join(process.cwd(), 'appData')
    app.setPath('appData', filePath)
    app.setPath('userData', filePath)
    app.setPath('logs', filePath)
  }

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

    _this.initRemoteConnect()

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
    _this.sysTray.create(menubarPic, '优信客户端')
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
    if (arg && arg.window === 'remoteWindow') {
      _this.remoteWindow.maximize()
      return false
    }
    _this.mainWindow.maximize()
  })

  ipcMain.on('onRestore', (evt, arg) => {
    if (arg && arg.window === 'aplWindow') {
      _this.aplWindow.restore()
      return false
    }
    if (arg && arg.window === 'remoteWindow') {
      _this.remoteWindow.restore()
      return false
    }
    _this.mainWindow.restore()
  })

  ipcMain.on('onMinimize', (evt, arg) => {
    if (arg && arg.window === 'aplWindow') {
      _this.aplWindow.minimize()
      return false
    }
    if (arg && arg.window === 'remoteWindow') {
      _this.remoteWindow.minimize()
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

  ipcMain.on('screenShot', (evt, arg) => {
    if (this.screenShoted) return // 在截屏状态直接return
    this.screenShoted = true
    if (arg.hideWin) {
      _this.mainWindow.hide()
    }
    let getStrFn = () => {
      // 获取截屏图片
      let nativeImage = clipboard.readImage()
      if (nativeImage) {
        return nativeImage.toDataURL()
      }
      return ''
    }
    setTimeout(() => {
      let bakBase64Str = getStrFn()
      let testFile = require('path').join(app.getAppPath(), '/dist/electron/static/addon/screenshot')
      exec('start Snapshot.exe', {cwd: testFile}, (error, stdout, stderr) => {
        if (error) {
          if (arg.hideWin) {
            _this.mainWindow.show()
            if (_this.aplWindow) {
              _this.aplWindow.show()
            }
          }
          this.screenShoted = false
          // 采用inno setup打包的exe文件，点击截屏闪退，这里引入electron-log打印日志，不抛出异常
          const log = require('electron-log')
          log.error(error)
          // throw error
        } else {
          if (arg.hideWin) {
            _this.mainWindow.show()
            if (_this.aplWindow) {
              _this.aplWindow.show()
            }
          }
          this.screenShoted = false
          let isChange = 1
          let base64Str = getStrFn()
          if (bakBase64Str !== base64Str) {
            isChange = 2
          }
          _this.mainWindow.screenShot({isChange, type: arg.type})
        }
      })
    }, 150)
  })

  ipcMain.on('onReset', (evt, arg) => {
    _this.mainWindow.reset()
    setTimeout(() => _this.sysTray.setToolTip(`优信(${arg.userInfo.name})`), 0)
  })

  ipcMain.on('relaunch-app', () => {
    app.relaunch()
    app.quit()
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

  ipcMain.on('sendAccount', function (evt, arg) {
    if (_this.mainWindow) _this.mainWindow.getAccid(arg)
  })

  // 营业精灵唤起截屏
  ipcMain.on('callScreenShot', function (evt, arg) {
    if (_this.mainWindow) _this.mainWindow.callScreenShot(arg)
  })

  ipcMain.on('registerShortcut', function (evt, arg) {
    _this.registerShortcut(arg.replace(/\s+/g, ''))
  })

  // 发起远程协助
  ipcMain.on('remoteConnection', function (evt, arg) {
    // 采用inno setup打包的exe文件，点击截屏闪退，这里引入electron-log打印日志，不抛出异常
    const log = require('electron-log')
    log.info('remoteConnection init')
    // 通过调用获取用户信息接口验证网络是否通
    try {
      _this.execProcess('remote-vnc.exe -p 9016 "desktop"', () => {
        log.info('remoteConnection remote-vnc.exe init')
        let ip = ''
        const os = require('os')
        let interfaces = os.networkInterfaces()
        // 获取本地IP地址
        for (let devName in interfaces) {
          let iface = interfaces[devName]
          for (let i = 0; i < iface.length; i++) {
            let alias = iface[i]
            // log.info('alias', alias)
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
              ip = alias.address
              break
            }
          }
        }
        log.info('remoteConnection ip', ip)
        // 获取IP地址
        if (ip && _this.mainWindow) {
          global.HASREMOTE = arg
          _this.mainWindow.sendRemoteConnection({content: ip + ':9016', account: arg})
        } else {
          log.error('remoteConnection 网络连接状态异常，请在办公内网环境或网络良好的场景下使用远程协助')
        }
      })
    } catch (error) {
      log.error('remoteConnection check network fail', error)
    }
  })

  // 关闭远程协助
  ipcMain.on('remoteConnectionDiss', function (evt, arg) {
    try {
      _this.remoteConnection = null
      global.HASREMOTE = null
      _this.remoteWindow && _this.remoteWindow.close()
      _this.execProcess('taskkill -f -im "remote-vnc.exe"')
    } catch (error) {
      console.log('remoteConnectionDiss error', error)
    }
  })

  // 创建远程桌面
  ipcMain.on('remoteConnectionCreate', function (evt, arg) {
    try {
      _this.createRemoteWindow(arg)
    } catch (error) {
      console.log('remoteConnectionCreate error', error)
    }
  })

  // getSessionId接口出现网络异常时执行附件的bat命令,刷新dns缓存
  ipcMain.on('refreshDns', function (evt, arg) {
    let batPath = path.join(app.getAppPath(), '/dist/electron/static/addon/network_error/')
    exec('start network_exception_repair.bat', {cwd: batPath}, (error, stdout, stderr) => {
      if (error) {
        throw error
      } else {
      }
    })
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
  if (this.mainWindow) {
    this.mainWindow.show()
    this.mainWindow.positionSession()
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
      this.sysTray.setImage(`${__static}/img/systry-logo-null.ico`)
    }
  }, 600)
}

APP.prototype.registerShortcut = function (arg) {
  // 注册快捷键
  globalShortcut.unregisterAll()
  globalShortcut.register('Ctrl + Alt + Q', () => {
    // Do stuff when Y and either Command/Control is pressed.
    this.mainWindow.webContents.openDevTools()
  })
  globalShortcut.register(arg, () => {
    this.mainWindow.shortcutScreen()
  })
}

APP.prototype.execProcess = function (cmd, callback) {
  // 远程桌面执行程序
  let testFile = require('path').join(app.getAppPath(), '/dist/electron/static/addon/remote')
  let workerProcess = exec(cmd, { cwd: testFile })

  workerProcess.stdout.on('data', function (data) {
    if (!this.remoteConnection) {
      this.remoteConnection = true
      callback && callback()
    }
  })
}

APP.prototype.createRemoteWindow = function ({url, account}) {
  if (this.remoteWindow) {
    this.remoteWindow.show()
    return
  }
  // 创建远程桌面窗口
  this.remoteWindow = new BrowserWindow({
    width: 899,
    height: 505,
    minWidth: 500,
    minHeight: 300,
    frame: false,
    parent: this.mainWindow
  })
  // 创建全局远程窗口变量
  global.HASREMOTE = account
  const winURL = path.join('file://', __static, '/windows/remoteConnect.html')
  this.remoteWindow.loadURL(winURL)
  this.remoteWindow.on('maximize', () => {
    this.remoteWindow.webContents.send('doMax')
  })
  this.remoteWindow.on('restore', () => {
    this.remoteWindow.webContents.send('doRestore')
  })
  this.remoteWindow.on('unmaximize', () => {
    this.remoteWindow.webContents.send('doRestore')
  })
  this.remoteWindow.on('closed', () => {
    this.remoteWindow = null
    global.HASREMOTE = null
    // 通知对方已关闭远程协助
    this.mainWindow.closeRemoteWindow(account)
  })
  this.remoteWindow.webContents.once('did-finish-load', () => {
    this.remoteWindow.webContents.send('asynchronous-message', url)
  })
}

APP.prototype.initRemoteConnect = function () {
  if (global.HASREMOTE) {
    // 当前有正在进行的远程通信
    this.remoteConnection = null
    this.mainWindow.closeRemoteWindow(global.HASREMOTE)
    global.HASREMOTE = null
    try {
      this.execProcess('taskkill -f -im "remote-vnc.exe"')
    } catch (error) {
      console.log('initRemoteConnect error', error)
    }
  }
}

export default APP
