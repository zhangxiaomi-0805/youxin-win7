<template>
<div class="g-hbf-container m-chat">
  <div class="g-hbf-header m-header">
    <span class="session-name">{{sessionName}}</span>
    <div class="m-setting" v-if="funKey >= 2 && teamInvalid && valid">
      <!-- <a class="b-check"/> -->
      <a class="b-add" @click="createTeam()"/>
      <!-- <a class="b-add" v-if="funKey <= 2" @click="createTeam()"/> -->
      <a class="b-more" @click="openSliderMenu"/>
    </div>
  </div>
  <div style="display: none;">{{teamInfo}}</div>
  <div v-if="teamInvalid && valid">
    <div class="m-body-contain" :style="{right: this.scene === 'team' ? '152px' : 0}">
      <div class="g-hbf-body m-body" id="resize-chat-tp" style="bottom:150px;">
        <div class="u-position-btn" v-if="showPositionBtn" @click="scrollToUnread(unreadCount, 'click')">
          <div><span>{{unreadCount}}条新消息</span><span v-if="atCount">，{{atCount}}条@消息</span></div>
          <i></i>
        </div>
        <chat-list
          type="session"
          :scene="scene"
          :to="to"
          :msglist="msglist"
          :userInfos="userInfos"
          :myInfo="myInfo"
          :teamId="teamId"
          :isRobot="isRobot"
          :canLoadMore="canLoadMore"
          @load-more="loadMore"/>
      </div>
      <!-- <div class='newMsgHint' v-if="showNewMsgTip === true" @click="scrollToBottom">
        有新消息
      </div> -->
      <div class="g-hbf-footer m-footer" id="resize-chat-btm" style="height:150px;">
        <div class="border" id="resize-ns"></div>
        <chat-editor
          type="session"
          :scene="scene"
          :to="to"
          :isRobot="isRobot"
          :invalid="!teamInvalid || muteInTeam"
          :invalidHint="sendInvalidHint"
          :advancedTeam="teamInfo && teamInfo.type === 'advanced'"
          :teamId="teamId"
          :teamInfo="teamInfo"
          :userInfos="userInfos"
        />
      </div>
    </div>
    <chat-notice
      :userInfos="userInfos"
      :myInfo="myInfo"
      :scene="scene"
      :to="to"
      :teamId="teamId"
      :teamInfo="teamInfo"/>
    <slider-menu
      :scene="scene"
      :to="to"
      :teamId="teamId"
      :teamInfo="teamInfo"
      :sessionId="sessionId"
      :myInfo="myInfo"/>
  </div>
  <div v-else class="m-body-default">
    <div><img style="width: 158px; height: 131px;" :src="logo"><div class="no-msg">{{showLastText()}}</div></div>
  </div>
</div>
</template>

