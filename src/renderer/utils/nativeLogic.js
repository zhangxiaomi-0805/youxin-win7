/**
 * 与native/electron交互合集方法
 * **/

import store from '../store'

// 一、electron提供的方法
class ElectronHandle {
  // 1、设置窗口大小
  // setBounds = (userInfo) => {
  //   const electron = require('electron')
  //   const ipcRenderer = electron.ipcRenderer
  //   ipcRenderer.send('onReset', {userInfo}) // 设置系统托盘，设置窗口大小
  // }
}

// 二、Native提供的接口合集
class NativeHandle {
  downList = {}
  // 0、设置窗口可拖动区域
  setDraggableArea = (percent, leftTitleHeight, rightTitleHeight) => {
    window.NimCefWebInstance && window.NimCefWebInstance.call('setDraggableArea', {
      percent, // 左边占整个应用的百分比：如：0.3
      leftTitleHeight, // 左侧可拖动区域高度：20
      rightTitleHeight // 右侧可拖动区域高度：30
    }, (error, result) => {
      console.log(error, result)
      if (result) {
      }
    })
  }

  // 1、设置窗口大小
  setBounds = (width, height) => {
    window.NimCefWebInstance && window.NimCefWebInstance.call('setBounds', { width, height }, (error, result) => {
      console.log(error, result)
      if (result) {
      }
    })
  }

  /**
   * 2、打开文件、打开文件所在目录、打开外部浏览器
   * @params: type   // 打开类型（1-文件，2-文件所在目录，3-外部浏览器）
   * @params: path   // 文件对应的为本地路径，浏览器对应的是url
   * **/
  openShell = (type, path) => {
    console.log(type)
    console.log(path)
    window.NimCefWebInstance && window.NimCefWebInstance.call('openShell', { type, path }, (error, result) => {
      console.log(error)
      console.log(result)
      if (result) {
      }
    })
  }

  /**
   * 3、文件下载: 提供文件下载功能，需要将文件下载的进度、是否下载完成以及下载失败提供给h5（需要支持断点续传）
   * @params: url   // 文件下载地址
   * @params: savePath   // 默认保存路径
   * @params: showSaveDlg   // 是否显示保存对话框
   * **/
  fileDownload = (url, savePath, showSaveDlg, msg, session) => {
    const id = msg.idClient
    window.NimCefWebInstance.call('fileDownload', {
      url,
      savePath,
      showSaveDlg
    }, (error, result) => {
      if (error) {
        console.log('下载文件失败', result)
      } else {
        if (result.isReady) {
          console.log('任务开始， 任务 Id', result.id)
          // status 1 -下载中 2 -暂停
          this.downList[id] = {id: result.id, status: 1}
        } else if (result.isInProgress) {
          console.log('下载中', result.currentSpeed, result.totalBytes, result.receiveBytes, result.percentComplete)
          if (this.downList[id].status === 1) {
            store.commit('updateDownloadFileList', {
              type: 1,
              id: id,
              sessionId: session,
              downloadProgress: result.percentComplete
            })
          }
        } else if (result.isComplete) {
          console.log('下载完成', result.totalBytes, result.receiveBytes)
          let newMsg = Object.assign({}, msg)
          if (newMsg.localCustom) {
            newMsg.localCustom.downloadUrl = result.fullPath
          } else {
            newMsg.localCustom = {
              downloadUrl: result.fullPath
            }
          }
          const param = {
            sessionId: session,
            idClient: id,
            msg: newMsg
          }
          store.commit('updateDownloadFileList', {
            type: 0,
            id
          })
          store.state.nim.updateLocalMsg({
            idClient: id,
            localCustom: { downloadUrl: result.fullPath },
            done: () => {
              store.commit('replaceMsg', param)
              if (session === store.state.currSessionId) {
                store.commit('updateCurrSessionMsgs', {
                  type: 'replace',
                  idClient: id,
                  msg: newMsg
                })
              }
            }
          })
        } else if (result.isCanceled) {
          console.log('取消下载中', result.totalBytes, result.receiveBytes)
          store.commit('updateDownloadFileList', {
            type: 3,
            id: id
          })
        }
      }
    })
  }

  /**
   * 4.文件下载控制: 可控制文件下载状态
   * @params: downloadId   // 下载标识ID
   * @params: status   // 下载状态（1-暂停下载，2-恢复下载，3-取消下载）
   * **/
  downloadControl = (msgId, status) => {
    const downloadId = this.downList[msgId].id
    if (status === 0) {
      this.downList[msgId].status = 2
    } else {
      this.downList[msgId].status = 1
    }
    window.NimCefWebInstance && window.NimCefWebInstance.call('downloadControl', { id: downloadId, status: status }, (error, result) => {
      console.log(error)
      console.log(result)
      if (result) {
      }
    })
  }

