/*
 * 会话列表
 */

import store from '../'
import config from '../../configs'
import NativeLogic from '../../utils/nativeLogic.js'
// 如果会话对象不是好友，需要更新好友名片
function updateSessionAccount (sessions) {
  sessions.forEach(session => {
    // 清除最后消息记录，因删除本地消息记录存在bug
    let time = session.lastMsg ? session.lastMsg.time : 0
    if (session.localCustom && session.localCustom.lastDelTime && session.localCustom.lastDelTime >= time) {
      session.lastMsg = null
    }
    if (session.unread === 0 && session.localCustom && session.localCustom.at) {
      // 重置@信息
      store.dispatch('updateLocalCustomSession', {
        sessionId: session.id,
        localCustom: {at: null}
      })
    }
    // 收到群被解散或被踢出群tip处理
    if (session.scene === 'team' && (store.state.currSessionId !== session.id)) {
      let type = ''
      if (session.lastMsg && session.lastMsg.attach) {
        type = session.lastMsg.attach.type
      }
      if (type === 'dismissTeam') {
        // 群被解散
        if (!session.localCustom || !session.localCustom.isTeamDismissRead) {
          if (!session.localCustom) session.localCustom = {}
          session.localCustom.isTeamDismissRead = 1
        }
      } else if (type === 'removeTeamMembers') {
        // 移除群成员
        let accounts = session.lastMsg.attach.accounts
        let isNeedShowTip = false
        for (let key in accounts) {
          if (store.state.userUID === accounts[key]) {
            isNeedShowTip = true
            break
          }
        }
        if (isNeedShowTip) {
          if (!session.localCustom || !session.localCustom.teamRemoveTip) {
            if (!session.localCustom) session.localCustom = {}
            session.localCustom.teamRemoveTip = {
              idClient: session.lastMsg.idClient,
              status: 1
            }
          } else {
            let lastIdClient = session.localCustom.teamRemoveTip.idClient
            if (lastIdClient !== session.lastMsg.idClient) {
              session.localCustom.teamRemoveTip = {
                idClient: session.lastMsg.idClient,
                status: 1
              }
            }
          }
        }
      } else if (type === 'addTeamMembers') {
        // 添加群成员
        if (session.localCustom && session.localCustom.teamRemoveTip) {
          session.localCustom.teamRemoveTip.status = 2
        }
      }
    }
  })
  let accountsNeedSearch = []
  sessions.forEach(item => {
    if (item.scene === 'p2p') {
      // 如果不存在缓存资料
      if (!store.state.userInfos[item.to]) {
        accountsNeedSearch.push(item.to)
      }
    }
  })
  if (accountsNeedSearch.length > 0) {
    store.dispatch('searchUsers', {
      accounts: accountsNeedSearch
    })
  }
}

// onSessions只在初始化完成后回调
export function onSessions (sessions) {
  // onSessions完成初始化后进行订阅
  store.dispatch('subscribeEvent', sessions)
  updateSessionAccount(sessions)
  store.commit('updateSessions', sessions)
  // 初始化无效群信息
  setTimeout(async () => {
    let sessionlist = store.state.sessionlist
    let teamlist = store.state.teamlist
    for (let i in sessionlist) {
      if (sessionlist[i].scene === 'team') {
        let hasExit = false
        for (let j in teamlist) {
          if (teamlist[j].teamId === sessionlist[i].to) {
            hasExit = true
            break
          }
        }
        if (!hasExit) {
          let teamInfo = {}
          try {
            teamInfo = await getTeamInfo(sessionlist[i].to)
          } catch (error) {}
          store.state.teamlist.push(teamInfo)
        }
      }
    }

    // 通知主进程
    updateTwinkle('isInit')
  }, 100)
}

function getTeamInfo (teamId) {
  // 获取群信息
  return new Promise((resolve, reject) => {
    store.state.nim.getTeam({
      teamId,
      done: (error, teams) => {
        if (!error) resolve(teams)
        else reject(error)
      }
    })
  })
}

