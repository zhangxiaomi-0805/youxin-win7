<template>
  <div class="g-hbf-container m-chat">
    <div class="g-hbf-header m-header"><span class="session-name">{{'“' + titleName + '”的记录'}}</span></div>
    <ul class="m-body-contain u-list" id="record-list" @scroll="scrollEndLoad($event)">
      <li
        class="u-list-item s-list-item"
        v-for="msg in recordlist"
        :key="msg.id"
        :id="msg.id"
        @click="locationToMsg(msg, true)"
        @mouseenter="idClient = msg.idClient"
        @mouseleave="idClient = ''"
      >
        <img :src="msg.avatar || myUserIcon" class="s-img">
        <div class="s-contain">
          <div style="display: flex;flex-direction:row">
            <span class="s-name">{{msg.name || mag.fromNick}}</span>
            <!-- 时间 -->
            <div class="s-time">{{manageTime(msg.time)}}</div>
          </div>
          
          <div
            class="s-btm"
            v-html="msg.showText"
          ></div>
          <a v-if="msg.idClient === idClient" class="check-more" @click.stop="locationToMsg(msg, true)">查看上下文</a>
        </div>
      </li>
      <li v-if="noMoreData" class="n-data">已无更多记录...</li>
    </ul>
  </div>
</template>

<script>
  import config from '../../configs'
  import SearchData from './search.js'
  import util from '../../utils'
  export default {
    name: 'search-record',
    data () {
      return {
        noMoreData: false,
        recordlist: [],
        msgsTemp: [],
        myUserIcon: config.defaultUserIcon,
        idClient: ''
      }
    },
    computed: {
      sessionId () {
        return this.$route.query.sessionId || this.$store.state.currSessionId
      },
      searchValue () {
        return this.$route.query.searchValue
      },
      titleName () {
        return this.$route.query.titleName
      },
      currSessionMsgs () {
        return this.$store.state.currSessionMsgs
      }
    },
    mounted () {
      this.renderRecordlist()
    },
    watch: {
      $route () {
        this.noMoreData = false
        this.recordlist = []
        this.msgsTemp = []
        this.renderRecordlist()
      }
    },
    methods: {
      // 消息时间戳处理 --- 年-月-日 时-分-秒
      manageTime (time) {
        return util.DateFormat(time)
      },
      async renderRecordlist () {
        let end = ''
        if (this.recordlist.length > 0) end = this.recordlist[this.recordlist.length - 1].time
        let obj = end ? {end} : null
        let recordlist = []
        try {
          recordlist = await SearchData.getRecordsDetailData(obj, this.searchValue, this.sessionId)
        } catch (error) {}
        this.recordlist = this.recordlist.concat(recordlist)
        if (recordlist.length <= 0) this.noMoreData = true
      },
      scrollEndLoad (e) {
        let { scrollTop, clientHeight, scrollHeight } = e.target
        if ((parseInt(scrollTop + clientHeight)) === scrollHeight) {
          this.renderRecordlist()
        }
      },
      nameClass (text) {
        for (let i in this.searchValue) {
          if (this.searchValue[i] === text) return 's-name active'
        }
        return 's-name'
      },
      locationToMsg (msg) {
        this.$router.push({name: 'search-record-more', query: {time: msg.time, titleName: this.titleName, searchValue: this.searchValue, sessionId: this.sessionId}})
      }
      // async locationToMsg (msg, isFirst) {
      //   // 跳转到相应消息页面
      //   let msgs = []
      //   try {
      //     msgs = await SearchData.getRecordsDetail({start: msg.time}, null, false, 100, this.sessionId)
      //   } catch (error) {}
      //   isFirst && msgs.unshift(msg)
      //   this.msgsTemp = this.msgsTemp.concat(msgs)
      //   if (msgs.length >= 100) this.locationToMsg(this.msgsTemp[this.msgsTemp.length - 1])
      //   else {
      //     let idClient = msg.idClient
      //     this.$store.commit('updateMsgHighBgIdClient', idClient)
      //     this.$store.commit('updateCurrSessionMsgs', {msgs: this.msgsTemp, sessionId: this.sessionId, type: 'reset'})
      //     this.$router.push({name: 'chat', query: {sessionId: this.sessionId, noInit: true}})
      //   }
      // }
    }
  }
</script>

<style scoped>
  .m-chat .m-body-contain {
    position: absolute;
    left: 0;
    top: 31px;
    bottom: 0;
    right: 0;
  }
  .m-chat .m-header {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 31px;
    border-bottom: 1px solid rgba(214,214,214,1);
    padding-top: 2.5px;
    padding-left: 20px;
    padding-right: 10px;
  }

  .m-chat .m-header .session-name {
    height: 14px;
    line-height: 14px;
    font-size: 14px;
    color: rgba(11,13,12,1);
  }

  .s-list-item {
    position: relative;
    display: flex;
    flex-direction: row;
    /* align-items: center; */
    height: 70px;
    box-sizing: border-box;
    padding: 10px 16px;
    cursor: default;
  }
  .s-list-item:hover {
    background-color: #e0e0e0
  }

  .s-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  .s-list-item .s-name {
    font-size:12px;
    color:#999;
    margin-right:10px
  }
  .s-contain {
    padding:0 8px;
    width:85%;
  }
  .s-contain .s-btm {
    font-size:14px;
    color:#333;
    line-height:18px;
    padding-top:2px;
    -webkit-user-select: text;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp:2;
    -webkit-box-orient: vertical;
  }
  .s-time {
    font-size:12px;
    color:#b6b6b6;
  }
  .n-data {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px 0;
    font-size: 12px;
    color: #999;
  }
  .check-more {
    position: absolute;
    right: 16px;
    top: 6px;
    font-size: 12px;
    color: #3F6D8C;
  }
</style>

