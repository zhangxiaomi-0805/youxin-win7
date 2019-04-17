<template>
  <!-- 历史消息记录搜索后查看上下文 -->
  <div class="g-hbf-container m-chat">
    <div class="g-hbf-header m-header">
      <span class="session-name">{{'“' + titleName + '”的记录'}}</span>
      <div class="close-btn" @click.stop="toggleToChat"><span class="close-text">关闭</span></div>
    </div>
    <ul id="recordMore-box" 
      :class="isSearchCheckMore ? 'm-body-contain m-body-contain-1 u-list' : 'm-body-contain u-list'"
      v-if="recordlistMore.length > 0"
      @scroll="scroll($event)"
    >
      <li
        :class="msg.idClient === idClient ? 'u-list-item s-list-item s-list-item-checked' : 'u-list-item s-list-item'"
        v-for="msg in recordlistMore"
        :key="msg.idClient"
        :id="msg.idClient"
        @click.stop="isSearchCheckMore ? checkItemFn(msg) : null"
      >
        <div class="u-list-item s-list-item" style="padding:0;position: relative;">
          <div class="left">
            <!-- 选择框 -->
            <span v-show="isSearchCheckMore" :class="className(msg)"></span>
            <img :src="msg.avatar" alt="" class="avatar">
            <div style="padding:0 8px">
              <div style="display: flex;flex-direction:row">
                <span class="s-name">{{msg.name || mag.fromNick}}</span>
                <!-- 时间 -->
                <div class="s-time">{{manageTime(msg.time)}}</div>
              </div>
              <textarea style="width: 1px;height: 1px;position: absolute;overflow:hidden;left: -10px;visibility:hidden" :ref="`clipboard_${msg.idClient}`"></textarea>
              <div
                v-if="msg.type==='text'"
                @mouseup.stop="isSearchCheckMore ? null : showListOptions($event, msg)"
                :ref="`copy_${msg.idClient}`"
                class="msg-text"
                style="-webkit-user-select: text"
                v-html="msg.showText"
                @click.stop="openAplWindow($event, msg.sessionId)"
              />
              <div v-else-if="msg.type==='custom-type1'" class="msg-text" ref="mediaMsg"></div>
              <div v-else-if="msg.type==='custom-type3'" class="msg-text" ref="mediaMsg" @mouseup.stop="isSearchCheckMore ? null : showListOptions($event, msg)" style="background:transparent;border:none;">
                <img :src="msg.imgUrl" style="width: 100%; height: 100%"/>
              </div>
              <div v-else-if="msg.type==='custom-type7'" class="mediaMsg"  @mouseup.stop="showListOptions($event, msg)">
                <!-- <webview style="height:auto" class="webview-box" ref="webview"  autosize="on" minwidth="300" minheight="20" maxheight='auto' nodeintegration disablewebsecurity src="../../../../static/windows/webview.html"></webview> -->
                <iframe ref="iframe" @load="sendMsgToIframe(msg.showText, msg.idClient)" style="height: auto" src="./static/windows/webview.html" minwidth="300" minheight="20" frameborder="0" scrolling="no"></iframe>
              </div>
              <span v-else-if="msg.type==='custom-type8'" class="msg-text custom-type8-box" @mouseup.stop="isSearchCheckMore ? null : showListOptions($event, msg)">
                <span class="custom-type8-title">邀请你加入群聊</span>
                <span class="custom-type8-content-box">
                  <span class="custom-type8-content">{{msg.showText.description}}</span>
                  <img :src="msg.showText.teamAvatarUrl" alt="" style="width: 50px; height:50px">
                </span>
              </span>
              <div v-else-if="msg.type==='image'" class="msg-text cover" ref="mediaMsg" @mouseup.stop="isSearchCheckMore ? null : showListOptions($event, msg)" :style="{cursor: 'pointer', width: msg.w + 'px', height: msg.h + 'px', background: 'transparent', border: 'none'}">
                <img :src="msg.originLink" style="width: 100%; height: 100%"/>
              </div>
              <div v-else-if="msg.type==='video'" class="msg-text" ref="mediaMsg">
                <video :src="msg.src" autoStart="false" controls="controls" style="width:230px; height:230px"></video>
              </div>
              <div v-else-if="msg.type==='audio'" class="msg-text msg-audio" :class="isPlay ? 'zel-play' : ''" @click="isSearchCheckMore ? null : playAudio(msg.audioSrc, msg)" @mouseup.stop="isSearchCheckMore ? null : showListOptions($event, msg)"><span>{{msg.showText.split(' ')[0]}}</span></div>
              <div v-else-if="msg.type==='file'" class="msg-text"><a :href="msg.fileLink" target="_blank"><i class="u-icon icon-file"></i>{{msg.showText}}</a></div>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <div class="g-hbf-footer m-footer" id="resize-chat-btm" style="height:150px;">
        <div class="border" id="resize-ns"></div>
        <!-- 消息列表多选弹框 -->
        <chat-select-more
          v-if="isSearchCheckMore"
        />
      </div>
  </div>
