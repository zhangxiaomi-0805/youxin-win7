<template>
<div class="m-main-list" id="resize-side-lf" style="width:270px;">
  <div class="u-search searchevent" v-clickoutside="clearStatus">
    <div class="u-cont" @mouseup="showPaste">
      <input :class="showSearch ? 'active' : ''" type="text" 
        v-model="searchValue" placeholder="搜索"
        @focus="showSearch = true" ref="editDiv"
        @keyup="keyToSearch($event)"
      />
      <span v-if="showSearch" class="clear" @click="clearStatus"/>
    </div>
  </div>
  <div class="u-editor-paste-btn" v-if="showPasteBtn && !isXp" :style="{left: pasteLeft + 'px', top: pasteTop + 'px'}" @click="onPaste($event, 'click')" >粘贴</div>
  <div class="u-tips neterr" v-if="networkStatus !== 200"><i></i><span>当前网络不可用，请检查你的网络设置</span></div>
  <div class="u-tips mobile-online" v-else-if="mobileOnline"><i></i><span>手机端已登录</span></div>
  <div class="u-nomsg" v-if="sessionlist.length <= 0">暂无聊天消息~~</div>
  <search v-if="showSearch" type="all" :value="searchValue" :clearStatus="clearStatus"/>
  <ul class="u-list" id="nsession-list" :style="{top: networkStatus !== 200 ? '92px' : mobileOnline ? '92px' : '56px'}" ref="sessionList" @scroll="scrollTop = $event.target.scrollTop">
    <li 
      class="u-list-item"
      @click="toggleSelect(session.id)"
      @mouseup.stop="onShowMenu($event, session)"
      :style="hasBorder && session.id === acSessionId ? {border: '1px solid rgba(4,154,255,1)'}: (session.id === activeId ? {borderRight:'2px solid rgba(4,154,255,1)'} : {border: '1px solid transparent'})"
      :class="session.id === activeId ? 'u-list-item-active' : ''"
      v-for="session in sessionlist"
      :key="session.id" :id="session.id"
    >
      <a @click="toggleChat(session)" style="width:100%;cursor:default;" :ref="session.id" class="u-router-link"
        @mouseenter.stop="toggleShowDeleteBtn(1, session)"
        @mouseleave.stop="toggleShowDeleteBtn(2)"
      >
        <div class="u-list-item-container" :class="session.localCustom && session.localCustom.topTime ? 'u-list-item-isTop' : ''">
          <div style="display: flex; align-items: center;width:70%;">
            <div
              class="icon"
              style="position: relative;"
            >
              <img
                :src="session.avatar"
                style="width: 100%;height: 100%;border-radius: 50%;"
              />
              <!-- 去掉蒙层 -->
              <!-- <div
                v-if="session.status !== 0 && session.status !== 1 && session.scene === 'p2p' && session.to !== myPhoneId"
                class="u-status-cover"
              /> -->
            </div>
            <div class="multi-content">
              <div class="title" style="width: 95%;">{{session.name}}</div>
              <div class="content">
                <span class="fail-icon" v-if="session.fileStatus === 'fail' && !(session.localCustom && session.localCustom.draftMsg && session.localCustom.draftMsg.show)"></span>
                <span v-if="session.localCustom && session.localCustom.draftMsg && curSessionId !== session.id">
                  <span style="color: #F43530;">[草稿]</span>
                  <span>{{showDraft(session.localCustom.draftMsg.draftMsg)}}</span>
                </span>
                <span v-else>
                  <span v-if="session.localCustom && session.localCustom.at && !lastMsgStatus(session)" style="color: #F43530;">[有人@你] </span>
                  <span v-if="lastMsgStatus(session)" style="color: #F43530;">{{session.lastMsgShow}}</span>
                  <span v-else-if="session.lastMsgShow">{{session.lastMsgShow}}</span>
                </span>
              </div>
            </div>
          </div>
          <div style="margin-right:0.75rem;display:flex;flex-direction:column;height: 40px;align-items:flex-end;justify-content:space-between">
            <div style="color:#AFB2B1;overflow:hidden;white-space:nowrap;font-size: 12px;">{{session.updateTimeShow}}</div>
            <!-- 删除按钮 -->
            <div v-if="session.id === selectedId && showDelete" class="delete-btn" @click.stop="deleteSessionFast(session)"></div>

            <!-- 消息免打扰 -->
            <div v-if="!(session.id === selectedId && showDelete) && isMute(session)" class="mute-contain">
              <span class="mute"></span>
              <span v-if="session.unread > 0" class="nomsg"></span>
            </div>
            <!-- <span v-else-if="!(session.id === selectedId && showDelete) && lastMsgStatus(session)" class="u-unread unread-num">1</span> -->
            <span v-else-if="!(session.id === selectedId && showDelete) && session.unread > 0" class="u-unread unread-num">{{session.unread > 99 ? "99+" : session.unread}}</span>
            <!-- <div v-else style="width: 15px;height: 15px;"></div> -->
          </div>
        </div>
      </a>
    </li>
  </ul>
  <div class="border" id="resize-we"></div>
