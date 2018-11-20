<template>
  <li class="u-msg"
    :class="{
      'item-me': msg.flow==='out',
      'item-you': msg.flow==='in',
      'item-time': msg.type==='timeTag',
      'item-tip': msg.type==='tip',
      'item-isChatMsg': (msg.flow==='out' || msg.flow==='in') && (msg.type !== 'notification'),
      'session-chat': type==='session',
      'high-bg': msgHighBgIdClient === msg.idClient
    }">
    <div v-if="msg.type==='timeTag'" class="u-msg-time">{{msg.showText}}</div>
    <div v-else-if="msg.type==='tip'" class="tip">{{msg.showText}}</div>
    <div v-else-if="msg.type==='notification' && msg.scene==='team'" class="notification">{{msg.showText}}</div>
    <div
      v-else-if="msg.flow==='in' || msg.flow==='out'"
      :idClient="msg.idClient"
      :time="msg.time"
      :flow="msg.flow"
      :type="msg.type"
      style="overflow: hidden;"
    >
      <a class="msg-head noevent" v-if="msg.avatar" @click="showCheckUser($event, msg)">
        <img class="icon u-circle" :src="msg.avatar">
      </a>
      <p class="msg-user" v-else-if="msg.type!=='notification'"><em>{{msg.showTime}}</em>{{msg.from}}</p>
      <p v-if="scene === 'team'" :style="{textAlign: msg.flow==='in' ? 'left' : 'right', color: '#333', fontSize: '12px', marginBottom: '3px'}">{{msg.nickInTeam ? msg.nickInTeam : msg.fromNick}}</p>
      <textarea style="width: 1px;height: 1px;position: absolute;left: -10px;" ref="clipboard"></textarea>
      <span :ref="`copy_${idClient}`" style="-webkit-user-select: text;" v-if="msg.type==='text'" class="msg-text" v-html="msg.showText" @mousedown.stop="showListOptions($event, msg.type, msg.showText)" @mouseup.stop="itemMouseUp($event)"></span>
      <span v-else-if="msg.type==='custom-type1'" class="msg-text" ref="mediaMsg"></span>
      <span v-else-if="msg.type==='custom-type3'" class="msg-text" ref="mediaMsg" @mouseup.stop="showListOptions($event, msg.type)" style="background:transparent;border:none;"></span>
      <span v-else-if="msg.type==='image'" class="msg-text cover" ref="mediaMsg" @click.stop="showImgModal(msg.originLink)" @mouseup.stop="showListOptions($event, msg.type)" :style="{cursor: 'pointer', width: msg.w + 'px', height: msg.h + 'px', background: 'transparent', border: 'none'}"></span>
      <span v-else-if="msg.type==='video'" class="msg-text" ref="mediaMsg"></span>
      <span v-else-if="msg.type==='audio'" class="msg-text msg-audio" :class="isPlay ? 'zel-play' : ''" @click="playAudio(msg.audioSrc, msg)" @mouseup.stop="showListOptions($event, 'audio')"><span>{{msg.showText.split(' ')[0]}}</span></span>
      <span v-else-if="msg.type==='file'" class="msg-text"><a :href="msg.fileLink" target="_blank"><i class="u-icon icon-file"></i>{{msg.showText}}</a></span>
      <span v-else-if="msg.type==='notification'" class="msg-text notify">{{msg.showText}}</span>
      <span v-else class="msg-text" v-html="msg.showText"></span>
      <span v-if="msg.custom && JSON.parse(msg.custom).isSmsMsg" class="msg-short"><i class="send-short-msg"></i></span>
      <span v-if="msg.status==='fail'" class="msg-failed" @click="resendMsg(msg)"><i class="weui-icon-warn"></i></span>
      <span v-else-if="msg.status==='sending'" class="msg-failed"><i class="weui-icon-sending"></i></span>
    </div>
    <div :class="teamMsgUnRead>0 ? 'isRemoteRead team-unread' : 'isRemoteRead'" @click="teamMsgUnRead > 0 ? showUnreadModal($event) : ''">
      <span v-if="teamMsgUnRead >=0">{{teamMsgUnRead>0 ? `${teamMsgUnRead}人未读`: '全部已读'}}</span>
    </div>
    <div class="isRemoteRead" style="margin-right: 0px;" v-if="!toMyPhone && msg.scene === 'p2p' && msg.flow === 'out' && msg.type !== 'tip'">
      <span>{{(msg.localCustom && msg.localCustom.isRemoteRead) ? '已读' : '未读'}}</span>
    </div>
    <div v-if="showVioceToText" class="vioce-text" >{{vioceToText}}</div>
  </li>
