import { Menu, Tray } from 'electron'
import { StatusMenuImpl } from './MenuImpl.js'

function SysTray (opts) {
  this.opts = opts
  this.tray = null
  var template = [
    { label: '关于' },
    { type: 'separator' },
    {
      label: '状态',
      submenu: StatusMenuImpl.clientStatusMenuTemplate
    },
    { type: 'separator' },
    { role: 'quit', label: '退出' }
  ]

  this.template = Menu.buildFromTemplate(template)
  this.aboutItem = this.template.items[0]
  this.loginItem = this.template.items[2].submenu.items[3]
  this.logoutItem = this.template.items[2].submenu.items[4]
  this.onlineItem = this.template.items[2].submenu.items[0]
  this.busyItem = this.template.items[2].submenu.items[1]

  this.aboutItem.click = function () {
    // todo
    opts.showAboutWindow && opts.showAboutWindow()
  }

  var bindMenuFunc = StatusMenuImpl.bindMenuFunc.bind(this)
  bindMenuFunc(opts)
}

SysTray.prototype = {
  create: function (icon, tip) {
    if (this.tray) return
    var _this = this
    this.tray = new Tray(icon)
    this.tray.setToolTip(tip)
    this.tray.on('click', () => {
      _this.opts.showMainWindow && _this.opts.showMainWindow()
    })
    if (process.platform === 'win32') {
      this.tray.on('right-click', () => {
        _this.tray.popUpContextMenu(_this.template)
      })
    }
  },
  destroy: function () {
    if (this.trayMenu) this.trayMenu = null
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  },
  enableMenuItem: function (itemName, enable) {
    if (process.platform !== 'win32') return
    var enableMenuItem = StatusMenuImpl.enableMenuItem.bind(this)
    enableMenuItem(itemName, enable)
  },
  switchClientStatus: function (status) {
    if (process.platform !== 'win32') return
    var switchClientStatus = StatusMenuImpl.switchClientStatus.bind(this)
    switchClientStatus(this.template.items[2].submenu.items, status)
  }
}

export default SysTray