</template>

<script>
  import util from '../../utils'
  import config from '../../configs'
  import MsgRecordFn from './msgRecord.js'
  import SearchData from '../search/search.js'
  import ChatSelectMore from '../chat/ChatSelectMore'
  import emojiObj from '../../configs/emoji'
  export default {
    name: 'search-record-more',
    components: {
      ChatSelectMore
    },
    data () {
      return {
        myGroupIcon: config.defaultGroupIcon,
        beforeValue: '', // 上一次输入的值，做延时搜索
        recordlistMore: [],
        isPlay: false,
        msgsTemp: [],
        idClient: this.$route.query.idClient,
        isSearchCheckMore: false
      }
    },
    mounted () {
      // 消息列表是否多选
      this.eventBus.$on('updateIsCheckMoreChat', (data) => {
        this.isSearchCheckMore = data.isMore
      })
      this.renderRecordlistMore()
      this.$nextTick(() => {
        this.recordInterval = setInterval(() => {
          if (document.getElementById('recordMore-box') && document.getElementById(`${this.idClient}`)) {
            let curMsgTop = document.getElementById(`${this.idClient}`).offsetTop
            document.getElementById('recordMore-box').scrollTop = curMsgTop
            clearInterval(this.recordInterval)
          }
        }, 100)
      })
    },
    computed: {
      titleName () {
        return this.$route.query.titleName
      },
      time () {
        return this.$route.query.time
      },
      searchValue () {
        return this.$route.query.searchValue
      },
      sessionId () {
        return this.$route.query.sessionId || this.$store.state.currSessionId
      },
      myInfo () {
        return this.$store.state.myInfo
      },
      userInfos () {
        return this.$store.state.userInfos
      },
      myPhoneId () {
        return `${this.$store.state.userUID}`
      },
      checkedMsgList () {
        // 多选时选中的消息
        if (this.$store.state.checkedMsgs && this.$store.state.checkedMsgs.length > 0) {
          return this.$store.state.checkedMsgs
        } else {
          return []
        }
      }
    },
    methods: {
      // 页面滚动
      async scroll (e) {
        let { scrollTop, clientHeight, scrollHeight } = e.target
        if (scrollTop === 0) {
          // 滚动到顶部，继续加载第一条前面的消息
          let firstMsgTime = this.recordlistMore[0].time
          let beforeMsgList = await this.getBeforeMsgList(firstMsgTime)
          this.recordlistMore.unshift(...beforeMsgList)
        }
        if (scrollHeight - (scrollTop + clientHeight) < 1) {
          // 滚动到底部，继续加载最后一条后面的消息
          let lastMsgTime = this.recordlistMore[this.recordlistMore.length - 1].time
          let afterMsgList = await this.getAfterMsgList(lastMsgTime)
          this.recordlistMore.push(...afterMsgList)
        }
      },
      toggleToChat () {
        // 点击‘关闭’按钮，切换到聊天会话窗口
        this.$router.push({name: 'chat', query: {sessionId: this.sessionId}})
      },
      // 消息时间戳处理 --- 年-月-日 时-分-秒
      manageTime (time) {
        return util.DateFormat(time)
      },
      // 数据处理
      manageItem (item) {
        if (item.type === 'text') {
          item.showText = item.showText
        } else if (item.type === 'custom') {
          let content = JSON.parse(item.content)
          // type 1 为猜拳消息
          if (content.type === 1) {
            let data = content.data
            let resourceUrl = config.resourceUrl
            item.type = 'custom-type1'
            item.imgUrl = `${resourceUrl}/im/play-${data.value}.png`
            // type 3 为贴图表情
          } else if (content.type === 3) {
            let data = content.data
            let emojiCnt = ''
            if (emojiObj.pinupList[data.catalog]) {
              emojiCnt = emojiObj.pinupList[data.catalog][data.chartlet]
              item.type = 'custom-type3'
              item.imgUrl = `${emojiCnt.img}`
            }
          } else if (content.type === 7) {
            // 自定义富文本消息
            item.type = 'custom-type7'
            item.showText = content.data.value
          } else if (content.type === 8) {
            // 自定义邀请入群消息
            item.type = 'custom-type8'
            if (!content.data.value.teamAvatarUrl) {
              content.data.value.teamAvatarUrl = config.defaultGroupIcon
            }
            item.showText = content.data.value
          } else {
            item.showText = util.parseCustomMsg(item)
            if (item.showText !== '[自定义消息]') {
              item.showText += ',请到手机或电脑客户端查看'
            }
          }
        } else if (item.type === 'custom-type7') {
          // 自定义富文本消息
          let content = JSON.parse(item.content)
          item.showText = content.data.value
          console.log(item)
        } else if (item.type === 'custom-type8') {
          // 自定义邀请入群消息
          let content = JSON.parse(item.content)
          if (!content.data.value.teamAvatarUrl) {
            content.data.value.teamAvatarUrl = config.defaultGroupIcon
          }
          item.showText = content.data.value
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
          if (/(mov|mp4|ogg|webm)/i.test(item.file.ext)) {
            item.src = item.file.url
          } else {
            item.src = ''
            item.href = item.file.url
          }
        } else if (item.type === 'audio') {
          item.audioSrc = item.file.mp3Url
          item.showText = Math.round(item.file.dur / 1000) + '" 点击播放'
        } else if (item.type === 'file') {
          item.fileLink = item.file.url
          item.showText = item.file.name
        } else {
          item.showText = `[${util.mapMsgType(item)}],请到手机或电脑客户端查看`
        }
        return item
      },
      // 获取当前消息之后的消息
      async getAfterMsgList (time) {
        let afterMsgList = await SearchData.getRecordsDetailData({start: time || (this.time - 1000)}, null, this.sessionId, false)
        console.log(afterMsgList)
        return afterMsgList
      },
      // 获取当前消息之前的消息
      async getBeforeMsgList (time) {
        let beforMsgList = await SearchData.getRecordsDetailData({start: 0, end: time || (this.time)}, null, this.sessionId, true)
        return beforMsgList.reverse() // 反转
      },
      // 获取上下文列表
      async renderRecordlistMore () {
        if (!this.time) return false
        let afterMsgList = await this.getAfterMsgList()
        let beforMsgList = await this.getBeforeMsgList()
        let allMsgList = beforMsgList.concat(afterMsgList) // 拼接
        let newRecordList = []
        for (let i in allMsgList) {
          allMsgList[i] = this.manageItem(allMsgList[i])
          newRecordList.push(allMsgList[i])
        }
        this.recordlistMore = newRecordList
      },
      className (msg) {
        // 选择框样式
        let className = 'check common'
        for (let i in this.checkedMsgList) {
          let idClient = this.checkedMsgList[i].idClient
          if (idClient === msg.idClient) {
            className = 'checked common'
            break
          }
        }
        return className
      },
      className2 (text, classname) {
        // 搜索关键字样式匹配
        classname = classname || ''
        for (let i in this.value) {
          if (this.value[i] === text) {
            return 'active ' + classname
          }
        }
        return classname
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
      showListOptions (e, msg) {
        if (msg.type === 'text' && e.button === 2) {
          let target = (this.$refs[`copy_${msg.idClient}`])[0]
          MsgRecordFn.copyAll(target)
        }
        if (e.button === 2) {
          e.preventDefault()
          let key = ''
          if (msg.type === 'text') {
            key = 'msg-record'
          } else {
            key = 'image-msg-record'
          }
          this.$store.dispatch('showListOptions', {
            key,
            show: true,
            id: msg,
            pos: {
              x: e.clientX,
              y: e.clientY
            },
            that: this,
            msg,
            callBack: (type) => {
              switch (type) {
                case 0: // 多选
                  this.searchCheckMoreFn(msg)
                  break
                case 2: // 转发
                  // 转发消息 ***** type=8---多条转发， type=7---单条转发， msg---要转发的消息
                  let sidelist = MsgRecordFn.forwordMsg(this.to, this.myPhoneId, this.userInfos, this.myInfo, this.myGroupIcon) // type:8---多条转发， type:7---单条转发
                  this.eventBus.$emit('selectContact', {type: 7, sidelist, msg})
                  break
                case 3: // 复制
                  let clipboard = (this.$refs[`clipboard_${msg.idClient}`])[0]
                  clipboard.innerText = MsgRecordFn.getCopyText(e)
                  clipboard.select()
                  document.execCommand('Copy')
                  break
                case 4: // 删除
                  let index = this.recordlistMore.findIndex(item => {
                    return item.idClient === msg.idClient
                  })
                  if (index > -1) {
                    this.recordlistMore.splice(index, 1)
                  }
                  this.$store.dispatch('deleteMsg', msg)
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
        // if (this.$store.state.slideMenuStatus === 2 && type === 'text') {
        //   this.$store.commit('toggleSlideMenuStatus', 3)
        // }
        // 处理拖拽窗口事件移除
        document.onmousemove = null
        document.onmouseup = null
        document.body.style.cursor = 'default'
      },
      searchCheckMoreFn (msg) {
        this.isSearchCheckMore = true
        this.$store.commit('updateCheckedMsgs', [msg])
      },
      checkItemFn (msg) {
        const index = this.checkedMsgList.findIndex(item => {
          return item.idClient === msg.idClient
        })
        if (index === -1) {
          this.checkedMsgList.push(msg)
        } else {
          this.checkedMsgList.splice(index, 1)
        }
        this.$store.commit('updateCheckedMsgs', this.checkedMsgList)
      },
      reset () {
        this.beforeValue = ''
        this.recordlistMore = []
      },
      sendMsgToIframe (showText, idClient) {
        this.iframe = this.$refs.iframe
        this.iframe.contentWindow && this.iframe.contentWindow.postMessage({
          params: {showText, idClient}
        }, '*')
        setTimeout(() => {
          this.iframe.contentWindow.document.body.onmouseup = (e) => {
            this.showListOptions(e, 'custom-type7', 'iframe')
          }
          var a = [...(this.iframe.contentWindow.document.getElementsByTagName('a'))]
          for (let i = 0; i < a.length; i++) {
            a[i].addEventListener('click', (e) => {
              e.preventDefault()
              let url = a[i].getAttribute('href')
              if (url) {
                if (url.indexOf('yximcreatesession.telecomjs.com') > -1) {
                  // 发起会话处理
                  let account = e.url.split('?account=')[1]
                  if (account) {
                    if (config.environment === 'web') { // web分支
                      Request.GetAccid({userName: account}, this).then(ret => {
                        let accid = ret.accid
                        // 根据account 获取 accid 发起会话
                        this.createSession(accid)
                      })
                    } else { // electron分支
                      let { ipcRenderer } = require('electron')
                      ipcRenderer.send('sendAccount', {account})
                    }
                  }
                }
              }
              let openType = 1
              if (url.indexOf('#browserWindow') > -1) {
                openType = 2
              }
              this.openAplWindow({url}, openType)
            })
          }
        }, 1000)
      },
      openAplWindow (evt, sessionId) {
        MsgRecordFn.openAplWindow(evt, sessionId)
      }
    }
  }
</script>

<style scoped>
  #recordMore-box .u-list-item:hover {
    background-color: '#fff'
  }
  .m-chat .m-body-contain {
    position: absolute;
    left: 0;
    top: 40px;
    bottom: 0;
    right: 0;
  }
  .m-chat .m-body-contain-1 {
    bottom: 150px;
  }
  .m-chat .m-header {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    border-bottom: 1px solid rgba(214,214,214,1);
    padding: 5px 15px;
  }
  .m-chat .m-header .session-name {
    height: 21px;
    line-height: 21px;
    font-size: 15px;
    color: #0D0F0D;
  }
  .m-chat .m-header .close-btn {
    -webkit-app-region: no-drag;
    width: 60px;
    height: 24px;
    background-color: #F0F0F0;
    border-radius: 4px
  }
  .m-chat .m-header .close-btn:hover {
    background-color: #E0E0E0;
  }
  .m-chat .m-header .close-text {
    padding: 4px 16px;
    color: #049AFF;
    font-size: 12px;
  }
  .s-list-item {
    position: relative;
    display: flex;
    flex-direction: row;
    width: 100%;
    height: auto;
    box-sizing: border-box;
    padding: 10px 16px;
    cursor: default;
  }
  .s-list-item-checked {
    background-color: #e0e0e0
  }
  .left{
    display: flex;
    flex-direction: row;
    width: 78%;
  }
  .left .msg-text{
    height: auto;
    font-size:14px;
    color:#333;
    line-height: 20px;
    padding-top: 5px;
    word-wrap: break-word;
  }
  .avatar {
    width:40px;
    height:40px;
    border-radius: 50%;
    margin-top: 2px;
  }
  .left .s-name {
    font-size:12px;
    color:#999;
    margin-right:10px
  }
  .left .s-time {
    font-size:12px;
    color:#999;
  }
  .msg-audio{
    position: relative;
    overflow: visible !important;
    width: 60px;
    height: 20px;
    transition: all .2s;
    cursor: pointer;
    background: url(../../../../static/img/edit/voice-y.png) 12px center no-repeat;
    background-size: 14px 20px;
  }
  .msg-audio.zel-play{
    background: url(../../../../static/img/edit/voice-y-p.gif) 12px center no-repeat;
    background-size: 14px 20px;
  }
  .msg-audio span{
    position: absolute;
    bottom: -2px;
    right: 0;
    display: block;
    color: #999;
    font-size: 14px;
  }
  .common {
    display: inline-block;
    width: 15px;
    height: 32px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
    margin: 5px 5px 0 0 ;
  }
  .check {
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 15px 15px;
  }
  .checked {
    background-image: url('../../../../static/img/setting/checkbox-c.png');
    background-size: 15px 15px;
  }

  .check-more {
    position: absolute;
    right: 16px;
    top: 26px;
    font-size: 12px;
    color: #3F6D8C;
  }
  
</style>