</template>

<script type="text/javascript">
  import util from '../../utils'
  import config from '../../configs'
  import emojiObj from '../../configs/emoji'

  export default {
    props: {
      type: String, // 类型，chatroom, session
      scene: String,
      to: String,
      teamId: String,
      idClient: String,
      rawMsg: {
        type: Object,
        default () {
          return {}
        }
      },
      userInfos: {
        type: Object,
        default () {
          return {}
        }
      },
      myInfo: {
        type: Object,
        default () {
          return {}
        }
      },
      isRobot: {
        type: Boolean,
        default () {
          return false
        }
      },
      isHistory: {
        type: Boolean,
        default () {
          return false
        }
      }
    },
    data () {
      return {
        isFullImgShow: false,
        currentAudio: null,
        showVioceToText: false,
        vioceToText: '',
        isPlay: false,
        myGroupIcon: config.defaultGroupIcon
      }
    },
    computed: {
      robotInfos () {
        return this.$store.state.robotInfos
      },
      teamMsgUnRead () {
        var obj = !this.isHistory && this.msg.needMsgReceipt && this.msg.flow === 'out' && this.$store.state.teamMsgReads.find(item => item.idServer === this.msg.idServer)
        return obj ? parseInt(obj.unread) : -1
      },
      teamMembers () {
        let teamMembers = this.$store.state.teamMembers
        let members = teamMembers && teamMembers[this.teamId]
        return members
      },
      nickInTeam () {
        let teamMembers = this.$store.state.teamMembers
        let members = teamMembers && teamMembers[this.teamId]
        for (let key in members) {
          if (members[key].account === this.myInfo.account) {
            return members[key].nickInTeam || this.myInfo.nick
          }
        }
        return ''
      },
      myPhoneId () {
        return `${this.$store.state.userUID}`
      },
      msgHighBgIdClient () {
        return this.$store.state.msgHighBgIdClient
      },
      msg () {
        let item = Object.assign({}, this.rawMsg)
        // 标记用户，区分聊天室、普通消息
        if (this.type === 'session') {
          if (item.flow === 'in') {
            if (item.type === 'robot' && item.content && item.content.msgOut) {
              // 机器人下行消息
              let robotAccid = item.content.robotAccid
              item.avatar = this.robotInfos[robotAccid].avatar
              item.isRobot = true
              item.link = `#/mainpage/contacts/card?accid=${robotAccid}`
            } else if (item.from !== this.$store.state.userUID) {
              item.avatar = (this.userInfos[item.from] && this.userInfos[item.from].avatar) || config.defaultUserIcon
              item.link = `#/mainpage/contacts/card?accid=${item.from}`
              //  todo如果是未加好友的人发了消息，是否能看到名片
            } else {
              item.avatar = this.myInfo.avatar
              // item.avatar = `${config.myPhoneIcon}`
            }
          } else if (item.flow === 'out') {
            item.avatar = this.myInfo.avatar
          }
        } else {
          // 标记时间，聊天室中
          item.showTime = util.formatDate(item.time)
        }
        if (item.type === 'timeTag') {
          // 标记发送的时间
          item.showText = item.text
        } else if (item.type === 'text') {
          // 文本消息
          item.showText = util.escape(item.text)
          if (item.apns && item.flow === 'in') {
            if (!item.apns.accounts) {
              item.showText = item.showText.replace('@所有人', '<span style="color: #4F8DFF;">@所有人 </span>')
            } else if (item.apns.accounts.includes(this.myInfo.account)) {
              let name = util.escape(this.nickInTeam) || util.escape(this.myInfo.nick)
              item.showText = item.showText.replace('@' + name, `<span style="color: #4F8DFF;">@${name} </span>`)
            }
          }
          if (/\[[\u4e00-\u9fa5]+\]/.test(item.showText)) {
            let emojiItems = item.showText.match(/\[[\u4e00-\u9fa5]+\]/g)
            emojiItems.forEach(text => {
              let emojiCnt = emojiObj.emojiList.emoji
              if (emojiCnt[text]) {
                let dataKey = text.slice(1, -1)
                item.showText = item.showText.replace(text, `<img data-key='${dataKey}' style="width: 23px;height: 23px;vertical-align: middle;" class='emoji-small'  src='${emojiCnt[text].img}'>`)
              }
            })
          }
        } else if (item.type === 'custom') {
          let content = JSON.parse(item.content)
          // type 1 为猜拳消息
          if (content.type === 1) {
            let data = content.data
            let resourceUrl = config.resourceUrl
            // item.showText = `<img class="emoji-middle" src="${resourceUrl}/im/play-${data.value}.png">`
            item.type = 'custom-type1'
            item.imgUrl = `${resourceUrl}/im/play-${data.value}.png`
          // type 3 为贴图表情
          } else if (content.type === 3) {
            let data = content.data
            let emojiCnt = ''
            if (emojiObj.pinupList[data.catalog]) {
              emojiCnt = emojiObj.pinupList[data.catalog][data.chartlet]
              // item.showText = `<img class="emoji-big" src="${emojiCnt.img}">`
              item.type = 'custom-type3'
              item.imgUrl = `${emojiCnt.img}`
            }
          } else {
            item.showText = util.parseCustomMsg(item)
            if (item.showText !== '[自定义消息]') {
              item.showText += ',请到手机或电脑客户端查看'
            }
          }
        } else if (item.type === 'image') {
          // 原始图片全屏显示
          item.originLink = item.file.url
          if (item.file.w < 180) {
            item.w = item.file.w
            item.h = item.file.h
          } else {
            item.w = 180
            item.h = 180 / (item.file.w / item.file.h)
          }
        } else if (item.type === 'video') {
          // ...
        } else if (item.type === 'audio') {
          item.audioSrc = item.file.mp3Url
          item.showText = Math.round(item.file.dur / 1000) + '" 点击播放'
        } else if (item.type === 'file') {
          item.fileLink = item.file.url
          item.showText = item.file.name
        } else if (item.type === 'notification') {
          if (item.scene === 'team') {
            item.showText = util.generateTeamSysmMsg(item)
          } else {
            //  对于系统通知，更新下用户信息的状态
            item.showText = util.generateChatroomSysMsg(item)
          }
        } else if (item.type === 'tip') {
          //  对于系统通知，更新下用户信息的状态
          item.showText = item.tip
        } else if (item.type === 'robot') {
          let content = item.content || {}
          let message = content.message || []
          if (!content.msgOut) {
            // 机器人上行消息
            item.robotFlow = 'out'
            item.showText = item.text
          } else if (content.flag === 'bot') {
            item.subType = 'bot'
            message = message.map(item => {
              if (item.type === 'template') {
                // 在vuex(store/actions/msgs.js)中已调用sdk方法做了转换
                return item.content.json
              } else if (item.type === 'text' || item.type === 'answer') {
                // 保持跟template结构一致
                return [{
                  type: 'text',
                  text: item.content
                }]
              } else if (item.type === 'image') {
                // 保持跟template结构一致
                return [{
                  type: 'image',
                  url: item.content
                }]
              }
            })
            item.message = message
          } else if (item.content.flag === 'faq') {
            item.subType = 'faq'
            item.query = message.query
            let match = message.match.sort((a, b) => {
              // 返回最匹配的答案
              return b.score - a.score
            })
            item.message = match[0]
          }
        } else {
          item.showText = `[${util.mapMsgType(item)}],请到手机或电脑客户端查看`
        }
        // 昵称处理
        if (this.teamMembers) {
          let memberInfo = this.teamMembers.find(member => {
            return member.account === item.from
          })
          if (memberInfo) {
            if (this.userInfos[memberInfo.account]) {
              item.nickInTeam = this.userInfos[memberInfo.account].alias || memberInfo.nickInTeam
            } else {
              item.nickInTeam = memberInfo.nickInTeam
            }
          }
        }
        return item
      },
      toMyPhone () {
        if (this.msg.flow === 'out' && this.msg.to === this.myPhoneId) {
          return true
        } else {
          return false
        }
      }
    },
    mounted () {
      let item = this.msg
      // 有时序问题的操作
      this.$nextTick(() => {
        let media = null
        if (item.type === 'image') {
          media = new Image()
          media.src = item.file.url
          media.style = 'width:auto;height:auto;max-width:100%;max-height:100%;vertical-align: bottom;'
          if (item.status !== 'sending') {
            // 图片消息缩略图
            media.src = item.file.url + '?imageView&thumbnail=180x0&quality=85'
          }
        } else if (item.type === 'custom-type1') {
          // 猜拳消息
          media = new Image()
          media.className = 'emoji-middle'
          media.src = item.imgUrl
        } else if (item.type === 'custom-type3') {
          // 贴图表情
          media = new Image()
          media.className = 'emoji-big'
          media.src = item.imgUrl
        } else if (item.type === 'video') {
          if (/(mov|mp4|ogg|webm)/i.test(item.file.ext)) {
            media = document.createElement('video')
            media.src = item.file.url
            media.width = 640
            media.height = 480
            media.style.width = '100%'
            media.autoStart = false
            media.preload = 'metadata'
            media.controls = 'controls'
          } else {
            let aLink = document.createElement('a')
            aLink.href = item.file.url
            aLink.target = '_blank'
            //  TODO aLink.innerHTML = `<i class="u-icon icon-file"></i>${video.name}`
            this.$refs.mediaMsg.appendChild(aLink)
          }
        }
        if (media) {
          if (this.$refs.mediaMsg) {
            this.$refs.mediaMsg.appendChild(media)
          }
          media.onload = () => {
            this.$emit('msg-loaded')
          }
          media.onerror = () => {
            this.$emit('msg-loaded')
          }
        } else {
          this.$emit('msg-loaded')
        }
      }) // end this.nextTick
    },
    methods: {
      preventDefault (e) {
        e.stopPropagation()
      },
      // 展示已读未读列表
      showUnreadModal (e) {
        this.$store.dispatch('setSelectMsg', {
          curTeamId: this.teamId,
          curIdServer: this.msg.idServer
        })
        this.eventBus.$emit('showUnreadModal', {
          pos: {
            x: e.clientX,
            y: e.clientY
          }
        })
      },
      revocateMsg (vNode) {
        // 在会话聊天页
        if (this.$store.state.currSessionId) {
          if (vNode && vNode.data && vNode.data.attrs) {
            let attrs = vNode.data.attrs
            if (attrs.type === 'robot') {
              return
            }
            // 自己发的消息
            if (attrs.flow === 'out') {
              let that = this
              this.$vux.confirm.show({
                title: '确定需要撤回消息',
                onCancel () {
                },
                onConfirm () {
                  that.$store.dispatch('revocateMsg', {
                    idClient: attrs.idClient
                  })
                }
              })
            }
          }
        }
      },
      sendRobotBlockMsg (msg, originMsg) {
        if (this.isHistory) {
          // 在历史消息中，不进行机器人交互
          return
        }
        let body = '[复杂按钮模板触发消息]'
        if (msg.text && msg.text.length === 1) {
          body = msg.text[0].text
        }
        let robotAccid = originMsg.content.robotAccid
        if (!this.isRobot) {
          body = `@${this.robotInfos[robotAccid].nick} ${body}`
        }
        if (this.type === 'session') {
          this.$store.dispatch('sendRobotMsg', {
            type: 'link',
            scene: originMsg.scene,
            to: originMsg.to,
            robotAccid,
            // 机器人后台消息
            params: msg.params,
            target: msg.target,
            // 显示的文本消息
            body
          })
        } else if (this.type === 'chatroom') {
          this.$store.dispatch('sendChatroomRobotMsg', {
            type: 'link',
            robotAccid,
            // 机器人后台消息
            params: msg.params,
            target: msg.target,
            // 显示的文本消息
            body
          })
        }
      },
      continueRobotMsg (robotAccid) {
        this.$store.dispatch('continueRobotMsg', robotAccid)
      },
      showImgModal (src) {
        this.$store.dispatch('showImgModal', {
          src
        })
      },
      playAudio (src, msg) {
        if (!this.currentAudio) {
          this.currentAudio = new Audio(src)
          this.currentAudio.play()
          this.isPlay = true
          this.currentAudio.onended = () => {
            this.currentAudio = null
            this.isPlay = false
          }
        }
      },
      toMsgUnReadDetail () {
        this.href = '#/msgReceiptDetail/' + this.msg.idServer
      },
      isChildOf (child, parent) {
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
      },
      showListOptions (e, type) {
        this.selectInfo = null
        let vioceCallBack = null
        if (type === 'audio') {
          vioceCallBack = (text, url) => {
            this.showVioceToText = true
            this.vioceToText = text
          }
        } else if (type === 'text' && e.button === 2) {
          this.copyAll()
        }
        this.eventBus.$emit('checkUser', {})
        console.log(this.msg)
        if (e.button === 2) {
          let key = ''
          if (this.msg.flow === 'out' && (this.to !== this.myInfo.account)) {
            key = type + '-out'
          } else {
            key = type + '-in'
          }
          this.$store.dispatch('showListOptions', {
            key,
            show: true,
            id: this.msg,
            pos: {
              x: e.clientX,
              y: e.clientY
            },
            that: this,
            msg: this.msg,
            callBack: (type) => {
              switch (type) {
                case 1:
                  this.$store.dispatch('revocateMsg', {msg: this.msg, that: this})
                  break
                case 2:
                  this.forwordMsg()
                  break
                case 3:
                  this.$refs.clipboard.innerText = this.getCopyText(e)
                  this.$refs.clipboard.select()
                  document.execCommand('Copy')
                  break
                case 4:
                  this.$store.dispatch('deleteMsg', this.msg)
                  break
                case 5:
                  this.$store.dispatch('convertVoice', {url: this.msg.file.url, callBack: vioceCallBack})
                  break
                case 6:
                  this.$store.dispatch('downloadImg', this.msg)
                  break
              }
            }
          })
        } else {
          this.$store.dispatch('showListOptions', {
            show: false
          })
        }
        // 处理侧栏窗口状态恢复
        if (this.$store.state.slideMenuStatus === 2 && type === 'text') {
          this.$store.commit('toggleSlideMenuStatus', 3)
        }
        // 处理拖拽窗口事件移除
        document.onmousemove = null
        document.onmouseup = null
        document.body.style.cursor = 'default'
      },
      copyAll () {
        // 右键复制全选
        let isNeedAllSelect = true
        let selection = window.getSelection()
        let target = this.$refs[`copy_${this.idClient}`]
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
      },
      forwordMsg () {
        // 转发消息
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
        this.eventBus.$emit('selectContact', {type: 7, sidelist, msg: this.msg})
      },
      itemMouseUp (e) {
        if (this.selectInfo) {
          let range = document.createRange()
          range.setStart(this.selectInfo.anchorNode, this.selectInfo.startOffset)
          range.setEnd(this.selectInfo.focusNode, this.selectInfo.endOffset)
          let selection = window.getSelection()
          selection.removeAllRanges()
          selection.addRange(range)
        }
        // 处理拖拽窗口事件移除
        document.onmousemove = null
        document.onmouseup = null
        document.body.style.cursor = 'default'
      },
      getCopyText (e) {
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
      },
      showCheckUser (event, msg) {
        let userInfos = this.userInfos[msg.from]
        if (!userInfos) {
          if (msg.from === this.myInfo.account) {
            userInfos = 1
          } else return
        }
        // 查看个人资料
        this.eventBus.$emit('checkUser', {event, userInfos})
      },
      getSelectedText () {
        let sel = window.getSelection && window.getSelection()
        if (sel && sel.rangeCount > 0) {
          let selection = window.getSelection().getRangeAt(0).cloneContents()
          return selection
        } else {
          return ''
        }
      },
      resendMsg (msg) {
        // 消息重发
        this.$store.dispatch('resendMsg', msg)
      }
    }
  }
