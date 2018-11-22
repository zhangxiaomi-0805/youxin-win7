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
                <textarea style="width: 1px;height: 1px;position: absolute;left: -10px;" ref="clipboard"></textarea>
                <div 
                  v-if="msg.type==='text'"
                  @mousedown.stop="isSearchCheckMore ? null : showListOptions($event, msg)"
                  @mouseup.stop="isSearchCheckMore ? null : itemMouseUp($event)"
                  :ref="`copy_${msg.idClient}`" 
                >
                  <!-- :class="className2(text, 'searchValue')" -->
                  <span class="searchValue" v-html="msg.showText"/>
                </div>
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
export default {
  name: 'search-history-msg',
  props: {
    messageCheck: Boolean,
    value: String,
    historyMsgList: Array,
    clearStatus: Function,
    isSearchCheckMore: Boolean,
    sessionId: String,
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
      beforeValue: '', // 上一次输入的值，做延时搜索
      searchlist: []
    }
  },
  watch: {
    value (newValue, oldValue) {
      this.beforeValue = newValue
      setTimeout(() => {
        if (newValue !== this.beforeValue) return
        this.renderItem(newValue)
      }, 500)
    },
    messageCheck (newValue, oldValue) {
      this.beforeValue = newValue
      setTimeout(() => {
        if (newValue !== this.beforeValue) return
        this.renderItem(this.value)
      }, 500)
    }
  },
  methods: {
    manageTime (time) {
      return util.formatDate(time, true)
    },
    renderItem (value) {
      let searchlist = []
      let searchMsgList = []
      for (let i in this.historyMsgList) {
        if (this.historyMsgList[i].text && this.historyMsgList[i].text.indexOf(value) > -1) {
          searchlist.unshift(this.historyMsgList[i])
          if (this.historyMsgList[i].custom && JSON.parse(this.historyMsgList[i].custom).isSmsMsg) {
            searchMsgList.unshift(this.historyMsgList[i])
          }
        }
      }
      if (this.messageCheck) {
        this.searchlist = searchMsgList
      } else {
        this.searchlist = searchlist
      }
      console.log(this.searchlist)
    },
    className (msg) {
      // 选择框样式
      let className = 'check common'
      this.isItemChecked = false
      console.log(this.checkedMsgList)
      for (let i in this.checkedMsgList) {
        let idClient = this.checkedMsgList[i].idClient
        if (idClient === msg.idClient) {
          this.isItemChecked = true
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
    showListOptions (e, msg) {
      this.selectInfo = null
      // if (msg.type === 'text' && e.button === 2) {
      //   this.copyAll(msg)
      // }
      if (e.button === 2) {
        let key = 'history-msg'
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
                this.forwordMsg(msg)
                break
              case 3: // 复制
                this.$refs.clipboard.innerText = this.getCopyText(e)
                this.$refs.clipboard.select()
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
    getSelectedText () {
      let sel = window.getSelection && window.getSelection()
      if (sel && sel.rangeCount > 0) {
        let selection = window.getSelection().getRangeAt(0).cloneContents()
        return selection
      } else {
        return ''
      }
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
    copyAll (msg) {
      // 右键复制全选
      let isNeedAllSelect = true
      let selection = window.getSelection()
      let target = this.$refs[`copy_${msg.idClient}`]
      console.log(target)
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
    forwordMsg (msg) {
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
      this.eventBus.$emit('selectContact', {type: 7, sidelist, msg})
    },
    searchCheckMoreFn (msg) {
      this.$emit('searchCheckMore')
      this.isItemChecked = true
      this.$store.commit('updateCheckedMsgs', {sessionId: this.sessionId, checkedMsgList: [msg]})
    },
    checkItemFn (msg) {
      if (this.isItemChecked) {
        this.isItemChecked = false
        for (let i in this.checkedMsgList) {
          let idClient = this.checkedMsgList[i].idClient
          if (idClient === msg.idClient) {
            this.checkedMsgList.splice(i, 1)
            break
          }
        }
      } else {
        this.isItemChecked = true
        this.checkedMsgList.push(msg)
        console.log('11')
      }
      this.$store.commit('updateCheckedMsgs', {sessionId: this.sessionId, checkedMsgList: this.checkedMsgList})
      console.log(this.$store.state.checkedMsgs)
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

