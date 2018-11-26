import store from '../'
import tools from '../../utils/tool'
import config from '../../configs'
import Utils from '../../utils'

// 收到群列表及更新群列表接口
export async function onTeams (teams) {
  if (!Array.isArray(teams)) {
    teams = [teams]
  }
  for (let key in teams) {
    let team = teams[key]
    let teamlist = store.state.teamlist
    let teamInfo = teamlist.find(item => {
      return item.teamId === team.teamId
    })
    if (teamInfo) {
      // 对象替换
      team = Object.assign(teamInfo, team)
    }
    if (team.validToCurrentUser === undefined) {
      team.validToCurrentUser = true
    }
    if (team.avatar && team.avatar.indexOf('nim.nosdn.127') > 0 && team.avatar.indexOf('?imageView') === -1) {
      team.avatar = team.avatar + '?imageView&thumbnail=300y300'
    } else if (!tools.isUrlValid(team.avatar)) {
      if (Utils.isDiscussGroup(team)) {
        team.avatar = config.defaultDiscussGroupIcon
      } else {
        team.avatar = config.defaultGroupIcon
      }
    }
    if (team.teamId) {
      try {
        let map = await notifyForNewTeamMsg(store.state.nim, team.teamId)
        if (map) {
          // 更新muteTeamIds
          let muteTeamIds = store.state.muteTeamIds
          let muteNotiType = Number(map[team.teamId])
          if (muteNotiType === 1) {
            muteTeamIds.push(team.teamId)
          } else {
            for (let i in muteTeamIds) {
              if (muteTeamIds[i] === team.teamId) {
                muteTeamIds.splice(i, 1)
                break
              }
            }
          }
          team.muteNotiType = muteNotiType
        }
      } catch (error) {
        // console.log(error)
      }
    }
  }
  store.commit('updateTeamList', teams)
}

function notifyForNewTeamMsg (nim, teamId) {
  // 是否需要群消息提醒 0表示接收提醒，1表示关闭提醒，2表示仅接收管理员提醒
  return new Promise((resolve, reject) => {
    nim.notifyForNewTeamMsg({
      teamIds: [teamId],
      done: (error, map) => {
        if (!error) {
          resolve(map)
        } else {
          reject(error)
        }
      }
    })
  })
}

// 收到群成员及更新群成员接口
export function onTeamMembers (obj) {
  obj.teamId && store.commit('updateTeamMembers', obj)
}

export function onCreateTeam (team, owner) {
  onTeams(team)
  onTeamMembers({
    teamId: team.teamId,
    members: [owner]
  })
}

export function onSynCreateTeam (team) {
  onTeams(team)
}

export function onDismissTeam (obj) {
  store.commit('updateTeamList', {
    isDismiss: true,
    invalid: { teamId: obj.teamId }
  })
}

export function onUpdateTeam (team) {
  onTeams(team)
}

export function onTeamNotificationMsg ({state, commit}, msg) {
  if (msg.attach.type === 'updateTeam' && msg.attach.team) {
    store.commit('updateTeamInfo', msg.attach.team)
  }
  if (msg.attach.type === 'transferTeam') {
    onTeamMembers({
      teamId: msg.attach.team.teamId,
      members: msg.attach.members
    })
  }
}

export function onAddTeamMembers (obj) {
  obj.accounts.forEach(account => {
    // 自己被拉入群时更新群列表
    if (account === store.state.userUID) {
      let team = Object.assign({}, obj.team)
      team.validToCurrentUser = true
      onTeams(team)
    }
  })
  onTeamMembers({
    teamId: obj.team.teamId,
    members: obj.members
  })
}

export function onRemoveTeamMembers (obj) {
  obj.accounts.forEach(account => {
    // 自己被移出群时，更新群列表
    if (account === store.state.userUID) {
      let team = Object.assign({}, obj.team)
      team.validToCurrentUser = false
      onTeams([team])
    }
  })
  store.commit('removeTeamMembersByAccounts', {
    teamId: obj.team.teamId,
    accounts: obj.accounts
  })
}

export function onUpdateTeamMember (teamMember) {
  onTeamMembers({
    teamId: teamMember.teamId,
    members: teamMember
  })
}

