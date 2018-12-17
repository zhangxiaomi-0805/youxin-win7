<template>
  <!-- 群成员搜索 -->
  <div class="s-cont" :style="{top: isDiscussGroup ? '35px' : '185px'}">
    <div v-if="searchlist.length <= 0" class="s-empty searchevent">暂无搜索结果~</div>
    <ul class="u-list"> 
      <li
        class="u-list-item s-list-item searchevent"
        v-for="item in searchlist"
        :key="item.id"
        :id="item.id"
        @click.stop="checkUserInfo($event, item)"
        @dblclick.stop="sendMsg(item)"
      >
        <img :src="item.avatar || myGroupIcon" class="s-img searchevent">
        <div class="text-con"><span :class="nameClass(text)" v-for="text in (item.alias || item.nick)" :key="text.id" :id="text.id">{{text}}</span></div>
      </li>
    </ul>
  </div>
</template>

<script>
  import config from '../../configs'
  export default {
    name: 'search-member',
    props: {
      isDiscussGroup: Boolean,
      value: String,
      memberList: Array,
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
        searchlist: [],
        myGroupIcon: config.defaultUserIcon
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
    computed: {
      sessionlist () {
        return this.$store.state.sessionlist
      }
    },
    methods: {
      renderItem (value) {
        if (!value) {
          this.reset()
          return
        }
        let searchlist = []
        // if (this.myInfo.nick.indexOf(value) > -1) {
        //   searchlist.push(this.myInfo)
        // }
        for (let i in this.memberList) {
          if (this.memberList[i].alias !== '我' && this.memberList[i].alias.indexOf(value) > -1) {
            searchlist.push(this.memberList[i])
          }
        }
        this.searchlist = searchlist
      },
      nameClass (text) {
        for (let i in this.value) {
          if (this.value[i] === text) {
            return 's-name active searchevent'
          }
        }
        return 's-name searchevent'
      },
      checkUserInfo (event, member) {
        this.timer && clearTimeout(this.timer)
        let userInfos = this.userInfos[member.account]
        // 查看名片
        if (member.account === this.myInfo.account) {
          userInfos = 1
        }
        this.timer = setTimeout(() => {
          if (userInfos === 1) {
            this.eventBus.$emit('showMyInfo', {event, userInfos, pageType: 2})
          } else {
            this.eventBus.$emit('checkUser', {event, userInfos, pageType: 2})
          }
        }, 500)
      },
      sendMsg (userInfos) {
        this.timer && clearTimeout(this.timer)
        // 发消息
        let sessionId = ''
        for (let i in this.sessionlist) {
          if (this.sessionlist[i].to === userInfos.account) {
            sessionId = this.sessionlist[i].id
            break
          }
        }
        if (sessionId) {
          this.eventBus.$emit('toggleSelect', {sessionId})
          this.$router.push({name: 'chat', query: {sessionId, firstFlag: true}})
        } else {
          this.$store.dispatch('insertLocalSession', {
            scene: 'p2p',
            account: userInfos.account,
            callback: (sessionId) => {
              this.eventBus.$emit('toggleSelect', {sessionId})
              this.$router.push({name: 'chat', query: {sessionId, firstFlag: true}})
            }
          })
        }
        this.reset()
        this.clearStatus()
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
    top: 185px;
    bottom: 0;
    width: 100%;
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
    padding-top: 10px;
    font-size: 13px;
    color: #C4C4C4;
  }

  .s-list-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    height: 38px;
    padding: 6px 12px;
    cursor: default;
  }

  .s-img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }

  .s-list-item .s-name {
    font-size: 12px;
  }
  .s-list-item .s-name.default {
    color: #999;
    font-size: 12px;
  }
  .s-list-item .s-name.active {
    color: rgb(0, 162, 255);
  }

  .text-con {
    display: flex;
    align-items: center;
    padding-left: 9px;
  }
</style>

