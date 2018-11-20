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
      >
        <div  class="list-item">
            <div class="left">
                <img :src="msg.avatar" alt="" class="avatar">
                <div style="padding:0 8px">
                    <span style="font-size:12px; color:#999">{{msg.fromNick}}</span>
                    <span v-if="msg.custom && JSON.parse(msg.custom).isSmsMsg" class="msg-short"><i class="send-short-msg"></i></span>

                    <div 
                        v-if="msg.type==='text'"
                        style="width: 420px"
                        @mouseup.stop="showListOptions($event, msg.type)"
                        ref="clipboard"
                    >
                        <span :class="nameClass(text, 'searchValue')" v-for="text in msg.showText" :key="text.id" :id="text.id">{{text}}</span>
                    </div>
                    <div v-else-if="msg.type==='custom-type1'" class="msg-text" ref="mediaMsg"></div>
                    <div v-else-if="msg.type==='custom-type3'" class="msg-text" ref="mediaMsg" @mouseup.stop="showListOptions($event, msg.type)" style="background:transparent;border:none;"></div>
                    <div v-else-if="msg.type==='image'" class="msg-text cover" ref="mediaMsg" @click.stop="showImgModal(msg.originLink)" @mouseup.stop="showListOptions($event, msg.type)" :style="{cursor: 'pointer', width: msg.w + 'px', height: msg.h + 'px', background: 'transparent', border: 'none'}"></div>
                    <div v-else-if="msg.type==='video'" class="msg-text" ref="mediaMsg"></div>
                    <div v-else-if="msg.type==='audio'" class="msg-text msg-audio" :class="isPlay ? 'zel-play' : ''" @click="playAudio(msg.audioSrc, msg)" @mouseup.stop="showListOptions($event, 'audio')"><span>{{msg.showText.split(' ')[0]}}</span></div>
                    <div v-else-if="msg.type==='file'" class="msg-text"><a :href="msg.fileLink" target="_blank"><i class="u-icon icon-file"></i>{{msg.showText}}</a></div>
                    <div v-else-if="msg.type==='notification'" class="msg-text notify">{{msg.showText}}</div>
                    <div v-else class="msg-text" v-html="msg.showText"></div>
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
    value: String,
    historyMsgList: Array,
    clearStatus: Function,
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
    }
  },
  methods: {
    manageTime (time) {
      return util.formatDate(time, true)
    },
    renderItem (value) {
      if (!value) {
        this.reset()
        return
      }
      let searchlist = []
      console.log(value)
      console.log(this.historyMsgList)
      for (let i in this.historyMsgList) {
        if (this.historyMsgList[i].text.indexOf(value) > -1) {
          searchlist.push(this.historyMsgList[i])
        }
      }
      this.searchlist = searchlist
    },
    nameClass (text, classname) {
      classname = classname || ''
      for (let i in this.value) {
        if (this.value[i] === text) {
          return 'active ' + classname
        }
      }
      return classname
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
</style>

