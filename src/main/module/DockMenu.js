import { app, Menu } from 'electron'
import { StatusMenuImpl } from './MenuImpl.js'

function DockMenu (opts) {
  var template = [
    {
      label: '状态',
      submenu: StatusMenuImpl.clientStatusMenuTemplate
    }
  ]
  this.template = Menu.buildFromTemplate(template)
  this.loginItem = this.template.items[0].submenu.items[3]
  this.logoutItem = this.template.items[0].submenu.items[4]
  this.onlineItem = this.template.items[0].submenu.items[0]
  this.busyItem = this.template.items[0].submenu.items[1]

  var bindMenuFunc = StatusMenuImpl.bindMenuFunc.bind(this)
  bindMenuFunc(opts)
}

DockMenu.prototype = {
  setDockMenu: function () {
    if (process.platform !== 'darwin') return
    app.dock.setMenu(this.template)
  },
  enableMenuItem: function (itemName, enable) {
    if (process.platform !== 'darwin') return
    var enableMenuItem = StatusMenuImpl.enableMenuItem.bind(this)
    enableMenuItem(itemName, enable)
  },
  switchClientStatus: function (status) {
    if (process.platform !== 'darwin') return
    var switchClientStatus = StatusMenuImpl.switchClientStatus.bind(this)
    switchClientStatus(this.template.items[0].submenu.items, status)
  }
}

export default DockMenu
