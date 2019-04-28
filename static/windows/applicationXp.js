/**
 * 访客页初始化
 */
var TabManage = function () {
  this.showHideWinCheck = false // 截屏时是否隐藏窗口
  this.data = [] // 数据源
  this.currentTab = -1 // 当前活跃项
  this.tabsContain = document.getElementById('appli-tabs')
  this.iframeContain = document.getElementById('appli-iframe')
}

TabManage.prototype.init = function () {
  console.log('页面初始化===========')
  this.PreDef()
  // 监听主窗口通信方法
  window.NimCefWebInstance && window.NimCefWebInstance.register('onReceiveEvent', (params) => {
    if (params.eventName === 'showAplWindow') {
      tabManage.setWinStatus('营业精灵', 7) // 1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示
    }
    if (params.eventName === 'asyncMessage') {
      let arg = JSON.parse(params.data)
      console.log(arg)
      this.showHideWinCheck = arg.showHideWinCheck
      this.currentTab = arg.appCode
      let hasExit = false
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].appCode === arg.appCode) {
          // 已存在tab
          this.data[i] = arg
          document.getElementsByClassName('tabs-item')[i].firstChild.innerHTML = arg.title
          const iframe = document.getElementsByClassName('iframe')[i]
          iframe.setAttribute('src', arg.url)
          this.resetClass()
          hasExit = true
        }
      }
      if (!hasExit) {
        this.data.push(arg)
        this.createDom(arg)
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
    this.setWinStatus('营业精灵', 1) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
  })

  // 窗口放大
  const minMax = document.getElementById('appli-max')
  minMax.addEventListener('click', () => {
    this.setWinStatus('营业精灵', 2).then(res => {
      minMax.style.display = 'none'
      minRestore.style.display = 'inline-block'
    }).catch(err => {console.log(err)}) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
  })

  // 窗口还原
  const minRestore = document.getElementById('appli-restore')
  minRestore.addEventListener('click', () => {
    this.setWinStatus('营业精灵', 3).then(res => {
      minRestore.style.display = 'none'
      minMax.style.display = 'inline-block'
    }).catch(err => {console.log(err)}) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
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
    iframe &&  iframe.contentWindow.location.reload()
  })

  // 后退
  const backBtn = document.getElementById('appli-back')
  backBtn.addEventListener('click', () => {
    let iframe = this.getActiveDom(2)
    if (iframe) {
      iframe.contentWindow.history.back()
      window.event.chancelBUbble = true
    }
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
    console.log(this.currentTab)
    console.log(arg.appCode)
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
  iframe.style = 'display: inline-flex;width: 100%;height: 100%; border: 0'
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

// 获取当前活跃状态dom
TabManage.prototype.getActiveDom = function (type, appCode) {
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
    if (iframe) {
      backBtn.classList.remove('disabled')
    } else backBtn.classList.add('disabled')
  }
}

// 设置窗口状态
TabManage.prototype.setWinStatus = (windowName, type) => {
  return new Promise((resolve, reject) => {
    window.NimCefWebInstance && window.NimCefWebInstance.call('setWinStatus', {windowName, type}, (error, result) => {
      if (result) {
        resolve(result)
      } else {
        reject(error)
      }
    })
  })
}

// 跨窗口通信
TabManage.prototype.sendEvent = (windowName, data, eventName) => {
  window.NimCefWebInstance && window.NimCefWebInstance.call('sendEvent', {
    windowName,
    data: JSON.parse(data),
    eventName
  }, () => {
  })
}

// 设置可拖拽区域
TabManage.prototype.setDraggableArea = () => {
  let params = {
    percent: 0, // 设置为0时只空出右侧功能按钮
    leftTitleHeight: 30, // 左侧可拖动区域高度：20
    rightTitleHeight: 30, // 右侧可拖动区域高度：30
    rightTitleMargin: 80 // 右侧可拖动区域与右侧边框的距离
  }
  window.NimCefWebInstance && window.NimCefWebInstance.call('setDraggableArea',
    params , (error, result) => {})
}
// 设置窗口图标
TabManage.prototype.setWindowIcon = () => {
  let AppDirectory = window.location.pathname.slice(1) // 应用所在目录
  if (AppDirectory.indexOf('dist') > -1) {
    let urlArr = AppDirectory.split('dist')
    AppDirectory = urlArr[0]
  }
  let iconPath = AppDirectory + '/dist/static/img/systry-logo.png'
  window.NimCefWebInstance && window.NimCefWebInstance.call('setWindowIcon',{
    iconPath
  }, () => {})
} 

let tabManage = new TabManage()
tabManage.init()

window.onload = () => {
  // 通知主窗口，我已加载完成
  tabManage.sendEvent('main', JSON.stringify({isLoaded: true}), 'childIsLoaded')

  // 设置窗口图标
  tabManage.setWindowIcon()
  
  // 设置可拖拽区域
  tabManage.setDraggableArea()

  // 点击右下角退出按钮时的通知--这里是关闭
  window.NimCefWebInstance && window.NimCefWebInstance.register('OnAppExit', (params) => {
    tabManage.setWinStatus('营业精灵', 4).then(res => { // 1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示
    }).catch(err => console.log(err))
  })
  
  /* 接收拦截到打开新链接的事件 */
  window.NimCefWebInstance && window.NimCefWebInstance.register('OnOpenNewLink', (params) => {
    console.log('123=========')
    // 窗口内链接跳转
    const iframe = tabManage.getActiveDom(2) // 找到当前活跃的iframe
    if (params.url.indexOf('yximcreatesession.telecomjs.com') > -1) { // 发起会话处理
      let account = params.url.split('?account=')[1]
      if (account) {
        // 跟主页面通信
        tabManage.sendEvent('main', JSON.stringify({account}), 'createSession')
      }
    } else if (params.url.indexOf('yximscreencapture.telecomjs.com') > -1) { // 唤起截屏处理
      if (tabManage.showHideWinCheck) {
        tabManage.setWinStatus('营业精灵', 1).then(res => { // 1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示
          // 跟主页面通信
          tabManage.sendEvent('main', null, 'callScreenShot')
        }).catch(err => console.log(err))
      } else {
        // 跟主页面通信
        tabManage.sendEvent('main', null, 'callScreenShot')
      }
      
    } else { // 渲染新url
      iframe.src = params.url
    }
    tabManage.canGoBack()
  })
}