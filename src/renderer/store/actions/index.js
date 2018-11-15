// Action 提交的是 mutation，而不是直接变更状态。
// Action 可以包含任意异步操作。
// import cookie from '../../utils/cookie'
import pageUtil from '../../utils/page'
/* 导出actions方法 */
import { showLoading, hideLoading, showFullscreenImg, hideFullscreenImg, showImgModal, showListOptions } from './widgetUi'
import {initNimSDK} from './initNimSDK'
// import {initChatroomSDK, resetChatroomSDK} from './initChatroomSDK'
import {updateBlack} from './blacks'
import {updateMute} from './mute'
import {subscribeEvent, unSubscribeEvent, publistEvents} from './statusEvent'
import {updateFriend, addFriend, deleteFriend} from './friends'
import {resetSearchResult, searchUsers, searchTeam} from './search'
import {deleteSession, setCurrSession, resetCurrSession, insertLocalSession, setTopSession, deleteLocalMsgsBySession, updateLocalCustomSession} from './session'
import { sendMsg, sendFileMsg, sendMsgReceipt, sendRobotMsg, revocateMsg, getHistoryMsgs, getLocalMsgs, resetNoMoreHistoryMsgs, continueRobotMsg, deleteMsg, downloadImg, convertVoice, previewFile, resendMsg, onForwordMsg } from './msgs'
import {markSysMsgRead, resetSysMsgs, deleteSysMsgs, markCustomSysMsgRead, getLocalSysMsgs} from './sysMsgs'
// import {sendChatroomMsg, sendChatroomRobotMsg, sendChatroomFileMsg, getChatroomHistoryMsgs} from './chatroomMsgs'
// import {initChatroomInfos, getChatroomInfo, getChatroomMembers, clearChatroomMembers} from './chatroomInfos'
import {delegateTeamFunction, onTeamNotificationMsg, enterSettingPage, getTeamMembers, checkTeamMsgReceipt, getTeamMsgReads, updateTeam, updateInfoInTeam, addTeamManagers, removeTeamManagers, transferTeam, dismissTeam, leaveTeam, addTeamMembers, removeTeamMembers, setSelectMsg, getUnreadList} from './team'
import LocalStorage from 'localStorage'
function connectNim ({state, commit, dispatch}, obj) {
  // alert('connectNim')
  let {force, done} = Object.assign({}, obj)
  if (!state.nim || force) {
    let loginInfo = {
      uid: LocalStorage.getItem('uid'),
      sdktoken: LocalStorage.getItem('sdktoken'),
      done: done
    }
    if (!loginInfo.uid) {
      // 无cookie，直接跳转登录页
      pageUtil.turnPage('无历史登录记录，请重新登录', 'login')
    } else {
      // 有cookie，重新登录
      dispatch('initNimSDK', loginInfo)
    }
  }
}

function connectChatroom ({state, commit, dispatch}, obj) {
  let {chatroomId} = Object.assign({}, obj)
  const nim = state.nim
  if (nim) {
    dispatch('showLoading')
    nim.getChatroomAddress({
      chatroomId,
      done: function getChatroomAddressDone (error, obj) {
        if (error) {
          location.href = '#/room'
          return
        }
        dispatch('initChatroomSDK', obj)
      }
    })
  }
}

export default {
  updateRefreshState ({commit}) {
    commit('updateRefreshState')
  },

  // UI 及页面状态变更
  showLoading,
  hideLoading,
  showFullscreenImg,
  hideFullscreenImg,
  continueRobotMsg,
  showImgModal,
  showListOptions,

  // 连接sdk请求，false表示强制重连
  connect (store, obj) {
    let {type} = Object.assign({}, obj)
    // type 可为 nim chatroom
    type = type || 'nim'
    switch (type) {
      case 'nim':
        connectNim(store, obj)
        break
      case 'chatroom':
        connectChatroom(store, obj)
        break
    }
  },

  // 用户触发的登出逻辑
  logout ({ state, commit }) {
    LocalStorage.removeItem('uid')
    LocalStorage.removeItem('sdktoken')
    // cookie.delCookie('uid')
    // cookie.delCookie('sdktoken')
    if (state.nim) {
      state.nim.disconnect()
    }
    pageUtil.turnPage('', 'login')
  },

  // 初始化 重新连接SDK
  initNimSDK,
  // 清空所有搜索历史纪录
  resetSearchResult,
  // 搜索用户信息
  searchUsers,
  // 更新黑名单
  updateBlack,
  // 更新静音列表
  updateMute,
  // 更新好友
  addFriend,
  deleteFriend,
  updateFriend,
  // 删除会话
  deleteSession,
  // 设置当前会话
  setCurrSession,
  // 重置当前会话
  resetCurrSession,
  // 插入一条本地会话
  insertLocalSession,
  // 置顶会话
  setTopSession,
  // 删除某个会话的本地消息
  deleteLocalMsgsBySession,
  // 更新本地会话
  updateLocalCustomSession,
  // 发送消息
  sendMsg,
  sendFileMsg,
  sendRobotMsg,
  // 发送消息已读回执
  sendMsgReceipt,
  // 消息撤回
  revocateMsg,
  getHistoryMsgs,
  getLocalMsgs,
  // 消息删除
  deleteMsg,
  // 转文字
  convertVoice,
  // 重置历史消息状态
  resetNoMoreHistoryMsgs,
  // 标记系统消息已读
  markSysMsgRead,
  markCustomSysMsgRead,
  resetSysMsgs,
  deleteSysMsgs,
  getLocalSysMsgs,
  // 下载图片
  downloadImg,
  // 预览文件
  previewFile,
  // 消息重发
  resendMsg,
  // 转发消息
  onForwordMsg,
  /*
  initChatroomSDK,
  initChatroomInfos,
  resetChatroomSDK,
  sendChatroomMsg,
  sendChatroomRobotMsg,
  sendChatroomFileMsg,
  getChatroomHistoryMsgs,
  getChatroomInfo,
  getChatroomMembers,
  clearChatroomMembers,
  */

  // 搜索群
  searchTeam,
  // 代理sdk中的群方法
  delegateTeamFunction,
  // 处理群消息回调
  onTeamNotificationMsg,
  // 进入群信息设置页
  enterSettingPage,
  // 获取群成员
  getTeamMembers,
  // 群消息回执检查
  checkTeamMsgReceipt,
  // 查询群消息回执已读列表
  getTeamMsgReads,
  // 更新群信息
  updateTeam,
  // 修改自己的群属性
  updateInfoInTeam,
  // 添加管理员
  addTeamManagers,
  // 移除管理员
  removeTeamManagers,
  // 转让群
  transferTeam,
  // 解散群
  dismissTeam,
  // 退出群
  leaveTeam,
  // 拉人入群
  addTeamMembers,
  // 踢人出群
  removeTeamMembers,
  // 已读未读账号
  setSelectMsg,
  getUnreadList,
  // 在线忙碌状态
  subscribeEvent,
  unSubscribeEvent,
  publistEvents
}
