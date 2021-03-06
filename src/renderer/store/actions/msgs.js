import store from '../'
import config from '../../configs'
import util from '../../utils'
import Request from '../../utils/request'
import NativeLogic from '../../utils/nativeLogic.js'
const fs = require('fs')
export function formatMsg (msg) {
  const nim = store.state.nim
  if (msg.type === 'robot') {
    if (msg.content && msg.content.flag === 'bot') {
      if (msg.content.message) {
        msg.content.message = msg.content.message.map(item => {
          switch (item.type) {
            case 'template':
              item.content = nim.parseRobotTemplate(item.content)
              break
            case 'text':
            case 'image':
            case 'answer':
              break
          }
          return item
        })
      }
    }
  }
  return msg
}

export function onRoamingMsgs (obj) {
  let msgs = obj.msgs.map(msg => {
    return formatMsg(msg)
  })
  store.commit('updateMsgs', msgs)
  receiveMsg(msgs)
}

export function onOfflineMsgs (obj) {
  let msgs = obj.msgs.map(msg => {
    return formatMsg(msg)
  })
  store.commit('updateMsgs', msgs)
  receiveMsg(msgs)
}

export function onNewMsg (msg) {
  let newMsg = formatMsg(msg)
  store.commit('updateNewMsg', newMsg)
  onMsg(msg)
  receiveMsg(newMsg)
  systemNewMsgsManage(msg)
}

async function systemNewMsgsManage (msg) {
  store.commit('updateSessions', {sessions: msg})
  if (msg.from === store.state.userUID || msg.type === 'notification') return false
  let unreadNums = store.state.unreadNums
  // 发送音频
  let isMute = false
  if (msg.scene === 'p2p') {
    isMute = store.state.mutelist.find(item => {
      return item.account === msg.from
    })
  } else {
    let map = await notifyForNewTeamMsg(msg.to)
    let muteNotiType = Number(map[msg.to])
    if (muteNotiType === 1) isMute = true
  }
  if (!isMute) {
    // 未设置免打扰时，任务栏才闪烁
    if (config.environment === 'web') { // web分支
      NativeLogic.native.getWinStatus('main')
        .then(res => {
          if (!res.isFocused) {
            NativeLogic.native.flashFrame(true)
          }
        })
    } else { // electron分支
      let { ipcRenderer } = require('electron')
      ipcRenderer.send('receiveNewMsgs', {unreadNums})
    }
    // 开启声音提醒
    if (!localStorage.getItem('AUDIOSETT')) {
      let audio = new Audio(`./static/img/msg.wav`)
      audio.play()
      setTimeout(() => audio.pause(), 800)
    }
  }
}

function notifyForNewTeamMsg (teamId) {
  // 是否需要群消息提醒 0表示接收提醒，1表示关闭提醒，2表示仅接收管理员提醒
  return new Promise((resolve, reject) => {
    store.state.nim.notifyForNewTeamMsg({
      teamIds: [teamId],
      done: (error, map) => {
        if (error) reject(error)
        else resolve(map)
      }
    })
  })
}

// 转发消息
export function onForwordMsg ({state, commit}, OBJ) {
  let path = ''
  let obj = Object.assign({}, OBJ)
  if (obj.msg.type === 'file') {
    path = (obj.msg.localCustom && obj.msg.localCustom.downloadUrl) || 'null'
  }
  if (obj.msg.type === 'custom-type1' || obj.msg.type === 'custom-type3' || obj.msg.type === 'custom-type7') {
    obj.msg.type = 'custom'
  }
  return new Promise((resolve, reject) => {
    state.nim.forwardMsg({
      msg: obj.msg,
      scene: obj.scene,
      to: obj.to,
      done: function (err, msg) {
        if (!err) {
          if (!path) {
            onSendMsgDone(err, msg)
            resolve()
          } else {
            msg.localCustom = {
              downloadUrl: path
            }
            state.nim.updateLocalMsg({
              idClient: msg.idClient,
              localCustom: { downloadUrl: path },
              done: () => {
                onSendMsgDone(err, msg)
                resolve(msg)
              }
            })
          }
        } else {
          reject(err)
        }
      }
    })
  })
}