export function onUpdateTeamMembersMute (obj) {
  onTeamMembers({
    teamId: obj.team.teamId,
    members: obj.members
  })
}

export function onUpdateTeamManagers (obj) {
  onTeamMembers({
    teamId: obj.team.teamId,
    members: obj.members
  })
}

export function onTeamMsgReceipt (obj) {
  obj.teamMsgReceipts.forEach(item => {
    if (item.teamId === store.state.currReceiptQueryTeamId) {
      store.dispatch('getUnreadList')
      store.commit('updateSingleTeamMsgReads', item)
    }
  })
}

// 进入可配置的群信息设置页，进入前改变state中的配置信息，进入页面后读取配置信息更新视图
export function enterSettingPage ({commit}, obj) {
  commit('updateTeamSettingConfig', obj)
  setTimeout(() => {
    location.href = `#/teamsetting`
  }, 20)
}

/*
* 代理nim sdk中对群组的操作方法
* @functionName  nim sdk中的方法名
* @options 传递给sdk方法的参数
*/
export function delegateTeamFunction ({state}, {functionName, options}) {
  const nim = state.nim
  if (functionName && nim[functionName] && typeof nim[functionName] === 'function') {
    nim[functionName](options)
  } else {
    // throw (`There is not property of '${functionName}' in nim or '${functionName}' is not a function`)
  }
}

export function getTeamMembers ({ state }, teamId) {
  const nim = state.nim
  if (!nim) {
    // 防止nim未初始化
    setTimeout(() => {
      getTeamMembers(store, teamId)
    }, 200)
    return
  }
  if (teamId) {
    nim.getTeamMembers({
      teamId: teamId,
      done: (_err, obj) => {
        if (obj.members) {
          onTeamMembers({
            teamId: obj.teamId,
            members: obj.members
          })
        }
      }
    })
  }
}

export function checkTeamMsgReceipt ({state}, msgs) {
  var result = /team-(\d+)/.exec(state.currSessionId)
  if (!result) {
    return null
  }
  var teamId = result[1]
  var needToPeceiptList = getMsgNeedToReceipt(state, teamId, msgs)
  if (needToPeceiptList && needToPeceiptList.length > 0) {
    state.nim.sendTeamMsgReceipt({
      teamMsgReceipts: needToPeceiptList,
      done: (err, _obj, _content) => {
        if (!err) {
          store.commit('updateSentReceipedMap', needToPeceiptList)
        }
      }
    })
  }

  store.commit('updateReceiptQueryList', {
    teamId: teamId,
    msgs: msgs
  })
}

// 查询需要发送回执的消息
function getMsgNeedToReceipt (state, teamId, msgs) {
  var sentReceipedList = state.sentReceipedMap[teamId] || []
  var needToReceipt = msgs.filter(msg => {
    // 需要回执，且未发送过
    return msg.needMsgReceipt && msg.from !== state.myInfo.account && !sentReceipedList.find(id => id === msg.idServer)
  }).map(msg => {
    return {
      teamId: teamId,
      idServer: msg.idServer
    }
  })
  return needToReceipt
}

export function getTeamMsgReads ({ state }, needQuery) {
  state.nim.getTeamMsgReads({
    teamMsgReceipts: needQuery,
    done: (error, _obj, content) => {
      if (error) {
        console.log('获取群组消息已读' + error)
      } else {
        store.commit('updateTeamMsgReads', content)
      }
    }
  })
}

export function setSelectMsg ({state, commit}, obj) {
  commit('updateSelectMsg', obj)
  store.dispatch('getUnreadList')
}

export function getUnreadList ({state, commit}, obj) {
  state.nim.getTeamMsgReadAccounts({
    teamMsgReceipt: {
      teamId: state.curTeamId,
      idServer: state.curIdServer
    },
    done: (error, obj, content) => {
      if (!error) {
        let teamMembers = store.state.teamMembers
        let members = teamMembers && teamMembers[state.curTeamId]
        let unreadList = []
        let readList = []
        members.forEach((item) => {
          var member = Object.assign({}, item)
          if (member.account !== store.state.userUID) {
            let isRead = true
            member.avatar = state.userInfos[member.account].avatar
            member.alias = state.userInfos[member.account].alias || member.nickInTeam || state.userInfos[member.account].nick
            content.unreadAccounts.forEach((unread) => {
              if (unread === member.account) {
                isRead = false
                unreadList.push(member)
              }
            })
            if (isRead) {
              readList.push(member)
            }
          }
        })
        commit('updateUnreadList', {
          readList,
          unreadList
        })
      }
    }
  })
}

