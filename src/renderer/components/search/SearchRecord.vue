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
      >
        <img :src="msg.avatar || myUserIcon" class="s-img">
        <div class="s-contain">
          <div>{{msg.name}}</div>
          <div class="s-btm"><span :class="nameClass(text)" v-for="text in msg.text" :key="text.id" :id="text.id">{{text}}</span></div>
        </div>
        <div class="s-time">{{msg.updateTimeShow}}</div>
      </li>
      <li v-if="noMoreData" class="n-data">已无更多记录...</li>
    </ul>
  </div>
</template>

<script>
  import config from '../../configs'
  import SearchData from './search.js'
  export default {
    name: 'search-record',
    data () {
      return {
        noMoreData: false,
        recordlist: [],
        msgsTemp: [],
        myUserIcon: config.defaultUserIcon
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
        if (scrollTop + clientHeight === scrollHeight) {
          this.renderRecordlist()
        }
      },
      nameClass (text) {
        for (let i in this.searchValue) {
          if (this.searchValue[i] === text) return 's-name active'
        }
        return 's-name'
      },
      async locationToMsg (msg, isFirst) {
        // 跳转到相应消息页面
        let msgs = []
        try {
          msgs = await SearchData.getRecordsDetail({start: msg.time}, null, false, 100, this.sessionId)
        } catch (error) {}
        if (msgs.length > 0) {
          isFirst && msgs.unshift(msg)
          this.msgsTemp = this.msgsTemp.concat(msgs)
          if (msgs.length >= 100) this.locationToMsg(this.msgsTemp[this.msgsTemp.length - 1])
          else {
            let idClient = msg.idClient
            this.$store.commit('updateMsgHighBgIdClient', idClient)
            this.$store.commit('updateCurrSessionMsgs', {msgs: this.msgsTemp, sessionId: this.sessionId, type: 'reset'})
            this.$router.push({name: 'chat', query: {sessionId: this.sessionId, noInit: true}})
          }
        }
      }
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
    align-items: center;
    height: 56px;
    box-sizing: border-box;
    padding: 10px 16px;
    cursor: default;
  }

  .s-img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
  }

  .s-list-item .s-name {
    color: #999;
    font-size: 12px;
  }
  .s-list-item .s-name.active {
    color: rgb(0, 162, 255);
  }

  .s-contain {
    width: 70%;
    padding-left: 10px;
    font-size: 13px;
  }

  .s-contain .s-btm {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .s-time {
    position: absolute;
    right: 16px;
    top: 20px;
    font-size: 11px;
    color: #999;
  }

  .n-data {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px 0;
    font-size: 12px;
    color: #999;
  }
</style>

