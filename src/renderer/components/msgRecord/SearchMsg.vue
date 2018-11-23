<template>
  <!-- 历史消息记录搜索 -->
  <div class="s-cont">
    <div v-if="searchlist.length <= 0" class="s-empty searchevent">暂无搜索结果~</div>
    <ul class="u-list"> 
      <li
        class="list-item"
        v-for="msg in searchlist"
        :key="msg.id"
        :id="msg.id"
        @click.stop="isSearchCheckMore ? checkItemFn(msg) : null"
      >
        <div  class="list-item">
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
                />
                <div v-else-if="msg.type==='custom-type1'" class="msg-text" ref="mediaMsg"></div>
                <div v-else-if="msg.type==='custom-type3'" class="msg-text" ref="mediaMsg" @mouseup.stop="isSearchCheckMore ? null : showListOptions($event, msg)" style="background:transparent;border:none;"></div>
                <div v-else-if="msg.type==='image'" class="msg-text cover" ref="mediaMsg" @mouseup.stop="isSearchCheckMore ? null : showListOptions($event, msg)" :style="{cursor: 'pointer', width: msg.w + 'px', height: msg.h + 'px', background: 'transparent', border: 'none'}"></div>
                <div v-else-if="msg.type==='video'" class="msg-text" ref="mediaMsg"></div>
                <div v-else-if="msg.type==='audio'" class="msg-text msg-audio" :class="isPlay ? 'zel-play' : ''" @click="isSearchCheckMore ? null : playAudio(msg.audioSrc, msg)" @mouseup.stop="isSearchCheckMore ? null : showListOptions($event, msg)"><span>{{msg.showText.split(' ')[0]}}</span></div>
                <div v-else-if="msg.type==='file'" class="msg-text"><a :href="msg.fileLink" target="_blank"><i class="u-icon icon-file"></i>{{msg.showText}}</a></div>
            </div>
          </div>
          <!-- 时间 -->
          <div style="font-size:12px; color:#999">{{manageTime(msg.time)}}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import util from '../../utils'
import config from '../../configs'
import MsgRecordFn from './msgRecord.js'
export default {
  name: 'search-msg',
  props: {
    shortMsgCheck: Boolean,
    searchValue: String,
    historyMsgList: Array,
    clearStatus: Function,
    isSearchCheckMore: Boolean,
    sessionId: String,
    checkType: String, // ''---全部; image---图片; file---文件
    checkedMsgList: {
      type: Array,
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
    }
  },
  data () {
    return {
      myGroupIcon: config.defaultGroupIcon,
      beforeValue: '', // 上一次输入的值，做延时搜索
      searchlist: [],
      isPlay: false
    }
  },
  mounted () {
    this.InitSearchMsg()
  },
  watch: {
    searchValue (newValue, oldValue) {
      this.beforeValue = newValue
      setTimeout(() => {
        if (newValue !== this.beforeValue) return
        this.renderItem(newValue)
      }, 500)
    },
    shortMsgCheck (newValue, oldValue) {
      this.beforeValue = newValue
      setTimeout(() => {
        if (newValue !== this.beforeValue) return
        this.renderItem(this.searchValue)
      }, 500)
    }
  },
  computed: {
    myPhoneId () {
      return `${this.$store.state.userUID}`
    }
  },
  methods: {
    InitSearchMsg () {
      let searchMsgList = MsgRecordFn.getSearchRecords(this.searchValue, this.checkType)
      console.log(searchMsgList)
      return searchMsgList
    },
    manageTime (time) {
      return util.formatDate(time, true)
    },
    renderItem (value) {
      let searchlist = []
      let searchMsgList = []
      let msgList = this.$store.state.currSessionMsgs
      console.log(value)
      console.log(msgList)
      for (let i in msgList) {
        if (msgList[i].text && msgList[i].text.indexOf(value) > -1) {
          searchlist.unshift(msgList[i])
          if (msgList[i].custom && JSON.parse(msgList[i].custom).isSmsMsg) {
            searchMsgList.unshift(msgList[i])
          }
        }
      }
      if (this.shortMsgCheck) {
        this.searchlist = searchMsgList
      } else {
        this.searchlist = searchlist
      }
      console.log(this.searchlist)
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
        console.log(target)
        MsgRecordFn.copyAll(target)
      }
      if (e.button === 2) {
        let key = 'msg-record'
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
                console.log(this.$refs[`clipboard_${msg.idClient}`])
                let clipboard = (this.$refs[`clipboard_${msg.idClient}`])[0]
                clipboard.innerText = MsgRecordFn.getCopyText(e)
                clipboard.select()
                document.execCommand('Copy')
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
    }
  }
}
</script>

<style scoped>
  .s-cont {
    position: absolute;
    top: 180px;
    width: 87%;
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
    overflow-x: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 10px;
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
    padding-top:2px
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
</style>

