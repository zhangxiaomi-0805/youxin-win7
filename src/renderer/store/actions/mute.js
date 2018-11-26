/*
 * 静音列表
 */

import store from '../'

// 完成加入静音列表/从静音列表移除，初始化获取静音列表，都会触发此函数
export function onMutelist (mutes) {
  mutes = mutes.map(item => {
    if (typeof item.isMute !== 'boolean') {
      item.isMute = true
    }
    return item
  })
  // 更新静音列表
  store.commit('updateMutelist', mutes)
  // 在好友身上打上标记
  store.commit('updateFriends', mutes)
  // 更新好友信息字典
  // store.commit('updateUserInfo', mutes)
}

export function onMarkInMutelist (obj) {
  // obj = obj || obj2
  let account = obj.account
  // 说明是自己，被别人加入静音
  if (account === store.state.userUID) {

  } else {
    // 说明是别人的帐号，静音通知
    if (typeof obj.isAdd === 'boolean') {
      onMutelist([{
        account,
        isMute: obj.isAdd
      }])
    }
  }
}

export function updateMute ({state}, {account, isMute}) {
  const nim = state.nim
  if (account && (typeof isMute === 'boolean')) {
    nim.markInMutelist({
      account,
      // `true`表示加入静音列表, `false`表示从静音列表移除
      isAdd: isMute,
      done: function (error, obj) {
        if (!error) {
          onMarkInMutelist(obj)
        } else {
          store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: error.message
          })
        }
      }
    })
  }
}