  /**
   * 5.截屏:
   * **/
  screenShot = () => {
    window.NimCefWebInstance && window.NimCefWebInstance.call('screenShot', {}, (error, result) => {
      console.log(error)
      console.log(result)
      if (result) {
        // code: 200 // 截屏状态（200-成功，400-取消截屏）
      }
    })
  }

  /**
   * 6、获取系统剪切板数据
   * **/
  getClipboard = () => {
    return new Promise((resolve, reject) => {
      window.NimCefWebInstance && window.NimCefWebInstance.call('getClipboard', {}, (error, result) => {
        console.log(error)
        console.log(result)
        if (result) {
          // data: {} // 截切板数据，如果为文件，则返回blob对象
          resolve(result)
        } else {
          reject(error)
        }
      })
    })
  }

  /**
   * 7、设置系统托盘应用图标
   * @params: iconPath // 图片地址
   * @params: tooltip // 图标示例
   * **/
  setTrayImage = (iconPath, tooltip) => {
    console.log(iconPath)
    window.NimCefWebInstance && window.NimCefWebInstance.call('setTrayImage', {iconPath, tooltip}, (error, result) => {
      console.log(error)
      console.log(result)
      if (result) {
      }
    })
  }

  receiveNewMsgs = (arg) => {
    let AppDirectory = window.location.pathname.slice(1) // 应用所在目录
    console.log(AppDirectory)
    // if (AppDirectory.indexOf('dist') > -1) {
    //   let urlArr = AppDirectory.split('dist')
    //   AppDirectory = urlArr[0]
    // }
    // 设置系统托盘应用图标
    // NativeLogic.native.setTrayImage(AppDirectory + '/static/img/systry-logo.png', userInfo.name)
    if (arg.unreadNums <= 0) {
      if (this.twinkle) {
        this.setTrayImage(`./static/img/systry-logo.png`)
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
        this.setTrayImage(`./static/img/systry-logo.png`)
      } else {
        this.setTrayImage(`./static/img/systry-logo-a.png`)
      }
    }, 600)
  }

  /**
   * 8、设置任务栏闪烁
   * **/
  flashFrame = () => {
    window.NimCefWebInstance && window.NimCefWebInstance.call('flashFrame', (error, result) => {
      console.log(error)
      console.log(result)
      if (result) {
      }
    })
  }

  /**
   * 9、设置窗口状态: 窗口的最大化、最小化、关闭、重启、隐藏、显示（主窗口的关闭需要保证所有子窗口都关闭）
   * @params: windowName   // 窗口名称；main-表示主窗口；其他窗口在创建时传入windowName
   * @params: type      // 类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
   * **/
  setWinStatus = (windowName, type) => {
    window.NimCefWebInstance && window.NimCefWebInstance.call('setWinStatus', {windowName, type}, (error, result) => {
      console.log(error)
      console.log(result)
      if (result) {
      }
    })
  }

  /**
   * 10、获取窗口状态: 收到新消息，当窗口处于非激活状态时进行消息通知
   * **/
  getWinStatus = () => {
    window.NimCefWebInstance && window.NimCefWebInstance.call('getWinStatus', { windowName: 'main_form' }, (error, result) => {
      console.log(error)
      console.log(result)
      if (result) {
        // resolve(result)
        // 回参
        // windowName: "main", // 窗口名称；main-表示主窗口；其他窗口在创建时传入windowName
        // isFocused: true, // 是否获取焦点
        // isMinimized: true // 是否最小化
      }
    })
  }

  /**
   * 11、创建窗口： 营业精灵，打开内部窗口
   * @params: path      对应子窗口加载的界面路径
   * @params: windowName      窗口名称，不能传入“main”（会与主窗口冲突）
   * @params: height      初始窗口高
   * @params: width      初始窗口宽
   * **/
  createWindows = (windowName, path, height, width) => {
    return new Promise((resolve, reject) => {
      window.NimCefWebInstance && window.NimCefWebInstance.call('createWindow', {windowName, path, height, width}, (error, result) => {
        if (result) {
          console.log(result)
          resolve(result)
        } else {
          console.log(error)
          reject(error)
        }
      })
    })
  }

  /**
   * 12、跨窗口通信： 主窗口与子窗口之间数据传递与交互
   * @params:  windowName 创建窗口时指定的窗口名，如为空，则指所有窗口，包括主窗口
   * @params: data:{}      携带参数
   * @params: eventName      事件名称（接收窗口监听该事件）
   * @params: callback      回调函数，等接收窗口处理完后回调给调用窗口
   * **/
  sendEvent = (windowName, data, eventName) => {
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
}

const electron = new ElectronHandle()
const native = new NativeHandle()
export default{
  electron,
  native
}