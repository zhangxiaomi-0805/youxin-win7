<template>
<!-- 历史消息记录 -->
<transition name="fade">
  <div class="m-historymsg-contain" v-if="showHistoryMsg">
    <div class="m-historymsg-cover" @click="closeCover"></div>
    <div class="m-info-box" style="width:600px;height:502px;">
      <!-- 头部 -->
      <div class="drag" id="historyMsgDrag">
        <!-- 单聊 -->
        <ul  v-if='scene === "p2p"' class="session-box">
          <li 
            class="session-box" 
            v-for="member in memberList" 
            :key="member.id" 
            :id="member.id"
          >
            <img class="session-avatar" :src="member.avatar">
            <div class="session-name">{{member.alias}}</div>
          </li>
        </ul>
        <!-- 群聊 -->
        <div v-else class="session-box">
          <img :src="teamInfo.avatar" alt="" class="session-avatar">
          <span class="session-name">{{sessionName}}</span>
        </div>

        <div class="u-sysbtn close">
          <a class="btn-close" @click="closeModal"/>
        </div>
      </div>
      <!-- 内容 -->
      <div class="m-historymsg-content">
        <!-- 搜索 -->
        <div class="search-bar">
          <input :class="showSearch ? 'active' : ''" type="text" autofocus="autofocus" v-model="searchValue" placeholder="搜索" @focus="showSearch = true" v-clickoutside="clearStatus"/>
          <span v-if="showSearch" class="clear" @click="clearStatus"/>
        </div>
        <!-- <div class="search-box">
          <div class="search-img"></div>
          <span class="search">搜索</span>
        </div> -->

        <!-- 全部 && 图片 && 文件 -->
        <div class="tab-title">
          <a :class="checkType === 'all' ? 'tab-title-item active' : 'tab-title-item'" @click="toggleList('all')">全部</a>
          <a :class="checkType === 'image' ? 'tab-title-item active' : 'tab-title-item'" @click="toggleList('image')">图片</a>
          <a :class="checkType === 'file' ? 'tab-title-item active' : 'tab-title-item'" @click="toggleList('file')">文件</a>
        </div>

        <!-- 短信选择 -->
        <div
          class="message-box"
          @click.stop="messageCheck = !messageCheck"
        >
          <span :class="messageCheck ? 'checked common':'check common'"></span>
          <span style="font-size: 12px; color: #333; line-height:40px">短信</span>
        </div>

         <!-- 内容列表 -->
      <ul style="width: 100%;overflow-y: scroll; height:300px">
        <history-item
          v-for="msg in msglist"
          :rawMsg="msg"
          :isRobot="isRobot"
          :userInfos="userInfos"
          :myInfo="myInfo"
        ></history-item>
      </ul>
      </div>
    </div>    
  </div>
</transition>
</template>

