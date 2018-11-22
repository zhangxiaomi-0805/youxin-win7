/**
 * 历史消息记录公用方法
 */
import util from '../../utils'
var MsgRecordFn = {}

MsgRecordFn.forwordMsg = function (type, msg) {
  // 转发消息 ***** type=8---多条转发， type=7---单条转发， msg---要转发的消息
  let sessionlist = this.$store.state.sessionlist.filter((item, index) => {
    item.name = ''
    item.avatar = ''
    if (item.scene === 'p2p') {
      let userInfo = null
      if (item.to !== this.myPhoneId) {
        userInfo = this.userInfos[item.to]
      } else {
        userInfo = Object.assign({}, this.myInfo)
        // userInfo.alias = '我的手机'
        // userInfo.avatar = `${config.myPhoneIcon}`
      }
      if (userInfo) {
        item.name = util.getFriendAlias(userInfo)
        item.avatar = userInfo.avatar
      }
    } else if (item.scene === 'team') {
      let teamInfo = null
      teamInfo = this.$store.state.teamlist.find(team => {
        if (team.teamId === item.to) {
          item.memberNum = team.memberNum
        }
        return team.teamId === item.to
      })
      if (teamInfo) {
        item.name = teamInfo.name
        item.avatar = teamInfo.avatar || this.myGroupIcon
      } else if (item.lastMsg && item.lastMsg.attach && item.lastMsg.attach.team) {
        item.name = item.lastMsg.attach.team.name
        item.avatar = item.avatar || this.myGroupIcon
      } else {
        item.name = `群${item.to}`
        item.avatar = item.avatar || this.myGroupIcon
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
  this.eventBus.$emit('selectContact', {type, sidelist, msg})
}

MsgRecordFn.deleteMsgs = function (type, msg) {
  // 删除消息 ***** type=8---多条转发， type=7---单条转发， msg---要转发的消息
  if (type === 7) {
    for (let i = 0; i < msg.length; i++) {
      this.$store.dispatch('deleteMsg', msg[i])
    }
  }
  if (type === 8) {
    for (let i = 0; i < msg.length; i++) {
      this.$store.dispatch('deleteMsg', msg[i])
    }
  }
}

MsgRecordFn.copyAll = function (target) {
  // 右键复制全选
  return new Promise(async (resolve, reject) => {
    let isNeedAllSelect = true
    let selection = window.getSelection()
    let selectInfo = {}
    console.log(target)
    if (this.getSelectedText().childNodes && this.getSelectedText().childNodes.length > 0) {
      let anchorNode = selection.anchorNode
      let focusNode = selection.focusNode
      if (this.isChildOf(anchorNode, target) && this.isChildOf(focusNode, target)) {
        isNeedAllSelect = false
        let range = selection.getRangeAt(0)
        selectInfo = {
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
    resolve(selectInfo)
  })
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
