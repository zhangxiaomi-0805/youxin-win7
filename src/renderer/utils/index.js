import Vue from 'vue'
import store from '../store'

/*
if (!Function.prototype.bind) {
  Function.prototype.bind = function () {
    var fn = this
    var args = Array.prototype.slice.call(arguments)
    var object = args.shift()
    return function () {
      return fn.apply(object, args.concat(Array.prototype.slice.call(arguments)))
    }
  }
}
*/

let Utils = Object.create(null)

Utils.encode = function (_map, _content) {
  _content = '' + _content
  if (!_map || !_content) {
    return _content || ''
  }
  return _content.replace(_map.r, function ($1) {
    var _result = _map[!_map.i ? $1.toLowerCase() : $1]
    return _result != null ? _result : $1
  })
}

Utils.escape = (function () {
  let _reg = /<br\/?>$/
  let _map = {
    r: /<|>|&|\r|\n|\s|'|"/g,
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    ' ': '&nbsp;',
    '"': '&quot;',
    "'": '&#39;',
    '\n': '<br/>',
    '\r': ''
  }
  return function (_content) {
    _content = Utils.encode(_map, _content)
    return _content.replace(_reg, '<br/>')
  }
})()

Utils.object2query = function (obj) {
  let keys = Object.keys(obj)
  let queryArray = keys.map(item => {
    return `${item}=${encodeURIComponent(obj[item])}`
  })
  return queryArray.join('&')
}

// https://cn.vuejs.org/v2/guide/reactivity.html
// Vue 不能检测到对象属性的添加或删除。然而它可以使用 Vue.set(object, key, value) 方法将响应属性添加到嵌套的对象上
Utils.mergeObject = function (dest, src) {
  if (typeof dest !== 'object' || !dest) {
    dest = Object.create(null)
  }
  dest = Object.assign(Object.create(null), dest, src)
  return dest
}

Utils.mergeVueObject = function (dest, src) {
  let keys = Object.keys(src)
  keys.forEach(item => {
    if (typeof src[item] !== 'undefined') {
      Vue.set(dest, item, src[item])
    }
  })
  return dest
}

// 消息类型列表
Utils.mapMsgType = function (msg) {
  let map = {
    text: '文本消息',
    image: '图片消息',
    file: '文件消息',
    audio: '语音消息',
    video: '视频消息',
    geo: '地理位置消息',
    tip: '提醒消息',
    custom: '自定义消息',
    notification: '系统通知',
    robot: '机器人消息'
  }
  let type = msg.type
  return map[type] || '未知消息类型'
}

Utils.stringifyDate = function (datetime, simple = false) {
  // let weekMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  let weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  datetime = new Date(datetime)
  let year = datetime.getFullYear()
  let simpleYear = datetime.getYear() - 100
  let month = datetime.getMonth() + 1
  month = month > 9 ? month : '0' + month
  let day = datetime.getDate()
  day = day > 9 ? day : '0' + day
  let hour = datetime.getHours()
  hour = hour > 9 ? hour : '0' + hour
  let min = datetime.getMinutes()
  min = min > 9 ? min : '0' + min
  let week = datetime.getDay()
  week = weekMap[week]
  let thatDay = (new Date(year, month - 1, day, 0, 0, 0)).getTime()

  if (simple) {
    return {
      withYear: `${simpleYear}-${month}-${day}`,
      withMonth: `${month}-${day}`,
      withDay: `${week}`,
      withLastDay: `昨天`,
      withHour: `${hour}:${min}`,
      thatDay
    }
  } else {
    return {
      withYear: `${year}-${month}-${day} ${hour}:${min}`,
      withMonth: `${month}-${day} ${hour}:${min}`,
      withDay: `${week} ${hour}:${min}`,
      withLastDay: `昨天 ${hour}:${min}`,
      withHour: `${hour}:${min}`,
      thatDay
    }
  }
}

/* 时间戳转换为 年-月-日  时-分-秒 */
Utils.DateFormat = function (inputTime) {
  let date = new Date(inputTime)
  let y = date.getFullYear()
  let m = date.getMonth() + 1
  m = m < 10 ? ('0' + m) : m
  let d = date.getDate()
  d = d < 10 ? ('0' + d) : d
  let h = date.getHours()
  h = h < 10 ? ('0' + h) : h
  let minute = date.getMinutes()
  let second = date.getSeconds()
  minute = minute < 10 ? ('0' + minute) : minute
  second = second < 10 ? ('0' + second) : second
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second
}

