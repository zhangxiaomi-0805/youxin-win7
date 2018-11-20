<template>
  <li 
    class="list-item"
    @click="locationToMsg(msg, true)"
  >
    <div  class="list-item">
      <div class="left">
          <img :src="msg.avatar" alt="" class="avatar">
          <div style="padding:0 8px">
              <span style="font-size:12px; color:#999">{{msg.fromNick}}</span>
              <span v-if="msg.custom && JSON.parse(msg.custom).isSmsMsg" class="msg-short"><i class="send-short-msg"></i></span>

              <div 
                v-if="msg.type==='text'"
                style="font-size:13px; color:#333; line-height:18px;padding-top:2px"
                @mouseup.stop="showListOptions($event, msg.type)"
                ref="clipboard"
                v-html="msg.showText"
              ></div>
              <div v-else-if="msg.type==='custom-type1'" ref="mediaMsg"></div>
              <div v-else-if="msg.type==='custom-type3'" ref="mediaMsg" @mouseup.stop="showListOptions($event, msg.type)" style="background:transparent;border:none;"></div>
              <div v-else-if="msg.type==='image'"  ref="mediaMsg" @mouseup.stop="showListOptions($event, msg.type)" :style="{cursor: 'pointer', width: msg.w + 'px', height: msg.h + 'px', background: 'transparent', border: 'none'}"></div>
              <div v-else-if="msg.type==='video'"  ref="mediaMsg"></div>
              <div v-else-if="msg.type==='audio'"  :class="isPlay ? 'zel-play' : ''"  @mouseup.stop="showListOptions($event, 'audio')"><span>{{msg.showText.split(' ')[0]}}</span></div>
              <div v-else-if="msg.type==='file'" ><a :href="msg.fileLink" target="_blank"><i class="u-icon icon-file"></i>{{msg.showText}}</a></div>
          </div>
      </div>
      <!-- 时间 -->
      <div style="font-size:12px; color:#999">{{manageTime(msg.time)}}</div>
    </div>
        
  </li>
</template>