// 接收到离线消息、漫游消息、新消息时处理（@记录）
function receiveMsg (msgs) {
  store.commit('connectStatus', { networkStatus: 200 })
  if (!Array.isArray(msgs)) {
    msgs = [msgs]
  }
  const state = store.state
  let sessionId = msgs[0].sessionId
  let session = null
  if (sessionId) session = state.sessionMap[sessionId]
  let length = session && session.unread <= msgs.length ? session.unread : msgs.length
  for (let i = length - 1; i >= 0; i--) {
    let msg = msgs[i]
    // @只处理接收到的群消息
    if (msg.flow === 'in' && msg.scene === 'team' && msg.apns && state.currSessionId !== msg.sessionId) {
      let accounts = msg.apns.accounts
      let hasAt = false
      if (accounts) {
        for (let i = 0; i < accounts.length; i++) {
          if (accounts[i] === state.userUID) {
            hasAt = true
            break
          }
        }
      } else if (msg.apns.content) {
        hasAt = true
      }
      if (hasAt) {
        let session = Object.assign({}, state.sessionMap[msg.sessionId])
        if (session) {
          if (session.localCustom && session.localCustom.at) {
            session.localCustom.at.count += 1
          } else {
            if (!session.localCustom) {
              session.localCustom = {}
            }
            session.localCustom.at = {
              idClient: msg.idClient,
              time: msg.time,
              count: 1
            }
          }
          state.nim.updateLocalSession({
            id: session.id,
            localCustom: session.localCustom,
            done: (error) => {
              error && console.log(error)
            }
          })
        }
      }
    }
  }
}

function onMsg (msg) {
  msg = formatMsg(msg)
  store.commit('putMsg', msg)
  if (msg.sessionId === store.state.currSessionId) {
    store.commit('updateCurrSessionMsgs', {
      type: 'put',
      msg
    })
    // 发送已读回执
    store.dispatch('sendMsgReceipt')
  }
  if (msg.scene === 'team' && msg.type === 'notification') {
    store.dispatch('onTeamNotificationMsg', msg)
  }
}

function onSendMsgDone (error, msg) {
  if (msg.custom) {
    let isSmsMsg = JSON.parse(msg.custom).isSmsMsg
    if (isSmsMsg && msg.status === 'success') {
      // 短信发送
      let params = {
        msgId: msg.idClient,
        sendType: msg.scene === 'team' ? 1 : 2,
        receiveId: msg.to,
        content: msg.text
      }
      Request.SendMsg(params)
    }
  }
  store.dispatch('hideLoading')
  if (error) {
    // 被拉黑
    if (error.code === 7101) {
      msg.status = 'success'
    } else if (error.code === 'Error_Internet_Disconnected' || error.code === 'Error_Connection_Socket_State_not_Match') {
      if (store.state.networkStatus !== 500) {
        store.commit('toastConfig', {
          show: true,
          type: 'fail',
          toastText: '网络连接状态异常，请检查网络连接'
        })
        store.commit('connectStatus', { networkStatus: 500 })
      }
    } else {
      console.log(' onSendMsgDone error ', error)
      console.log(error.message)
    }
  } else if (msg && msg.status === 'success') {
    store.commit('connectStatus', { networkStatus: 200 })
  }
  onMsg(msg)
}

// 消息删除
export function onDeleteMsg (error, obj) {
  if (error) {
    console.log(error)
  }
  store.commit('deleteMsg', obj)
}

export function deleteMsg ({state, commit}, msg) {
  const nim = state.nim
  let {idClient} = msg
  msg = Object.assign(msg, state.msgsMap[idClient])
  nim.deleteLocalMsg({
    msg,
    done: function deleteLocalMsgDone (error, obj) {
      onDeleteMsg(error, msg)
    }
  })
}