/* 格式化日期 */
Utils.formatDate = function (datetime, simple = false) {
  let tempDate = (new Date()).getTime()
  let result = this.stringifyDate(datetime, simple)
  let thatDay = result.thatDay
  let deltaTime = (tempDate - thatDay) / 1000

  if (deltaTime < 3600 * 24) {
    return result.withHour
  } else if (deltaTime < 3600 * 24 * 2) {
    return result.withLastDay
  } else if (deltaTime < 3600 * 24 * 7) {
    return result.withDay
  } else if (deltaTime < 3600 * 24 * 30) {
    return result.withYear
  } else {
    return result.withYear
  }
}

Utils.parseSession = function (sessionId) {
  if (/^p2p-/.test(sessionId)) {
    return {
      scene: 'p2p',
      to: sessionId.replace(/^p2p-/, '')
    }
  } else if (/^team-/.test(sessionId)) {
    return {
      scene: 'team',
      to: sessionId.replace(/^team-/, '')
    }
  }
}

Utils.parseCustomMsg = function (msg) {
  if (msg.type === 'custom') {
    try {
      let cnt = JSON.parse(msg.content)
      switch (cnt.type) {
        case 1:
          return '[猜拳消息]'
        case 2:
          return '[阅后即焚]'
        case 3:
          return '[贴图表情]'
        case 4:
          return '[白板消息]'
        case 7:
          return '[媒体消息]'
        case 8:
          return '[入群邀请]'
      }
    } catch (e) {}
    return '[自定义消息]'
  }
  return ''
}
/* 获得有效的备注名 */
Utils.getFriendAlias = function (userInfo) {
  userInfo.alias = userInfo.alias ? userInfo.alias.trim() : ''
  return userInfo.alias || userInfo.nick || userInfo.account
}

Utils.generateChatroomSysMsg = function (data) {
  let text
  switch (data.attach.type) {
    case 'memberEnter':
      text = `欢迎${data.attach.fromNick}进入直播间`
      break
    case 'memberExit':
      text = `${data.attach.fromNick}离开了直播间`
      break
    case 'blackMember':
      text = `${(data.attach.toNick[0] || data.attach.to[0])}被管理员拉入黑名单`
      break
    case 'unblackMember':
      text = `${(data.attach.toNick[0] || data.attach.to[0])}被管理员解除拉黑`
      break
    case 'gagMember':
      text = `${(data.attach.toNick[0] || data.attach.to[0])}被管理员禁言`
      break
    case 'ungagMember':
      text = `${(data.attach.toNick[0] || data.attach.to[0])}被管理员解除禁言`
      break
    case 'addManager':
      text = `${(data.attach.toNick[0] || data.attach.to[0])}被任命管理员身份`
      break
    case 'removeManager':
      text = `${(data.attach.toNick[0] || data.attach.to[0])}被解除管理员身份`
      break
    case 'addTempMute':
      text = `${(data.attach.toNick[0] || data.attach.to[0])}被管理员临时禁言`
      break
    case 'removeTempMute':
      text = `${(data.attach.toNick[0] || data.attach.to[0])}被管理员解除临时禁言`
      break
    case 'addCommon':
      text = `管理员添加普通成员`
      break
    case 'removeCommon':
      text = `管理员删除普通成员`
      break
    case 'kickMember':
      text = `${data.attach.toNick[0]}被管理员踢出房间`
      break
    // case 'xxx':
    // 直播公告已更新
    // break;
    default:
      text = '通知消息'
      break
  }
  return text
}

Utils.generateTeamSysmMsg = function (data) {
  let task = '群'
  if (data.scene === 'team') {
    for (let i in store.state.teamlist) {
      let team = store.state.teamlist[i]
      if (team.teamId === data.to) {
        if (Utils.isDiscussGroup(team)) {
          task = '讨论组'
        }
        break
      }
    }
  }
  var text = this.getNickNames(data.attach.users)
  var nicks = text
  switch (data.attach.type) {
    case 'updateTeam':
      text = this.getTeamUpdateInfo(data, task)
      break
    case 'addTeamMembers': {
      let op = nicks.pop()
      for (let i in nicks) {
        nicks[i] = `“${nicks[i]}”`
      }
      text = `“${op}”邀请${nicks.join('、')}加入了${task}`
      break
    }
    case 'removeTeamMembers': {
      let op = nicks.pop()
      for (let i in nicks) {
        nicks[i] = `“${nicks[i]}”`
      }
      text = `${nicks.join('、')}被“${op}”移出群`
      break
    }
    case 'acceptTeamInvite': {
      let op = nicks.pop()
      text = `“${nicks.join()}”接受了“${op}”入${task}邀请`
      break
    }
    case 'passTeamApply': {
      let op = nicks.shift()
      if (nicks.length === 1 && op === nicks[0]) {
        // 此情况为高级群设置不需要验证，用户申请入群后，收到的群消息提示
        text = `“${nicks}”加入${task}`
      } else {
        text = `“${op}”通过了“${nicks}”的入${task}申请`
      }
      break
    }
    case 'addTeamManagers': {
      // todo test
      let op = nicks.pop()
      text = `“${op}”新增了“${nicks}”为管理员`
      break
    }
    case 'removeTeamManagers': {
      // todo test
      let op = nicks.pop()
      text = `“${op}”移除了“${nicks}”的管理员权限`
      break
    }
    case 'leaveTeam': {
      text = `“${nicks.join()}”退出了${task}`
      break
    }
    case 'dismissTeam': {
      text = task !== '群' ? `该讨论组已被解散` : `该群已被群主“${nicks.join()}”解散`
      break
    }
    case 'transferTeam': {
      // todo test
      let nicks = this.getNickNames(data.attach.users)
      let op = nicks.shift()
      text = task !== '群' ? '' : `“${op}”转让群主给“${nicks}”`
      break
    }
    case 'updateTeamMute': {
      let nicks = this.getNickNames(data.attach.users)
      text = `“${nicks}”被管理员${data.attach.mute ? '禁言' : '解除禁言'}`
      break
    }
    default:
      break
  }
  return text
}

