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
          <div v-else-if="msg.type==='image'"  ref="mediaMsg" @mouseup.stop="showListOptions($event, msg.type)" :style="{cursor: 'pointer', width: msg.w + 'px', height: msg.h + 'px', background: 'transparent', border: 'none'}">
            <img :src="msg.originLink" style="width: 100%; height: 100%"/> 
          </div>
          <div v-else-if="msg.type==='video'"  ref="mediaMsg"></div>
          <div v-else-if="msg.type==='audio'"  :class="isPlay ? 'zel-play' : ''" @click="playAudio(msg.audioSrc, msg)" @mouseup.stop="showListOptions($event, 'audio')"><span>{{msg.showText.split(' ')[0]}}</span></div>
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