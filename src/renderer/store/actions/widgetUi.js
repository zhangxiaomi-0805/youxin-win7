import util from '../../utils'
import store from '../'
// 显示加载中进度条
export function showLoading ({state, commit}) {
  // commit('updateLoading', true)
}

// 隐藏加载中进度条
export function hideLoading ({state, commit}) {
  // commit('updateLoading', false)
}

// 显示原图片
export function showFullscreenImg ({state, commit}, obj) {
  if (obj) {
    obj.type = 'show'
    // commit('updateFullscreenImage', obj)
  }
}

export function showImgModal ({state, commit}, obj) {
  let msgs = state.currSessionMsgs
  let imgArr = []
  msgs.forEach(item => {
    if (item.type === 'image') {
      imgArr[ imgArr.length ] = Object.assign({}, item)
    }
  })
  obj.imgArr = imgArr
  commit('updateImgModal', obj)
}

// 隐藏原图片
export function hideFullscreenImg ({state, commit}) {
  // commit('updateFullscreenImage', {
  //  type: 'hide'
  // })out
}
function getTeamMembers (id) {
  return new Promise((resolve, reject) => {
    store.state.nim.getTeamMembers({
      teamId: id,
      done: (err, obj) => {
        if (!err) {
          resolve(obj.members)
        } else {
          reject(err)
        }
      }
    })
  })
}

function getTeams () {
  return new Promise((resolve, reject) => {
    store.state.nim.getTeams({
      done: (err, teams) => {
        if (!err) {
          resolve(teams)
        } else {
          reject(err)
        }
      }
    })
  })
}