export function updateTeam ({state}, params) {
  let teamInfo = params.teamInfo
  // 更新群信息
  state.nim.updateTeam({
    ...teamInfo,
    done: (error, team) => {
      if (!error) {
        store.commit('updateTeamInfo', {
          team: team,
          callback: params.callback
        })
      } else {
        params.callback && params.callback()
      }
    }
  })
}

// 修改自己的群属性
export function updateInfoInTeam ({state}, params) {
  let teamInfo = params.teamInfo
  if (params.nickInTeam) {
    state.nim.updateInfoInTeam({
      teamId: teamInfo.teamId,
      nickInTeam: params.nickInTeam,
      muteNotiType: params.muteNotiType || 0,
      done: (error, obj) => {
        error && console.log(error)
      }
    })
  } else {
    state.nim.updateInfoInTeam({
      teamId: teamInfo.teamId,
      muteNotiType: params.muteNotiType || 0,
      done: (error, obj) => {
        error && console.log(error)
      }
    })
  }
}

// 添加管理员
export function addTeamManagers ({state}, params) {
  state.nim.addTeamManagers({
    teamId: params.teamId,
    accounts: params.accounts,
    done: (error, obj) => {
      params.callback && params.callback()
      if (error) console.log(error)
    }
  })
}

// 移除管理员
export function removeTeamManagers ({state}, params) {
  state.nim.removeTeamManagers({
    teamId: params.teamId,
    accounts: params.accounts,
    done: (error, obj) => {
      params.callback && params.callback()
      error && console.log(error)
    }
  })
}

// 转让群
export function transferTeam ({state}, params) {
  state.nim.transferTeam({
    teamId: params.teamId,
    account: params.account,
    leave: false,
    done: (error, obj) => {
      params.callback && params.callback()
      if (!error) {
        store.commit('toastConfig', {
          show: true,
          type: 'success',
          toastText: '转让成功，您已变为普通群成员'
        })
      } else {
        store.commit('toastConfig', {
          show: true,
          type: 'fail',
          toastText: '转让失败'
        })
      }
    }
  })
}

// 解散群
export function dismissTeam ({state}, params) {
  state.nim.dismissTeam({
    teamId: params.teamId,
    done: (error) => {
      params.callback && params.callback()
      if (!error) {
        store.commit('toastConfig', {
          show: true,
          type: 'success',
          toastText: `您已成功解散群组${params.name}`
        })
        let sessionIdArr = state.sessionlist.map(item => {
          return item.id
        })
        setTimeout(() => {
          store.dispatch('deleteSession', {curSessionId: state.currSessionId, id: state.currSessionId, sessionIdArr, that: params.that})
        }, 200)
      }
    }
  })
}

// 退出群
export function leaveTeam ({state}, params) {
  state.nim.leaveTeam({
    teamId: params.teamId,
    done: (error, obj) => {
      params.callback && params.callback()
      if (!error) {
        store.commit('toastConfig', {
          show: true,
          type: 'success',
          toastText: '已退出' + params.teamName
        })
        let sessionIdArr = state.sessionlist.map(item => {
          return item.id
        })
        setTimeout(() => {
          store.dispatch('deleteSession', {curSessionId: state.currSessionId, id: state.currSessionId, sessionIdArr, that: params.that})
        }, 200)
      } else {
        store.commit('toastConfig', {
          show: true,
          type: 'fail',
          toastText: '退出失败'
        })
      }
    }
  })
}

// 拉人入群
export function addTeamMembers ({state}, params) {
  state.nim.addTeamMembers({
    teamId: params.teamId,
    accounts: params.accounts,
    done: (error, obj) => {
      params.callback && params.callback(error)
    }
  })
}

// 踢人出群
export function removeTeamMembers ({state}, params) {
  state.nim.removeTeamMembers({
    teamId: params.teamId,
    accounts: params.accounts,
    done: (error) => {
      params.callback && params.callback()
      error && console.log(error)
    }
  })
}
