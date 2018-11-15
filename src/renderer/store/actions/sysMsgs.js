import store from '../'
import {onUpdateFriend, onDeleteFriend} from './friends'
import {onRevocateMsg} from './msgs'

export function onSysMsgs (sysMsgs) {
  store.commit('updateSysMsgs', sysMsgs)
}

export async function onSysMsg (sysMsg) {
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
    case 'rejectTeamApply': // 申请入群被拒绝
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
    if (msg.type === 'custom') {
      if (msg.content) {
        try {
          let content = JSON.parse(msg.content)
          // 消息正在输入中
          if ((content.id + '') === '1') {
            return false
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
        _obj.sysMsgs.forEach(async item => {
          try {
            item = await manageSysMsg(item)
          } catch (error) {}
        })
        store.commit('updateSysMsgs', _obj.sysMsgs)
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
