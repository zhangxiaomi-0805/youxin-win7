<template>
  <div class="g-hbf-container m-chat">
    <div class="g-hbf-header m-header">
      <div style="width: 75%;  overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        <span class="session-name b-more" @click="openSliderMenu">{{sessionName}}</span>
      </div>
      <div class="m-setting" v-if="funKey >= 2 && teamInvalid && valid">
        <a class="b-check" @click="showHistoryMsgModal"/>
        <a class="b-add" v-if="funKey <= 2" @click="createTeam()"/>
        <a class="b-more" @click="openSliderMenu"/>
      </div>
    </div>
    <div style="display: none;">{{teamInfo}}</div>
    <div style="display: none;">{{applyTeamPer}}</div>
    <div class="m-body-contain" style="right: 152px">
      <div class="g-hbf-body m-body" id="resize-chat-tp" style="bottom:150px;">
        <div class="u-position-btn" v-if="showPositionBtn" @click="scrollToUnread(unreadCount, 'click')">
          <div><span>{{unreadCount}}条新消息</span><span v-if="atCount">，{{atCount}}条@消息</span></div><i></i>
        </div>
        <a v-if="scene === 'team' && showInvitMsgTip" class="u-sysmsg-tip">
          <span class="nowap">{{applyTeamPer + '申请加入群聊'}}</span><span class="confirm" @click="confirmApplyTeamMsg">去确认</span><span class="close" @click="showInvitMsgTip = false">X</span>
        </a>
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
      <div class="g-hbf-footer m-footer" id="resize-chat-btm" style="height:150px;">
        <div class="border" id="resize-ns"></div>
        <!-- 消息列表多选弹框 -->
        <chat-select-more
          v-if="isChatCheckMore"
        />
        <!-- 消息发送框 -->
        <chat-editor
          v-else
          ref="chatEditor"
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
          :sessionName="sessionName"
        />
      </div>
    </div>
    <chat-user-card
      :otherUserInfos="userInfos"
      :scene="scene"
      :to="to"
    />
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
</template>