</div>
</template>

<script>
import util from '../../utils'
import config from '../../configs'
import pageUtil from '../../utils/page'
import Search from '../search/Search.vue'
import clickoutside from '../../utils/clickoutside.js'
import Request from '../../utils/request'
import NativeLogic from '../../utils/nativeLogic.js'
import emojiObj from '../../configs/emoji'
export default {
  name: 'session-list',
  directives: {clickoutside},
  components: {Search},
  mounted () {
    this.setDragArea() // 设置可拖拽高度
    var _this = this
    // 定位会话列表 --- 系统托盘闪烁时，点击系统托盘
    this.eventBus.$on('positionSession', function () {
      _this.positionSession()
    })
    this.eventBus.$on('locationMainListItem', function (data) {
      if (data.listType === 'session') {
        setTimeout(() => {
          pageUtil.scrollMainList('nsession-list', data.activeId)
          _this.activeId = data.activeId
        }, 500)
      }
    })
    this.eventBus.$on('toggleSelect', function (data) {
      _this.activeId = data.sessionId
      _this.scrollToSession()
    })
    this.eventBus.$on('toggleSession', () => {
      let ul = document.getElementById('nsession-list')
      if (ul && ul.scrollTop !== 0) {
        let length = this.newSessionlistTopLength
        for (let i in this.sessionlist) {
          let session = this.sessionlist[i]
          if (session.id === this.activeId && session.localCustom && session.localCustom.topTime) {
            length = 0
            break
          }
        }
        ul.scrollTop = 68 * length
      }
    })
  },
  beforeDestroy () {
    this.eventBus.$off('positionSession')
    this.eventBus.$off('locationMainListItem')
    this.eventBus.$off('toggleSelect')
    this.eventBus.$off('toggleSession')
  },
  watch: {
    sessionlist (newData, oldData) {
      if (newData.length === 0) {
        this.$router.push({name: 'session-default'})
        return false
      }
    }
  },
  activated () {
    // 重新加载聊天页
    let activeId = this.activeId
    let dom = this.$refs[activeId]
    this.$nextTick(() => {
      if (dom && dom[0] && dom[0].click) {
        dom[0].click()
      } else {
        this.$router.push({name: 'session-default'})
      }
    })
    // 处理滚动条位置
    this.$refs.sessionList.scrollTop = this.scrollTop
  },
  data () {
    return {
      isXp: config.environment === 'web',
      showPasteBtn: false,
      activeId: '',
      scrollTop: 0,
      showSearch: false,
      searchValue: '',
      myPhoneIcon: config.myPhoneIcon,
      myGroupIcon: config.defaultGroupIcon,
      menuId: '',
      newSessionlistTopLength: 0,
      showDelete: false, // 快捷删除按钮
      selectedId: -1 // 当前鼠标移入的会话id
    }
  },
  updated () {
    window.document.body.addEventListener('click', () => {
      this.showPasteBtn = false
    })
  },
  computed: {
    moveStatus () {
      return this.$store.state.slideMenuStatus
    },
    networkStatus () {
      return this.$store.state.networkStatus
    },
    // 判断手机在线
    mobileOnline () {
      return this.$store.state.mobileOnline
    },
    hasBorder () {
      if (this.$store.state.showListOptions) {
        return true
      }
      return false
    },
    acSessionId () {
      return this.$store.state.sessionAc
    },
    sysMsgUnread () {
      let temp = this.$store.state.sysMsgUnread
      let sysMsgUnread = temp.addFriend || 0
      sysMsgUnread += temp.team || 0
      let customSysMsgUnread = this.$store.state.customSysMsgUnread
      let total = sysMsgUnread + customSysMsgUnread
      return total > 99 ? 99 : total
    },
    mutelist () {
      return this.$store.state.mutelist
    },
    userInfos () {
      return this.$store.state.userInfos
    },
    myInfo () {
      return this.$store.state.myInfo
    },
    myPhoneId () {
      return `${this.$store.state.userUID}`
    },
    curSessionId () {
      return this.$store.state.currSessionId
    },
    sessionlist () {
      let newSessionlist = JSON.parse(JSON.stringify(this.$store.state.sessionlist))
      let sessionlist = newSessionlist.filter(item => {
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
          let teamInfo = this.$store.state.teamlist.find(team => {
            return team.teamId === item.to
          })
          if (teamInfo) {
            item.name = teamInfo.name
            item.avatar = teamInfo.avatar || this.myGroupIcon
          } else if (item.lastMsg && item.lastMsg.attach && item.lastMsg.attach.team) {
            item.name = item.lastMsg.attach.team.name
            item.avatar = item.avatar || this.myGroupIcon
          } else {
            item.name = item.to
            item.avatar = item.avatar || this.myGroupIcon
          }
        }
        let lastMsg = item.lastMsg || {}
        if (lastMsg.type === 'text') {
          item.lastMsgShow = lastMsg.text || ''
        } else if (lastMsg.type === 'custom') {
          item.lastMsgShow = util.parseCustomMsg(lastMsg)
        } else if (lastMsg.scene === 'team' && lastMsg.type === 'notification') {
          item.lastMsgShow = util.generateTeamSysmMsg(lastMsg)
        } else if (!lastMsg.type) {
          item.lastMsgShow = ''
        } else if (lastMsg.tip) {
          item.lastMsgShow = lastMsg.tip
        } else if (util.mapMsgType(lastMsg)) {
          item.lastMsgShow = `[${util.mapMsgType(lastMsg)}]`
        }
        if (item.updateTime) {
          item.updateTimeShow = util.formatDate(item.updateTime, true)
        }
        if (item.name && item.avatar) { // 避免显示空的现象
          return item
        }
      })
      let sessionlistTop = sessionlist.filter((item) => {
        if (item.localCustom && item.localCustom.topTime) {
          let time = item.lastMsg ? item.lastMsg.time : 0
          if (item.localCustom.topTime - time > 0) {
            item.compareTime = item.localCustom.topTime
          } else {
            item.compareTime = time
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
      this.newSessionlistTopLength = newSessionlistTop.length
      return [...newSessionlistTop, ...sessionlistBot]
    }
  },
  methods: {
    // 判断快捷删除按钮显示与否
    toggleShowDeleteBtn (type, session) {
      if (type === 1 && session) { // 鼠标移入时
        // console.log('鼠标移入时=====')
        this.selectedId = session.id
        this.showDelete = session.unread <= 0
        // console.log('this.selectedId=====', this.selectedId)
        // console.log('session.id=====', session.id)
        // console.log('this.showDelete=====', this.showDelete)
      } else if (type === 2) { // 鼠标移出时
        // console.log('鼠标移出时=====')
        this.selectedId = -1
        this.showDelete = false
        // console.log('this.selectedId=====', this.selectedId)
        // console.log('this.showDelete=====', this.showDelete)
      }
    },
    // 回车触发搜索
    keyToSearch (e) {
      this.eventBus.$emit('_keyToSearch', {event: e})
    },
    // 右键粘贴
    showPaste (e) {
      if (e.button === 2 && config.environment !== 'web') {
        e.preventDefault()
        this.showPasteBtn = true
        this.pasteLeft = e.offsetX
        this.pasteTop = e.offsetY
      }
    },
    // 粘贴事件
    async onPaste (e) {
      e && e.preventDefault()
      let text = null
      if (config.environment !== 'web') {
        const { clipboard } = require('electron')
        if (clipboard.readText() && !clipboard.read('public.file-url')) {
          text = clipboard.readText()
        }
      }
      if (text) {
        // 粘贴文字
        // 得到剪贴板中的文本
        let showText = ''
        if (text.length + this.msgTransform().textLen > 5000) {
          showText = text.slice(0, 5000 - this.msgTransform().textLen)
        } else {
          showText = text
        }
        let emojiItems = showText.match(/\[[\u4e00-\u9fa5]+\]/g)
        let copyText = showText
        let emojiCnt = emojiObj.emojiList.emoji
        if (emojiItems && emojiItems.length > 0) {
          emojiItems.forEach((item) => {
            let index = copyText.indexOf(item)
            if (index !== 0) {
              document.execCommand('insertText', false, copyText.slice(0, index))
            }
            if (emojiCnt[item]) {
              let dataKey = item.slice(1, -1)
              let emoji = `<img class="emoji-small" style="width: 24px;height: 24px;vertical-align: middle;" data-key="${dataKey}" src="${emojiCnt[item].img}">`
              document.execCommand('insertHTML', false, emoji)
            } else {
              document.execCommand('insertText', false, item)
            }
            copyText = copyText.slice(index + item.length)
          })
        }
        if (copyText) {
          this.searchValue = copyText
          document.execCommand('insertText', false, copyText)
        }
      }
    },
    msgTransform () {
      let msgText = ''
      let msgImg = 0
      let childNodes = [...(this.$refs.editDiv.childNodes)]
      childNodes.forEach((item, index) => {
        if (item.nodeType === 3) {
          msgText += item.data
        } else if (item.nodeType === 1) {
          if (item.outerHTML === '<div><br></div>') {
            msgText += '\r\n'
          } else if (item.tagName === 'IMG') {
            if (item.getAttribute('data-key')) {
              msgText += item.getAttribute('data-key')
            }
            if (item.getAttribute('data-obj')) {
              msgImg++
            }
          } else if (item.tagName === 'DIV') {
            msgText += '\r\n' + item.innerText
          }
        }
      })
      return {
        textLen: msgText.length,
        imgLen: msgImg
      }
    },
    // 快捷删除会话
    deleteSessionFast (session) {
      this.$store.dispatch('deleteSession', {id: session.id, that: this})
    },
    // 点击系统托盘定位会话列表---有未读消息时
    positionSession () {
      let _this = this
      let unreadSessionlist = _this.sessionlist && _this.sessionlist.filter(session => {
        return (session.unread > 0 && !_this.isMute(session)) // 未读数大于0 且 未设置免打扰
      })
      if (unreadSessionlist && unreadSessionlist.length > 0) {
        _this.activeId = unreadSessionlist[unreadSessionlist.length - 1].id
        _this.toggleSelect(_this.activeId)
        _this.scrollToSession()
        _this.toggleChat(unreadSessionlist[unreadSessionlist.length - 1])
      }
    },
    setDragArea () {
      let leftDom = document.getElementById('resize-side-lf')
      let leftWidth = (leftDom.style.width).split('px')[0]
      let percent = ((Number(leftWidth) + 70) / Number(config.mainWinWidth)).toFixed(2) // 70----最左边导航宽，为固定宽
      /**
      * @params:  percent, // 左边占整个应用的百分比：如：0.3
      * * */
      if (config.environment === 'web') {
        NativeLogic.native.setDraggableArea(percent, 20, 30, 80)
      }
    },
    // 获取未读消息
    getUnread (id, len) {
      let msgList = [...this.$store.state.msgs[id]].reverse()
      let isTip = 0
      for (let i = 0; i < len; i++) {
        if (msgList[i].type === 'tip') {
          isTip++
        }
      }
      return len - isTip
    },
    scrollToSession () {
      // 定位到当前会话
      let key = 0
      for (let i in this.sessionlist) {
        if (this.sessionlist[i].id === this.activeId) {
          key = i
          break
        }
      }
      this.$nextTick(() => {
        let ul = document.getElementById('nsession-list')
        if (ul) {
          ul.scrollTop = 68 * (key - 1)
        }
      })
    },
    isMute (account) {
      if (account.scene === 'p2p') {
        // 静音处理
        for (let i = 0; i < this.mutelist.length; i++) {
          if (this.mutelist[i].account === account.to) {
            return this.mutelist[i].isMute
          }
        }
      } else {
        let isMute = this.$store.state.muteTeamIds.find(team => {
          return team === account.to
        })
        if (isMute) {
          return true
        }
        return false
      }
    },
    toggleChat (session) {
      // 切换会话时重置消息列表多选状态
      this.$store.commit('updateCheckedMsgs', [])
      this.eventBus.$emit('updateIsCheckMoreChat', {isMore: false})
      // 会话切换(不采用router-link方式是为了避免鼠标中键对a标签的默认行为)
      let sessionId = session.id
      if (sessionId === this.curSessionId) {
        return
      }
      if (session.unread > 0) {
        this.eventBus.$emit('showPositionBtn', {
          isShow: true,
          unreadCount: session.unread,
          atCount: session.localCustom && session.localCustom.at ? session.localCustom.at.count : 0
        })
      } else {
        this.eventBus.$emit('showPositionBtn', {
          isShow: false
        })
      }
      if (session.localCustom) {
        let localCustom = {}
        if (session.localCustom.isTeamDismissRead) {
          // 重置群解散未读消息
          localCustom.isTeamDismissRead = 2
        } else if (session.localCustom.teamRemoveTip) {
          // 重置被移除未读消息
          localCustom.teamRemoveTip = Object.assign({}, session.localCustom.teamRemoveTip)
          localCustom.teamRemoveTip.status = 2
        }
        this.$store.dispatch('updateLocalCustomSession', {
          sessionId: session.id, localCustom
        })
      }
      this.eventBus.$emit('checkUser', {})
      // 通知主进程
      if (config.environment === 'web') { // web分支
        let data = JSON.stringify({appCode: session.id})
        NativeLogic.native.sendEvent('营业精灵', data, 'toggleSession')
      } else { // electron分支
        const ipcRenderer = require('electron').ipcRenderer
        ipcRenderer.send('toggleSession', {appCode: session.id})
      }

      this.$router.push({name: 'chat', query: {sessionId, firstFlag: true}})
    },
    enterMyChat () {
      // 我的手机页面
      location.href = `#/chat/p2p-${this.myPhoneId}`
    },
    deleteSession () {
      if (this.menuId) {
        this.$store.dispatch('deleteSession', this.menuId)
      }
    },
    onShowMenu (e, session) {
      // console.log('会话列表右击事件===session===', session)
      // 单个列表右击事件
      let teamInfo = {}
      let members = []
      let userType = 'normal'
      if (e.button === 2) {
        // console.log('会话列表右击事件===e.button===', e.button)
        e.preventDefault()
        let type = 'p2p-istop'
        if (session.scene === 'team') {
          if (session.localCustom && session.localCustom.topTime) {
            type = 'team-isTop'
          } else {
            type = 'team-notTop'
          }
          teamInfo = this.$store.state.teamlist.find(team => {
            return team.teamId === session.to
          })
          let teamMembers = this.$store.state.teamMembers
          members = teamMembers && teamMembers[session.to]
          if (members) {
            for (let i = 0; i < members.length; i++) {
              if (members[i].account === this.$store.state.personInfos.accid) {
                userType = members[i].type
                break
              }
            }
          }
        } else if (session.scene === 'p2p') {
          if (session.localCustom && session.localCustom.topTime) {
            type = 'p2p-isTop'
          } else {
            type = 'p2p-notTop'
          }
        }
        // console.log('会话列表右击事件===showListOptions --- type ===', type)
        this.$store.dispatch('showListOptions', {
          key: type,
          show: true,
          id: session.id,
          pos: {
            x: e.clientX,
            y: e.clientY
          },
          userType,
          callBack: (type) => {
            // console.log('会话列表右击事件---右键回调type', type)
            switch (type) {
              case 1:
                // 消息置顶
                this.$store.dispatch('setTopSession', {
                  id: session.id,
                  key: true
                })
                break
              case 2:
                // 删除聊天
                this.$store.dispatch('deleteSession', {id: session.id, that: this})
                break
              case 3:
                // 取消置顶
                this.$store.dispatch('setTopSession', {
                  id: session.id,
                  key: false
                })
                break
              case 4:
                // 群设置
                if (this.$store.state.currSessionId !== session.id) {
                  this.toggleChat(session)
                  this.toggleSelect(session.id)
                }
                setTimeout(() => {
                  this.openSliderMenu()
                }, 15)
                break
              case 5:
                // 查看资料
                this.showCheckUser(e, this.userInfos[session.to])
                break
              case 6:
                // +常用联系人
                Request.AddOrDelContactUser({accid: session.to, userType: 1}, this)
                break
              case 7:
                // 消息免打扰
                this.$store.dispatch('updateInfoInTeam', {
                  teamInfo: teamInfo,
                  muteNotiType: 1
                })
                break
              case 8:
                // 取消免打扰
                this.$store.dispatch('updateInfoInTeam', {
                  teamInfo: teamInfo,
                  muteNotiType: 0
                })
                break
              case 9:
                // 退出群
                this.eventBus.$emit('dismissTeam', {teamId: session.to, type: 2, teamInfo: teamInfo})
                break
              case 10:
                // 退出讨论组
                this.eventBus.$emit('dismissTeam', {
                  type: 3,
                  callBack: () => {
                    let deleteSeeionFn = () => {
                      let currSessionId = session.id
                      this.$store.dispatch('deleteSession', {id: currSessionId, that: this})
                    }
                    let leaveTeamFn = () => {
                      this.$store.dispatch('leaveTeam', {
                        teamId: teamInfo.teamId,
                        teamName: teamInfo.name,
                        that: this,
                        callback: () => setTimeout(() => deleteSeeionFn(), 200)
                      })
                    }
                    let teamName = teamInfo.name
                    if (teamInfo.memberNum <= 3) {
                      Request.DelTeam({tid: teamInfo.teamId, owner: teamInfo.owner}, this).then(res => {
                        this.$store.commit('toastConfig', {
                          show: true,
                          type: 'success',
                          toastText: '已退出' + teamName
                        })
                        deleteSeeionFn()
                      }).catch(() => {
                        this.$store.commit('toastConfig', {
                          show: true,
                          type: 'fail',
                          toastText: '退出讨论组失败！'
                        })
                      })
                    } else {
                      if (userType === 'owner') {
                        let account = ''
                        for (let i in members) {
                          if (members[i].account !== this.$store.state.userUID) {
                            account = members[i].account
                            break
                          }
                        }
                        this.$store.dispatch('transferTeam', {
                          account,
                          teamId: teamInfo.teamId,
                          callback: () => leaveTeamFn()
                        })
                      } else leaveTeamFn()
                    }
                  }
                })
            }
          }
        })
      } else {
        this.$store.dispatch('showListOptions', {
          show: false
        })
      }
      // 处理拖拽窗口事件移除
      document.onmousemove = null
      document.onmouseup = null
      document.body.style.cursor = 'default'
    },
    toggleSelect (sessionId) {
      let moveStatus = this.$store.state.slideMenuStatus
      if (sessionId === this.activeId && moveStatus === 2) {
        this.$store.commit('toggleSlideMenuStatus', 3)
      } else {
        this.$store.commit('toggleSlideMenuStatus', 4)
      }
      this.activeId = sessionId
    },
    openSliderMenu () {
      if (this.moveStatus !== 2) {
        this.$store.commit('toggleSlideMenuStatus', 2)
      }
    },
    showCheckUser (event, userInfos) {
      console.log('查看个人资料===')
      // 查看个人资料
      if (!userInfos || userInfos.accid === this.myInfo.account) {
        userInfos = 1
      }
      this.eventBus.$emit('checkUser', {event, userInfos})
    },
    lastMsgStatus (session) {
      let localCustom = session.localCustom
      // 最新消息展示状态
      if (localCustom) {
        if (localCustom.isTeamDismissRead && localCustom.isTeamDismissRead === 1) {
          return true
        }
        if (localCustom.teamRemoveTip && localCustom.teamRemoveTip.status === 1) {
          return true
        }
      }
      return false
    },
    clearStatus (el, e) {
      if (e) {
        let className = e.target.className
        if (className.indexOf('searchevent') > -1) return
      }
      this.showSearch = false
      this.searchValue = ''
    },
    showDraft (msg) {
      // 草稿内容
      let showText = ''
      for (let i = 0; i < msg.length; i++) {
        if (msg[i]) {
          if (msg[i].text) {
            showText += msg[i].text
          } else if (msg[i].type && msg[i].type === 'image') {
            showText += '[图片消息]'
          } else {
            showText += '[未知消息类型]'
          }
        }
      }
      return showText
    }
  }
}
</script>

<style>
  .u-editor-paste-btn {
    position: absolute;
    z-index: 70;
    width: 88px;
    height: 30px;
    background: rgba(255,255,255,0.90);
    border: 1px solid #BEBEBE;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.16);
    border-radius: 10px;
    text-align: center;
    line-height: 30px;
    cursor: pointer;
    color: #333;
    font-size: 14px;
  }
  /*时间提示*/
  .g-window .u-session-time {
    display: inline-block;
    position: relative;
    right: 1.8rem;
    top: 1.1rem;
  }
  /* 未读数标签 */
  .g-window .u-unread {
    display: inline-block;
    float: right;
    margin-top: 2px;
    padding: 0 4px;
    min-width: 7px;
    height: 15px;
    line-height: 15px;
    font-size: 12px;
    background-color: #F43530;
    color: #fff;
    text-align: center;
    border-radius: 8px;
  }
  .u-tips {
    display: flex;
    align-items: center;
    width: 100%;
    height: 36px;
  }

  .u-tips span{
    font-size: 11px;
    color: #626369;
  }

  .u-tips.neterr {
    justify-content: center;
    background: #FFDFE0;
  }

  .u-tips.neterr i{
    margin-right: 5px;
    width: 16px;
    height: 16px;
    background-image: url(../../../../static/img/nav/main-tab-neterr.png);
    background-size: 100%;
  }

  .u-tips.mobile-online {
    justify-content: flex-start;
    background: #f7f7f7;
  }

  .u-tips.mobile-online i{
    margin-left: 12px;
    width: 14px;
    height: 20px;
    background-image: url(../../../../static/img/nav/mobile-online.png);
    background-size: 100%;
  }

  .u-tips.mobile-online span {
    margin-left: 13px;
  }
  .g-window .nomsg {
    display: inline-block;
    float: right;
    margin: 2px auto 0;
    padding: 0 4px;
    min-width: 7px;
    height: 15px;
    line-height: 15px;
    font-size: 12px;
    background-color: #F43530;
    color: #fff;
    text-align: center;
    border-radius: 8px;
    width: 10px;
    height: 10px;
    padding: 0;
    margin: 0;
    margin-left: 5px;
  }

  .g-window .mute-contain {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-top: 5px;
  }
  .g-window .mute-contain .mute {
    display: inline-block;
    width: 12.5px;
    height: 12.5px;
    background: url('../../../../static/img/setting/mute.png') no-repeat center center;
    background-size: 100% 100%;
  }

  .m-main-list > .u-list {
    position: absolute;
    top: 56px;
    bottom: 0;
  }

  .m-main-list .border {
    position: absolute;
    right: 0;
    top: 0;
    width: 2px;
    height: 100%;
    cursor: w-resize;
  }

  .u-status-cover {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
  }

  .u-list-item-isTop {
    position: relative;
  }
  .u-list-item-isTop:after {
    position: absolute;
    content: '';
    left: -8px;
    top: -8px;
    width: 16px;
    height: 16px;
    background: rgba(4,154,255,1);
    transform: rotate(45deg);
  }
  .u-search{
    -webkit-app-region: drag;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 56px;
  }
  .u-search .u-cont {
    -webkit-app-region: no-drag;
    position: relative;
    width: 90%;
    height: 28px;
  }
  .u-search input {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background: #F0F0F0 url(../../../../static/img/nav/main-tab-search.png) 8px center no-repeat;
    background-size: 12px 12px;
    border-radius: 2px;
    border: none;
    font-size: 12px;
    color: #333;
    padding: 0 26px;
    border: 1px solid transparent;
    transition: border .1s linear;
  }
  .u-search input.active {
    border: 1px solid rgba(4,154,255,1);
  }
  .u-search .clear {
    position: absolute;
    right: 8px;
    top: 6.3px;
    display: block;
    width: 14px;
    height: 14px;
    background-image: url('../../../../static/img/setting/delete.png');
    background-size: 100% 100%;
    cursor: pointer;
  }
  input::-webkit-input-placeholder {
    color: #7D807E;
  }
  .u-neterr {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 36px;
    background: #FFDFE0;
  }
  .u-neterr i{
    margin-right: 5px;
    width: 16px;
    height: 16px;
    background-image: url(../../../../static/img/nav/main-tab-neterr.png);
    background-size: 100%;
  }
  .u-neterr span{
    font-size: 11px;
    color: #626369;
  }

  .u-nomsg {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 56px;
    bottom: 0;
    width: 100%;
    font-size: 14px;
    color: #C4C4C4;
  }
  .delete-btn {
    width: 16px;
    height: 16px;
    background-image: url('../../../../static/img/setting/delete.png');
    background-size: 16px 16px;
    cursor: pointer;
  }
  .delete-btn:hover {
    background-image: url('../../../../static/img/setting/delete-c.png');
    background-size: 16px 16px;
  }
</style>
