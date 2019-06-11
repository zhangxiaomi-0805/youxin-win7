/**
 * 历史消息记录公用方法
 */
import store from '../../store'
import util from '../../utils'
import config from '../../configs'
import NativeLogic from '../../utils/nativeLogic.js'
import Request from '../../utils/request.js'
var MsgRecordFn = {}
MsgRecordFn.copyMoreText = function (textAreaId, checkedMsgList, callback) {
  let resTarget = document.getElementById(textAreaId)
  let allCopyText = ''
  checkedMsgList.sort(function (obj1, obj2) {
    return obj1.time - obj2.time
  })
  if (checkedMsgList && checkedMsgList.length > 0) {
    checkedMsgList.forEach(msg => {
      let newMsg = JSON.parse(JSON.stringify(msg))
      // newMsg.time = this.manageTime(newMsg.time)
      if (newMsg.type === 'text') {
        let singgleCopyText = `${newMsg.fromNick}  ${newMsg.time}\n${newMsg.text}\n\n`
        allCopyText += singgleCopyText
      }
    })
    resTarget.innerText = allCopyText.replace(/\r/g, '')
    document.addEventListener('copy', function copy (e) {
      e.clipboardData.setData('text/plain', allCopyText.replace(/\r/g, ''))
      e.preventDefault()
    })
    document.execCommand('Copy')
    store.commit('toastConfig', {
      show: true,
      type: 'success',
      toastText: '复制成功！'
    })
    callback && callback()
  }
}
MsgRecordFn.getSearchRecords = function (searchValue, checkType) {
  // 搜索
  return new Promise((resolve, reject) => {
    let nim = store.state.nim
    nim.getLocalMsgs({
      sessionId: store.state.currSessionId,
      desc: true,
      limit: 20,
      types: checkType,
      keyword: searchValue,
      done: (error, obj) => {
        if (!error) resolve(obj.msgs)
        else reject(error)
      }
    })
  })
}