export async function onUpdateSession (session, callback) {
  let sessions = [session]
  updateSessionAccount(sessions)
  if (callback) {
    store.commit('updateSessions', {sessions, callback})
  } else {
    store.commit('updateSessions', sessions)
  }
  // 通知主进程
  setTimeout(() => updateTwinkle('onUpdateSession'), 50)
}

async function updateTwinkle (type) {
  let unreadList = [...document.getElementsByClassName('unread-num')] // 未读数dom列表
  console.log(type + '=====' + unreadList.length)
  let unreadNums = 0
  if (unreadList.length < 1) {
    unreadNums = 0
  } else {
    unreadNums = 1
  }
  if (config.environment === 'web') { // web分支
    NativeLogic.native.receiveNewMsgs({ unreadNums })
  } else { // electron分支
    let { ipcRenderer } = require('electron')
    ipcRenderer.send('receiveNewMsgs', {unreadNums})
  }
}

// 获取静音列表
// function getRelationsDone () {
//   return new Promise((resolve, reject) => {
//     store.state.nim.getRelations({
//       done: (error, obj) => {
//         if (error) reject(error)
//         else resolve(obj.mutelist)
//       }
//     })
//   })
// }

// function notifyForNewTeamMsg (teamId) {
//   // 是否需要群消息提醒 0表示接收提醒，1表示关闭提醒，2表示仅接收管理员提醒
//   return new Promise((resolve, reject) => {
//     store.state.nim.notifyForNewTeamMsg({
//       teamIds: [teamId],
//       done: (error, map) => {
//         if (error) reject(error)
//         else resolve(map)
//       }
//     })
//   })
// }

// 置顶聊天
export function setTopSession ({state}, obj) {
  let session = state.sessionMap[obj.id]
  if (session) {
    store.dispatch('updateLocalCustomSession', {
      sessionId: obj.id,
      localCustom: {topTime: obj.key ? Number(new Date()) : ''}
    })
  }
}

export function deleteSession ({state, commit}, obj) {
  const nim = state.nim
  let sessionIdArr = state.sessionlist.map((item, index) => {
    return item.id
  })
  let curSessionId = obj.that.$router.history.current.query.sessionId
  let sessionId = obj.id || ''
  let scene = null
  let account = null
  if (/^p2p-/.test(sessionId)) {
    scene = 'p2p'
    account = sessionId.replace(/^p2p-/, '')
  } else if (/^team-/.test(sessionId)) {
    scene = 'team'
    account = sessionId.replace(/^team-/, '')
  }
  if (account && scene) {
    nim.deleteSession({
      scene,
      to: account,
      done: function deleteServerSessionDone (error, session) {
        if (error) {
          store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: error.message
          })
          return
        }
        nim.deleteLocalSession({
          id: sessionId,
          done: function deleteLocalSessionDone (error, session) {
            if (error) {
              return
            }
            updateTwinkle()
            // type为1是则删除所有
            let { that, type } = obj
            if (type === 1) {
              that.$router.push({ name: 'session-default' })
              commit('deleteSessions', [sessionId])
              return
            }
            if (curSessionId === sessionId) {
              let arrLength = sessionIdArr.length
              let curIndex = sessionIdArr.indexOf(curSessionId)
              let queryId = null
              if (arrLength - 1 <= 0) {
                queryId = null
              } else if (curIndex < arrLength - 1) {
                queryId = sessionIdArr[curIndex + 1]
              } else {
                queryId = sessionIdArr[curIndex - 1]
              }
              const pathName = that.$router.history.current.name
              if (!queryId) {
                state.currSessionId = null
                if (pathName === 'chat') {
                  that.$router.push({name: 'session-default'})
                }
              } else {
                if (pathName === 'chat') {
                  that.$router.push({name: 'chat', query: {sessionId: queryId, firstFlag: true}})
                }
                that.eventBus.$emit('toggleSelect', {sessionId: queryId})
              }
              store.commit('toggleSlideMenuStatus', 4)
            }
            // if (scene === 'p2p') {
            //   store.dispatch('unSubscribeEvent', [account])
            // }
            commit('deleteSessions', [sessionId])
            obj.callback && obj.callback()
          }
        })
      }
    })
  }
}

