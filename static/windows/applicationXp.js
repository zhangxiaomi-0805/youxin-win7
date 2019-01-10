/**
 * 访客页初始化
 */

var TabManage = function () {
  this.data = [] // 数据源
  this.currentTab = -1 // 当前活跃项
  this.tabsContain = document.getElementById('appli-tabs')
  this.iframeContain = document.getElementById('appli-iframe')
}

TabManage.prototype.init = function () {
  this.PreDef()
  this.setWinStatus('营业精灵', 7) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
  // 监听主窗口通信方法
  window.NimCefWebInstance && window.NimCefWebInstance.register('OnReceiveEvent', (params) => {
    console.log('事件监听====')
    if (params.eventName === 'asyncMessage') {
      const eventData = params.data
      console.log(eventData )
      this.createDom(eventData)
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
    this.setWinStatus('营业精灵', 1) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
  })

  // 窗口放大
  const minMax = document.getElementById('appli-max')
  minMax.addEventListener('click', () => {
    this.setWinStatus('营业精灵', 2) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
  })

  // 窗口还原
  const minRestore = document.getElementById('appli-restore')
  minRestore.addEventListener('click', () => {
    this.setWinStatus('营业精灵', 3) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
  })

  // 窗口关闭
  const closeBtn = document.getElementById('appli-colse')
  closeBtn.addEventListener('click', () => {
    this.setWinStatus('营业精灵', 4) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
  })

  // 刷新页面
  const refreshBtn = document.getElementById('appli-refresh')
  refreshBtn.addEventListener('click', () => {
    let iframe = this.getActiveDom(2)
    iframe && iframe.reload()
  })

  // 返回上级页面
  const backBtn = document.getElementById('appli-back')
  backBtn.addEventListener('click', () => {
    let iframe = this.getActiveDom(2)
    if (iframe && iframe.canGoBack()) iframe.goBack()
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

  let iframe = document.createElement('iframe')
  iframe.className = 'iframe'
  iframe.style = 'display: inline-flex;width: 100%;height: 100%;'
  console.log(arg.url)
  iframe.src = arg.url
  iframe.setAttribute('value', arg.appCode)
  this.iframeContain.appendChild(iframe)

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

  let iframe = document.getElementsByClassName('iframe')
  for (let i = 0; i < iframe.length; i++) {
    let value = iframe[i].getAttribute('value')
    if (value === this.currentTab) {
      iframe[i].classList.add('active')
    } else iframe[i].classList.remove('active')
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
    this.setWinStatus('营业精灵', 4) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
    return false
  }
  this.tabsContain.removeChild(this.getActiveDom(1, appCode))
  this.iframeContain.removeChild(this.getActiveDom(2, appCode))
}

TabManage.prototype.setWinStatus = (windowName, type) => {
  // 设置窗口状态
  window.NimCefWebInstance && window.NimCefWebInstance.call('setWinStatus', {windowName, type}, (error, result) => {
    console.log(result)
    if (result) {
    }
  })
}

TabManage.prototype.sendEvent = (windowName, data, eventName) => {
  console.log({
    windowName,
    data: JSON.parse(data),
    eventName
  })
  window.NimCefWebInstance && window.NimCefWebInstance.call('sendEvent', {
    windowName,
    data: JSON.parse(data),
    eventName
  }, (error, result) => {
    console.log(error)
    console.log(result)
    if (result) {
    }
  })
}

TabManage.prototype.getActiveDom = function (type, appCode) {
  // 获取当前活跃状态dom
  let className = ''
  switch (type) {
    case 1:
      className = 'tabs-item'
      break
    case 2:
      className = 'iframe'
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
  let iframe = this.getActiveDom(2)
  if (iframe) {
    let backBtn = document.getElementById('appli-back')
    if (iframe.canGoBack && iframe.canGoBack()) {
      backBtn.classList.remove('disabled')
    } else backBtn.classList.add('disabled')
  }
}

new TabManage().init()

window.onload = () => {
  console.log(this)
  new TabManage().sendEvent('main_form', JSON.stringify({isLoaded: true}), 'childIsLoaded')
}
