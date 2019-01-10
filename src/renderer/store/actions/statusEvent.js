import store from '../'

export function onLoginPortsChange (loginPorts) {
  if (loginPorts[0].type === 'Android' || loginPorts[0].type === 'iOS') {
    store.commit('updateMobileOnline', loginPorts[0].online)
  }
}

export function onPushEvents (param) {
  if (param.msgEvents) {
    param.msgEvents.forEach(data => {
      store.commit('updateFriendsStatusList', {
        account: data.account,
        type: updateMultiPortStatus(data)
      })
    })
    store.commit('updateSessions', [])
    store.commit('updateContactsToplist', {type: 'status'})
  }
}

function updateMultiPortStatus (data) {
  if (data.account) {
    var multiPortStatus = ''
    let getMultiPortStatus = (customType, custom) => {
      // 服务器下推多端事件标记的特定序号对应值
      var netState = {
        0: '',
        1: 'Wifi',
        2: 'WWAN',
        3: '2G',
        4: '3G',
        5: '4G'
      }
      var onlineState = {
        0: '在线',
        1: '忙碌',
        2: '离开'
      }

      custom = custom || {}
      if (customType !== 0) {
        // 有serverConfig.online属性，已被赋值端名称
        custom = custom[customType]
      } else if (custom[16]) {
        custom = custom[16]
        multiPortStatus = 'Web'
      } else if (custom[2]) {
        custom = custom[2]
        multiPortStatus = 'iOS'
      } else if (custom[1]) {
        custom = custom[1]
        multiPortStatus = 'Android'
      } else if (custom[4]) {
        custom = custom[4]
        multiPortStatus = '电脑'
      } else if (custom[64]) {
        custom = custom[64]
        multiPortStatus = 'Mac'
      }
      if (custom) {
        custom = JSON.parse(custom)
        if (typeof custom['net_state'] === 'number') {
          var tempNetState = netState[custom['net_state']]
          if (tempNetState) {
            multiPortStatus += ('[' + tempNetState + ']')
          }
        }
        if (typeof custom['online_state'] === 'number') {
          multiPortStatus += onlineState[custom['online_state']]
        } else {
          multiPortStatus += '在线'
        }
      }
      return multiPortStatus
    }

    // demo自定义多端登录同步事件
    if (+data.type === 1) {
      if (+data.value === 1 || +data.value === 2 || +data.value === 3 || +data.value === 10001) {
        var serverConfig = JSON.parse(data.serverConfig)
        var customType = 0
        multiPortStatus = ''
        // 优先判断serverConfig字段
        if (serverConfig.online) {
          if (serverConfig.online.indexOf(16) >= 0) {
            multiPortStatus = 'Web'
            customType = 16
          } else if (serverConfig.online.indexOf(2) >= 0) {
            multiPortStatus = 'iOS'
            customType = 2
          } else if (serverConfig.online.indexOf(1) >= 0) {
            multiPortStatus = 'Android'
            customType = 1
          } else if (serverConfig.online.indexOf(4) >= 0) {
            multiPortStatus = '电脑'
            customType = 4
          } else if (serverConfig.online.indexOf(64) >= 0) {
            multiPortStatus = 'Mac'
            customType = 64
          }
        }
        if (data.custom && (Object.keys(data.custom).length > 0)) {
          var portStatus = getMultiPortStatus(customType, data.custom)
          // 如果serverConfig里有属性而custom里没有对应属性值
          if ((multiPortStatus !== '') && (portStatus === '')) {
            multiPortStatus += '在线'
          } else {
            multiPortStatus += portStatus
          }
        } else if (customType !== 0) {
          multiPortStatus += '在线'
        } else {
          multiPortStatus = 2
        }
      }
    }
    // 2 -离线  1 -忙碌  0 -在线
    if (multiPortStatus === 2) {
      return 2
    }
    if (multiPortStatus.indexOf('忙碌') > -1) {
      return 1
    } else {
      return 0
    }
  }
  return 2
}

// 订阅事件
export async function subscribeEvent ({state}, sessions) {
  let accounts = []
  sessions.forEach(item => {
    if (item.scene === 'p2p') {
      accounts.push(item.to)
    }
  })
  // 定义返回已订阅的账号列表
  let successArr = []
  try {
    successArr = await querySubscribe([...accounts])
  } catch (err) {
  }
  // 在列表中排除已订阅账号
  if (successArr.length > 0) {
    successArr.forEach(item => {
      let index = [...accounts].indexOf(item.to)
      if (index > -1) {
        [...accounts].splice(index, 1)
      }
    })
  }
  if ([...accounts].length > 0) {
    // state.nim.subscribeEvent({
    //   // type 1 为登录事件，用于同步多端登录状态
    //   type: 1,
    //   accounts: [...accounts],
    //   subscribeTime: 3600 * 24 * 30,
    //   // 同步订阅事件，保证每次登录时会收到推送消息
    //   sync: true,
    //   done: function (err, res) {
    //     if (err) {
    //       console.error('订阅好友事件失败', err)
    //     } else {
    //       // console.log(res)
    //     }
    //   }
    // })
  }
}

// 查询监听
function querySubscribe (accounts) {
  return new Promise((resolve, reject) => {
    let arr = [...accounts]
    store.state.nim.querySubscribeEventsByAccounts({
      type: 1,
      accounts: arr,
      done: function (error, obj) {
        if (error) {
          reject(error)
        } else {
          resolve(obj.msgEventSubscribes)
        }
      }
    })
  })
}

// 取消订阅事件
export function unSubscribeEvent ({state}, accounts) {
  // state.nim.unSubscribeEventsByAccounts({
  //   type: 1,
  //   accounts,
  //   done: function (error, obj) {
  //     console.log('取消订阅事件' + (!error ? '成功' : '失败'), error, obj)
  //   }
  // })
}

// 发布在线状态事件 type  0 -在线  1 -忙碌
export function publistEvents ({state, commit}, type) {
  const curState = state.statusInfo
  if (type === curState) {
    return
  }
  const status = {net_state: 0, online_state: type}
  state.nim.publishEvent({
    type: 1,
    value: 10001,
    custom: JSON.stringify(status),
    vaildTime: 60,
    sync: true,
    done: function (error, obj) {
      if (error) {
        console.log('发布事件失败', error)
      } else {
        commit('updateStatusInfo', type)
      }
    }
  })
}
