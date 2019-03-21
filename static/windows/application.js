/**
 * 访客页初始化
 */
var TabManage = function () {
  this.data = [] // 数据源
  this.currentTab = -1 // 当前活跃项
  this.tabsContain = document.getElementById('appli-tabs')
  this.webviewContain = document.getElementById('appli-webview')
}

TabManage.prototype.init = function () {
  this.PreDef()
  let electron = require('electron')
  let ipcRenderer = electron.ipcRenderer
  ipcRenderer.on('asynchronous-message', (event, arg) => {
    this.currentTab = arg.appCode
    let hasExit = false
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].appCode === arg.appCode) {
        // 已存在tab
        this.data[i] = arg
        document.getElementsByClassName('tabs-item')[i].firstChild.innerHTML = arg.title
        const webview = document.getElementsByClassName('webview')[i]
        webview.setAttribute('src', arg.url)
        this.resetClass()
        hasExit = true
      }
    }
    if (!hasExit) {
      this.data.push(arg)
      this.createDom(arg)
    }
    // 窗口内链接跳转
    const webview = this.getActiveDom(2)
    if (webview) {
      webview.addEventListener('new-window', (e) => {
        if (e.url) {
          if (e.url.indexOf('yximcreatesession.telecomjs.com') > -1) {
            // 发起会话处理
            let account = e.url.split('?account=')[1]
            if (account) {
              ipcRenderer.send('sendAccount',{account})
            }
          } else {
            webview.loadURL(e.url)
            this.canGoBack()
          }
        }
      })
      webview.addEventListener('load-commit', (e) => {
        this.canGoBack()
      })
      webview.addEventListener('did-fail-load', (e) => {
        if (e.validatedURL.indexOf('yximcreatesession.telecomjs.com') > -1) {
          // 发起会话处理
          let account = e.validatedURL.split('?account=')[1]
          if (account) {
            ipcRenderer.send('sendAccount',{account})
          }
        }
        webview.goBack()
      })
    }
  })

  ipcRenderer.on('doMax', () => {
    document.getElementById('appli-max').style.display = 'none'
    document.getElementById('appli-restore').style.display = 'inline-block'
  })

  ipcRenderer.on('doRestore', () => {
    document.getElementById('appli-max').style.display = 'inline-block'
    document.getElementById('appli-restore').style.display = 'none'
  })

  ipcRenderer.on('renderSession', (evt, arg) => {
    for (let i in this.data) {
      if (this.data[i].appCode === arg.appCode) {
        this.currentTab = arg.appCode
        this.resetClass()
        break
      }
    }
  })
}

TabManage.prototype.PreDef = function () {
  // 阻止窗口默认行为
  window.addEventListener('dragstart', (e) => {
    e.preventDefault()
    return false
  })
  window.addEventListener('dragover', (e) => {
    e.preventDefault()
    return false
  })
  window.addEventListener('drop', (e) => {
    e.preventDefault()
    return false
  })

  // 窗口缩小
  const minBtn = document.getElementById('appli-min')
  minBtn.addEventListener('click', () => {
    let electron = require('electron')
    let ipcRenderer = electron.ipcRenderer
    ipcRenderer.send('onMinimize', {window: 'aplWindow'})
  })

  // 窗口放大
  const minMax = document.getElementById('appli-max')
  minMax.addEventListener('click', () => {
    let electron = require('electron')
    let ipcRenderer = electron.ipcRenderer
    ipcRenderer.send('onMax', {window: 'aplWindow'})
  })

  // 窗口还原
  const minRestore = document.getElementById('appli-restore')
  minRestore.addEventListener('click', () => {
    let electron = require('electron')
    let ipcRenderer = electron.ipcRenderer
    ipcRenderer.send('onRestore', {window: 'aplWindow'})
  })

  // 窗口关闭
  const closeBtn = document.getElementById('appli-colse')
  closeBtn.addEventListener('click', () => {
    window.close()
  })

  // 刷新页面
  const refreshBtn = document.getElementById('appli-refresh')
  refreshBtn.addEventListener('click', () => {
    let webview = this.getActiveDom(2)
    // 刷新时禁用缓存
    webview && webview.getWebContents().session.clearCache(() => {
      webview.reload()
    })
  })

  // 返回上级页面
  const backBtn = document.getElementById('appli-back')
  backBtn.addEventListener('click', () => {
    let webview = this.getActiveDom(2)
    if (webview && webview.canGoBack()) webview.goBack()
  })
}