MsgRecordFn.forwordMsg = function (to, myPhoneId, userInfos, myInfo, myGroupIcon) {
  // 转发消息 ***** type=8---多条转发， type=7---单条转发， msg---要转发的消息
  let sessionlist = store.state.sessionlist.filter((item, index) => {
    item.name = ''
    item.avatar = ''
    if (item.scene === 'p2p') {
      let userInfo = null
      if (item.to !== myPhoneId) {
        userInfo = userInfos[item.to]
      } else {
        userInfo = Object.assign({}, myInfo)
        // userInfo.alias = '我的手机'
        // userInfo.avatar = `${config.myPhoneIcon}`
      }
      if (userInfo) {
        item.name = util.getFriendAlias(userInfo)
        item.avatar = userInfo.avatar
      }
    } else if (item.scene === 'team') {
      let teamInfo = null
      teamInfo = store.state.teamlist.find(team => {
        if (team.teamId === item.to) {
          item.memberNum = team.memberNum
        }
        return team.teamId === item.to
      })
      if (teamInfo) {
        item.name = teamInfo.name
        item.avatar = teamInfo.avatar || myGroupIcon
      } else if (item.lastMsg && item.lastMsg.attach && item.lastMsg.attach.team) {
        item.name = item.lastMsg.attach.team.name
        item.avatar = item.avatar || myGroupIcon
      } else {
        item.name = `群${item.to}`
        item.avatar = item.avatar || myGroupIcon
      }
      if (!item.memberNum) {
        return false
      }
    }
    if (item.updateTime) {
      item.updateTimeShow = util.formatDate(item.updateTime, true)
    }
    return item
  })
  let sessionlistTop = sessionlist.filter((item) => {
    if (item.localCustom && item.localCustom.topTime) {
      if (item.localCustom.topTime - item.lastMsg.time > 0) {
        item.compareTime = item.localCustom.topTime
      } else {
        item.compareTime = item.lastMsg.time
      }
      return item
    }
  })
  let newSessionlistTop = sessionlistTop.sort((a, b) => {
    return b.compareTime - a.compareTime
  })
  let sessionlistBot = sessionlist.filter((item) => {
    if (!item.localCustom || !item.localCustom.topTime) {
      return item
    }
  })
  let sidelist = [...newSessionlistTop, ...sessionlistBot]
  return sidelist
}
MsgRecordFn.isChildOf = function (child, parent) {
  if (child === parent) return true
  // 判断一个节点是否为另外一个节点的子节点
  let parentNode = ''
  if (child && parent) {
    parentNode = child.parentNode
    while (parentNode) {
      if (parent === parentNode) {
        return true
      }
      parentNode = parentNode.parentNode
    }
  }
  return false
}
MsgRecordFn.copyAll = function (target) {
  // 右键复制全选
  let isNeedAllSelect = true
  let selection = window.getSelection()
  if (this.getSelectedText().childNodes && this.getSelectedText().childNodes.length > 0) {
    let anchorNode = selection.anchorNode
    let focusNode = selection.focusNode
    if (this.isChildOf(anchorNode, target) && this.isChildOf(focusNode, target)) {
      isNeedAllSelect = false
      let range = selection.getRangeAt(0)
      this.selectInfo = {
        anchorNode: selection.anchorNode,
        focusNode: selection.focusNode,
        startOffset: range.startOffset,
        endOffset: range.endOffset
      }
    }
  }
  if (isNeedAllSelect) { // 全选
    let range = document.createRange()
    range.selectNodeContents(target)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}
MsgRecordFn.getSelectedText = function (e) {
  let sel = window.getSelection && window.getSelection()
  if (sel && sel.rangeCount > 0) {
    let selection = window.getSelection().getRangeAt(0).cloneContents()
    return selection
  } else {
    return ''
  }
}
MsgRecordFn.getCopyText = function (e) {
  let text = ''
  let dom = null
  if (this.getSelectedText().childNodes && this.getSelectedText().childNodes.length > 0) {
    let range = this.getSelectedText()
    let container = document.createElement('div')
    container.appendChild(range)
    dom = container
  }
  if (dom === null) {
    if (e.target.tagName === 'IMG') {
      dom = e.target.parentNode
    } else {
      dom = e.target
    }
  }
  let childNodes = [...(dom.childNodes)] // dom节点不是真正的数组，不能用forEach,需转化为数组
  childNodes.forEach((item, index) => {
    if (item.nodeType === 3) {
      text += item.data
    } else if (item.nodeType === 1) {
      if (item.tagName === 'IMG') {
        let dataKey = item.getAttribute('data-key')
        if (dataKey) {
          text += '[' + dataKey + ']'
        }
      } else if (item.tagName === 'SPAN' || item.tagName === 'A') {
        text += item.innerText
      }
    }
  })
  return text
}
MsgRecordFn.httpSpring = function (str) {
  // 匹配url
  // let regHttp = /((?:http(s?):\/\/)?w{3}(?:.[\w]+)+)/g
  let regHttpAll = /(?:http(s?):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\\.,@?^=%&:/~\\+#]*[\w\-\\@?^=%&/~\\+#])?/g
  let regEmail = /^([0-9A-Za-z\-_\\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g
  let httpArr = []
  str.split('\r\n').map(lineStr => {
    // 分割空格
    lineStr.split(/\s+/).map(minStr => {
      if (!regEmail.test(minStr)) {
        let httpResult = minStr.match(regHttpAll)
        // if (!httpResult) {
        //   httpResult = minStr.match(regHttpAll)
        // }
        if (httpResult) httpArr.push(httpResult[0])
      }
    })
  })
  return httpArr
}
MsgRecordFn.openAplWindow = function (evt, sessionId) {
  let url = evt.target.getAttribute('data-url')
  if (url) {
    url = url.slice(1, url.length - 1)
    // 打开营业精灵
    let thirdUrls = store.state.thirdUrls
    let sessionlist = store.state.sessionlist
    let sessionInfo = {}
    for (let i in sessionlist) {
      if (sessionlist[i].id === sessionId) {
        sessionInfo = sessionlist[i]
        break
      }
    }
    let regDomain = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62}|(:[0-9]{1,6}))+\.?/
    let domain = url.match(regDomain)[0]
    if (url.split('://').length <= 1) url = 'http://' + url
    for (let i in thirdUrls) {
      if (thirdUrls[i].url === domain) {
        Request.ThirdConnection({url: encodeURIComponent(url), appCode: thirdUrls[i].appCode}).then(res => {
          if (config.environment === 'web') { // web分支
            NativeLogic.native.createWindows('营业精灵', url, config.aplWinHeight, config.aplWinWidth)
          } else { // electron分支
            let { ipcRenderer } = require('electron')
            ipcRenderer.send('openAplWindow', {url: res, title: sessionInfo.name, icon: sessionInfo.avatar, appCode: sessionId, showHideWinCheck: localStorage.SHOWHIDEWINCHECK})
          }
        }).catch(() => {})
        return false
      }
    }
    if (config.environment === 'web') { // web分支
      NativeLogic.native.openShell(3, url, true) // 打开类型（1-文件，2-文件所在目录，3-外部浏览器）
    } else { // electron分支
      let { shell } = require('electron')
      shell.openExternal(url)
    }
  }
}
export default MsgRecordFn