<script type="text/javascript">
import util from '../../utils'
export default {
  name: 'history-item',
  props: {
    scene: String,
    to: String,
    teamId: String,
    idClient: String,
    msg: {
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
      isPlay: false,
      currentAudio: null
    }
  },
  // computed: {
  //   msg () {
  //     let item = Object.assign({}, this.rawMsg)
  //     if (item.flow === 'in') {
  //       if (item.type === 'robot' && item.content && item.content.msgOut) {
  //         // 机器人下行消息
  //         let robotAccid = item.content.robotAccid
  //         item.avatar = this.robotInfos[robotAccid].avatar
  //         item.isRobot = true
  //         item.link = `#/mainpage/contacts/card?accid=${robotAccid}`
  //       } else if (item.from !== this.$store.state.userUID) {
  //         item.avatar = (this.userInfos[item.from] && this.userInfos[item.from].avatar) || config.defaultUserIcon
  //         item.link = `#/mainpage/contacts/card?accid=${item.from}`
  //         //  todo如果是未加好友的人发了消息，是否能看到名片
  //       } else {
  //         item.avatar = this.myInfo.avatar
  //         // item.avatar = `${config.myPhoneIcon}`
  //       }
  //     } else if (item.flow === 'out') {
  //       item.avatar = this.myInfo.avatar
  //     }
  //     if (item.type === 'timeTag') {
  //       // 标记发送的时间
  //       item.showText = item.text
  //     } else if (item.type === 'text') {
  //       // 文本消息
  //       item.showText = util.escape(item.text)
  //       if (item.apns && item.flow === 'in') {
  //         if (!item.apns.accounts) {
  //           item.showText = item.showText.replace('@所有人', '<span style="color: #4F8DFF;">@所有人 </span>')
  //         } else if (item.apns.accounts.includes(this.myInfo.account)) {
  //           let name = util.escape(this.nickInTeam) || util.escape(this.myInfo.nick)
  //           item.showText = item.showText.replace('@' + name, `<span style="color: #4F8DFF;">@${name} </span>`)
  //         }
  //       }
  //       if (/\[[\u4e00-\u9fa5]+\]/.test(item.showText)) {
  //         let emojiItems = item.showText.match(/\[[\u4e00-\u9fa5]+\]/g)
  //         emojiItems.forEach(text => {
  //           let emojiCnt = emojiObj.emojiList.emoji
  //           if (emojiCnt[text]) {
  //             let dataKey = text.slice(1, -1)
  //             item.showText = item.showText.replace(text, `<img data-key='${dataKey}' style="width: 23px;height: 23px;vertical-align: middle;" class='emoji-small'  src='${emojiCnt[text].img}'>`)
  //           }
  //         })
  //       }
  //     } else if (item.type === 'custom') {
  //       let content = JSON.parse(item.content)
  //       // type 1 为猜拳消息
  //       if (content.type === 1) {
  //         let data = content.data
  //         let resourceUrl = config.resourceUrl
  //         // item.showText = `<img class="emoji-middle" src="${resourceUrl}/im/play-${data.value}.png">`
  //         item.type = 'custom-type1'
  //         item.imgUrl = `${resourceUrl}/im/play-${data.value}.png`
  //       // type 3 为贴图表情
  //       } else if (content.type === 3) {
  //         let data = content.data
  //         let emojiCnt = ''
  //         if (emojiObj.pinupList[data.catalog]) {
  //           emojiCnt = emojiObj.pinupList[data.catalog][data.chartlet]
  //           // item.showText = `<img class="emoji-big" src="${emojiCnt.img}">`
  //           item.type = 'custom-type3'
  //           item.imgUrl = `${emojiCnt.img}`
  //         }
  //       } else {
  //         item.showText = util.parseCustomMsg(item)
  //         if (item.showText !== '[自定义消息]') {
  //           item.showText += ',请到手机或电脑客户端查看'
  //         }
  //       }
  //     } else if (item.type === 'image') {
  //       // 原始图片全屏显示
  //       item.originLink = item.file.url
  //       if (item.file.w < 180) {
  //         item.w = item.file.w
  //         item.h = item.file.h
  //       } else {
  //         item.w = 180
  //         item.h = 180 / (item.file.w / item.file.h)
  //       }
  //     } else if (item.type === 'video') {
  //       // ...
  //     } else if (item.type === 'audio') {
  //       item.audioSrc = item.file.mp3Url
  //       item.showText = Math.round(item.file.dur / 1000) + '" 点击播放'
  //     } else if (item.type === 'file') {
  //       item.fileLink = item.file.url
  //       item.showText = item.file.name
  //     } else {
  //       item.showText = `[${util.mapMsgType(item)}],请到手机或电脑客户端查看`
  //     }
  //     console.log(item)
  //     return item
  //   }
  // },
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
          media.width = 400
          media.height = 380
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
    manageTime (time) {
      return util.formatDate(time, true)
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
    showListOptions (e, type) {
      console.log('aaa')
      if (e.button === 2) {
        let key = 'history-msg'
        this.$store.dispatch('showListOptions', {
          key,
          show: true,
          id: 'aaa',
          pos: {
            x: e.clientX,
            y: e.clientY
          },
          that: this,
          msg: 'aaa',
          callBack: (type) => {
            switch (type) {
              case 0: // 多选
                console.log('多选')
                break
              case 2: // 转发
                console.log('转发')
                // this.forwordMsg()
                break
              case 3: // 复制
                console.log('复制')
                // this.$refs.clipboard.innerText = this.getCopyText(e)
                // this.$refs.clipboard.select()
                // document.execCommand('Copy')
                break
              case 4: // 删除
                console.log('删除')
                // this.$store.dispatch('deleteMsg', this.msg)
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
    }
  }
}
</script>

<style scoped>
.list-item {
    width:100%;
    overflow-x: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 10px;

}
.list-item .left{
    display: flex;
    flex-direction: row;
    width: 88%
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
  background: url('/../../../../static/img/edit/voice-y.png') 12px center no-repeat;
  background-size: 14px 20px;
}
.list-item .msg-audio.zel-play{
  background: url('../../../../static/img/edit/voice-y-p.gif') 12px center no-repeat;
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
</style>