// 消息撤回
export function onRevocateMsg (error, obj) {
  const {msg} = obj
  const nim = store.state.nim
  const accid = store.state.personInfos.accid
  const isFirstWithdraw = localStorage.getItem(`WITHDRAW-${accid}`)
  if (error) {
    if (error.code === 508) {
      store.commit('toastConfig', {type: 'fail', toastText: '你可在5分钟内撤回发送的消息', show: true})
    }
    return
  }
  if (!isFirstWithdraw && obj.msg.from === store.state.userUID) {
    store.commit('toastConfig', {
      toastText: '你可在5分钟内撤回发送的消息',
      show: true,
      type: 'success'
    })
    localStorage.setItem(`WITHDRAW-${accid}`, 'true')
  }
  if (obj.msg.from !== store.state.userUID) {
    // 被撤回的消息是否存在
    let exit = false
    let currentMsg = store.state.msgs[obj.sessionId]
    for (let i in currentMsg) {
      if (currentMsg[i].idClient === msg.idClient) {
        exit = true
      }
    }
    if (!exit) return
  }
  let tip = ''
  let to = msg.to
  if (msg.from === store.state.userUID) {
    tip = '你撤回了一条消息'
  } else {
    let userInfo = store.state.userInfos[msg.from]
    if (msg.scene === 'p2p') {
      to = msg.from
      tip = '对方撤回了一条消息'
    } else if (userInfo) {
      tip = `${util.getFriendAlias(userInfo)}撤回了一条消息`
    } else {
      tip = '对方撤回了一条消息'
    }
  }
  nim.sendTipMsg({
    isLocal: true,
    scene: msg.scene,
    to: to,
    tip,
    time: msg.time,
    done: function sendTipMsgDone (_error, tipMsg) {
      let idClient = msg.deletedIdClient || msg.idClient
      store.commit('replaceMsg', {
        sessionId: msg.sessionId,
        idClient,
        msg: tipMsg
      })
      if (msg.sessionId === store.state.currSessionId) {
        store.commit('updateCurrSessionMsgs', {
          type: 'replace',
          idClient,
          msg: tipMsg
        })
      }
    }
  })
}

export function revocateMsg ({state, commit}, obj) {
  const nim = state.nim
  let {idClient} = obj.msg
  let msg = Object.assign(obj.msg, state.msgsMap[idClient])
  nim.deleteMsg({
    msg,
    done: function deleteMsgDone (error) {
      onRevocateMsg(error, {msg, that: obj.that})
    }
  })
}

// 下载图片或文件
export function downloadImg ({state, commit}, file) {
  // console.log('downloadImg', file)
  const nim = state.nim
  const nameUrl = nim.packFileDownloadName({
    url: file.url.split('?')[0],
    name: file.name
  })
  // console.log('nameUrl', nameUrl)
  var $a = document.createElement('a')
  let decodeUrl = ''
  if (file.type === 'file') {
    decodeUrl = decodeURI(file.url)
  } else {
    decodeUrl = decodeURI(nameUrl)
  }
  $a.setAttribute('href', decodeUrl)
  $a.setAttribute('download', file.name)
  var evObj = document.createEvent('MouseEvents')
  evObj.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, true, false, 0, null)
  $a.dispatchEvent(evObj)
  // 修改文件名
  let {ipcRenderer} = require('electron')
  this.downloadedHandle = (evt, obj) => {
    // 判断文件是否存在后缀
    let oldPath = obj.url
    let newPath = obj.url
    console.log('downloadImg downloadedHandle obj：', obj)
    let oriUrl = obj.id.replace('youx.telecomjs.com', '')
    var spl = oriUrl.split('.')
    if (obj.url.split('.').length === 1 && spl.length !== 1) {
      newPath = obj.url + '.' + spl[spl.length - 1]
    }
    // 修改文件名
    if (oldPath !== newPath) {
      fs.stat(newPath, function (err, stat) {
        // console.log('stat========', stat)
        // console.log('err========', err)
        if (err !== null) {
          setTimeout(() => {
            fs.rename(oldPath, newPath, (err) => {
              // console.log('rename oldPath', oldPath)
              // console.log('rename newPath', newPath)
              if (err) {
                console.log('err', err)
              }
            })
          }, 100)
        }
      })
    }
  }
  // 下载完成
  ipcRenderer.on(`downloaded`, this.downloadedHandle)
}