</script>

<style scoped>
  .u-msg {
    list-style: none;
  }

  .u-msg .u-msg-time{
    position: relative;
    font-size: 12px;
    text-align: center;
    color: rgba(175,178,177,1);
  }

    .u-msg .msg-link {
        display: none;
    }
    .u-msg .msg-text {
      max-width: 80%;
      word-wrap:break-word;
    }
    .u-msg .msg-link {
        bottom: 0;
        right: -4rem;
        font-size: 0.9rem;
    }

  .msg-unread {
    position: relative;
    float: right;
    top: 0.3rem;
    right: 0.5rem;
    font-size: 0.9rem;
    color: #0091e4;
  }

  /* 消息记录 */
.g-window .u-msg {

    position: relative;

    padding: 0.2rem 0;
    overflow: hidden;
}
/* 用户头像 */
.g-window .u-msg .msg-head {

    position: relative;

    display: inline-block;

    /* top: 0.1rem; */

    margin: 0;

    margin-right: 10px;

    margin-left: 20px;

    padding: 0;

    width: 32px;

    height: 32px;

    vertical-align: top;

    cursor: pointer;
}

.g-window .u-msg.item-me .msg-head {
  margin-right: 20px;
  margin-left: 10px;
}

.g-window .u-msg .msg-head img {

    position: relative;

    display: inline-block;

    margin: 0;

    width: inherit;

    height: inherit;
}
.g-window .u-msg .msg-user {

    font-style: italic;

    color: #999;
}
.g-window .u-msg .msg-user em {

    font-weight: normal;

    margin-right: 1rem;
}
.g-window .u-msg .msg-text {

    position: relative;

    display: inline-block;

    max-width: 54%;

    min-height: 1.2rem;

    word-break: break-all;

    height: auto;

    line-height: 20px;

    font-size: 0.9rem;

    border: none;
}
.g-window .u-msg .msg-text img {

    position: relative;

    display: inline-block;

    margin: 0;

    padding: 0;

    vertical-align: bottom;
}
.g-window .u-msg .msg-text img.emoji-small {

    width: 23px;

    height: 23px;

    vertical-align: middle;
}
.g-window .u-msg .msg-text img.emoji-big {

    width: 3rem;

    height: 3rem;

    vertical-align: middle;
}
.g-window .u-msg .msg-text img.emoji-big {

    width: 4.8rem;

    height: 4.8rem;

    vertical-align: middle;
}
.g-window .u-msg .msg-text embed, .g-window .u-msg .msg-text video {

    position: relative;

    display: inline-block;

    max-width: 100%;

    max-height: 8rem;

    vertical-align: bottom;

    background-color: #000;

    text-align: center;

    color: #fff;
}
.g-window .u-msg .msg-text .button {

    margin: 0.1rem 0;

    padding: 0.1rem 0.2rem;

    border: 1px solid #fff;

    border-radius: 0.2rem;

    background-color: #e5f4ff;

    color: #666;
}
.g-window .u-msg .msg-text::before, .g-window .u-msg .msg-text::after {

    content: ' ';

    position: absolute;

    top: 12.8px;

    top: 0.8rem;

    border-top: 6.4px solid transparent;

    border-top: 0.4rem solid transparent;

    border-bottom: 6.4px solid transparent;

    border-bottom: 0.4rem solid transparent;

    width: 0;

    height: 0;
}
.g-window .u-msg .msg-text.notify {

    max-width: 100%;
}
.g-window .u-msg .msg-failed {

    position: relative;

    float: right;

    margin-right: 0.2rem;

    vertical-align: bottom;

    font-size: 0.92rem;

    line-height: 2.0rem;
}
.g-window .u-msg .newMsgTip{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
}
.g-window .u-msg .newMsgTip span{
  margin: 0 3px;
  color: #AFB2B1;
  font-size: 12px;
}
.g-window .u-msg .newMsgTip i{
  flex: 1;
  height: 1px;
  background: #DADADA;
}

