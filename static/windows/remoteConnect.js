/**
 * 访客页初始化
 */
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

var TabManage = function () {
  this.webview = document.getElementById('appli-webview')
}

TabManage.prototype.init = function () {
  this.PreDef()

  ipcRenderer.on('asynchronous-message', (event, arg) => {
    this.webview.src = arg
  })

  ipcRenderer.on('doMax', () => {
    document.getElementById('appli-max').style.display = 'none'
    document.getElementById('appli-restore').style.display = 'inline-block'
  })

  ipcRenderer.on('doRestore', () => {
    document.getElementById('appli-max').style.display = 'inline-block'
    document.getElementById('appli-restore').style.display = 'none'
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
    ipcRenderer.send('onMinimize', {window: 'remoteWindow'})
  })

  // 窗口放大
  const minMax = document.getElementById('appli-max')
  minMax.addEventListener('click', () => {
    ipcRenderer.send('onMax', {window: 'remoteWindow'})
  })

  // 窗口还原
  const minRestore = document.getElementById('appli-restore')
  minRestore.addEventListener('click', () => {
    ipcRenderer.send('onRestore', {window: 'remoteWindow'})
  })

  // 窗口关闭
  const closeBtn = document.getElementById('appli-colse')
  closeBtn.addEventListener('click', () => {
    window.close()
  })
}

new TabManage().init()
