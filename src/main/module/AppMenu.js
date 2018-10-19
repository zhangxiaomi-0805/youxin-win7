import { Menu } from 'electron'
import { StatusMenuImpl } from './MenuImpl.js'

function AppMenu (opts) {
  var template = [
    {
      label: 'NICE',
      submenu: [
        { label: '关于' },
        {
          type: 'separator'
        },
        {
          label: '退出',
          role: 'quit'
        }
      ]
    },
    {
      label: '状态',
      submenu: StatusMenuImpl.clientStatusMenuTemplate
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: '重做',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: '剪切',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: '复制',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: '粘贴',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: '全选',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: '窗口',
      submenu: [
        {
          label: '最小化',
          role: 'minimize'
        },
        {
          label: '关闭',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
        {
          label: '缩放',
          role: 'zoom'
        },
        {
          label: '前置全部窗口',
          role: 'front'
        },
        {
          label: `隐藏`,
          accelerator: 'CmdOrCtrl+H',
          role: 'hide'
        }, {
          label: '隐藏其它',
          accelerator: 'CmdOrCtrl+Alt+H',
          role: 'hideothers'
        }, {
          label: '显示全部',
          role: 'unhide'
        }
      ]
    }
  ]

  this.template = Menu.buildFromTemplate(template)
  this.loginItem = this.template.items[1].submenu.items[3]
  this.logoutItem = this.template.items[1].submenu.items[4]
  this.onlineItem = this.template.items[1].submenu.items[0]
  this.busyItem = this.template.items[1].submenu.items[1]

  var bindMenuFunc = StatusMenuImpl.bindMenuFunc.bind(this)
  bindMenuFunc(opts)
}

AppMenu.prototype = {
  setAppMenu: function () {
    if (process.platform !== 'darwin') return
    Menu.setApplicationMenu(this.template)
  },
  enableMenuItem: function (itemName, enable) {
    if (process.platform !== 'darwin') return
    var enableMenuItem = StatusMenuImpl.enableMenuItem.bind(this)
    enableMenuItem(itemName, enable)
  },
  switchClientStatus: function (status) {
    if (process.platform !== 'darwin') return
    var switchClientStatus = StatusMenuImpl.switchClientStatus.bind(this)
    switchClientStatus(this.template.items[1].submenu.items, status)
  }
}

export default AppMenu