// 发送普通消息
export function sendMsg ({state, commit}, obj) {
  const nim = state.nim
  obj = obj || {}
  let type = obj.type || ''
  let dataAt = obj.dataAt ? obj.dataAt.split('&&') : ''
  let apns = {}
  if (dataAt) {
    let isAtAll = dataAt.every((item) => {
      return item !== '@'
    })
    if (!isAtAll) {
      apns = {
        forcePush: true
      }
    } else {
      apns = {
        accounts: dataAt,
        forcePush: true
      }
    }
  }
  store.dispatch('showLoading')
  return new Promise((resolve, reject) => {
    let option = {}
    switch (type) {
      case 'text':
        option = {
          scene: obj.scene,
          to: obj.to,
          text: obj.text,
          needPushNick: true,
          done: (error, msg) => {
            onSendMsgDone(error, msg)
            if (error) reject(error)
            else resolve(msg)
          },
          needMsgReceipt: true
        }
        if (obj.scene === 'team') {
          option.pushPayload = obj.pushPayload
        }
        if (obj.custom && obj.custom.isSmsMsg) option.custom = JSON.stringify(obj.custom)
        if (dataAt) option.apns = apns
        let msg = nim.sendText(option)
        if (msg) {
          onSendMsgDone(null, msg)
        }
        break
      case 'custom':
        option = {
          scene: obj.scene,
          to: obj.to,
          needPushNick: true,
          pushContent: obj.pushContent,
          content: JSON.stringify(obj.content),
          done: (error, msg) => {
            onSendMsgDone(error, msg)
            if (error) reject(error)
            else resolve(msg)
          }
        }
        if (obj.scene === 'team') {
          option.pushPayload = obj.pushPayload
        }
        nim.sendCustomMsg(option)
    }
  })
}
// 发送文件消息
export function sendFileMsg ({ state, commit }, obj) {
  console.log(obj.pushPayload)
  const nim = state.nim
  let type = 'file'
  const { scene, to, file } = obj
  // 伪造假的消息对象
  let extArr = /\.(\w+)$/.exec(file.name)
  let ext = ''
  if (extArr.length > 0) {
    ext = extArr[1]
  }
  let msgFake = {
    sessionId: `${scene}-${to}`,
    scene,
    from: state.userUID,
    to,
    flow: 'out',
    type,
    idClientFake: util.uuid(),
    status: 'sending',
    time: (new Date()).getTime(),
    file: {
      name: file.name,
      size: file.size,
      ext
    }
  }
  onSendMsgDone(null, msgFake)
  const id = msgFake.idClientFake
  return new Promise((resolve, reject) => {
    let option = {
      scene,
      to,
      type,
      blob: file,
      needMsgReceipt: true,
      beginupload: function (upload) {
        store.commit('updateUploadprogressList', { id, percentage: 0, type: 0, abort: () => upload.abort(), file })
        // - 如果开发者传入 fileInput, 在此回调之前不能修改 fileInput
        // - 在此回调之后可以取消图片上传, 此回调会接收一个参数 `upload`, 调用 `upload.abort();` 来取消文件上传
      },
      uploadprogress: function (_data) {
        // 更新进度条
        const percentage = _data.percentage
        store.commit('updateUploadprogressList', { id, percentage, type: 1, file })
      },
      uploaderror: function () {
        console.log('上传失败')
      },
      uploaddone: function (_error, _file) {
        if (_error) {
          reject(_error)
        }
      },
      beforesend: function (_msg) {
        // console.log('beforesend')
      },
      done: function (error, msg) {
        store.commit('updateUploadprogressList', { id, percentage: 100, type: 2 })
        msg.idClientFake = msgFake.idClientFake
        if (msg.localCustom) {
          msg.localCustom.downloadUrl = file.path
        } else {
          msg.localCustom = {
            downloadUrl: file.path
          }
        }
        // 更新本地消息将下载保存路径存入自定义字段
        nim.updateLocalMsg({
          idClient: msg.idClient,
          localCustom: { downloadUrl: file.path },
          done: () => {
            onSendMsgDone(error, msg)
            resolve(msg)
          }
        })
      }
    }
    if (scene === 'team') {
      option.pushPayload = obj.pushPayload
    }
    // 发送文件消息
    nim.sendFile(option)
  })
}