export function setCurrSession ({state, commit, dispatch}, sessionId) {
  const nim = state.nim
  if (sessionId) {
    commit('updateCurrSessionId', {
      type: 'init',
      sessionId
    })
    if (nim) {
      // 如果在聊天页面刷新，此时还没有nim实例，需要在onSessions里同步
      nim.setCurrSession(sessionId)
      commit('updateCurrSessionMsgs', {
        type: 'init',
        sessionId
      })
      // 发送已读回执
      dispatch('sendMsgReceipt')
    }
  }
}

export function resetCurrSession ({state, commit}) {
  const nim = state.nim
  if (nim) {
    nim.resetCurrSession()
    commit('updateCurrSessionMsgs', {
      type: 'destroy'
    })
  }
}

export function insertLocalSession ({state}, params) {
  const nim = state.nim
  if (params.account) {
    nim.insertLocalSession({
      scene: params.scene,
      to: params.account,
      done: (error, obj) => {
        if (!error) {
          onUpdateSession(obj.session, params.callback)
        } else {
          // 执行删除再创建会话
          store.dispatch('deleteSession', {
            id: params.scene + '-' + params.account,
            callback: () => {
              store.dispatch('insertLocalSession', params)
            }
          })
        }
      }
    })
  }
}

// 清理选中会话消息
export function deleteLocalMsgs ({state, commit}, obj) {
  const {idList, that} = obj
  let accountList = []
  idList.forEach(item => {
    if (/^p2p-/.test(item)) {
      accountList.push({acc: item.replace(/^p2p-/, ''), scene: 'p2p'})
    } else if (/^team-/.test(item)) {
      accountList.push({acc: item.replace(/^team-/, ''), scene: 'team'})
    }
  })
  accountList.forEach(item => {
    state.nim.deleteLocalMsgsBySession({
      scene: item.scene,
      to: item.acc,
      done: (err, obj) => {
        if (!err) {
          const param = {
            id: item.scene + '-' + item.acc,
            that,
            type: obj.type
          }
          store.dispatch('deleteSession', param)
          // 记录删除状态
          let session = state.sessionMap[item.scene + '-' + item.acc]
          if (session && session.lastMsg) {
            store.dispatch('updateLocalCustomSession', {
              sessionId: item.scene + '-' + item.acc,
              localCustom: { lastDelTime: session.lastMsg.time }
            })
          }
          commit('clearCurrentSessionMsgs', {
            sessionId: obj.sessionId
          })
        }
      }
    })
  })
}

// 删除某个会话的本地消息
export function deleteLocalMsgsBySession ({state, commit}, params) {
  const nim = state.nim
  nim.deleteLocalMsgsBySession({
    scene: 'p2p',
    to: params.account,
    done: (error, obj) => {
      if (!error) {
        // 记录删除状态
        let session = state.sessionMap[params.sessionId]
        if (session && session.lastMsg) {
          store.dispatch('updateLocalCustomSession', {
            sessionId: params.sessionId,
            localCustom: {lastDelTime: session.lastMsg.time}
          })
        }
        commit('clearCurrentSessionMsgs', {
          sessionId: obj.sessionId
        })
        params.callback()
      }
    }
  })
}
// 更新本地会话
export function updateLocalCustomSession ({state}, {sessionId, localCustom, callback}) {
  let session = state.sessionMap[sessionId]
  if (session) {
    if (!session.localCustom) {
      session.localCustom = {}
    }
    let newLocalCustom = Object.assign(session.localCustom, localCustom)
    state.nim.updateLocalSession({
      id: sessionId,
      localCustom: newLocalCustom,
      done: (error, session) => {
        error && console.log(error)
        callback && callback(error)
      }
    })
  }
}
