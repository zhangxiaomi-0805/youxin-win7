/**
 * 历史消息记录公用方法
 */
import store from '../../store'
import util from '../../utils'
var MsgRecordFn = {}
MsgRecordFn.getSearchRecords = function (searchValue, checkType) {
  console.log(searchValue)
  console.log(checkType)
  console.log(store.state.currSessionId)
  // 搜索
  return new Promise((resolve, reject) => {
    let nim = store.state.nim
    nim.getLocalMsgs({
      sessionId: store.state.currSessionId,
      desc: true,
      limit: 20,
      type: checkType,
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
  dom.childNodes.forEach((item, index) => {
    if (item.nodeType === 3) {
      text += item.data
    } else if (item.nodeType === 1) {
      if (item.tagName === 'IMG') {
        let dataKey = item.getAttribute('data-key')
        if (dataKey) {
          text += '[' + dataKey + ']'
        }
      } else if (item.tagName === 'SPAN') {
        text += item.innerText
      }
    }
  })
  return text
}
export default MsgRecordFn