<script>
import ChatEditor from './ChatEditor'
import ChatList from './ChatList'
import ChatNotice from './ChatNotice'
import util from '../../utils'
import pageUtil from '../../utils/page'
import SliderMenu from '../float/SliderMenu'
import Resize from '../../utils/resize.js'
export default {
  name: 'chat',
  components: {
    ChatEditor,
    ChatList,
    SliderMenu,
    ChatNotice
  },
  // 进入该页面，文档被挂载
  mounted () {
    Resize.changeChatRange({max: 250, min: 90})
    this.$store.dispatch('showLoading')
    // 此时设置当前会话
    this.$store.dispatch('setCurrSession', this.sessionId)
    let dom = document.getElementById('chat-list')
    if (dom) {
      dom.style.visibility = 'hidden'
    }
    // this.scrollToBottom()
    this.$store.dispatch('resetNoMoreHistoryMsgs')
    this.$route.query.firstFlag = false
    setTimeout(() => {
      this.$store.dispatch('hideLoading')
    }, 1000)
    if (!this.msglist || this.msglist.length <= 10) {
      this.loadMore()
    }
    this.eventBus.$on('showPositionBtn', (obj) => {
      this.unreadCount = obj.unreadCount
      this.atCount = obj.atCount
      if (!obj.show) {
        this.showPositionBtn = false
      }
    })
  },
  updated () {
    if (this.$route.query.firstFlag && this.$store.state.currSessionId !== this.sessionId) {
      this.$store.dispatch('resetCurrSession')
      this.$store.dispatch('setCurrSession', this.sessionId)
      let dom = document.getElementById('chat-list')
      if (dom) {
        dom.style.visibility = 'hidden'
      }
      this.$store.dispatch('resetNoMoreHistoryMsgs')
      this.$route.query.firstFlag = false
      if (!this.msglist || this.msglist.length <= 10) {
        this.loadMore()
      }
    }
    if (this.msglist.length > 10 || !this.canLoadMore) {
      this.$nextTick(() => {
        let chatList = document.getElementById('chat-list')
        if (chatList && (chatList.style.visibility === 'hidden')) {
          this.scrollToBottom()
          chatList.style.visibility = 'visible'
          if (this.unreadCount > 0) {
            this.isShowPositionBtn()
          }
          let _this = this
          document.querySelector('#chat-list').onscroll = function () {
            if (_this.unreadCount > 0 && _this.showPositionBtn) {
              _this.scrollToUnread(_this.unreadCount, 'scroll')
            }
          }
        }
      })
    }
  },
  // 离开该页面，此时重置当前会话
  destroyed () {
    this.$store.dispatch('resetCurrSession')
  },
  data () {
    return {
      showNewMsgTip: false,
      showPositionBtn: false,
      unreadCount: 0,
      atCount: 0,
      logo: './static/img/no-msg.png'
    }
  },
  computed: {
    sessionId () {
      let sessionId = this.$route.query.sessionId || this.$store.state.currSessionId
      return sessionId
    },
    lastMsg () {
      let session = this.$store.state.sessionlist.find(item => {
        return item.id === this.sessionId
      })
      if (session) {
        return session.lastMsg
      }
      return null
    },
    nicks () {
      if (this.lastMsg && this.lastMsg.attach) {
        return this.lastMsg.attach.team.owner
      }
      return ''
    },
    teamId () {
      return this.sessionId.replace('team-', '')
    },
    sessionName () {
      let sessionId = this.sessionId
      let user = null
      if (/^p2p-/.test(sessionId)) {
        user = sessionId.replace(/^p2p-/, '')
        if (user === this.$store.state.userUID) {
          return this.myInfo.nick || this.myInfo.name
        } else if (this.isRobot) {
          return this.robotInfos[user].nick
        } else {
          let userInfo = this.userInfos[user] || {}
          return util.getFriendAlias(userInfo)
        }
      } else if (/^team-/.test(sessionId)) {
        if (this.teamInfo && this.teamInvalid && this.valid && this.$store.state.networkStatus === 200) {
          // 获取群成员
          var teamMembers = this.$store.state.teamMembers[this.to]
          if (teamMembers === undefined || teamMembers.length < this.teamInfo.memberNum) {
            this.$store.dispatch('getTeamMembers', this.to)
          }
          return this.teamInfo.name
        } else if (this.lastMsg && this.lastMsg.attach && this.lastMsg.attach.team) {
          return this.lastMsg.attach.team.name
        } else {
          return '群'
        }
      }
    },
    scene () {
      return util.parseSession(this.sessionId).scene
    },
    to () {
      return util.parseSession(this.sessionId).to
    },
    // 判断是否是机器人
    isRobot () {
      let sessionId = this.sessionId
      let user = null
      if (/^p2p-/.test(sessionId)) {
        user = sessionId.replace(/^p2p-/, '')
        if (this.robotInfos[user]) {
          return true
        }
      }
      return false
    },
    myInfo () {
      return this.$store.state.myInfo
    },
    userInfos () {
      return this.$store.state.userInfos
    },
    robotInfos () {
      return this.$store.state.robotInfos
    },
    msglist () {
      let msgs = this.$store.state.currSessionMsgs
      return msgs
    },
    teamInfo () {
      if (this.scene === 'team') {
        var teamId = this.sessionId.replace('team-', '')
        let teamInfo = this.$store.state.teamlist.find(team => {
          return team.teamId === teamId
        })
        if (teamInfo) {
          return teamInfo
        }
      }
      return undefined
    },
    muteInTeam () {
      if (this.scene !== 'team') return false
      if (!this.teamInfo) return false
      var teamMembers = this.$store.state.teamMembers
      var Members = teamMembers && teamMembers[this.teamInfo.teamId]
      var selfInTeam = Members && Members.find(item => {
        return item.account === this.$store.state.userUID
      })
      return (selfInTeam && selfInTeam.mute) || false
    },
    valid () {
      // 被解散
      if (this.scene === 'team') {
        return !!(this.teamInfo && (this.teamInfo.valid === undefined || this.teamInfo.valid))
      }
      return true
    },
    teamInvalid () {
      // 被踢
      if (this.scene === 'team') {
        return !!(this.teamInfo && (this.teamInfo.validToCurrentUser === undefined || this.teamInfo.validToCurrentUser))
      }
      return true
    },
    sendInvalidHint () {
      if (this.scene === 'team' && this.teamInvalid) {
        return `您已不在该${this.teamInfo && this.teamInfo.type === 'normal' ? '讨论组' : '群'}，不能发送消息`
      } else if (this.muteInTeam) {
        return '您已被禁言'
      }
      return '无权限发送消息'
    },
    canLoadMore () {
      return !this.$store.state.noMoreHistoryMsgs
    },
    incomingMsg () {
      return this.$store.state.newMsg
    },
    funKey () {
      let sessionId = this.sessionId
      let user = null
      if (/^p2p-/.test(sessionId)) {
        user = sessionId.replace(/^p2p-/, '')
        if (user === this.$store.state.userUID) {
          return 0
        } else if (this.isRobot) {
          return 1
        } else {
          return 2
        }
      } else if (/^team-/.test(sessionId)) {
        if (this.teamInfo) {
          return 3
        } else {
          return 4
        }
      }
    },
    moveStatus () {
      return this.$store.state.slideMenuStatus
    },
    teamlist () {
      let teamlist = this.$store.state.teamlist.filter(item => {
        return item.valid && item.validToCurrentUser
      })
      return teamlist
    }
  },
  watch: {
    incomingMsg (newMsg, oldMsg) {
      let isCurrent = newMsg.sessionId === this.$store.state.currSessionId
      if (!isCurrent) return
      let gap = pageUtil.getChatListHeight() - pageUtil.getChatListScroll() - pageUtil.getChatListClientHeight()
      if (gap > 100) {
        this.showNewMsgTip = true
      } else {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    $route () {
      if (document.querySelector('#newMsgTip')) {
        document.querySelector('#chat-list').removeChild(document.querySelector('#newMsgTip'))
      }
    }
  },
  methods: {
    scrollToBottom () {
      pageUtil.scrollChatListDown()
      this.showNewMsgTip = false
    },
    isShowPositionBtn (num) {
      let liArr = [...document.querySelectorAll('#chat-list .u-msg')].reverse()
      let bodyH = document.querySelector('#chat-list').offsetHeight
      let msgIndex = 0
      let msgHeight = 0
      for (let i = 0; i < liArr.length; i++) {
        msgHeight += liArr[i].offsetHeight
        if ([...liArr[i].classList].includes('item-isChatMsg')) {
          msgIndex++
        }
        if (msgHeight > bodyH) {
          if (msgIndex >= this.unreadCount) {
            this.showPositionBtn = false
            break
          } else {
            this.showPositionBtn = true
            break
          }
        }
      }
    },
    getHistoryMsgs (callBack) {
      if (this.canLoadMore) {
        this.$store.dispatch('getLocalMsgs', {
          scene: this.scene,
          to: this.to,
          sessionId: this.$store.state.currSessionId,
          callBack: callBack
        })
      }
    },
    scrollToUnread (num, type) {
      let liArr = document.querySelectorAll('#chat-list .item-isChatMsg')
      let chatList = document.getElementById('chat-list')
      if (liArr.length < num) {
        // 拉取历史记录
        this.getHistoryMsgs(() => this.scrollToUnread(num))
      } else {
        let li = liArr[liArr.length - num]
        let offsetTop = 0
        if (li && li.offsetTop) {
          offsetTop = li.offsetTop
        }
        if (type === 'click') {
          this.unreadCount = 0
          this.atCount = 0
          this.showPositionBtn = false
          document.querySelector('#chat-list').insertBefore(this.insertMsgTip(), li)
          this.scrollAnimate(chatList.scrollTop, offsetTop)
        } else if (type === 'scroll') {
          if (chatList.scrollTop <= offsetTop + 40) {
            this.unreadCount = 0
            this.atCount = 0
            this.showPositionBtn = false
          }
        }
      }
    },
    // 滚动过渡动画
    scrollAnimate (curTop, toTop) {
      let timer = null
      let chatList = document.getElementById('chat-list')
      let scrollStep = (curTop - toTop) / 400 * 15
      if (chatList.scrollTop - toTop > scrollStep * 2) {
        timer = setTimeout(() => {
          chatList.scrollTop -= scrollStep
          this.scrollAnimate(curTop, toTop)
        }, 15)
      } else {
        chatList.scrollTop = toTop
        if (timer) {
          clearTimeout(timer)
          timer = null
        }
      }
    },
    // 插入以下为新消息的提示节点
    insertMsgTip () {
      let newMsgTip = document.createElement('div')
      let span = document.createElement('span')
      let i1 = document.createElement('i')
      let i2 = document.createElement('i')
      newMsgTip.id = 'newMsgTip'
      span.innerText = '以下为新消息'
      i1.style.height = '1px'
      i1.style.flex = 1
      i1.style.background = '#dadada'
      i2.style.height = '1px'
      i2.style.flex = 1
      i2.style.background = '#dadada'
      span.style.color = '#afb2b1'
      span.style.margin = '0 3px'
      span.style.fontSize = '12px'
      newMsgTip.style.display = 'flex'
      newMsgTip.style.justifyContent = 'space-between'
      newMsgTip.style.alignItems = 'center'
      newMsgTip.style.height = '40px'
      newMsgTip.style.width = '100%'
      newMsgTip.style.boxSizing = 'border-box'
      newMsgTip.style.padding = '0 20px'
      newMsgTip.appendChild(i1)
      newMsgTip.appendChild(span)
      newMsgTip.appendChild(i2)
      return newMsgTip
    },
    loadMore () {
      this.getHistoryMsgs()
    },
    openSliderMenu () {
      if (this.moveStatus === 2) {
        this.$store.commit('toggleSlideMenuStatus', 3)
      } else {
        this.$store.commit('toggleSlideMenuStatus', 2)
      }
    },
    createTeam () {
      this.$store.commit('updateOrgDisabledlist', {type: 'put', accid: this.to})
      this.eventBus.$emit('selectOrgnize', {type: 2})
    },
    showLastText () {
      if (this.lastMsg && this.lastMsg.attach) {
        let type = this.lastMsg.attach.type
        if (type === 'dismissTeam') {
          return '该群已被解散'
        } else if (type === 'removeTeamMembers') {
          return `你已被${this.nicks}移出本群`
        }
      } else if (!this.valid) {
        return '该群已被解散'
      } else if (!this.teamInvalid) {
        return `你已被${this.nicks}移出本群`
      }
      return ''
    }
  }
}
</script>

<style scoped>
.m-chat .m-body-contain {
  position: absolute;
  left: 0;
  top: 31px;
  bottom: 0;
  right: 11.5rem;
}

.m-chat .m-header {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  /* align-items: center; */
  justify-content: space-between;
  height: 31px;
  border-bottom: 1px solid rgba(214,214,214,1);
  padding-top: 2.5px;
  padding-left: 20px;
  padding-right: 10px;
}

.m-chat .m-header .session-name {
  height: 14px;
  line-height: 14px;
  font-size: 14px;
  color: rgba(11,13,12,1);
}

.m-chat .m-body {
  top: 0;
  bottom: 14rem;
  background-color: rgba(242,242,242,1);
}

.m-chat .m-footer {
  height: 14rem;
}

.m-chat .m-footer .border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  cursor: n-resize;
  border-top-style: solid; 
  border-top-width: 1px; 
  border-color:rgba(211,211,211,1);
  z-index: 20;
}

.u-position-btn{
  position: absolute;
  right: 0;
  top: 20px;
  z-index: 49;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  padding: 0 10px;
  min-width: 50px;
  height: 32px;
  border-radius: 20px 0 0 20px;
  background: rgba(0,0,0,0.5);
}
.u-position-btn span{
  color: #fff;
  line-height: 32px;
  font-size: 14px;
}
.u-position-btn i{
  margin-left: 6px;
  width: 11px;
  height: 11px;
  background-image: url(../../../../static/img/edit/position-btn-up.png);
}

.invalidHint {
  width: 100%;
  height: 2rem;
  line-height: 2rem;
  text-align: center;
  background-color: rgb(251, 252, 190);
  color: gray;
  font-size: 0.9rem;
}

.newMsgHint {
  width: 100%;
  height: 2rem;
  line-height: 2rem;
  text-align: center;
  background-color: rgb(251, 252, 190);
  color: gray;
  font-size: 0.9rem;
  bottom: 14rem;
  position: absolute;
  opacity: 0.8;
}

  .m-setting {
    display: flex;
    justify-content: center;
  }

  .m-setting .b-check {
    -webkit-app-region: no-drag;
    display: inline-block;
    vertical-align: middle;
    width: 17px;
    height: 17px;
    background-image: url('../../../../static/img/setting/record.png');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 100% 100%;
    margin-right: 20px;
    transition: all .3s linear;
  }

  .m-setting .b-check:hover, .b-check:focus {
    background-image: url('../../../../static/img/setting/record-h.png');
  }
  .m-setting .b-check:active {
    background-image: url('../../../../static/img/setting/record-p.png');
  }

  .m-setting .b-add {
    -webkit-app-region: no-drag;
    display: inline-block;
    vertical-align: middle;
    width: 17px;
    height: 17px;
    background-image: url('../../../../static/img/setting/member.png');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 100% 100%;
    margin-right: 20px;
    transition: all .3s linear;
  }

  .m-setting .b-add:hover, .b-add:focus {
    background-image: url('../../../../static/img/setting/member-h.png');
  }
  .m-setting .b-add:active {
    background-image: url('../../../../static/img/setting/member-p.png');
  }

  .m-setting .b-more {
    -webkit-app-region: no-drag;
    display: inline-block;
    vertical-align: middle;
    width: 17px;
    height: 17px;
    background-image: url('../../../../static/img/setting/chat.png');
    background-repeat: no-repeat;
    background-position: center center;
     background-size: 100% 100%;
    transition: all .3s linear;
  }

  .m-setting .b-more:hover, .b-more:focus {
    background-image: url('../../../../static/img/setting/chat-h.png');
  }
  .m-setting .b-more:active {
    background-image: url('../../../../static/img/setting/chat-p.png');
  }

  .m-body-default {
    position: absolute;
    top: 31px;
    bottom: 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    /* align-items: center; */
    justify-content: center;
    padding-top: 28%;
    background-color: rgba(242,242,242,1);
  }

  .m-body-default .no-msg {
    font-size: 16px;
    color: #333;
    letter-spacing: 0;
    text-align: center;
  }
</style>