.g-window .u-msg .msg-failed .weui-icon-warn {
  display: inline-block;
  width: 15px;
  height: 15px;
  background: url("../../../../static/img/setting/prompt.png") no-repeat center center;
  background-size: 100% 100%;
}

.g-window .u-msg .msg-failed .weui-icon-sending {
  display: inline-block;
  width: 15px;
  height: 15px;
  background: url("../../../../static/img/setting/loading.gif") no-repeat center center;
  background-size: 100% 100%;
}

.g-window .u-msg .msg-link {

    display: block;

    position: absolute;

    bottom: -2rem;

    right: 0;

    min-width: 4rem;

    min-height: 1.2rem;

    word-break: normal;

    height: auto;

    line-height: 1.2rem;

    font-size: 1.0rem;

    border: none;
}
.g-window .u-msg .msg-link a {

    color: #0091e4;

    text-decoration: underline;

    float: right;
}
.g-window .u-msg .notification {

    font-size: 0.8rem;

    text-align: center;

    color: #AFB2B1;

    max-width: 80%;
    overflow: hidden;

    text-overflow:ellipsis;
    white-space:nowrap;
    margin: 0 auto;
}
.g-window .u-msg .notify {

    color: #f50;

    font-size: 0.8rem;
}
.g-window .u-msg.session-chat {

    padding: 0.6rem 0;

    clear: both;
}
.g-window .u-msg.session-chat .msg-text {

    padding: 0.4rem;

    /* margin-bottom: 6px; */

    border-radius: 0.4rem;
}
.g-window .u-msg.session-chat .msg-robot {

    min-width: 3rem;

    margin-bottom: 3rem;
}
.g-window .u-msg.session-chat.item-you .msg-head, .g-window .u-msg.session-chat.item-you .msg-text {

    float: left;
}
.g-window .u-msg.session-chat.item-you .msg-text {
  box-sizing: border-box;
  background-color: #fff;
  border: 0.5px solid rgba(204,204,204,1);
  border-radius: 2px 10px 10px 10px;
  padding: 6px 10px;
  font-size: 14px;
  overflow: hidden;
}
/* .g-window .u-msg.session-chat.item-you .msg-text::before {

    right: 99%;

    border-right: 6.4px solid #5cacde;

    border-right: 0.4rem solid #5cacde;
} */
.g-window .u-msg.session-chat.item-you .msg-text::after {

    background: none;
}
.g-window .u-msg.session-chat.item-me .msg-head, .g-window .u-msg.session-chat.item-me .msg-text {

    float: right;
}
.g-window .u-msg.session-chat.item-me .msg-text {

    /* color: #666;

    background-color: #e5f4ff; */
    box-sizing: border-box;
    background-color: #4F8DFF;
    color: #fff;
    font-size: 14px;
    border-radius: 10px 2px 10px 10px;
    padding: 6px 10px;
    overflow: hidden;
}