// 发送图片消息
export function sendImgMsg ({ state, commit }, obj) {
  const nim = state.nim
  let { scene, to, imageFile } = obj
  let type = 'image'
  store.dispatch('showLoading')
  let { base64Str, w, h } = imageFile
  // 伪造假的消息对象
  let msgFake = {
    sessionId: `${scene}-${to}`,
    scene,
    from: state.userUID,
    to,
    flow: 'out',
    type,
    idClientFake: util.uuid(),
    status: 'sending',
    time: (new Date()).getTime(),
    file: {
      url: base64Str,
      w: w,
      h: h
    }
  }
  onSendMsgDone(null, msgFake)
  return new Promise((resolve, reject) => {
    // 先预览文件，获取文件URL
    state.nim.previewFile({
      type: obj.type,
      blob: imageFile,
      uploadprogress: (obj) => {
        // console.log(obj)
      },
      done: (error, file) => {
        if (error) {
          msgFake.status = 'fail'
          onSendMsgDone(error, msgFake)
          store.commit('updateUploadprogressList', { id: msgFake.idClientFake, percentage: 0, type: 0, abort: () => {}, file: imageFile })
          reject(error)
          return
        }
        file.w = w
        file.h = h
        let option = {
          scene,
          to,
          type,
          file,
          needMsgReceipt: true,
          uploadprogress: function (_data) {
            // console.log('uploadprogress,上传进度:' + _data.percentage)
          },
          uploaderror: function () {
            // console && console.log('上传失败')
          },
          uploaddone: function (_error, _file) {
            if (_error) {
              msgFake.status = 'fail'
              onSendMsgDone(_error, msgFake)
              reject(error)
            }
          },
          beforesend: function (_msg) {
          },
          done: function (error, msg) {
            msg.idClientFake = msgFake.idClientFake
            onSendMsgDone(error, msg)
            resolve(msg)
          }
        }
        if (scene === 'team') {
          option.pushPayload = obj.pushPayload
        }
        // 发送文件消息
        nim.sendFile(option)
      }
    })
  })
}

// 发送机器人消息
export function sendRobotMsg ({state, commit}, obj) {
  const nim = state.nim
  let {type, scene, to, robotAccid, content, params, target, body} = obj
  scene = scene || 'p2p'
  if (type === 'text') {
    nim.sendRobotMsg({
      scene,
      to,
      robotAccid: robotAccid || to,
      content: {
        type: 'text',
        content
      },
      body,
      done: onSendMsgDone
    })
  } else if (type === 'welcome') {
    nim.sendRobotMsg({
      scene,
      to,
      robotAccid: robotAccid || to,
      content: {
        type: 'welcome'
      },
      body,
      done: onSendMsgDone
    })
  } else if (type === 'link') {
    nim.sendRobotMsg({
      scene,
      to,
      robotAccid: robotAccid || to,
      content: {
        type: 'link',
        params,
        target
      },
      body,
      done: onSendMsgDone
    })
  }
}

// 发送消息已读回执
export function sendMsgReceipt ({state, commit}) {
  // 如果有当前会话
  let currSessionId = store.state.currSessionId
  if (currSessionId) {
    // 只有点对点消息才发已读回执
    if (util.parseSession(currSessionId).scene === 'p2p') {
      // let msgs = store.state.currSessionMsgs
      const nim = state.nim
      if (state.sessionMap[currSessionId]) {
        nim.sendMsgReceipt({
          msg: state.sessionMap[currSessionId].lastMsg,
          done: function sendMsgReceiptDone (_error, _obj) {
            // do something
          }
        })
      }
    }
  }
}