export async function showListOptions ({state, commit}, obj) {
  let items = []
  // 右键出现蓝框位置
  if (obj.key === 'p2p-isTop' || obj.key === 'team-isTop' || obj.key === 'team-notTop' || obj.key === 'p2p-notTop') {
    commit('updateSessionAc', {
      id: obj.id
    })
    commit('updateNoticeAc', {
      id: ''
    })
    commit('updateTeamAc', {
      id: ''
    })
  } else if (obj.key === 'group' || obj.key === 'team') {
    commit('updateTeamAc', {
      id: obj.id
    })
    commit('updateSessionAc', {
      id: ''
    })
    commit('updateNoticeAc', {
      id: ''
    })
  } else {
    commit('updateNoticeAc', {
      id: obj.id
    })
    commit('updateSessionAc', {
      id: ''
    })
    commit('updateTeamAc', {
      id: ''
    })
  }
  if (!obj.show) {
    commit('updateListOptions', {
      items,
      show: false,
      pos: {
        x: 0,
        y: 0
      }
    })
    return
  }
  // 定义选项事件
  // chatItem
  let event0 = {
    title: '多选',
    callBack: () => obj.callBack(0)
  }
  let event1 = {
    title: '撤回',
    callBack: () => obj.callBack(1)
  }
  let event2 = {
    title: '转发',
    callBack: () => obj.callBack(2)
  }
  let event3 = {
    title: '复制',
    callBack: () => obj.callBack(3)
  }
  let event4 = {
    title: '删除',
    callBack: () => obj.callBack(4)
  }
  // let event5 = {
  //   title: '转文字',
  //   callBack: () => obj.callBack(5)
  // }
  let event6 = {
    title: '另存为',
    callBack: () => obj.callBack(6)
  }
  // sessionList
  let event7 = {
    title: '消息置顶',
    callBack: () => obj.callBack(1)
  }
  let event8 = {
    title: '删除聊天',
    callBack: () => obj.callBack(2)
  }
  let event9 = {
    title: '取消置顶',
    callBack: () => obj.callBack(3)
  }
  let event17 = {
    title: '群设置',
    callBack: () => obj.callBack(4)
  }
  let event19 = {
    title: '查看资料',
    callBack: () => obj.callBack(5)
  }
  let event20 = {
    title: '+常用联系人',
    callBack: () => obj.callBack(6)
  }
  let event21 = {
    title: '消息免打扰',
    callBack: () => obj.callBack(7)
  }
  let event10 = {
    title: '添加成员',
    callBack: () => obj.callBack(4)
  }
  let event11 = {
    title: '移出成员',
    callBack: () => obj.callBack(2)
  }
  let event00 = {
    title: '搜索成员',
    callBack: () => obj.callBack(3)
  }
  let event12 = {
    title: '发消息',
    callBack: () => obj.callBack(1)
  }
  let event13 = {
    title: '设为管理员',
    callBack: () => obj.callBack(2)
  }
  let event14 = {
    title: '取消管理员身份',
    callBack: () => obj.callBack(3)
  }
  let event15 = {
    title: '移出本群',
    callBack: () => obj.callBack(7)
  }
  let event16 = {
    title: '添加联系人',
    callBack: () => obj.callBack(5)
  }
  // let event18 = {
  //   title: '发起群聊',
  //   callBack: () => obj.callBack()
  // }
  // 创建
  let event30 = {
    title: '创建群',
    callBack: () => obj.callBack(1)
  }
  let event31 = {
    title: '创建讨论组',
    callBack: () => obj.callBack(2)
  }
  let event32 = {
    title: '邀请成员',
    callBack: () => obj.callBack(1)
  }
  let event33 = {
    title: '退出群',
    callBack: () => {
      obj.callBack(9)
    }
  }
  let event34 = {
    title: '邀请群成员',
    callBack: () => obj.callBack(1)
  }
  let event35 = {
    title: '退出讨论组',
    callBack: () => {
      obj.callBack(10)
    }
  }
  let event36 = {
    title: '取消免打扰',
    callBack: () => {
      obj.callBack(8)
    }
  }
  // 文件消息
  let event37 = {
    title: '在文件夹中显示',
    callBack: () => {
      obj.callBack(7)
    }
  }
  let event38 = {
    title: '打开',
    callBack: () => {
      obj.callBack(8)
    }
  }
  // 历史消息记录
  if (obj.key === 'msg-record') {
    items = [
      event3, event2, event0, event4
    ]
  }
  // if (obj.key === 'text-msg-record') {
  //   items = [
  //     event3, event2, event0, event4
  //   ]
  // }
  if (obj.key === 'image-msg-record') {
    items = [
      event2, event0, event4
    ]
  }
  if (obj.key === 'custom-type8-msg-record') {
    items = [
      event4
    ]
  }
  // if (obj.key === 'file-msg-record') {
  //   items = [
  //     event2, event6, event0, event4, event37
  //   ]
  // }
  // 自定义消息 --- 贴图表情 && 富文本
  if (obj.key === 'custom-out') {
    items = [
      event1, event2, event4
    ]
  }
  if (obj.key === 'custom-in' || obj.key === 'custom-out-timeout') {
    items = [
      event2, event4
    ]
  }
  // 自定义消息 --- 邀请入群消息
  if (obj.key === 'custom-type8-out') {
    items = [
      event1, event4
    ]
  }
  if (obj.key === 'custom-type8-in' || obj.key === 'custom-type8-out-timeout') {
    items = [
      event4
    ]
  }
  // 选择会话
  if (obj.key === 'p2p-notTop') {
    items = [
      event7, event19, event8, event20
    ]
  }
  if (obj.key === 'p2p-isTop') {
    items = [
      event9, event19, event8, event20
    ]
  }
  // 消息列表 群会话
  if (obj.key === 'team-notTop' || obj.key === 'team-isTop') {
    const teams = await getTeams()
    const hasTeam = teams.find(item => {
      return item.teamId === obj.id.split('-')[1]
    })
    let valid = true
    let isDiscussGroup = false
    let muteNotiType = -1
    for (let i = 0; i < state.teamlist.length; i++) {
      const item = state.teamlist[i]
      if (item.teamId === obj.id.split('-')[1]) {
        isDiscussGroup = util.isDiscussGroup(item)
        muteNotiType = item.muteNotiType
        valid = item.valid
        break
      }
    }
    if (!valid || !hasTeam) {
      if (obj.key === 'team-notTop') {
        items = [
          event7, event8
        ]
      }
      if (obj.key === 'team-isTop') {
        items = [
          event9, event8
        ]
      }
    } else if (isDiscussGroup) {
      if (obj.key === 'team-notTop') {
        if (muteNotiType === 1) {
          items = [
            event7, event36, event8, event35
          ]
        } else {
          items = [
            event7, event21, event8, event35
          ]
        }
      } else {
        if (muteNotiType === 1) {
          items = [
            event9, event36, event8, event35
          ]
        } else {
          items = [
            event9, event21, event8, event35
          ]
        }
      }
    } else {
      let members = []
      let valid = true
      try {
        members = await getTeamMembers(obj.id.split('-')[1])
      } catch (err) {
        valid = false
      }
      if (!valid) {
        if (obj.key === 'team-notTop') {
          items = [
            event7, event8
          ]
        }
        if (obj.key === 'team-isTop') {
          items = [
            event9, event8
          ]
        }
      } else {
        let userType = ''
        for (let i = 0; i < members.length; i++) {
          let item = members[i]
          if (item.account === state.personInfos.accid) {
            userType = item.type
            break
          }
        }
        // 非置顶
        if (obj.key === 'team-notTop') {
          if (userType === 'normal') {
            if (muteNotiType === 1) {
              items = [
                event7, event36, event8, event33
              ]
            } else {
              items = [
                event7, event21, event8, event33
              ]
            }
          }
          if (userType === 'owner') {
            if (muteNotiType === 1) {
              items = [
                event7, event36, event8, event17
              ]
            } else {
              items = [
                event7, event21, event8, event17
              ]
            }
          }
          if (userType === 'manager') {
            if (muteNotiType === 1) {
              items = [
                event7, event36, event8, event33, event17
              ]
            } else {
              items = [
                event7, event21, event8, event33, event17
              ]
            }
          }
        }
        // 置顶
        if (obj.key === 'team-isTop') {
          if (userType === 'normal') {
            if (muteNotiType === 1) {
              items = [
                event9, event36, event8, event33
              ]
            } else {
              items = [
                event9, event21, event8, event33
              ]
            }
          }
          if (userType === 'owner') {
            if (muteNotiType === 1) {
              items = [
                event9, event36, event8, event17
              ]
            } else {
              items = [
                event9, event21, event8, event17
              ]
            }
          }
          if (userType === 'manager') {
            if (muteNotiType === 1) {
              items = [
                event9, event36, event8, event33, event17
              ]
            } else {
              items = [
                event9, event21, event8, event33, event17
              ]
            }
          }
        }
      }
    }
  }
  // 选择自己的text
  if (obj.key === 'text-out') {
    items = [
      event1, event3, event2, event4
    ]
  }
  if (obj.key === 'text-out-fail' || obj.key === 'text-out-timeout') { // 时间超过五分钟，不能撤回
    items = [
      event3, event2, event4
    ]
  }
  // 选择他人的text
  if (obj.key === 'text-in') {
    items = [
      event3, event2, event4
    ]
  }
  // 选择自己的image
  if (obj.key === 'image-out') {
    items = [
      event1, event2, event6, event4
    ]
  }
  if (obj.key === 'image-out-fail' || obj.key === 'image-out-timeout') {
    items = [
      event2, event6, event4
    ]
  }
  // 选择他人的image
  if (obj.key === 'image-in') {
    items = [
      event2, event6, event4
    ]
  }
  // 选择自己的audio
  if (obj.key === 'audio-out') {
    items = [
      event1, event4
    ]
  }
  if (obj.key === 'audio-out-fail' || obj.key === 'audio-out-timeout') {
    items = [
      event4
    ]
  }
  // 选择他人的audio
  if (obj.key === 'audio-in') {
    items = [
      event4
    ]
  }
  // 群设置（搜索、添加、移出成员）
  if (obj.key === 'team-member') {
    items = [
      event00, event10, event11
    ]
  }
  if (obj.key === 'team-member-normal') {
    items = [
      event00, event10
    ]
  }
  // 讨论组设置（搜索、添加成员）
  if (obj.key === 'discuss-group-member') {
    items = [
      event00, event10
    ]
  }
  // 群成员管理（发消息、查看资料、+常用联系人、移出本群）--- 群主
  if (obj.key === 'owner-member-manager') {
    items = [
      event12, event19, event20, event15
    ]
    if (obj.isDiscussGroup) {
      items = [
        event12, event19, event20
      ]
    }
  }
  // 群成员管理（发消息、查看资料、+常用联系人）--- 普通群成员
  if (obj.key === 'normal-member-manager') {
    items = [
      event12, event19, event20
    ]
  }
  if (obj.key === 'owner-add-set') {
    items = [
      event16, event13, event15
    ]
  }
  if (obj.key === 'owner-add-remove') {
    items = [
      event16, event14, event15
    ]
  }
  // 群设置（管理员）
  if (obj.key === 'manager-send') {
    items = [
      event12
    ]
  }
  if (obj.key === 'manager-add') {
    items = [
      event16
    ]
  }
  if (obj.key === 'manager-send-remove') {
    items = [
      event12, event15
    ]
  }
  if (obj.key === 'manager-add-remove') {
    items = [
      event16, event15
    ]
  }
  // 群设置（普通成员）
  if (obj.key === 'normal-send') {
    items = [
      event12, event19, event20
    ]
  }
  if (obj.key === 'normal-add') {
    items = [
      event16
    ]
  }
  // 创建群&讨论组
  if (obj.key === 'launch-chat') {
    items = [
      event30, event31
    ]
  }
  // 群或讨论组右键
  if (obj.key === 'team') {
    let muteNotiType = -1
    for (let i = 0; i < state.teamlist.length; i++) {
      const item = state.teamlist[i]
      if (item.teamId === obj.id) {
        muteNotiType = item.muteNotiType
        break
      }
    }
    const members = await getTeamMembers(obj.id)
    let userType = ''
    for (let i = 0; i < members.length; i++) {
      let item = members[i]
      if (item.account === state.personInfos.accid) {
        userType = item.type
        break
      }
    }
    if (userType === 'normal') {
      if (muteNotiType === 1) {
        items = [
          event36, event33
        ]
      } else {
        items = [
          event21, event33
        ]
      }
    }
    if (userType === 'owner') {
      if (muteNotiType === 1) {
        items = [
          event36, event34, event17
        ]
      } else {
        items = [
          event21, event34, event17
        ]
      }
    }
    if (userType === 'manager') {
      if (muteNotiType === 1) {
        items = [
          event36, event34, event33, event17
        ]
      } else {
        items = [
          event21, event34, event33, event17
        ]
      }
    }
  }

  if (obj.key === 'group') {
    let muteNotiType = -1
    for (let i = 0; i < state.teamlist.length; i++) {
      const item = state.teamlist[i]
      if (item.teamId === obj.id) {
        muteNotiType = item.muteNotiType
        break
      }
    }
    if (muteNotiType === 1) {
      items = [
        event36, event32, event35
      ]
    } else {
      items = [
        event21, event32, event35
      ]
    }
  }

  // 文件消息右键处理
  if (obj.key === 'file-out') {
    items = [
      event38, event2, event6, event4, event1, event37
    ]
  }
  if (obj.key === 'file-out-timeout') {
    items = [
      event38, event2, event6, event4, event37
    ]
  }
  if (obj.key === 'file-in') {
    items = [
      event2, event6, event4
    ]
  }
  if (obj.key === 'file-in-isDownloaded') {
    items = [
      event38, event2, event6, event4, event37
    ]
  }

  // 他人名片文本支持复制
  if (obj.key === 'check-user') {
    items = [
      event3
    ]
  }

  commit('updateListOptions', {
    items,
    show: true,
    pos: {
      x: obj.pos.x,
      y: obj.pos.y,
      left: obj.pos.left
    }
  })
}