.g-window .u-msg.session-chat.item-you .msg-text.cover,
.g-window .u-msg.session-chat.item-me .msg-text.cover {
  padding: 0;
}

.g-window .u-msg.session-chat.item-me .msg-text::before {
  background: none;
}
/* .g-window .u-msg.session-chat.item-me .msg-text::after {

    left: 99%;

    border-left: 6.4px solid #e5f4ff;

    border-left: 0.4rem solid #e5f4ff;
} */
.g-window .u-msg.item-time {
  font-size: 0.8rem;
  text-align: center;
  color: #ccc;
}
.g-window .u-msg.item-tip {
  font-size: 0.8rem;
  text-align: center;
}
.g-window .u-msg.item-tip .tip {
  margin: 0 auto;
  width: 10rem;
  padding: 0.1rem;
  font-size: 12px;  
  color: rgba(175,178,177,1);
}

.g-window .u-msg .vioce-text{
  padding: 10px;
  margin: 6px 0 10px;
  width: fit-content;
  max-width: 40%;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 12px;
  color: #333333;
  line-height: 14px;
}

.g-window .item-you .vioce-text{
  float: left;
  margin-left: 62px;
}

.g-window .item-me .vioce-text{
  float: right;
  margin-right: 62px;
}

.g-window .item-you .msg-audio, .g-window .item-me .msg-audio{
  position: relative;
  overflow: visible !important;
  width: 120px;
  height: 36px;
  transition: all .2s;
  cursor: pointer;
}
.g-window .msg-audio span{
  position: absolute;
  bottom: -2px;
  display: block;
  color: #999;
  font-size: 14px;
}

