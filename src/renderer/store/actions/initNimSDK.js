/*
 * SDK连接相关
 */

import config from '../../configs'
import pageUtil from '../../utils/page'
import store from '../'
import {onFriends, onSyncFriendAction} from './friends'
import {onPushEvents, onLoginPortsChange} from './statusEvent'
import {onRobots} from './robots'
import {onBlacklist, onMarkInBlacklist} from './blacks'
import {onMutelist, onMarkInMutelist} from './mute'
import {onMyInfo, onUserInfo} from './userInfo'
import {onSessions, onUpdateSession} from './session'
import {onRoamingMsgs, onOfflineMsgs, onNewMsg} from './msgs'
import {onSysMsgs, onSysMsg, onSysMsgUnread, onCustomSysMsgs} from './sysMsgs'
import {onTeams, onSynCreateTeam, onCreateTeam, onUpdateTeam, onTeamMembers, onUpdateTeamMember, onAddTeamMembers, onRemoveTeamMembers, onUpdateTeamManagers, onDismissTeam, onUpdateTeamMembersMute, onTeamMsgReceipt} from './team'
import NativeLogic from '../../utils/nativeLogic.js'
const SDK = require('../../nim_sdk/NIM_Web_SDK_v6.2.1')

// 重新初始化 NIM SDK
export function initNimSDK ({ state, commit, dispatch }, loginInfo) {
  if (state.nim) {
    state.nim.disconnect()
  }
  // 初始化SDK
  let Params = {
    debug: false,
    appKey: config.appkey,
    account: loginInfo.uid,
    token: loginInfo.sdktoken,
    db: true,
    syncSessionUnread: true,
    syncRobots: true,
    autoMarkRead: true, // 默认为true
    onconnect: function onConnect (event) {
      if (loginInfo) {
        // 连接上以后更新uid
        commit('updateUserUID', loginInfo)
        if (loginInfo.done instanceof Function) {
          loginInfo.done(200)
        }
        commit('connectStatus', { networkStatus: 200 })
        if (config.environment === 'electron') {
          let { ipcRenderer } = require('electron')
          ipcRenderer.send('logined', null)
        }
      }
    },
    onerror: function onError (evt) {
      switch (evt.event) {
        case 'HEARTBEAT_ERROR':
          commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: '网络连接状态异常，请检查网络连接'
          })
          commit('connectStatus', { networkStatus: 500 })
          break
        case 'Error_Connection_Socket_State_not_Match':
          commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: '网络连接状态异常，请检查网络连接'
          })
          break
      }
    },
    onwillreconnect: function onWillReconnect () {},
    ondisconnect: function onDisconnect (error) {
      switch (error.code) {
        // 账号或者密码错误, 请跳转到登录页面并提示错误
        case 302:
          if (loginInfo.done instanceof Function) {
            loginInfo.done('用户或账号密码错误，登录失败')
          } else {
            pageUtil.turnPage('用户或账号密码错误，登录失败', 'login')
          }
          break
        // 被踢, 请提示错误后跳转到登录页面
        case 'kicked':
          commit('updateDownlineModal', {status: true, reason: error.reason})
          break
        case 'logout':
          if (config.environment === 'web') { // web分支
            NativeLogic.native.sendEvent(null, 'logout', () => {})
          } else { // electron分支
            let { ipcRenderer } = require('electron')
            ipcRenderer.send('logout', null)
          }
          break
        default:
          break
      }
    },
    // 多端登录
    onloginportschange: onLoginPortsChange,
    // 用户关系及好友关系
    onblacklist: onBlacklist,
    onsyncmarkinblacklist: onMarkInBlacklist,
    onmutelist: onMutelist,
    onsyncmarkinmutelist: onMarkInMutelist,
    onfriends: onFriends,
    onsyncfriendaction: onSyncFriendAction,
    // 机器人
    onrobots: onRobots,
    // 用户名片 - actions/userInfo
    onmyinfo: onMyInfo,
    onupdatemyinfo: onMyInfo,
    onusers: onUserInfo,
    onupdateuser: onUserInfo,
    // // 群组
    onteams: onTeams,
    onsynccreateteam: onSynCreateTeam,
    syncTeams: true,
    onteammembers: onTeamMembers,
    onCreateTeam: onCreateTeam,
    onDismissTeam: onDismissTeam,
    onUpdateTeam: onUpdateTeam,
    onAddTeamMembers: onAddTeamMembers,
    onRemoveTeamMembers: onRemoveTeamMembers,
    onUpdateTeamManagers: onUpdateTeamManagers,
    onupdateteammember: onUpdateTeamMember,
    onUpdateTeamMembersMute: onUpdateTeamMembersMute,
    onTeamMsgReceipt: onTeamMsgReceipt,
    // // 会话
    onsessions: onSessions,
    onupdatesession: onUpdateSession,
    // // 消息
    onroamingmsgs: onRoamingMsgs,
    onofflinemsgs: onOfflineMsgs,
    onmsg: onNewMsg,
    // // 系统通知
    onsysmsg: onSysMsg,
    onofflinesysmsgs: onSysMsgs,
    onupdatesysmsg: onSysMsg, // 通过、拒绝好友申请会收到此回调

    onsysmsgunread: onSysMsgUnread,
    onupdatesysmsgunread: onSysMsgUnread,

    onofflinecustomsysmsgs: onCustomSysMsgs,
    oncustomsysmsg: onCustomSysMsgs,
    // 订阅事件
    onpushevents: onPushEvents,
    // // 同步完成
    onsyncdone: function onSyncDone () {
      // 说明在聊天列表页
      if (store.state.currSessionId) {
        dispatch('setCurrSession', store.state.currSessionId)
      }
      // 同步本地系统通知
      dispatch('getLocalSysMsgs', {})
    },
    shouldIgnoreNotification: function onShouldIgnoreNotification (msg) {
      // 是否要忽略某条通知类消息
      if (msg.attach.type === 'updateTeam') {
        let team = msg.attach.team
        if (team.custom) return true
      }
    }
  }
  if (config.env === 'self' || config.env === 'selfOnline') {
    // 私有化
    Params = Object.assign(Params, {privateConf: config.privateConf})
  }
  window.nim = state.nim = SDK.NIM.getInstance(Params)
}
