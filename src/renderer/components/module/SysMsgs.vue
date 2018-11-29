<template>
<div class="g-hbf-container m-sysmsg bg" style="top: 31px;">
  <ul class="u-list s-msg-list">
    <li class="u-list-item s-msg-list-item" v-for="msg in msgList" :key="msg.idServer">
      <div class="s-msg-list-item-container s-msg-center" :key="msg.idServer" v-if="msg.type ==='applyTeam' || msg.type ==='teamInvite'" @contextmenu="showMenu" :id="msg.idServer">
        <div class="s-msg-center" style="width: 75%">
          <img class="icon" style="marginRight: 10px;" :src="msg.avatar || defaultAvatar"/>
          <div class="s-msg-content"><span style="color: rgba(4,154,255,1);">{{msg.nick || msg.from}}</span><span>申请加入</span><span style="color: rgba(4,154,255,1);">{{getTeamName(msg.to)}}</span></div>
        </div>
        <div class="s-msg-rt" v-if='deleteIdServer !== msg.idServer'>
          <div class="s-msg-time">{{msg.showTime}}</div>
          <a v-if='msg.state === "init"' class="s-msg-check" @click="checkUser($event, msg)">查看</a>
          <div style="height:30px;lineHeight: 30px;" v-else>
            <span v-if="msg.state === 'error'">已被其他管理员处理</span>
            <span class="s-msg-rejected" v-else-if="msg.state === 'rejected'">已拒绝</span>
            <span v-else>已同意</span>
          </div>
        </div>
      </div>
    </li>      
  </ul>
</div>
</template>

<script>
import config from '../../configs'
export default {
  name: 'sysmsgs',
  mounted () {
    this.$store.dispatch('markSysMsgRead')
    this.$store.dispatch('markCustomSysMsgRead')
  },
  data () {
    return {
      sysType: 0, // 系统消息 0, 自定义消息 1,
      defaultAvatar: config.defaultUserIcon,
      deleteIdServer: '',
      menuData: {
        menuName: 'sysMsgMenu',
        axios: {x: null, y: null},
        menulists: [
          {fnHandler: 'delete', btnName: '删除'}
        ]
      }
    }
  },
  computed: {
    userInfos () {
      return this.$store.state.userInfos || {}
    },
    sysMsgs () {
      let sysMsgs = this.$store.state.sysMsgs.filter(msg => {
        return msg.type === 'applyTeam'
      })
      return sysMsgs
    },
    customSysMsgs () {
      let customSysMsgs = this.$store.state.customSysMsgs.filter(msg => {
        if (msg.scene === 'p2p') {
          let content = JSON.parse(msg.content)
          msg.showText = `${content.content}`
          msg.avatar = this.userInfos[msg.from].avatar
          return msg
        }
        return false
      })
      return customSysMsgs
    },
    msgList () {
      return this.sysType === 0 ? this.sysMsgs : this.customSysMsgs
    }
  },
  methods: {
    deleteMsg () {
      if (!this.deleteIdServer) return
      this.$store.commit('deleteSysMsgs', {
        type: this.sysType,
        idServer: this.deleteIdServer
      })
    },
    showMenu (parameter) {
      parameter.preventDefault()
      var x = parameter.clientX
      var y = parameter.clientY
      this.deleteIdServer = parameter.currentTarget.id
      this.menuData.axios = {
        x, y
      }
    },
    clearMsgs () {
      var that = this
      if (window.confirm('确认要清空消息吗？')) {
        that.$store.dispatch('resetSysMsgs', {
          type: that.sysType
        })
      }
    },
    getTeamName (teamId) {
      let team = this.$store.state.teamlist.find(team => {
        return team.teamId === teamId
      })
      return (team && team.name) || ''
    },
    handleTeamApply (msg, pass) {
      let action
      switch (msg.type) {
        case 'applyTeam':
          action = pass ? 'passTeamApply' : 'rejectTeamApply'
          break
        case 'teamInvite':
          action = pass ? 'acceptTeamInvite' : 'rejectTeamInvite'
          break
        default:
          return
      }
      this.$store.dispatch('delegateTeamFunction', {
        functionName: action,
        options: {
          idServer: msg.idServer,
          teamId: msg.to,
          from: msg.from,
          done: (_error, obj) => {
            console.log('handleDone', obj)
          }
        }
      })
    },
    checkUser (event, msg) {
      // 查看信息
      this.eventBus.$emit('checkUser', {
        event,
        userInfos: {account: msg.from},
        callBack: (type) => {
          switch (type) {
            case 1:
              this.handleTeamApply(msg, true)
              break
            case 2:
              this.handleTeamApply(msg, false)
              break
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.bg {
  background:rgba(242,242,242,1);
}

.m-sysmsg .m-header {
  height: 2rem;
  -webkit-app-region: no-drag;
}

.m-sysmsg .m-header .header-pushed {
  color:rgb(104,179,255);
  border-bottom-style:solid;
}

.m-sysmsg .a-link {
  color:rgb(104,179,255);
  font-size: 0.9rem;
}

.m-sysmsg .m-body {
  top: 2rem;
  bottom: 2rem;
}

.m-sysmsg .m-footer {
  height: 2rem;
}

.s-msg-list {
  position: absolute;
  top: 0;
  bottom: 0;
  box-sizing: border-box;
  padding: 25px 13px;
}

.s-msg-list .s-msg-list-item {
  height:86px;
  background:rgba(255,255,255,1);
  border-radius:4px;
  margin-bottom: 15px;
  border:1px solid rgba(0, 0, 0, 0.1);
}
.s-msg-list-item-container {
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding-right: 15px;
}

.s-msg-center {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.s-msg-content {
  width: 80%;
  font-size:14px;
  color:#333;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap
}

.s-msg-time {
  font-size:12px;
  color:rgb(175, 178, 177);
  margin-bottom: 15px;
}

.s-msg-rt {
  font-size:14px;
  color:rgba(153,153,153,1);
  text-align: right;
}

.s-msg-check {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width:60px;
  height:30px;
  background:rgba(4,154,255,1);
  border-radius:4px;
  font-size:14px;
  color:rgba(255,255,255,1);
  transition: all .2s linear;
}

.s-msg-check:hover {
  background:rgba(1, 138, 230,1);
}

.s-msg-rejected {
  color: rgba(253,47,47,1);
}
</style>