export function getHistoryMsgs ({state, commit}, obj) {
  const nim = state.nim
  if (nim) {
    let {scene, to, beginTime, endTime, lastMsgId, callBack} = obj
    let options = {
      scene,
      to,
      reverse: false,
      asc: false,
      limit: config.localMsglimit || 20,
      done: function getHistoryMsgsDone (_error, obj) {
        if (obj.msgs) {
          let msgs = obj.msgs.map(msg => {
            return formatMsg(msg)
          })
          callBack && callBack()
          commit('updateCurrSessionHistoryMsgs', {
            type: 'concat',
            msgs: msgs
          })
        }
      }
    }
    if (endTime) {
      options.endTime = endTime
    }
    if (beginTime) {
      options.beginTime = beginTime
    }
    if (lastMsgId) {
      options.lastMsgId = lastMsgId
    }
    nim.getHistoryMsgs(options)
  }
}

// 拉取本地历史记录
var loadRepeat = {}
export function getLocalMsgs ({state, commit}, obj) {
  if (loadRepeat[obj.sessionId]) {
    return false
  }
  loadRepeat[obj.sessionId] = true
  const nim = state.nim
  if (nim) {
    let callback = obj.callBack
    let options = {
      limit: config.localMsglimit || 20,
      sessionId: obj.sessionId,
      done: function getHistoryMsgsDone (_error, obj) {
        loadRepeat[obj.sessionId] = null
        if (obj.msgs) {
          if (options.limit > obj.msgs.length) {
            commit('setNoMoreHistoryMsgs')
            if (callback) callback(obj.msgs)
          }
          if (obj.msgs.length > 0) {
            let msgs = obj.msgs.map(msg => {
              return formatMsg(msg)
            })
            commit('updateCurrSessionMsgs', {
              type: 'concat',
              msgs: msgs,
              sessionId: obj.sessionId
            })
            if (callback) callback(msgs)
          }
        }
        store.dispatch('hideLoading')
      }
    }
    if (state.currSessionLastMsg && state.currSessionLastMsg.time) {
      options = Object.assign(options, {
        end: state.currSessionLastMsg.time
      })
    }
    if (obj.end) {
      options.end = obj.end.time
    }
    if (obj.start) {
      options.start = obj.start
    }
    store.dispatch('showLoading')
    nim.getLocalMsgs(options)
  }
}

export function resetNoMoreHistoryMsgs ({commit}) {
  commit('resetNoMoreHistoryMsgs')
}

// 继续与机器人会话交互
export function continueRobotMsg ({commit}, robotAccid) {
  commit('continueRobotMsg', robotAccid)
}

export function onConvertVoice (error, obj, params) {
  if (!error) {
    params.callBack(obj.text, obj.url)
  }
}

export function convertVoice ({ state }, obj) {
  const nim = state.nim
  nim.audioToText({
    url: obj.url,
    done: function audioToTextDone (error, _obj) {
      onConvertVoice(error, _obj, obj)
    }
  })
}

export function previewFile ({ state }, obj) {
  state.nim.previewFile({
    type: obj.type,
    fileInput: obj.fileInput,
    uploadprogress: (obj) => {
      // console.log(obj)
    },
    done: (error, file) => {
      if (!error) {
        obj.callback(file)
      }
    }
  })
}

// 消息重发
export function resendMsg ({ state, commit }, msg) {
  state.nim.resendMsg({
    msg,
    done: (error, newMsg) => {
      if (!error) {
        commit('updateCurrSessionMsgs', {
          type: 'rewire',
          idClient: msg.idClient,
          msg: newMsg
        })
      }
    }
  })
}

// 更新本地消息
export function updateLocalMsg ({ state }, obj) {
  state.nim.updateLocalMsg({
    idClient: obj.idClient,
    localCustom: obj.localCustom,
    done: (_err, _obj) => {
      if (!_err) {
        store.commit('updateLocalCustomMsg', obj)
      }
    }
  })
}

// 自定义系统通知
export function sendCustomSysMsg ({ state }, msg) {
  let { account, content } = msg
  state.nim.sendCustomSysMsg({
    scene: 'p2p',
    to: account,
    content: content,
    isPushable: false, // 自定义系统消息不推送消息
    sendToOnlineUsersOnly: true,
    apnsText: content,
    done: (error, newMsg) => {
      if (!error) {
        console.log('发送成功！')
      }
    }
  })
}
