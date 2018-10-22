// 更改 Vuex 的 store 中的状态的唯一方法是提交 mutation
// this.$store.commit(method, params)

import store from '../'
// import cookie from '../../utils/cookie'
import util from '../../utils'
import listSort from '../../utils/listSort.js'
import config from '../../configs'
import Vue from 'Vue'
import LocalStorage from 'localStorage'
import IndexedDB from '../../utils/indexedDB'
export default {
  updateRefreshState (state) {
    state.isRefresh = false
  },
  updateLoading (state, status) {
    clearTimeout(state.loadingTimer)
    state.loadingTimer = setTimeout(() => {
      state.isLoading = status
    }, 2000)
  },
  updateImgModal (state, obj) {
    if (obj.src) {
      state.curModalImg = obj.src
      state.allModalImg = obj.imgArr
      state.imgModal = true
    } else {
      state.imgModal = false
      state.curModalImg = ''
      state.allModalImg = []
    }
  },
  updateListOptions (state, obj) {
    state.listOptionsItems = obj.items
    state.showListOptions = obj.show
    state.listOptionsPos = obj.pos
  },
  updateFullscreenImage (state, obj) {
    obj = obj || {}
    if (obj.src && obj.type === 'show') {
      state.fullscreenImgSrc = obj.src
      state.isFullscreenImgShow = true
    } else if (obj.type === 'hide') {
      state.fullscreenImgSrc = ' '
      state.isFullscreenImgShow = false
    }
  },
  updateLoginCode (state, code) {
    state.loginCode = code
  },
  updateUserUID (state, loginInfo) {
    state.userUID = loginInfo.uid
    state.sdktoken = loginInfo.sdktoken
    LocalStorage.setItem('uid', loginInfo.uid)
    LocalStorage.setItem('sdktoken', loginInfo.sdktoken)
    // cookie.setCookie('uid', loginInfo.uid)
    // cookie.setCookie('sdktoken', loginInfo.sdktoken)
  },
  updateMyInfo (state, myInfo) {
    state.myInfo = util.mergeObject(state.myInfo, myInfo)
  },
  updateUserInfo (state, users) {
    let userInfos = state.userInfos
    users.forEach(user => {
      let account = user.account
      if (account) {
        userInfos[account] = util.mergeObject(userInfos[account], user)
      }
    })
    state.userInfos = util.mergeObject(state.userInfos, userInfos)
  },
  updateFriends (state, friends) {
    const nim = state.nim
    state.friendslist = nim.mergeFriends(state.friendslist, friends)
  },
  deleteFriends (state, cutFriends) {
    const nim = state.nim
    state.friendslist = nim.cutFriends(state.friendslist, cutFriends)
    // state.friendslist = nim.cutFriends(state.friendslist, friends.invalid)
  },
  updateRobots (state, robots) {
    const nim = state.nim
    robots = robots.map(item => {
      if (item.avatar) {
        item.originAvatar = item.avatar
        item.avatar = nim.viewImageSync({
          url: item.avatar, // 必填
          thumbnail: { // 生成缩略图， 可选填
            width: 40,
            height: 40,
            mode: 'cover'
          }
        })
      } else {
        item.avatar = config.defaultUserIcon
      }
      return item
    })
    state.robotslist = robots
    state.robotInfos = Object.create(null)
    robots.forEach(robot => {
      state.robotInfos[robot.account] = robot
      state.robotInfosByNick[robot.nick] = robot
    })
  },
  updateBlacklist (state, blacks) {
    const nim = state.nim
    state.blacklist = nim.cutFriends(state.blacklist, blacks.invalid)
    let addBlacks = blacks.filter(item => {
      return item.isBlack === true
    })
    let remBlacks = blacks.filter(item => {
      return item.isBlack === false
    })
    // 添加黑名单
    state.blacklist = nim.mergeFriends(state.blacklist, addBlacks)
    // 解除黑名单
    state.blacklist = nim.cutFriends(state.blacklist, remBlacks)
  },
  updateMutelist (state, mutes) {
    const nim = state.nim
    state.mutelist = nim.cutFriends(state.mutelist, mutes.invalid)
    let addMutes = mutes.filter(item => {
      return item.isMute === true
    })
    let remMutes = mutes.filter(item => {
      return item.isMute === false
    })
    // 添加到静音列表
    state.mutelist = nim.mergeFriends(state.mutelist, addMutes)
    // 从静音列表移除
    state.mutelist = nim.cutFriends(state.mutelist, remMutes)
  },
  updateSearchlist (state, obj) {
    const type = obj.type
    switch (type) {
      case 'user':
        if (obj.list.length !== 0 || state.searchedUsers.length !== 0) {
          state.searchedUsers = obj.list
        } else {
          state.searchedUsers = []
        }
        break
      case 'team':
        if (obj.list.length !== 0 || state.searchedTeams.length !== 0) {
          state.searchedTeams = obj.list
        } else {
          state.searchedTeams = []
        }
        break
    }
  },
  updateSessions (state, sessions) {
    let callback = ''
    if (sessions.callback) {
      callback = sessions.callback
      sessions = sessions.sessions
    }
    const nim = state.nim
    state.sessionlist = nim.mergeSessions(state.sessionlist, sessions)
    state.sessionlist.sort((a, b) => {
      return b.updateTime - a.updateTime
    })
    state.sessionlist.forEach(item => {
      state.sessionMap[item.id] = item
    })
    callback && callback(sessions[0].id)
    if (sessions[0].msgReceiptTime) {
      // 修改已读回执状态
      state.currSessionMsgs.forEach((msg, index) => {
        if (msg.scene === 'p2p' && msg.flow === 'out') {
          if (msg.time <= sessions[0].msgReceiptTime) {
            let copyMsg = Object.assign({}, msg)
            if (msg.localCustom) {
              if (!msg.localCustom.isRemoteRead) {
                copyMsg.localCustom = msg.localCustom
                copyMsg.localCustom.isRemoteRead = true
                state.currSessionMsgs.splice(index, 1, copyMsg)
                // 更新本地信息
                nim.updateLocalMsg({
                  idClient: copyMsg.idClient,
                  localCustom: copyMsg.localCustom
                })
              }
            } else {
              copyMsg.localCustom = {
                isRemoteRead: true
              }
              state.currSessionMsgs.splice(index, 1, copyMsg)
              // 更新本地信息
              nim.updateLocalMsg({
                idClient: copyMsg.idClient,
                localCustom: copyMsg.localCustom
              })
            }
          }
        }
      })
    }
    store.commit('updateContactHistoryObj', {type: 'update', sessionId: sessions[0].id})
  },
  deleteSessions (state, sessionIds) {
    const nim = state.nim
    state.sessionlist = nim.cutSessionsByIds(state.sessionlist, sessionIds)
  },
  // 初始化，收到离线漫游消息时调用
  updateMsgs (state, msgs) {
    const nim = state.nim
    let tempSessionMap = {}
    msgs.forEach(msg => {
      let sessionId = msg.sessionId
      tempSessionMap[sessionId] = true
      if (!state.msgs[sessionId]) {
        state.msgs[sessionId] = []
      }
      // sdk会做消息去重
      state.msgs[sessionId] = nim.mergeMsgs(state.msgs[sessionId], [msg])
      // state.msgs[sessionId].push(msg)
    })
    store.commit('updateMsgByIdClient', msgs)
    for (let sessionId in tempSessionMap) {
      state.msgs[sessionId].sort((a, b) => {
        if (a.time === b.time) {
          // 机器人消息，回复消息时间和提问消息时间相同，提问在前，回复在后
          if (a.type === 'robot' && b.type === 'robot') {
            if (a.content && a.content.msgOut) {
              return 1
            }
            if (b.content && b.content.msgOut) {
              return -1
            }
          }
        }
        return a.time - b.time
      })
      if (sessionId === state.currSessionId) {
        store.commit('updateCurrSessionMsgs', {
          type: 'init'
        })
      }
    }
  },
  updateNewMsg (state, msg) {
    state.newMsg = msg
  },
  // 更新追加消息，追加一条消息
  putMsg (state, msg) {
    state.newMsg = msg
    let sessionId = msg.sessionId
    if (!state.msgs[sessionId]) {
      state.msgs[sessionId] = []
    }
    store.commit('updateMsgByIdClient', msg)
    let tempMsgs = state.msgs[sessionId]
    let lastMsgIndex = tempMsgs.length - 1
    if (tempMsgs.length === 0) {
      tempMsgs.push(msg)
    } else {
      let needReplace = false
      if (msg.status !== 'sending' && msg.flow === 'out') {
        // 发送成功/失败的消息需要进行替换
        for (let i = lastMsgIndex; i >= 0; i--) {
          let currMsg = tempMsgs[i]
          if (msg.idClient === currMsg.idClient || (msg.idClientFake && currMsg.idClientFake && msg.idClientFake === currMsg.idClientFake)) {
            needReplace = true
            state.msgs[sessionId].splice(i, 1, msg)
            break
          }
        }
      }
      if (!needReplace) {
        if (msg.time > tempMsgs[lastMsgIndex].time) {
          tempMsgs.push(msg)
        } else {
          for (let i = lastMsgIndex; i >= 0; i--) {
            let currMsg = tempMsgs[i]
            if (msg.time >= currMsg.time) {
              state.msgs[sessionId].splice(i, 0, msg)
              break
            }
          }
        }
      }
    }
  },
  // 删除消息列表消息
  deleteMsg (state, msg) {
    let sessionId = msg.sessionId
    let tempMsgs = state.msgs[sessionId]
    if (tempMsgs && tempMsgs.length > 0) {
      let lastMsgIndex = tempMsgs.length - 1
      for (let i = lastMsgIndex; i >= 0; i--) {
        let currMsg = tempMsgs[i]
        if (msg.idClient === currMsg.idClient) {
          state.msgs[sessionId].splice(i, 1)
          break
        }
      }
    }
    if (sessionId === state.currSessionId) {
      let msgLen = state.currSessionMsgs.length
      let lastMsgIndex = msgLen - 1
      if (msgLen > 0) {
        for (let i = lastMsgIndex; i >= 0; i--) {
          if (state.currSessionMsgs[i].idClient === msg.idClient) {
            state.currSessionMsgs.splice(i, 1)
            break
          }
        }
      }
    }
  },
  // 替换消息列表消息，如消息撤回
  replaceMsg (state, obj) {
    let {sessionId, idClient, msg} = obj
    let tempMsgs = state.msgs[sessionId]
    if (!tempMsgs || tempMsgs.length === 0) {
      return
    }
    let lastMsgIndex = tempMsgs.length - 1
    for (let i = lastMsgIndex; i >= 0; i--) {
      let currMsg = tempMsgs[i]
      if (idClient === currMsg.idClient) {
        state.msgs[sessionId].splice(i, 1, msg)
        break
      }
    }
  },
  // 用idClient 更新消息，目前用于消息撤回
  updateMsgByIdClient (state, msgs) {
    if (!Array.isArray(msgs)) {
      msgs = [msgs]
    }
    let tempTime = (new Date()).getTime()
    msgs.forEach(msg => {
      // 有idClient 且 5分钟以内的消息
      if (msg.idClient && (tempTime - msg.time < 1000 * 300)) {
        state.msgsMap[msg.idClient] = msg
      }
    })
  },
  // 更新当前会话id，用于唯一判定是否在current session状态
  updateCurrSessionId (state, obj) {
    let type = obj.type || ''
    if (type === 'destroy') {
      state.currSessionId = null
    } else if (type === 'init') {
      if (obj.sessionId && (obj.sessionId !== state.currSessionId)) {
        state.currSessionId = obj.sessionId
      }
    }
  },
  // 更新当前会话列表的聊天记录，包括历史消息、单聊消息等，不包括聊天室消息
  // replace: 替换idClient的消息
  updateCurrSessionMsgs (state, obj) {
    let type = obj.type || ''
    if (type === 'destroy') { // 清空会话消息
      state.currSessionMsgs = []
      state.currSessionLastMsg = null
      store.commit('updateCurrSessionId', {
        type: 'destroy'
      })
    } else if (type === 'init') { // 初始化会话消息列表
      if (state.currSessionId) {
        let sessionId = state.currSessionId
        let currSessionMsgs = [].concat(state.msgs[sessionId] || [])
        // 做消息截断
        let limit = config.localMsglimit
        let msgLen = currSessionMsgs.length
        if (msgLen - limit > 0) {
          state.currSessionLastMsg = currSessionMsgs[msgLen - limit]
          currSessionMsgs = currSessionMsgs.slice(msgLen - limit, msgLen)
        } else if (msgLen > 0) {
          state.currSessionLastMsg = currSessionMsgs[0]
        } else {
          state.currSessionLastMsg = null
        }
        let currSessionMsgsTemp = []
        let lastMsgTime = 0
        currSessionMsgs.forEach(msg => {
          if ((msg.time - lastMsgTime) > 1000 * 60 * 5) {
            lastMsgTime = msg.time
            currSessionMsgsTemp.push({
              type: 'timeTag',
              text: util.formatDate(msg.time, false)
            })
          }
          currSessionMsgsTemp.push(msg)
        })
        state.currSessionMsgs = currSessionMsgsTemp
        store.dispatch('checkTeamMsgReceipt', state.currSessionMsgs)
      }
    } else if (type === 'put') { // 追加一条消息
      let newMsg = obj.msg
      let lenCurrMsgs = state.currSessionMsgs.length
      if (newMsg) {
        // 判断是否需要消息替换
        let needReplace = false
        if (newMsg.status !== 'sending' && newMsg.flow === 'out') {
          // 发送成功/失败的消息需要进行替换
          let lastMsgIndex = lenCurrMsgs - 1
          if (lastMsgIndex > 0) {
            for (let i = lastMsgIndex; i >= 0; i--) {
              let currMsg = state.currSessionMsgs[i]
              if (newMsg.idClient === currMsg.idClient || (newMsg.idClientFake && currMsg.idClientFake && newMsg.idClientFake === currMsg.idClientFake)) {
                needReplace = true
                state.currSessionMsgs.splice(i, 1, newMsg)
                break
              }
            }
          }
        }
        if (!needReplace) {
          let lastMsgTime = 0
          if (lenCurrMsgs > 0) {
            lastMsgTime = state.currSessionMsgs[lenCurrMsgs - 1].time
          }
          if ((newMsg.time - lastMsgTime) > 1000 * 60 * 5) {
            state.currSessionMsgs.push({
              type: 'timeTag',
              text: util.formatDate(newMsg.time, false)
            })
          }
          state.currSessionMsgs.push(newMsg)
        }
        store.dispatch('checkTeamMsgReceipt', [newMsg])
      }
    } else if (type === 'concat') {
      // 一般用于历史消息拼接
      let currSessionMsgs = []
      let lastMsgTime = 0
      obj.msgs.reverse()
      obj.msgs.forEach(msg => {
        if ((msg.time - lastMsgTime) > 1000 * 60 * 5) {
          lastMsgTime = msg.time
          currSessionMsgs.push({
            type: 'timeTag',
            text: util.formatDate(msg.time, false)
          })
        }
        // 消息已读标记
        if (msg.scene === 'p2p' && msg.flow === 'out') {
          msg.localCustom = msg.localCustom || {}
          msg.localCustom.isRemoteRead = state.nim.isMsgRemoteRead(msg)
        }
        currSessionMsgs.push(msg)
      })
      state.currSessionMsgs = currSessionMsgs.concat(state.currSessionMsgs)
      if (obj.msgs[0]) {
        state.currSessionLastMsg = obj.msgs[0]
      }
      store.dispatch('checkTeamMsgReceipt', currSessionMsgs)
    } else if (type === 'replace') {
      let msgLen = state.currSessionMsgs.length
      let lastMsgIndex = msgLen - 1
      if (msgLen > 0) {
        for (let i = lastMsgIndex; i >= 0; i--) {
          if (state.currSessionMsgs[i].idClient === obj.idClient) {
            state.currSessionMsgs.splice(i, 1, obj.msg)
            break
          }
        }
      }
    } else if (type === 'rewire') { // 消息重发
      // 删除重发消息
      let msgLen = state.currSessionMsgs.length
      let lastMsgIndex = msgLen - 1
      if (msgLen > 0) {
        for (let i = lastMsgIndex; i >= 0; i--) {
          if (state.currSessionMsgs[i].idClient === obj.idClient) {
            state.currSessionMsgs.splice(i, 1)
            break
          }
        }
      }
      // 追加新消息
      store.commit('updateCurrSessionMsgs', {
        type: 'put',
        msg: obj.msg
      })
    }
  },
  updateSysMsgs (state, sysMsgs) {
    const nim = state.nim
    if (!Array.isArray(sysMsgs)) {
      sysMsgs = [sysMsgs]
    }
    sysMsgs = sysMsgs.map(msg => {
      msg.showTime = util.formatDate(msg.time, false)
      return msg
    })
    // state.sysMsgs = nim.mergeSysMsgs(state.sysMsgs, sysMsgs)
    state.sysMsgs = [].concat(nim.mergeSysMsgs(state.sysMsgs, sysMsgs))
    Vue.set(state, sysMsgs, state.sysMsgs)
  },
  // 更新消息的状态，如管理员批准或拒绝入群后，会收到新消息，更新入群申请的状态
  updateSysMsgState (state, sysMsg) {
    let exitMsg = state.sysMsgs.find(msg => {
      return msg.idServer === sysMsg.idServer
    })
    if (exitMsg) {
      exitMsg.state = sysMsg.state
    }
  },
  updateSysMsgUnread (state, obj) {
    state.sysMsgUnread = Object.assign({}, obj)
  },
  updateCustomSysMsgs (state, sysMsgs) {
    // const nim = state.nim
    if (!Array.isArray(sysMsgs)) {
      sysMsgs = [sysMsgs]
    }
    sysMsgs = sysMsgs.map(msg => {
      msg.showTime = util.formatDate(msg.time, false)
      return msg
    })
    // state.customSysMsgs = nim.mergeSysMsgs(state.customSysMsgs, sysMsgs)
    state.customSysMsgs = state.customSysMsgs.concat(sysMsgs)
    Vue.set(state, /* customSysMsgs, */state.customSysMsgs)
    store.commit('updateCustomSysMsgUnread', {
      type: 'add',
      unread: sysMsgs.length
    })
  },
  updateCustomSysMsgUnread (state, obj) {
    let {type, unread} = obj
    switch (type) {
      case 'reset':
        state.customSysMsgUnread = unread || 0
        break
      case 'add':
        state.customSysMsgUnread += unread
        break
    }
  },
  resetSysMsgs (state, obj) {
    let type = obj.type
    switch (type) {
      case 0:
        state.sysMsgs = []
        break
      case 1:
        state.customSysMsgs = []
        store.commit('updateCustomSysMsgUnread', {
          type: 'reset'
        })
        break
    }
  },
  deleteSysMsgs (state, obj) {
    let type = obj.type
    let idServer = obj.idServer
    let arr = type === 0 ? state.sysMsgs : state.customSysMsgs
    arr = arr.filter(msg => {
      return msg.idServer !== idServer
    })
    Vue.set(state, 'sysMsgs', arr)
  },
  setNoMoreHistoryMsgs (state) {
    state.noMoreHistoryMsgs = true
  },
  resetNoMoreHistoryMsgs (state) {
    state.noMoreHistoryMsgs = false
  },
  // 继续与机器人会话交互
  continueRobotMsg (state, robotAccid) {
    state.continueRobotAccid = robotAccid
  },

  initChatroomInfos (state, obj) {
    state.chatroomInfos = obj
  },
  setCurrChatroom (state, chatroomId) {
    state.currChatroomId = chatroomId
    state.currChatroom = state.chatroomInsts[chatroomId]
    state.currChatroomMsgs = []
    state.currChatroomInfo = {}
    state.currChatroomMembers = []
  },
  resetCurrChatroom (state) {
    state.currChatroomId = null
    state.currChatroom = null
    state.currChatroomMsgs = []
    state.currChatroomInfo = {}
    state.currChatroomMembers = []
  },
  // 聊天室相关逻辑
  updateChatroomInfo (state, obj) {
    state.currChatroomInfo = Object.assign(state.currChatroomInfo, obj)
  },
  updateCurrChatroomMsgs (state, obj) {
    let {type, msgs} = Object.assign({}, obj)
    if (type === 'put') {
      msgs.forEach(msg => {
        let chatroomId = msg.chatroomId
        if (chatroomId === state.currChatroomId) {
          msgs.forEach(msg => {
            state.currChatroomMsgs.push(msg)
          })
        }
      })
    } else if (type === 'concat') {
      // 一般用于历史消息拼接
      let currSessionMsgs = obj.msgs
      currSessionMsgs.reverse()
      currSessionMsgs.forEach(msg => {
        state.currSessionMsgs.unshift(msg)
      })
      if (obj.msgs[0]) {
        state.currSessionLastMsg = obj.msgs[0]
      }
    }
  },
  getChatroomInfo (state, obj) {
    state.currChatroomInfo = obj
  },
  updateChatroomMembers (state, obj) {
    let {type, members} = obj
    if (type === 'destroy') {
      state.currChatroomMembers = []
    } else if (type === 'put') {
      members.forEach(member => {
        if (member.online) {
          state.currChatroomMembers.push(member)
        }
      })
    }
  },
  updateTeamList (state, teams) {
    const nim = state.nim
    store.state.teamlist = nim.mergeTeams(store.state.teamlist, teams)
    store.state.teamlist = nim.cutTeams(store.state.teamlist, teams.invalid)
  },
  updateTeamMembers (state, obj) {
    const nim = state.nim
    var teamId = obj.teamId
    var members = obj.members
    state.teamMembers = state.teamMembers || {}
    state.teamMembers[teamId] = nim.mergeTeamMembers(state.teamMembers[teamId], members)
    state.teamMembers[teamId] = nim.cutTeamMembers(state.teamMembers[teamId], members.invalid)
    state.teamMembers[teamId] = state.teamMembers[teamId].map((member) => {
      if (member.account === state.userUID) {
        member.alias = '我'
      } else if (state.userInfos[member.account] === undefined) {
        member.alias = member.nickInTeam || member.account
      } else {
        member.alias = state.userInfos[member.account].alias || member.nickInTeam || state.userInfos[member.account].nick
      }
      return member
    })
    state.teamMembers[teamId] = listSort(state.teamMembers[teamId])
    state.teamMembers[teamId].sort((a, b) => {
      // 将群主和管理员排在队列前方
      if (a.type === 'owner' || b.type === 'owner') {
        return a.type === 'owner' ? -1 : 1
      }
      if (a.type === 'manager' || b.type === 'manager') {
        return a.type === 'manager' ? -1 : b.type === 'manager' ? 1 : 0
      }
      return -1
    })
    state.teamMembers = Object.assign({}, state.teamMembers)
  },
  removeTeamMembersByAccounts (state, obj) {
    var teamId = obj.teamId
    var invalidAccounts = obj.accounts
    if (state.teamMembers[teamId] === undefined) return
    state.teamMembers[teamId] = state.teamMembers[teamId].filter((member, index) => {
      return invalidAccounts.indexOf(member.account) === -1
    })
    state.teamMembers = Object.assign({}, state.teamMembers)
  },
  updateTeamInfo (state, team) {
    let callback = null
    if (team.callback) {
      callback = team.callback
      team = team.team
    }
    var index = state.teamlist.findIndex(item => { return item.teamId === team.teamId })
    if (index === -1) {
      callback && callback()
      return
    }
    for (const key in team) {
      if (key !== 'teamId' && team.hasOwnProperty(key) && team[key]) {
        state.teamlist[index][key] = team[key]
      }
    }
    callback && callback()
  },
  updateTeamSettingConfig (state, obj) {
    state.teamSettingConfig = obj
  },
  updateSentReceipedMap (state, obj) {
    if (!obj || obj.length < 1) {
      return
    }
    var teamId = obj[0].teamId
    if (!state.sentReceipedMap[teamId]) {
      state.sentReceipedMap[teamId] = []
    }
    state.sentReceipedMap[teamId].push(...obj.map(msg => msg.idServer))
  },
  updateReceiptQueryList (state, obj) {
    if (state.currReceiptQueryTeamId !== obj.teamId) {
      state.receiptQueryList = []
      state.teamMsgReads = []
      state.currReceiptQueryTeamId = obj.teamId
    }
    var needQuery = obj.msgs
      .filter(msg =>
        msg.needMsgReceipt && msg.from === state.myInfo.account && !state.receiptQueryList.find(item => item.idServer === msg.idServer)
      )
      .map(msg => {
        return {
          teamId: obj.teamId,
          idServer: msg.idServer
        }
      })
    if (needQuery.length > 0) {
      state.receiptQueryList.push(...needQuery)
    }
    if (needQuery.length > 0) {
      store.dispatch('getTeamMsgReads', needQuery)
    }
  },
  updateTeamMsgReads (state, obj) {
    state.teamMsgReads.push(...obj.teamMsgReceipts)
  },
  updateSingleTeamMsgReads (state, obj) {
    state.teamMsgReads.forEach(item => {
      if (item.idServer === obj.idServer) {
        item.unread = obj.unread
        item.read = obj.read
      }
    })
    // 更新已读未读账号列表
    var unreadAccounts = state.teamMsgReadsDetail.unreadAccounts
    var findIndex = unreadAccounts.findIndex(account => account === obj.account)
    if (findIndex >= 0) {
      unreadAccounts.splice(findIndex, 1)
      state.teamMsgReadsDetail.readAccounts.push(obj.account)
    }
  },
  updateSelectMsg (state, obj) {
    state.curTeamId = obj.curTeamId
    state.curIdServer = obj.curIdServer
  },
  updateUnreadList (state, obj) {
    state.curUnreadList = obj.unreadList
    state.curReadList = obj.readList
  },
  initMsgReceiptDetail (state, obj) {
    state.teamMsgReadsDetail.readAccounts = obj.readAccounts
    state.teamMsgReadsDetail.unreadAccounts = obj.unreadAccounts
  },
  toggleSlideMenuStatus (state, status) {
    // 1-初始状态，2-开启，3-关闭，4-隐藏
    state.slideMenuStatus = status
  },
  clearCurrentSessionMsgs (state, obj) {
    // 清空消息记录
    state.msgs[obj.sessionId] = []
    state.currSessionMsgs = []
  },
  toastConfig (state, obj) {
    // 全局提示框状态
    if (obj) {
      state.toastConfig = obj
      setTimeout(() => {
        state.toastConfig.show = false
      }, 2000)
    }
  },
  connectStatus (state, obj) {
    // 网络连接状态
    state.networkStatus = obj.networkStatus
  },
  updateSessionAc (state, obj) {
    state.sessionAc = obj.id
  },
  updateNoticeAc (state, obj) {
    state.noticeAc = obj.id
  },
  updatePersonInfos (state, obj) {
    // 更新用户信息
    state.personInfos = obj
  },
  updateOrgnizeObj (state, obj) {
    if (obj.type === 'replace') {
      state.orgnizeObj = obj.data || {}
      return
    }
    let InitFn = () => {
      let orgnizeObj = {
        currentId: obj.currentId,
        parentId: obj.parentId,
        orgnizelist: obj.orgnizelist,
        userlist: obj.userlist,
        tag: obj.tag
      }
      if (JSON.stringify(orgnizeObj) === JSON.stringify(state.orgnizeObj[obj.currentId])) {
        // 数据未发生变化不做处理
        return false
      }
      obj.set(state.orgnizeObj, obj.currentId, orgnizeObj)
      SortOrgFn(state.orgnizeObj[obj.currentId].orgnizelist)
      SortUserFn(state.orgnizeObj[obj.currentId].userlist)
      return true
    }
    let SortOrgFn = (sortOrgList) => {
      IndexedDB.setItem('orgnizeObj', state.orgnizeObj)
      // 组织排序
      for (let i = 0; i < sortOrgList.length; i++) {
        for (let j = 0; j < sortOrgList.length - 1 - i; j++) {
          let orgSeqBef = sortOrgList[j].orgSeq
          let orgSeqAft = sortOrgList[j + 1].orgSeq
          if (orgSeqBef > orgSeqAft) {
            let t = sortOrgList[j]
            sortOrgList[j] = sortOrgList[j + 1]
            sortOrgList[j + 1] = t
          }
        }
      }
    }
    let SortUserFn = (sortUserList) => {
      IndexedDB.setItem('orgnizeObj', state.orgnizeObj)
      // 成员排序（用户类型；1-普通成员；2-超级管理员；3-管理员）
      let superManger = []
      let manager = []
      let member = []
      for (let i in sortUserList) {
        let obj = sortUserList[i]
        if (obj.userType === 2) {
          superManger.push(obj)
        } else if (obj.userType === 3) {
          manager.push(obj)
        } else {
          member.push(obj)
        }
      }
      superManger = listSort(superManger)
      manager = listSort(manager)
      member = listSort(member)
      sortUserList = [...superManger, ...manager, ...member]
    }
    // 更新组织数据
    if (obj.type === 'init') {
      if (!InitFn()) return false
    } else if (obj.type === 'update') {
      // pullTag 拉取标识，1-全量拉取；2-增量拉取（当传入的tag与当前时间相差30天（暂定）以上，那么就会全量返回数据，需对已有数据做替换）
      if (obj.pullTag === 1) {
        if (!InitFn()) return false
      } else {
        let currentOrgObj = state.orgnizeObj[obj.currentId]
        if (currentOrgObj) {
          let currentOrgList = currentOrgObj.orgnizelist
          let currentUserList = currentOrgObj.userlist
          // 更新组织
          for (let i in obj.orgnizelist) {
            let objUpdate = obj.orgnizelist[i]
            let hasExit = false
            for (let j in currentOrgList) {
              let orgnize = Object.assign({}, currentOrgList[j])
              if (orgnize.id === objUpdate.id) {
                if (objUpdate.dataStatus === 1) {
                  // 替换
                  orgnize = objUpdate
                  currentOrgList.splice(j, 1, orgnize)
                } else if (objUpdate.dataStatus === 2) {
                  // 删除
                  currentOrgList.splice(j, 1)
                }
                hasExit = true
                break
              }
            }
            if (!hasExit) {
              // 新增
              if (objUpdate.dataStatus === 1) {
                currentOrgList.push(objUpdate)
              }
            }
            SortOrgFn(currentOrgList)
          }
          // 更新成员
          for (let i in obj.userlist) {
            let objUpdate = obj.userlist[i]
            let hasExit = false
            for (let j in currentUserList) {
              let user = Object.assign({}, currentUserList[j])
              if (user.id === objUpdate.id) {
                if (objUpdate.dataStatus === 1) {
                  // 替换
                  user = objUpdate
                  currentUserList.splice(j, 1, user)
                } else if (objUpdate.dataStatus === 2) {
                  // 删除
                  currentUserList.splice(j, 1)
                }
                hasExit = true
                break
              }
            }
            if (!hasExit) {
              // 新增
              if (objUpdate.dataStatus === 1) {
                currentUserList.push(objUpdate)
              }
            }
            SortUserFn(currentUserList)
          }
          currentOrgObj.tag = obj.tag
        }
      }
    }
  },
  upadteContactSelectObj (state, obj) {
    // 更新通讯录选中状态
    state.contactSelectObj = obj
  },
  upadteCreateTeamSelect (state, obj) {
    // 更新通讯录选中状态
    if (obj.type === 'update') {
      for (let i in state.createTeamSelect) {
        if (state.createTeamSelect[i].accid === obj.user.accid) {
          // 已存在
          state.createTeamSelect.splice(i, 1)
          return false
        }
      }
      state.createTeamSelect.push(obj.user)
    } else if (obj.type === 'reset') {
      state.createTeamSelect = []
    }
  },
  updateContactslist (state, obj) {
    // 更新通讯录用户信息
    if (obj.type === 'replace' && obj.data) {
      state.contactslist = obj.data
    } else {
      if (obj.data) {
        let data = obj.data
        for (let i in data.userList) {
          let user = data.userList[i]
          let hasExit = false
          for (let j in state.contactslist) {
            let contact = state.contactslist[j]
            if (contact.id === user.id) {
              // 已存在
              contact = user
              contact.tag = data.tag
              hasExit = true
              IndexedDB.setItem('contactslist', contact, contact.id)
              break
            }
          }
          if (!hasExit) {
            let contact = user
            contact.tag = data.tag
            IndexedDB.setItem('contactslist', contact, contact.id)
            state.contactslist.push(contact)
          }
        }
      }
    }
  },
  updateOrgDisabledlist (state, obj) {
    // 更新组织架构禁用成员列表
    if (obj.type === 'put') {
      state.orgDisabledlist.push(obj.accid)
    } else if (obj.type === 'concat') {
      let accidArr = []
      obj.userlist.map(item => {
        accidArr.push(item.account)
      })
      state.orgDisabledlist = state.orgDisabledlist.concat(accidArr)
    } else if (obj.type === 'destory') {
      state.orgDisabledlist = []
    }
  },
  updateLoginInfo (state, obj) {
    state.loginInfo = obj
  },
  updateContactHistoryObj (state, obj) {
    if (obj.type === 'init') {
      state.contactHistoryObj = obj.data || {}
    } else if (obj.type === 'update') {
      // 更新历史联系人
      obj.sessionId = util.parseSession(obj.sessionId)
      if (obj.sessionId.to === state.userUID || obj.sessionId.scene !== 'p2p') return false
      let contactObj = state.sessionlist.find(item => {
        return item.to === obj.sessionId.to
      })
      if (contactObj) {
        Vue.set(state.contactHistoryObj, obj.sessionId.to, contactObj)
        IndexedDB.setItem('contactHistoryObj', contactObj, obj.sessionId.to)
      }
    }
  }
}