.g-window .item-you .msg-audio span{
  right: -28px;
}

.g-window .item-me .msg-audio span{
  left: -28px;
}

.g-window .item-you .msg-audio{
  background: url(../../../../static/img/edit/voice-y.png) 12px center no-repeat;
  background-size: 14px 20px;
}

.g-window .u-msg.session-chat.item-you .msg-audio:hover{
  background-color: #d2d2d2;
}

.g-window .u-msg.session-chat.item-you .msg-audio.zel-play{
  background: url(../../../../static/img/edit/voice-y-p.gif) 12px center no-repeat;
  background-size: 14px 20px;
}

.g-window .item-me .msg-audio{
  background: url(../../../../static/img/edit/voice-m.png) 94px center no-repeat;
  background-size: 14px 20px;
}

.g-window .u-msg.session-chat.item-me .msg-audio.zel-play{
  background: #4F8DFF url(../../../../static/img/edit/voice-m-p.gif) 94px center no-repeat;
  background-size: 14px 20px;
}

.u-msg .isRemoteRead {
  margin: 2px 62px 0 0;
  float: right;
  height: 20px;
}

.u-msg .isRemoteRead span{
  text-align: right;
  font-size: 12px;
  line-height: 20px;
  color: #999;
}

.u-msg .isRemoteRead.team-unread span{
  transition: all .3s;
  cursor: pointer;
  width: fit-content;
  color: #4F8DFF;
}

.u-msg .isRemoteRead.team-unread:hover span{
  opacity: .85;
}
.u-msg .isRemoteRead.team-unread:active span{
  opacity: .7;
}

.u-msg.item-you .msg-short {
  float: left;
  padding-left: 10px;
}
.u-msg.item-me .msg-short {
  float: right;
  padding-right: 10px;
}

.u-msg .msg-short .send-short-msg {
  display: inline-block;
  vertical-align: middle;
  width: 22px;
  height: 20px;
  background-repeat: no-repeat;
  background-position: center center;
  background-image: url('../../../../static/img/edit/message-h.png');
  background-size: 22px 16px;
}

.g-window .u-msg.high-bg {
  background: url(../../../../static/img/edit/shine-bg.gif) no-repeat center center;
  background-size: 100% 100%;
}

</style>