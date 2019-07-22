import store from '../'
import {onUpdateFriend, onDeleteFriend} from './friends'
import {onRevocateMsg} from './msgs'

export function onSysMsgs (sysMsgs) {
  // store.commit('updateSysMsgs', sysMsgs)
}

export async function onSysMsg (sysMsg) {
  if (!sysMsg) return
  switch (sysMsg.type) {
    // 在其他端添加或删除好友
    case 'addFriend':
      onUpdateFriend(null, {
        account: sysMsg.from
      })
      store.commit('updateSysMsgs', [sysMsg])
      break
    case 'deleteFriend':
      onDeleteFriend(null, {
        account: sysMsg.from
      })
      break
    // 对方消息撤回
    case 'deleteMsg':
      if (sysMsg.scene === 'p2p') {
        sysMsg.sessionId = `p2p-${sysMsg.from}`
      } else {
        sysMsg.sessionId = `team-${sysMsg.to}`
      }
      onRevocateMsg(null, sysMsg)
      break
    case 'teamInvite': // 被邀请入群
    case 'applyTeam': // 申请入群
      try {
        sysMsg = await manageSysMsg(sysMsg)
      } catch (error) {}
      store.commit('updateSysMsgs', [sysMsg])
      break
    case 'passTeamApply': // 通过入群申请
      store.commit('updateSysMsgs', [sysMsg])
      break
    case 'rejectTeamApply': // 申请入群被拒绝
      store.commit('updateSysMsgs', [sysMsg])
      break
    case 'rejectTeamInvite': // 拒绝入群邀请
      store.commit('updateSysMsgs', [sysMsg])
      break
  }
  store.commit('updateSysMsgState', sysMsg)
}

export function onSysMsgUnread (obj) {
  store.commit('updateSysMsgUnread', obj)
}

export function onCustomSysMsgs (customSysMsgs) {
  if (!Array.isArray(customSysMsgs)) {
    customSysMsgs = [customSysMsgs]
  }
  customSysMsgs = customSysMsgs.filter(msg => {
    console.log('自定义系统通知====', msg)
    if (msg.type === 'custom') {
      if (msg.content) {
        let content = JSON.parse(msg.content)
        try {
          if (content.status && !content.actionStatus) {
            remoteConnectCtrl(content, msg.from)
            return false
          } else if (content.actionStatus) { // content.actionStatus: passTeamApply || rejectTeamApply
            // 群管理员处理群成员入群申请时发的自定义消息 --- 通知其他管理员同步处理
            if (msg.from !== store.state.myInfo.account) {
              let idServer = content.idServer
              let findIndex = -1
              for (let i = 0; i < store.state.sysMsgs.length; i++) {
                let itemMsg = store.state.sysMsgs[i]
                if ((itemMsg.to === content.teamId) && (itemMsg.from === content.fromAccid)) { // 千万别拿idServer去匹配，同一条消息管理员的idServer和群主的idServer还不一样，大坑
                  idServer = itemMsg.idServer
                  findIndex = i
                  break
                }
              }
              store.dispatch('delegateTeamFunction', {
                functionName: content.actionStatus,
                options: {
                  idServer,
                  teamId: content.teamId,
                  from: content.fromAccid,
                  done: (_error, obj) => {
                    let sysMsgs = store.state.sysMsgs
                    console.log('findIndex===', findIndex)
                    if (findIndex > -1) {
                      sysMsgs[findIndex].state = 'error' // 已被其他管理员处理
                      sysMsgs[findIndex].read = true // 手动置为已读
                      store.commit('updateSysMsgs', [sysMsgs])
                    }
                  }
                }
              })
            }
          }
        } catch (e) {}
      }
    }
    return true
  })
  if (customSysMsgs.length > 0) {
    store.commit('updateCustomSysMsgs', customSysMsgs)
  }
}

// 不传obj则全部重置
export function markSysMsgRead ({state, commit}, obj) {
  const nim = state.nim
  let sysMsgs = []
  if (obj && obj.sysMsgs) {
    sysMsgs = obj.sysMsgs
  } else {
    sysMsgs = state.sysMsgs
  }
  if (Array.isArray(sysMsgs) && sysMsgs.length > 0) {
    nim.markSysMsgRead({
      sysMsgs,
      done: function (_error, _obj) {
      }
    })
  }
}

export function markCustomSysMsgRead ({state, commit}) {
  commit('updateCustomSysMsgUnread', {
    type: 'reset'
  })
}

export function resetSysMsgs ({state, commit}, obj) {
  commit('resetSysMsgs', obj)
}

export function deleteSysMsgs ({commit}, obj) {
  commit('deleteSysMsgs', obj)
}

