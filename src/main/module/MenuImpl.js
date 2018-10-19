export var StatusMenuImpl = {
  clientStatusMenuTemplate: [
    { label: '在线', enabled: false, checked: false, type: 'radio' },
    { label: '忙碌', enabled: false, checked: false, type: 'radio' },
    { type: 'separator' },
    { label: '登录', enabled: false },
    { label: '注销', enabled: false }
  ],
  bindMenuFunc: function (opts) {
    var _this = this
    this.loginItem.click = function () {
      opts.login && opts.login()
    }

    this.logoutItem.click = function () {
      opts.logout && opts.logout()
    }

    this.onlineItem.click = function () {
      if (_this.onlineItem.checked) return
      _this.onlineItem.checked = true
      // todo
      opts.setClientStatus && opts.setClientStatus(0)
    }

    this.busyItem.click = function () {
      if (_this.busyItem.checked) return
      _this.busyItem.checked = true
      // todo
      opts.setClientStatus && opts.setClientStatus(1)
    }
  },
  enableMenuItem: function (itemName, enable) {
    var enabled = enable || false
    switch (itemName) {
      case 'status':
        this.onlineItem.enabled = enabled
        this.busyItem.enabled = enabled
        break
      case 'login':
        this.loginItem.enabled = enabled
        break
      case 'logout':
        this.logoutItem.enabled = enabled
        break
      default:
        break
    }
  },
  switchClientStatus: function (items, status) {
    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      if (i === status) {
        item.checked = true
        break
      }
    }
  }
}