<script>
  import ChatEditor from './ChatEditor'
  import ChatList from './ChatList'
  import ChatNotice from './ChatNotice'
  import util from '../../utils'
  import pageUtil from '../../utils/page'
  import SliderMenu from '../float/SliderMenu'
  import Resize from '../../utils/resize.js'
  import ChatSelectMore from './ChatSelectMore'
  import ChatUserCard from './ChatUserCard'
  export default {
    name: 'chat',
    components: {
      ChatEditor,
      ChatList,
      SliderMenu,
      ChatNotice,
      ChatSelectMore,
      ChatUserCard
    },
    // 进入该页面，文档被挂载
    mounted () {
      // 消息列表是否多选
      this.eventBus.$on('updateIsCheckMoreChat', (data) => {
        this.isChatCheckMore = data.isMore
      })
      Resize.changeChatRange({max: 250, min: 90})
      // 此时设置当前会话
      this.sessionInit()
      this.eventBus.$on('showPositionBtn', (obj) => {
        this.unreadCount = obj.unreadCount
        this.atCount = obj.atCount
        if (!obj.show) {
          this.showPositionBtn = false
        }
      })
      this.getMembers()
    },
    updated () {
      if ((this.$route.query.firstFlag && this.$store.state.currSessionId !== this.sessionId)) {
        this.sessionInit()
      }
      if (this.$route.query.isReset) {
        // 从历史纪录消息跳转
        this.sessionInit()
        let dom = document.getElementById('chat-list')
        if (dom) dom.scrollTop = 0
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
    beforeDestroy () {
      this.eventBus.$off('updateIsCheckMoreChat')
      this.eventBus.$off('showPositionBtn')
    },
    // 离开该页面，此时重置当前会话
    destroyed () {
      this.$store.dispatch('resetCurrSession')
    },
    data () {
      return {
        showNewMsgTip: false,
        showPositionBtn: false,
        showInvitMsgTip: false,
        unreadCount: 0,
        atCount: 0,
        logo: './static/img/no-msg.png',
        isChatCheckMore: false
      }
    },
    computed: {
      sessionId () {
        let sessionId = this.$route.query.sessionId || this.$store.state.currSessionId
        return sessionId
      },
      noInit () {
        return this.$route.query.noInit
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
      teamMembers () {
        let teamMembers = this.$store.state.teamMembers
        let members = teamMembers && teamMembers[this.teamId]
        return members
      },
      sessionName () {
        let sessionId = this.sessionId
        let user = null
        if (/^p2p-/.test(sessionId)) {
          user = sessionId.replace(/^p2p-/, '')
          if (user === this.$store.state.userUID) {
            this.$store.commit('updateSessionName', this.myInfo.nick || this.myInfo.name) // 更新会话标题名称
            return this.myInfo.nick || this.myInfo.name
          } else if (this.isRobot) {
            return this.robotInfos[user].nick
          } else {
            let userInfo = this.userInfos[user] || {}
            this.$store.commit('updateSessionName', util.getFriendAlias(userInfo))
            return util.getFriendAlias(userInfo)
          }
        } else if (/^team-/.test(sessionId)) {
          if (this.teamInfo) {
            this.$store.commit('updateSessionName', this.teamInfo.name)
            return this.teamInfo.name
          } else if (this.lastMsg && this.lastMsg.attach && this.lastMsg.attach.team) {
            this.$store.commit('updateSessionName', this.lastMsg.attach.team.name)
            return this.lastMsg.attach.team.name
          } else {
            if (util.isDiscussGroup(this.teamInfo)) {
              this.$store.commit('updateSessionName', '讨论组')
              return '讨论组'
            }
            this.$store.commit('updateSessionName', '群')
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
      },
      power () {
        let type = 'normal'
        if (this.teamMembers) {
          for (let i = 0; i < this.teamMembers.length; i++) {
            if (this.teamMembers[i].account === this.myInfo.account) {
              type = this.teamMembers[i].type
              break
            }
          }
        }
        return type
      },
      applyTeamPer () {
        let temp = this.$store.state.sysMsgUnread
        if (this.power !== 'normal' && temp.applyTeam > 0) {
          let sysMsgs = this.$store.state.sysMsgs
          let currentSysMsg = ''
          for (let i in sysMsgs) {
            if (sysMsgs[i].type === 'applyTeam' && (sysMsgs[i].to === this.teamId) && sysMsgs[i].state === 'init') {
              currentSysMsg = sysMsgs[i]
            }
          }
          if (currentSysMsg) {
            this.showInvitMsgTip = true
            return `“${currentSysMsg.nick}”`
          }
        }
        this.showInvitMsgTip = false
        return '有好友'
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
      $route (newRoute, oldRoute) {
        // 通知chatEditor获取焦点
        if (newRoute.name === 'chat') {
          this.eventBus.$emit('getFocusFn')
        }
        if (document.querySelector('#newMsgTip')) {
          document.querySelector('#chat-list').removeChild(document.querySelector('#newMsgTip'))
        }
        this.getMembers()
        let newId = newRoute.query.sessionId
        let oldId = oldRoute.query.sessionId
        if (newId !== oldId) {
          this.syncDraft(newId, oldId)
        }
      }
    },
    methods: {
      // 获取群成员
      getMembers () {
        if (this.teamInfo) {
          if (this.teamInfo.valid && this.teamInfo.validToCurrentUser) {
            // 获取群成员
            var teamMembers = this.$store.state.teamMembers[this.to]
            if (!teamMembers || teamMembers.length < this.teamInfo.memberNum) {
              this.$store.dispatch('getTeamMembers', this.to)
            }
          }
        }
      },
      sessionInit () {
        this.$store.dispatch('resetCurrSession')
        this.$store.dispatch('setCurrSession', this.sessionId)
        this.$store.dispatch('resetNoMoreHistoryMsgs')
        this.$route.query.firstFlag = false
        this.$route.query.isReset = false
        if (this.noInit) return
        let dom = document.getElementById('chat-list')
        if (dom) {
          dom.style.visibility = 'hidden'
        }
        if (!this.msglist || this.msglist.length <= 10) {
          this.loadMore()
        }
      },
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
          let endMsg = null
          for (let key in this.msglist) {
            let msg = this.msglist[key]
            if (msg.type !== 'timeTag' && msg.time) {
              endMsg = msg
              break
            }
          }
          this.$store.dispatch('getLocalMsgs', {
            scene: this.scene,
            to: this.to,
            sessionId: this.$store.state.currSessionId,
            end: endMsg,
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
        let currSessionMsgs = this.$store.state.currSessionMsgs
        let preFirstDom = document.getElementById('chat-list').childNodes[3]
        let preFirstId = preFirstDom && preFirstDom.getAttribute('id')
        let preMsgInfo = {
          preMsgLength: currSessionMsgs.length,
          preFirstId
        }
        this.$store.commit('updatePreMsgInfo', preMsgInfo) // 加载更多之前保存当前消息长度和最前面一条消息的id
        this.getHistoryMsgs(() => {
          setTimeout(() => {
            let curMsgLength = this.$store.state.currSessionMsgs && this.$store.state.currSessionMsgs.length
            let preMsgLength = this.$store.state.preMsgInfo && this.$store.state.preMsgInfo.preMsgLength
            let preFirstId = this.$store.state.preMsgInfo && this.$store.state.preMsgInfo.preFirstId
            if (preFirstId) {
              let prevFirstObj = document.getElementById(`${preFirstId}`)
              let prevItemOne = prevFirstObj && prevFirstObj.previousSibling // 查找上一个兄弟元素节点
              let itemOffsetHeight = prevFirstObj && prevFirstObj.offsetHeight
              if (prevItemOne) {
                let prevItemTwo = prevItemOne.previousSibling // 查找上上一个兄弟元素节点
                if (prevItemTwo) {
                  itemOffsetHeight = prevItemTwo.offsetHeight
                } else {
                  itemOffsetHeight = prevItemOne.offsetHeight
                }
              }
              if (curMsgLength - 2 >= preMsgLength && prevFirstObj) {
                this.$nextTick(() => {
                  document.getElementById('chat-list').scrollTop = prevFirstObj.offsetTop - itemOffsetHeight
                })
              }
            }
          }, 0)
        })
      },
      openSliderMenu () {
        if (this.moveStatus === 2) {
          this.$store.commit('toggleSlideMenuStatus', 3)
        } else {
          this.$store.commit('toggleSlideMenuStatus', 2)
        }
      },
      showHistoryMsgModal () {
        let sessionName = this.sessionName
        let teamInfo = this.teamInfo
        // 查看历史记录
        this.eventBus.$emit('checkHistoryMsg', {isRobot: this.isRobot, scene: this.scene, to: this.to, sessionName, teamInfo})
      },
      createTeam () {
        this.$store.commit('updateOrgDisabledlist', {type: 'put', accid: this.to})
        this.eventBus.$emit('selectOrgnize', {type: 0}) // 创建讨论组（此时包含自己和该用户，所以其他人最多选198人）
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
      },
      confirmApplyTeamMsg () {
        this.showInvitMsgTip = false
        this.eventBus.$emit('updateNavBar', {navTo: 'team'})
        this.$router.push({name: 'team', query: {isApplyTeam: true}})
      },
      syncDraft (newId, oldId) {
        // 同步草稿
        let result = this.$refs.chatEditor ? this.$refs.chatEditor.getEditContent() : null
        // br剪切板未过滤，手动置为无效
        if (result && result.innerHTML === '<br>') {
          result.innerHTML = ''
        }
        // console.log('result', result)
        let prevSession = this.$store.state.sessionlist.find(item => {
          return item.id === oldId
        })
        // 处理当前会话场景
        this.$store.commit('updateCurrentDraft', { type: 'toggle', sessionId: newId })
        // 更新上一个会话草稿状态
        if (prevSession && result) {
          let draftMsg = result.innerHTML ? { show: true, draftMsg: result.msgToSent } : null
          if (prevSession.localCustom) {
            prevSession.localCustom.draftMsg = draftMsg
            prevSession.localCustom.draftInner = result.innerHTML
          } else {
            prevSession.localCustom = { draftMsg, draftInner: result.innerHTML }
          }
          // console.log('prevSession.localCustom', prevSession.localCustom)
          // 更新本地信息
          this.$store.state.nim.updateLocalSession({
            id: prevSession.id,
            localCustom: prevSession.localCustom
          })
        }
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
    -webkit-app-region: no-drag;
    height: 14px;
    line-height: 14px;
    font-size: 17px;
    color: rgba(11,13,12,1);
    cursor: pointer;
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

  .u-sysmsg-tip {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 2px;
    box-sizing: border-box;
    width: 100%;
    height: 40px;
    padding: 0 40px;
    background: #fff;
    box-shadow:0px 5px 11px 0px rgba(0,0,0,0.05);
    z-index: 30;
    font-size:13px;
    color:rgba(153,153,153,1);
  }
  .u-sysmsg-tip .confirm {
    color: rgba(4,154,255,1);
    margin-left: 5px;
  }
  .u-sysmsg-tip .close {
    position: absolute;
    right: 12px;
    top: 10px;
  }
  .u-sysmsg-tip .nowap {
    display: inline-block;
    max-width: 85%;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
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