<script>
// import platform from '../../utils/platform'
import drag from '../../utils/drag.js'
import util from '../../utils'
import clickoutside from '../../utils/clickoutside.js'
import HistoryItem from './HistoryItem'
// import SearchData from '../search/search.js'
export default {
  name: 'check-history-msg',
  directives: {clickoutside},
  components: {
    HistoryItem
  },
  mounted () {
    // 获取当前聊天记录
    this.InitHistoryMsg()
    this.eventBus.$on('checkHistoryMsg', (data) => {
      this.showHistoryMsg = true
      this.isRobot = data.isRobot
      this.sessionName = data.sessionName
      this.teamInfo = data.teamInfo
      this.scene = data.scene
      this.to = data.to
    })
  },
  data () {
    return {
      showHistoryMsg: false,
      showConfirmCover: false,
      showSearch: false,
      searchValue: '',
      loading: false,
      isRobot: false,
      messageCheck: false, // 短信勾选状态
      checkType: 'all', // all---全部; image---图片; file---文件
      scene: 'p2p', // p2p---单聊； team---群聊
      to: '',
      sessionName: '',
      teamInfo: {}
      // msgList: [{type: 'text', avatar: 'http://www.qqzhi.com/uploadpic/2014-06-06/000435511.jpg', nickName: '苏大元', message: '我那个时候考上公务员的城管 供电局也考上了 去了供电局 感觉比城管好 我那个时候考上公务员的城管', time: '12:42:00'}, {type: 'text', avatar: 'http://www.qqzhi.com/uploadpic/2014-06-06/000435511.jpg', nickName: '苏大元', message: '他以为自己是什么小饼干', time: '12:42:00'}, {type: 'text', avatar: 'http://tx.haiqq.com/uploads/allimg/150323/151500B45-1.jpg', nickName: '大西瓜的瓜', message: '这是什么鬼登西', time: '12:42:00'}]
    }
  },
  computed: {
    myInfo () {
      return this.$store.state.myInfo
    },
    userInfos () {
      return this.$store.state.userInfos
    },
    sessionId () {
      let sessionId = this.$route.query.sessionId || this.$store.state.currSessionId
      return sessionId
    },
    teamId () {
      return this.sessionId.replace('team-', '')
    },
    teamMembers () {
      let teamMembers = this.$store.state.teamMembers
      let members = teamMembers && teamMembers[this.teamId]
      return members
    },
    memberList () {
      if (this.scene === 'p2p') {
        let members = []
        if (this.to === this.$store.state.userUID) {
          // 自己同自己发消息
          members.push({
            alias: this.$store.state.myInfo.nick,
            avatar: this.$store.state.myInfo.avatar
          })
        } else {
          let userInfo = this.userInfos[this.to]
          if (userInfo) {
            members.push({
              alias: util.getFriendAlias(userInfo),
              avatar: userInfo.avatar
            })
          }
        }
        return members
      }
      let teamMembers = this.$store.state.teamMembers
      let members = teamMembers && teamMembers[this.teamId]
      let needSearchAccounts = []
      if (members) {
        members = members.map(item => {
          var member = Object.assign({}, item) // 重新创建一个对象，用于存储展示数据，避免对vuex数据源的修改
          member.valid = true // 被管理员移除后，标记为false
          if (member.account === this.$store.state.userUID) {
            member.alias = '我'
            member.avatar = this.$store.state.myInfo.avatar
          } else if (this.userInfos[member.account] === undefined) {
            needSearchAccounts.push(member.account)
            member.avatar = member.avatar || this.avatar
            member.alias = member.nickInTeam || member.account
          } else {
            member.avatar = this.userInfos[member.account].avatar
            member.alias = this.userInfos[member.account].alias || member.nickInTeam || this.userInfos[member.account].nick
          }
          return member
        })
        if (needSearchAccounts.length > 0) {
          while (needSearchAccounts.length > 0) {
            this.searchUsers(needSearchAccounts.splice(0, 150))
          }
        }
        return members
      }
    },
    msglist () {
      let allMsgs = this.$store.state.currSessionMsgs
      let imagelist = [] // 保存图片历史记录
      let filelist = [] // 保存文件历史记录
      let shortMsg = [] // 保存所有短信历史记录
      allMsgs.map((item, index) => {
        if (item.type === 'timeTag' || item.type === 'tip' || item.type === 'notification') { // 删除只有时间的、提示信息类列表
          allMsgs.splice(index, 1)
        }
        if (item.type === 'image') {
          imagelist.push(item)
        }
        if (item.type === 'file') {
          filelist.push(item)
        }
        if (item.custom && JSON.parse(item.custom).isSmsMsg) { // 获取短信消息
          shortMsg.push(item)
        }
      })
      console.log(allMsgs)
      if (this.checkType === 'all') { // 选择全部
        if (this.messageCheck) {
          return shortMsg
        } else {
          return allMsgs
        }
      } else if (this.checkType === 'image') { // 选择图片
        console.log(imagelist)
        let imageShortMsg = []
        imagelist.map((item, index) => {
          if (item.custom && JSON.parse(item.custom).isSmsMsg) { // 获取短信消息
            imageShortMsg.push(item)
          }
        })
        if (this.messageCheck) {
          return imageShortMsg
        } else {
          return imagelist
        }
      } else if (this.checkType === 'file') { // 选择文件
        let fileShortMsg = []
        filelist.map((item, index) => {
          if (item.custom && JSON.parse(item.custom).isSmsMsg) { // 获取短信消息
            fileShortMsg.push(item)
          }
        })
        if (this.messageCheck) {
          return fileShortMsg
        } else {
          return filelist
        }
      }
    }
  },
  updated () {
    drag.dragPosition('historyMsgDrag', 1)
  },
  methods: {
    InitHistoryMsg () {
      if (!this.msglist || this.msglist.length <= 10) {
        this.getHistoryMsgs()
      }
    },
    getHistoryMsgs () {
      let callBack = () => {}
      console.log('历史消息记录')
      this.$store.dispatch('getLocalMsgs', {
        scene: this.scene,
        to: this.to,
        sessionId: this.$store.state.currSessionId,
        callBack: callBack
      })
    },
    closeCover () {
      this.showConfirmCover = false
    },
    closeModal () {
      this.showHistoryMsg = false
      this.loading = false
    },
    clearStatus (el, e) {
      if (e) {
        let className = e.target.className
        if (className.indexOf('searchevent') > -1) return
      }
      this.showSearch = false
      this.searchValue = ''
    },
    toggleList (value) {
      if (this.checkType === value) return
      this.checkType = value
    }
  }
}
</script>