TabManage.prototype.createDom = function (arg) {
  // 动态生成界面元素
  let a = document.createElement('a')
  a.className = 'tabs-item'
  let icon = arg.icon || '../img/systry-logo.png'
  a.innerHTML = `<img class="appli-icon" src="${icon}"></span><span>${arg.title}</span>`
  a.setAttribute('value', arg.appCode)
  a.onclick = () => {
    if (this.currentTab === arg.appCode) return
    // 切换标签页
    this.currentTab = arg.appCode
    this.resetClass()
    this.canGoBack()
  }
  let i = document.createElement('i')
  i.className = 'close'
  i.innerHTML = 'x'
  i.onclick = (e) => {
    e.stopPropagation()
    // 关闭标签页
    if (this.currentTab === arg.appCode) {
      let currentTab = ''
      for (let key = 0; key < this.data.length; key++) {
        if (this.data[key].appCode === arg.appCode) {
          let currentTabIndex = this.data[key - 1] ? key - 1 : key + 1
          currentTabIndex = this.data.length === 1 ? 0 : currentTabIndex
          currentTab = this.data[currentTabIndex].appCode
          break
        }
      }
      this.removeChild(arg.appCode)
      this.currentTab = currentTab
      this.resetClass()
    } else {
      this.removeChild(arg.appCode)
    }
    this.canGoBack()
  }
  a.appendChild(i)
  this.tabsContain.appendChild(a)

  let webview = document.createElement('webview')
  webview.className = 'webview'
  webview.style = 'display: inline-flex;width: 100%;height: 100%;'
  webview.src = arg.url
  webview.setAttribute('value', arg.appCode)
  this.webviewContain.appendChild(webview)

  this.resetClass()
}

TabManage.prototype.resetClass = function () {
  // 样式重置
  let tabs = document.getElementsByClassName('tabs-item')
  for (let i = 0; i < tabs.length; i++) {
    let value = tabs[i].getAttribute('value')
    if (value === this.currentTab) {
      tabs[i].classList.add('active')
    } else tabs[i].classList.remove('active')
  }

  let webview = document.getElementsByClassName('webview')
  for (let i = 0; i < webview.length; i++) {
    let value = webview[i].getAttribute('value')
    if (value === this.currentTab) {
      webview[i].classList.add('active')
    } else webview[i].classList.remove('active')
  }
}

TabManage.prototype.removeChild = function (appCode) {
  // 移除元素
  for (let i in this.data) {
    if (this.data[i].appCode === appCode) {
      this.data.splice(i, 1)
      break
    }
  }
  if (this.data.length <= 0) {
    window.close()
    return false
  }
  this.tabsContain.removeChild(this.getActiveDom(1, appCode))
  this.webviewContain.removeChild(this.getActiveDom(2, appCode))
}

TabManage.prototype.getActiveDom = function (type, appCode) {
  // 获取当前活跃状态dom
  let className = ''
  switch (type) {
    case 1:
      className = 'tabs-item'
      break
    case 2:
      className = 'webview'
      break
  }
  let doms = document.getElementsByClassName(className)
  for (let i = 0; i < doms.length; i++) {
    let value = doms[i].getAttribute('value')
    if (value === (appCode || this.currentTab)) {
      return doms[i]
    }
  }
  return {}
}

TabManage.prototype.canGoBack = function () {
  let webview = this.getActiveDom(2)
  if (webview) {
    let backBtn = document.getElementById('appli-back')
    if (webview.canGoBack && webview.canGoBack()) {
      backBtn.classList.remove('disabled')
    } else backBtn.classList.add('disabled')
  }
}

new TabManage().init()
