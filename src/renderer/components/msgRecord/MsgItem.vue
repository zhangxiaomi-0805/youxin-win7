<template>
  <li 
    class="list-item"
    @click.stop="isCheckMore ? checkItemFn(msg) : null"
  >
    <div  class="list-item">
      <div 
        class="left"
      >
        <!-- 选择框 -->
        <span v-show="isCheckMore" :class="className(msg)"></span>
        
        <img :src="msg.avatar" alt="" class="avatar">
        <div style="padding:0 8px; width:90%">
          <span style="font-size:12px; color:#999">{{msg.fromNick}}</span>
          <span v-if="msg.custom && JSON.parse(msg.custom).isSmsMsg" class="msg-short"><i class="send-short-msg"></i></span>
          <textarea style="width: 1px;height: 1px;position: absolute;left: -10px;" ref="clipboard"></textarea>
          <div 
            v-if="msg.type==='text'"
            style="font-size:13px; color:#333; line-height:18px;padding-top:2px; -webkit-user-select: text"
            @mouseup.stop="isCheckMore ? null : showListOptions($event, msg)"
            v-html="msg.showText"
            :ref="`copy_${msg.idClient}`"
          ></div>
          <div v-else-if="msg.type==='custom-type1'" ref="mediaMsg"></div>
          <div v-else-if="msg.type==='custom-type3'" ref="mediaMsg" @mouseup.stop="isCheckMore ? null : showListOptions($event, msg)" style="background:transparent;border:none;"></div>
          <div v-else-if="msg.type==='image'"  ref="mediaMsg" @mouseup.stop="isCheckMore ? null : showListOptions($event, msg)" :style="{cursor: 'pointer', width: msg.w + 'px', height: msg.h + 'px', background: 'transparent', border: 'none'}">
            <img :src="msg.originLink" style="width: 100%; height: 100%"/> 
          </div>
          <div v-else-if="msg.type==='video'"  ref="mediaMsg"></div>
          <div v-else-if="msg.type==='audio'"  :class="isPlay ? 'zel-play' : ''" @click="isCheckMore ? null : playAudio(msg.audioSrc, msg)" @mouseup.stop="isCheckMore ? null : showListOptions($event, msg)"><span>{{msg.showText.split(' ')[0]}}</span></div>
          <div v-else-if="msg.type==='file'"  @mouseup.stop="isCheckMore ? null : showListOptions($event, msg)"><a href="javascript:;" target="_blank"><i class="u-icon icon-file"></i>{{msg.showText}}</a></div>
        </div>
      </div>
      <!-- 时间 -->
      <div style="font-size:12px; color:#999">{{manageTime(msg.time)}}</div>
    </div>
        
  </li>
</template>

<script type="text/javascript">
import util from '../../utils'
import config from '../../configs'
import MsgRecordFn from './msgRecord.js'
export default {
  name: 'msg-item',
  props: {
    isCheckMore: Boolean,
    scene: String,
    to: String,
    teamId: String,
    idClient: String,
    sessionId: String,
    // checkedMsgList: {
    //   type: Array,
    //   default () {
    //     return {}
    //   }
    // },
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
      currentAudio: null,
      myGroupIcon: config.defaultGroupIcon
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
    showListOptions (e, msg) {
      if (msg.type === 'text' && e.button === 2) {
        let target = this.$refs[`copy_${this.idClient}`]
        MsgRecordFn.copyAll(target)
      }
      console.log(msg)
      if (e.button === 2) {
        let key = 'msg-record'
        // let key = msg.type + '-msg-record'
        console.log(key)
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
                this.checkMoreFn(msg)
                break
              case 2: // 转发
                // 转发消息 ***** type=8---多条转发， type=7---单条转发， msg---要转发的消息
                let sidelist = MsgRecordFn.forwordMsg(this.to, this.myPhoneId, this.userInfos, this.myInfo, this.myGroupIcon) // type:8---多条转发， type:7---单条转发
                this.eventBus.$emit('selectContact', {type: 7, sidelist, msg: this.msg})
                break
              case 3: // 复制
                console.log(this.$refs.clipboard)
                this.$refs.clipboard.innerText = MsgRecordFn.getCopyText(e)
                this.$refs.clipboard.select()
                document.execCommand('Copy')
                break
              case 4: // 删除
                this.$store.dispatch('deleteMsg', this.msg)
                break
              case 6: // 图片或文件另存为
                // if (msg.type === 'file') {
                //   const file = {
                //     name: msg.file.name,
                //     url: this.downloadUrl
                //   }
                //   this.$store.dispatch('downloadImg', file)
                // } else {
                //   this.$store.dispatch('downloadImg', msg.file)
                // }
                break
              case 37: // 文件下载
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
      // 处理拖拽窗口事件移除
      document.onmousemove = null
      document.onmouseup = null
      document.body.style.cursor = 'default'
    },
    checkMoreFn (msg) {
      this.$emit('checkMore')
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
</style>