<style scoped>
  .m-historymsg-contain {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1001;
  }
  .m-historymsg-contain .m-historymsg-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }
  .m-historymsg-contain .m-info-box {
    box-sizing: border-box;
		position: absolute;
		top: 1px;
    left: 50%;
    transform: translateX(-50%);
		width: 600px;
		height: 502px;
    background: #fff;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    z-index: 100;
    padding: 0 0 0 40px;
  }
  .m-historymsg-contain .m-info-box .drag {
    -webkit-app-region: no-drag;
    box-sizing: border-box;
    position: relative;
    width: 100%;
    padding: 15px 0 8px 0;
    font-size: 14px;
    color: #999;
  }
  
  .m-info-box .close {
    position: absolute;
    right: 0;
    top: 0;
  }
  .m-historymsg-content {
    padding: 0 40px 0 0;
    height: 420px;
    overflow: hidden;
  }
  /* 聊天对象头像 && 昵称 */
  .m-info-box .session-box {
    display: flex;
    flex-direction: row;
    align-items: center
  }
  .m-info-box .session-avatar {
    width: 32px;
    height: 32px;
    border-radius: 16px
  }
  .m-info-box .session-name {
    font-size:14px;
    color:#333 ;
    padding-left: 10px
  }

  /* 搜索框 */
  .m-info-box .search-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 520px;
    height:28px;
    box-sizing: border-box;
    padding: 0;
  }
  .m-info-box .search-bar input {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background: #F0F0F0 url(../../../../static/img/nav/main-tab-search.png) 8px center no-repeat;
    background-size: 12px 12px;
    border-radius: 2px;
    border: 1px solid rgb(220, 222, 224);
    font-size: 12px;
    color: #333;
    padding: 0 26px;
    border: 1px solid transparent;
    transition: border .1s linear;
  }
  .m-info-box .search-bar .clear {
    position: absolute;
    right: 16px;
    top: 10px;
    display: block;
    width: 13px;
    height: 13px;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR…ZrPJlEhfIZaoUiFPF/TRMFyifTApwOf58Im1DWfzPV/wbfFZVUmTg6ZgAAAABJRU5ErkJggg==);
    background-size: 100% 100%;
    cursor: pointer;
}
  /* tab头 */
  .m-info-box .tab-title {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    width: 100%;
    padding: 10px 0;
    border-bottom: 1px solid rgba(0,0,0,0.15)
  }
  .m-info-box .tab-title .tab-title-item {
    width: 15%;
    height: 100%;
    line-height: 27px;
    text-align: left;
    color: #333;
    font-size: 12px;
    transition: opacity .3s linear;
  }
  .m-info-box .tab-title .tab-title-item:hover {
    opacity: 0.7;
  }

  .m-info-box .tab-title .tab-title-item.active {
    color: #049AFF;
  }
  /* 短信选择 */
  .m-info-box .message-box{
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding:5px 0
  } 
  .m-info-box .common {
    display: inline-block;
    width: 15px;
    height: 15px;
    margin-right: 6px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
  }
  .m-info-box  .check {
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 14px 14px;
  }
  .m-info-box  .check:hover, .check:focus {
    background-image: url('../../../../static/img/setting/checkboxborder-p.png');
  }

  .m-info-box  .checked {
    background-image: url('../../../../static/img/setting/checkbox-c.png');
    background-size: 100% 100%;
  }
 
</style>