// 获取本地系统通知
export function getLocalSysMsgs ({state}, obj) {
  const nim = state.nim
  let params = {
    limit: obj.limit || 100,
    done: function (_error, _obj) {
      if (!_error) {
        let resultMsgs = JSON.parse(JSON.stringify(_obj.sysMsgs))
        console.log('_obj.sysMsgs.length === ', _obj.sysMsgs.length)
        _obj.sysMsgs.forEach(async item => {
          try {
            for (let i = 0; i < _obj.sysMsgs.length; i++) {
              let itemMsg = _obj.sysMsgs[i]
              if ((itemMsg.idServer !== item.idServer) && (itemMsg.to === item.to) && (itemMsg.from === item.from) && (itemMsg.time === item.time) && (item.state === 'init')) {
                console.log('item === ', item)
                console.log('itemMsg === ', itemMsg)
                resultMsgs.forEach(async (item1, index) => {
                  if (item1.idServer === itemMsg.idServer) {
                    resultMsgs.splice(index, 1)
                  }
                })
                deleteLocalSysMsg(item.idServer)
                break
              }
            }
            // item = await manageSysMsg(item)
          } catch (error) {}
        })
        console.log('resultMsgs.length === ', resultMsgs.length)
        resultMsgs.forEach(async item => {
          try {
            item = await manageSysMsg(item)
          } catch (error) {}
        })
        store.commit('updateSysMsgs', resultMsgs)
      }
    }
  }
  if (obj.lastIdServer) {
    params.lastIdServer = obj.lastIdServer
  }
  nim.getLocalSysMsgs(params)
}

async function manageSysMsg (item) {
  let userInfo = {}
  if (store.state.userInfos[item.from]) {
    userInfo = store.state.userInfos[item.from]
  } else {
    try {
      userInfo = await getUserInfo(item.from)
    } catch (error) {}
  }
  item.nick = userInfo.nick || ''
  item.avatar = userInfo.avatar || ''
  return item
}

function getUserInfo (account) {
  // 获取成员信息
  return new Promise((resolve, reject) => {
    let nim = store.state.nim
    nim.getUser({
      account,
      done: (error, user) => {
        if (!error) resolve(user)
        else reject(error)
      }
    })
  })
}

// 删除本地消息
export function deleteLocalSysMsg (idServer) {
  const nim = store.state.nim
  nim.deleteLocalSysMsg({
    idServer,
    done: (_err, _obj) => {
    }
  })
}

/**
 * 远程桌面相关
 * @param {*} status    request-发起请求，response-接收响应，connect-已连接，dismiss-取消，refuse-拒绝（对方正忙），disConnect-已断开
 * @param {*} type      1-接受，2-拒绝，3-取消
 * @param {*} reqType   1-控制对方电脑，2-请求远程协助
 * @param {*} account   用户accid
 * @param {*} nick      用户昵称
 */
function remoteConnectCtrl (content, account) {
  const ipcRenderer = require('electron').ipcRenderer
  // 拒绝提示
  const warnPrompt = (toastText) => {
    store.commit('toastConfig', { show: true, type: 'fail', toastText })
  }

  switch (content.status) {
    case 'request':
      const remote = require('electron').remote
      if (remote.getGlobal('HASREMOTE')) {
        // 已在进行远程通信
        let content = { status: 'refuse' }
        store.dispatch('sendCustomSysMsg', {account, content: JSON.stringify(content)})
        return
      }
      if (content.type === 3) {
        store.commit('updateRemoteConnectObj', { showModal: false })
      } else {
        store.commit('updateRemoteConnectObj', { showModal: true, ...content, account })
      }
      break
    case 'response':
      if (store.state.remoteWaitingObj.showModal) {
        store.commit('updateRemoteWaitingObj', { showModal: false })
        if (content.type === 2) {
          warnPrompt(`${content.nick}谢绝了您的远程控制的请求`)
          return false
        }
        if (content.type === 1) {
          // 接受远程协助
          store.commit('updateRemoteWaitingObj', { showModal: true, noCancel: true, ...content, account })
          if (content.reqType === 2) {
            ipcRenderer.send('remoteConnection', account)
          }
        }
      }
      break
    case 'connect':
      store.commit('updateRemoteWaitingObj', { showModal: false })
      ipcRenderer.send('remoteConnectionCreate', { url: 'http://' + content.ipconfig, account })
      break
    case 'dismiss':
      store.commit('updateRemoteWaitingObj', { showModal: false })
      ipcRenderer.send('remoteConnectionDiss')
      if (content.role) {
        warnPrompt(`${content.nick}谢绝了您的远程控制的请求`)
      } else {
        warnPrompt('对方断开了远程连接。')
      }
      break
    case 'refuse':
      store.commit('updateRemoteWaitingObj', { showModal: false })
      warnPrompt('对方正忙。')
      break
    case 'disConnect':
      ipcRenderer.send('remoteConnectionDiss')
      warnPrompt('对方断开了远程连接。')
      break
    default:
      break
  }
}