// todo 写成私有成员方法
Utils.getNickNames = function (users) {
  return users.map(user => {
    return user.account === store.state.userUID ? '你' : user.nick
  })
}

// todo 写成私有成员方法
Utils.getTeamUpdateInfo = function (msg, task) {
  let text = msg.attach.team
  let team = text
  let op = this.getNickNames(msg.attach.users).pop()
  if (team['name']) text = `${op}修改${task}名为“${team['name']}”`
  else if (team['intro']) text = `${op}修改${task}介绍为“${team['intro']}”`

  // 由于群公告的交互与 Android iOS 不一致，现版本不适配群公告
  // else if (team['announcement']) {
  //   text = `${op}修改群公告为${team['announcement']}`
  // }
  else if (team['joinMode']) {
    text = `${task}身份验证模式更新为${team.joinMode === 'noVerify' ? '不需要验证' : team.joinMode === 'needVerify' ? '需要验证' : '禁止任何人加入'}`
  } else if (team['inviteMode']) {
    text = `邀请他人权限为${team['inviteMode'] === 'all' ? '所有人' : '管理员'}`
  } else if (team['updateTeamMode']) {
    text = `${task}资料修改权限为${team['updateTeamMode'] === 'all' ? '所有人' : '管理员'}`
  } else if (team['beInviteMode']) {
    text = `被邀请人身份${team['beInviteMode'] === 'noVerify' ? '不需要验证' : '需要验证'}`
  } else if (team['announcement']) {
    text = `${op}修改${task}公告为“${team['announcement']}”`
  } else {
    text = `更新${task}信息`
  }
  return text
}

Utils.teamConfigMap = {
  joinMode: {
    'noVerify': '不需要验证',
    'needVerify': '需要验证',
    'rejectAll': '禁止任何人加入'
  },
  beInviteMode: {
    'needVerify': '需要验证',
    'noVerify': '不需要验证'
  },
  inviteMode: {
    'manager': '管理员邀请',
    'all': '所有人邀请'
  },
  updateTeamMode: {
    'manager': '管理员修改',
    'all': '所有人修改'
  },
  memberType: {
    'manager': '管理员',
    'normal': '普通成员'
  }
}

Utils.uuid = () => {
  const s = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'
  const uuid = s.join('')
  return uuid
}

// 正则管理
Utils.regExp = {
  regPhone: /^1[3456789]\d{9}$/,
  regEmail: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
}

// 是否是讨论组
Utils.isDiscussGroup = (team) => {
  team = team || {}
  if (team.custom) {
    if (Utils.isJSON(team.custom)) {
      if (JSON.parse(team.custom).isDiscussGroup) {
        return true
      }
    }
  }
  return false
}

Utils.isJSON = (str) => {
  if (typeof str === 'string') {
    try {
      var obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}

// 文件大小显示
Utils.fileSize = (size) => {
  let sizeNum = ''
  switch (true) {
    case size <= 0:
      sizeNum = '0B'
      break
    case size <= 1024:
      sizeNum = size + 'B'
      break
    case size < 1024 * 1024:
      sizeNum = (size / 1024).toFixed(1) + 'KB'
      break
    case size < 1024 * 1024 * 1024:
      sizeNum = (size / 1024 / 1024).toFixed(1) + 'MB'
      break
    case size < 1024 * 1024 * 1024 * 1024:
      sizeNum = (size / 1024 / 1024 / 1024).toFixed(1) + 'GB'
      break
    default:
      break
  }
  return sizeNum
}

export default Utils
