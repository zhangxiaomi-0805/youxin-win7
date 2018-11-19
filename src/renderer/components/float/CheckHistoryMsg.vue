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
        <div class="search-box">
          <div class="search-img"></div>
          <!-- <img class="search-img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR…I6vSXCIp4eS+/iopLIDyItL7dMWMTz+XzjwtLSEyR4/h8s8iA5AK+B4wAAAABJRU5ErkJggg=="/> -->
          <span class="search">搜索</span>
        </div>

        <!-- 全部 && 图片 && 文件 -->
        <div class="tab-title">
          <a :class="checkType === 'all' ? 'tab-title-item active' : 'tab-title-item'" @click="toggleList('all')">全部</a>
          <a :class="checkType === 'pic' ? 'tab-title-item active' : 'tab-title-item'" @click="toggleList('pic')">图片</a>
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
      <ul style="width: 100%;">
        <li 
        v-for="(msg, $index) in msgList"
        :key="$index"
        class="list-item"
        >
          <div class="left">
            <img :src="msg.avatar" alt="" class="avatar">
            <div style="padding:0 8px">
              <span style="font-size:12px; color:#999">{{msg.nickName}}</span>
              <div 
                style="font-size:13px; color:#333; line-height:18px;padding-top:2px"
                @mouseup.stop="showListOptions($event, msg.type)"
                ref="clipboard">{{msg.message}}</div>
            </div>
          </div>
          <div style="font-size:12px; color:#999">{{msg.time}}</div>
        </li>
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
// import configs from '../../configs/index.js'
// import Request from '../../utils/request.js'
export default {
  name: 'check-history-msg',
  mounted () {
    this.eventBus.$on('checkHistoryMsg', (data) => {
      this.showHistoryMsg = true
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
      loading: false,
      messageCheck: false, // 短信勾选状态
      checkType: 'all', // all---全部; pic---图片; file---文件
      // type: 2, // 2-单聊，3-群组
      scene: 'p2p',
      to: '',
      sessionName: '',
      teamInfo: {},
      msgList: [{type: 'text', avatar: 'http://www.qqzhi.com/uploadpic/2014-06-06/000435511.jpg', nickName: '苏大元', message: '我那个时候考上公务员的城管 供电局也考上了 去了供电局 感觉比城管好 我那个时候考上公务员的城管', time: '12:42:00'}, {type: 'text', avatar: 'http://www.qqzhi.com/uploadpic/2014-06-06/000435511.jpg', nickName: '苏大元', message: '他以为自己是什么小饼干', time: '12:42:00'}, {type: 'text', avatar: 'http://tx.haiqq.com/uploads/allimg/150323/151500B45-1.jpg', nickName: '大西瓜的瓜', message: '这是什么鬼登西', time: '12:42:00'}]
    }
  },
  computed: {
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
      console.log(teamMembers)
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
    }
  },
  updated () {
    drag.dragPosition('historyMsgDrag', 1)
  },
  methods: {
    // getHistoryMsgs () {
    //   console.log(this)
    //   console.log(this.$store.state.currSessionId)
    //   // if (this.canLoadMore) {
    //   //   this.$store.dispatch('getLocalMsgs', {
    //   //     scene: this.scene,
    //   //     to: this.to,
    //   //     sessionId: this.$store.state.currSessionId,
    //   //     callBack: callBack
    //   //   })
    //   // }
    // },
    closeCover () {
      this.showConfirmCover = false
    },
    closeModal () {
      this.showHistoryMsg = false
      this.loading = false
    },
    toggleList (value) {
      console.log(this)
      console.log(this.$store.state.currSessionId)
      if (this.checkType === value) return
      this.checkType = value
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
    // copyAll () {
    //   // 右键复制全选
    //   let isNeedAllSelect = true
    //   let selection = window.getSelection()
    //   let target = this.$refs[`copy_${this.idClient}`]
    //   if (this.getSelectedText().childNodes && this.getSelectedText().childNodes.length > 0) {
    //     let anchorNode = selection.anchorNode
    //     let focusNode = selection.focusNode
    //     if (this.isChildOf(anchorNode, target) && this.isChildOf(focusNode, target)) {
    //       isNeedAllSelect = false
    //       let range = selection.getRangeAt(0)
    //       this.selectInfo = {
    //         anchorNode: selection.anchorNode,
    //         focusNode: selection.focusNode,
    //         startOffset: range.startOffset,
    //         endOffset: range.endOffset
    //       }
    //     }
    //   }
    //   if (isNeedAllSelect) { // 全选
    //     let range = document.createRange()
    //     range.selectNodeContents(target)
    //     selection.removeAllRanges()
    //     selection.addRange(range)
    //   }
    // },
    // forwordMsg () {
    //   // 转发消息
    //   let sessionlist = this.$store.state.sessionlist.filter((item, index) => {
    //     item.name = ''
    //     item.avatar = ''
    //     if (item.scene === 'p2p') {
    //       let userInfo = null
    //       if (item.to !== this.myPhoneId) {
    //         userInfo = this.userInfos[item.to]
    //       } else {
    //         userInfo = Object.assign({}, this.myInfo)
    //         // userInfo.alias = '我的手机'
    //         // userInfo.avatar = `${config.myPhoneIcon}`
    //       }
    //       if (userInfo) {
    //         item.name = util.getFriendAlias(userInfo)
    //         item.avatar = userInfo.avatar
    //       }
    //     } else if (item.scene === 'team') {
    //       let teamInfo = null
    //       teamInfo = this.$store.state.teamlist.find(team => {
    //         if (team.teamId === item.to) {
    //           item.memberNum = team.memberNum
    //         }
    //         return team.teamId === item.to
    //       })
    //       if (teamInfo) {
    //         item.name = teamInfo.name
    //         item.avatar = teamInfo.avatar || this.myGroupIcon
    //       } else if (item.lastMsg && item.lastMsg.attach && item.lastMsg.attach.team) {
    //         item.name = item.lastMsg.attach.team.name
    //         item.avatar = item.avatar || this.myGroupIcon
    //       } else {
    //         item.name = `群${item.to}`
    //         item.avatar = item.avatar || this.myGroupIcon
    //       }
    //       if (!item.memberNum) {
    //         return false
    //       }
    //     }
    //     if (item.updateTime) {
    //       item.updateTimeShow = util.formatDate(item.updateTime, true)
    //     }
    //     return item
    //   })
    //   let sessionlistTop = sessionlist.filter((item) => {
    //     if (item.localCustom && item.localCustom.topTime) {
    //       if (item.localCustom.topTime - item.lastMsg.time > 0) {
    //         item.compareTime = item.localCustom.topTime
    //       } else {
    //         item.compareTime = item.lastMsg.time
    //       }
    //       return item
    //     }
    //   })
    //   let newSessionlistTop = sessionlistTop.sort((a, b) => {
    //     return b.compareTime - a.compareTime
    //   })
    //   let sessionlistBot = sessionlist.filter((item) => {
    //     if (!item.localCustom || !item.localCustom.topTime) {
    //       return item
    //     }
    //   })
    //   let sidelist = [...newSessionlistTop, ...sessionlistBot]
    //   this.eventBus.$emit('selectContact', {type: 7, sidelist, msg: this.msg})
    // }
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
    color:'#333' ;
    padding-left: 10px
  }

  /* 搜索框 */
  .m-info-box .search-box {
    width: 520px;
    height:28px;
    background-color: #F0F0F0;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    /* background: #F0F0F0 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR…I6vSXCIp4eS+/iopLIDyItL7dMWMTz+XzjwtLSEyR4/h8s8iA5AK+B4wAAAABJRU5ErkJggg==) 8px center no-repeat; */
    /* background-size: 12px 12px; */

  }
  .m-info-box .search-box .search {
    font-size: 12px;
    color: #7D807E
  }
  .m-info-box .search-box .search-img{
    width:28px;
    height:28px;
    /* background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR…I6vSXCIp4eS+/iopLIDyItL7dMWMTz+XzjwtLSEyR4/h8s8iA5AK+B4wAAAABJRU5ErkJggg==) 8px center no-repeat; */
    /* background-size: 12px 12px; */
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
  .m-info-box  .list-item {
    width:100%;
    overflow-x: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 10px;

  }
  .m-info-box  .list-item .left{
    display: flex;
    flex-direction: row;
  }
  .m-info-box .list-item .avatar {
    width:32px;
    height:32px;
    border-radius: 50%;
    margin-top: 5px;
  }
</style>

