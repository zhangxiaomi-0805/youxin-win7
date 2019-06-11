<template>
  <!-- 历史消息记录搜索 -->
  <div class="s-cont" style="top: 125px;">
    <div v-if="searchlist.length <= 0" class="s-empty searchevent">暂无搜索结果~</div>
    <ul class="u-list" v-if="searchlist.length > 0">
      <li
        class="list-item"
        v-for="msg in searchlist"
        :key="msg.idClient"
        :id="msg.idClient"
        @click.stop="isSearchCheckMore ? checkItemFn(msg) : null"
        @mouseenter="idClient = msg.idClient"
        @mouseleave="idClient = ''"
      >
        <div class="list-item" style="position: relative;">
          <div class="left">
            <!-- 选择框 -->
            <span v-show="isSearchCheckMore" :class="className(msg)"></span>
            <img :src="msg.avatar" alt="" class="avatar">
            <div style="padding:0 8px; width:85%">
              <span style="font-size:12px; color:#999">{{msg.fromNick}}</span>
              <span v-if="msg.custom && JSON.parse(msg.custom).isSmsMsg" class="msg-short"><i class="send-short-msg"></i></span>
              <textarea style="width: 1px;height: 1px;position: absolute;overflow:hidden;left: -10px;" :ref="`clipboard_${msg.idClient}`"></textarea>
              <div
                v-if="msg.type==='text'"
                @mouseup.stop="isSearchCheckMore ? null : showListOptions($event, msg)"
                :ref="`copy_${msg.idClient}`"
                class="searchValue"
                style="-webkit-user-select: text"
                v-html="msg.showText"
                @click.stop="openAplWindow($event, msg.sessionId)"
                @keydown.stop="shearBoard($event)"
                tabindex="1"
              />
              <div v-else-if="msg.type==='custom-type1'" class="msg-text" ref="mediaMsg"></div>
              <div v-else-if="msg.type==='custom-type3'" class="msg-text" ref="mediaMsg" @mouseup.stop="isSearchCheckMore ? null : showListOptions($event, msg)" style="background:transparent;border:none;">
                <img :src="msg.imgUrl" style="width: 100%; height: 100%"/>
              </div>
              <div v-else-if="msg.type==='image'" class="msg-text cover" ref="mediaMsg" @mouseup.stop="isSearchCheckMore ? null : showListOptions($event, msg)" :style="{cursor: 'pointer', width: msg.w + 'px', height: msg.h + 'px', background: 'transparent', border: 'none'}">
                <img :src="msg.imgUrl" style="width: 230px; height: 230px"/>
              </div>
              <div v-else-if="msg.type==='video'" class="msg-text" ref="mediaMsg">
                <video :src="msg.src" autoStart="false" controls="controls" style="width:230px; height:230px"></video>
              </div>
              <div v-else-if="msg.type==='audio'" class="msg-text msg-audio" :class="isPlay ? 'zel-play' : ''" @click="isSearchCheckMore ? null : playAudio(msg.audioSrc, msg)" @mouseup.stop="isSearchCheckMore ? null : showListOptions($event, msg)"><span>{{msg.showText.split(' ')[0]}}</span></div>
              <div v-else-if="msg.type==='file'" class="msg-text"><a :href="msg.fileLink" target="_blank"><i class="u-icon icon-file"></i>{{msg.showText}}</a></div>
            </div>
          </div>
          <!-- 时间 -->
          <div class="time">{{manageTime(msg.time)}}</div>
          <a v-if="idClient === msg.idClient " class="check-more" @click.stop="locationToMsg(msg, true)">查看上下文</a>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  import util from '../../utils'
  import config from '../../configs'
  import emojiObj from '../../configs/emoji'
  import MsgRecordFn from './msgRecord.js'
  // import SearchData from '../search/search.js'
  export default {
    name: 'search-msg',
    props: {
      shortMsgCheck: Boolean,
      searchValue: String,
      clearStatus: Function,
      isSearchCheckMore: Boolean,
      sessionId: String,
      checkType: String, // 'all'---全部; image---图片; file---文件
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
      closeCover: Function
    },
    data () {
      return {
        myGroupIcon: config.defaultGroupIcon,
        beforeValue: '', // 上一次输入的值，做延时搜索
        searchlist: [],
        isPlay: false,
        msgsTemp: [],
        idClient: ''
      }
    },
    watch: {
      searchValue (newValue, oldValue) {
        this.beforeValue = newValue
        setTimeout(() => {
          if (newValue !== this.beforeValue) return
          this.renderItem(newValue, this.checkType)
        }, 500)
      },
      shortMsgCheck (newValue, oldValue) {
        this.beforeValue = newValue
        setTimeout(() => {
          if (newValue !== this.beforeValue) return
          this.renderItem(this.searchValue, this.checkType)
        }, 500)
      },
      checkType () {
        this.renderItem(this.searchValue, this.checkType)
      }
    },
    computed: {
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
      // 消息时间戳处理 --- 年-月-日 时-分-秒
      manageTime (time) {
        return util.DateFormat(time)
      },
      manageItem (item) {
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
        if (item.type === 'text') {
          item.showText = item.text
          // 标签解析
          item.showText = util.escape(item.showText)
          // 文本消息
          let variable = 0
          let replaceArr = []
          // url匹配
          let httpUrls = MsgRecordFn.httpSpring(item.text)
          if (httpUrls.length > 0) {
            httpUrls.map(url => {
              item.showText = item.showText.replace(url, (m) => {
                variable++
                let urlContent = url
                urlContent = urlContent.replace(this.searchValue, `<span style="color: rgba(79,141,255,1);">${this.searchValue}</span>`)
                replaceArr.push(`<a style="max-width: 100%;text-decoration: underline;display: inline-block;" data-url="[${url}]">${urlContent}</a>`)
                return `{---===${variable}}`
              })
            })
          }
          if (replaceArr.length === 0) {
            // 关键词高亮匹配
            item.showText = item.showText.replace(/\s/g, ' ').replace(/&nbsp;/g, ' ')
            let reg = new RegExp(`${this.searchValue}`, 'g')
            item.showText = item.showText.replace(reg, `<span style="color: rgba(79,141,255,1);">${this.searchValue}</span>`)
          }
          // 表情匹配
          if (/\[[\u4e00-\u9fa5]+\]/.test(item.showText)) {
            let emojiItems = item.showText.match(/\[[\u4e00-\u9fa5]+\]/g)
            emojiItems.forEach(text => {
              let emojiCnt = emojiObj.emojiList.emoji
              if (emojiCnt[text]) {
                let dataKey = text.slice(1, -1)
                item.showText = item.showText.replace(text, `<img data-key='[${dataKey}]' style="width: 20px;height: 20px;vertical-align: top;" class='emoji-small'  src='${emojiCnt[text].img}'>`)
              }
            })
          }
          // 变量替换
          if (replaceArr.length > 0) {
            for (let i = 0; i < replaceArr.length; i++) {
              item.showText = item.showText.replace(`{---===${i + 1}}`, replaceArr[i])
            }
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
        } else {
          item.showText = `[${util.mapMsgType(item)}],请到手机或电脑客户端查看`
        }
        return item
      },
      async renderItem (searchValue, checkType) {
        if (!searchValue) return false
        if (checkType === 'all') {
          checkType = ['text', 'image', 'file', 'audio', 'video', 'custom-type3']
        } else if (checkType === 'image') {
          checkType = ['image']
        } else if (checkType === 'file') {
          checkType = ['file']
        }
        let msgList = await MsgRecordFn.getSearchRecords(searchValue, checkType)
        let searchlist = []
        let searchMsgList = []
        for (let i in msgList) {
          if (msgList[i].text && msgList[i].text.indexOf(searchValue) > -1) {
            this.manageItem(msgList[i])
            searchlist.push(msgList[i])
            if (msgList[i].custom && JSON.parse(msgList[i].custom).isSmsMsg) {
              this.manageItem(msgList[i])
              searchMsgList.push(msgList[i])
            }
          }
        }
        if (this.shortMsgCheck) {
          this.searchlist = searchMsgList
        } else {
          this.searchlist = searchlist
        }
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
      shearBoard (e) {
        // Ctrl + C写入剪切版
        let copyText = MsgRecordFn.getCopyText(e)
        document.addEventListener('copy', function copy (e) {
          e.clipboardData.setData('text/plain', copyText)
          e.preventDefault()
        })
        document.execCommand('copy')
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
                  this.shearBoard(e)
                  break
                case 4: // 删除
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
        this.$emit('searchCheckMore')
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
        this.searchlist = []
      },
      openAplWindow (evt, sessionId) {
        MsgRecordFn.openAplWindow(evt, sessionId)
      },
      locationToMsg (msg) {
        let sessionName = this.$store.state.sessionName
        this.$router.push({name: 'search-record-more', query: {idClient: msg.idClient, time: msg.time, titleName: sessionName, searchValue: this.searchValue, sessionId: this.sessionId}})
        this.closeCover()
      }
    }
  }
</script>

<style scoped>
  .s-cont {
    position: absolute;
    top: 120px;
    width: 558px;
    height: 300px;
    z-index: 100;
    box-sizing: border-box;
    background-color: #fff;
    overflow-y: auto;
  }

  .s-empty {
    display: flex;
    justify-content: center;
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    font-size: 13px;
    color: #C4C4C4;
  }
  .list-item {
    width:100%;
    box-sizing: border-box;
    overflow-x: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 16px 10px 0;
  }
  .list-item .left{
    display: flex;
    flex-direction: row;
    width: 88%;
  }
  .list-item .left .searchValue{
    font-size:13px;
    color:#333;
    line-height:18px;
    padding-top:2px;
    word-wrap: break-word;
  }
  .list-item .left .searchValue.active{
    color: rgba(79,141,255,1);
  }
  .list-item .avatar {
    width:32px;
    height:32px;
    border-radius: 50%;
    margin-top: 5px;
  }
  .list-item .msg-short .send-short-msg {
    display: inline-block;
    vertical-align: middle;
    padding-left: 5px;
    width: 16px;
    height: 12px;
    background-repeat: no-repeat;
    background-position: center center;
    background-image: url('../../../../static/img/edit/message-h.png');
    background-size: 16px 12px;
  }
  .list-item .msg-audio{
    position: relative;
    overflow: visible !important;
    width: 60px;
    height: 20px;
    transition: all .2s;
    cursor: pointer;
    background: url(../../../../static/img/edit/voice-y.png) 12px center no-repeat;
    background-size: 14px 20px;
  }
  .list-item .msg-audio.zel-play{
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
  .list-item .common {
    display: inline-block;
    width: 15px;
    height: 32px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
    margin: 5px 5px 0 0 ;
  }
  .list-item .check {
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 15px 15px;
  }
  .list-item .checked {
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
  .list-item .time {
    font-size:12px;
    color:#999;
    position: absolute;
    top: 0;
    right: 0
  }
</style>

