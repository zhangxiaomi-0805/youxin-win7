<template>
<!-- 公告、群成员管理 -->
<div class="m-chat-nt" v-if="scene === 'team'">
  <div class="m-content">
    <div class="m-title notice">
      <span class="notice">公告</span>
    </div>
    <div class="m-edit" @click="showEditNotice('check')"><span>{{teamInfo.announcement ? teamInfo.announcement : '暂无公告'}}</span></div>
    <a class="b-edit" @click="showEditNotice('edit')"/>
  </div>
  <div 
    @click.stop="showListOptions($event)" 
    class="m-title team-control" 
  >
    <span>{{sessionName}}</span><a class="point" ></a>
  </div>
  <ul class="m-u-list">
    <li 
      class="m-u-list-item" 
      v-for="member in memberList" 
      :key="member.id" 
      :id="member.id" 
      @mouseup.stop="showMemberOptions($event, member)"
      :style="hasBorder && member.id === acNoticeId ? {border: '1px solid #4F8DFF'} : {border: '1px solid transparent'}"
    >
      <div class="m-left"><img class="t-img" :src="member.avatar"><span class="t-style">{{member.alias}}</span></div>
      <span :class="member.type" v-show="member.type !== 'normal'"/>
    </li>
  </ul>
</div>
</template>

<script>
import Fetch from '../../utils/fetch.js'
export default {
  name: 'chat-notice',
  props: {
    scene: String,
    to: String,
    teamId: String,
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
    teamInfo: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      settingIcon: './static/img/nav/icon-plus.png'
    }
  },
  computed: {
    hasBorder () {
      if (this.$store.state.showListOptions) {
        return true
      }
      return false
    },
    acNoticeId () {
      return this.$store.state.noticeAc
    },
    sessionlist () {
      return this.$store.state.sessionlist
    },
    sessionName () {
      if (this.teamInfo) {
        // teamInfo中的人数为初始获取的值，在人员增减后不会及时更新，而teamMembers在人员增减后同步维护的人员信息
        var members = this.$store.state.teamMembers && this.$store.state.teamMembers[this.teamInfo.teamId]
        var memberCount = members && members.length
        return '群成员 ' + (memberCount ? `(${memberCount}) 人` : '')
      }
      return '群'
    },
    memberList () {
      if (this.teamInfo) {
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
      } else return []
    },
    power () {
      let type = 'normal'
      if (this.memberList) {
        for (let i = 0; i < this.memberList.length; i++) {
          if (this.memberList[i].account === this.myInfo.account) {
            type = this.memberList[i].type
            break
          }
        }
      }
      return type
    },
    jurisdiction () {
      let disabled = true
      if (this.power !== 'normal' || this.teamInfo.updateTeamMode === 'all') {
        disabled = false
      }
      return disabled
    }
  },
  watch: {
    jurisdiction (newPromiss, oldPromiss) {
      if (newPromiss === oldPromiss) return
      this.eventBus.$emit('editNoticePromiss', {jurisdiction: !newPromiss})
    }
  },
  methods: {
    searchUsers (Accounts) {
      this.$store.dispatch('searchUsers',
        {
          accounts: Accounts,
          done: (users) => {
            this.updateTeamMember(users)
          }
        })
    },
    updateTeamMember (users) {
      users.forEach(user => {
        var member = this.memberList && this.memberList.find(member => {
          return member.account === user.account
        })
        if (member) {
          member.avatar = user.avatar
          member.alias = member.nickInTeam || user.nick
        }
      })
    },
    showEditNotice (type) {
      this.eventBus.$emit('editNotice', {
        teamInfo: this.teamInfo,
        disabled: this.jurisdiction,
        type,
        scene: this.scene,
        to: this.to
      })
    },
    checkUserInfo (event, member) {
      let userInfos = this.userInfos[member.account]
      // 查看名片
      if (member.account === this.myInfo.account) {
        userInfos = 1
      }
      this.eventBus.$emit('checkUser', {event, userInfos})
    },
    showListOptions (event) {
      /**
       * 群设置
       * * */
      let key = ''
      if (this.power === 'owner') { // 管理员
        key = 'owner-team-set'
      } else if (this.power === 'normal') { // 普通群成员
        key = 'normal-team-set'
      }
      this.$store.dispatch('showListOptions', {
        key,
        show: true,
        pos: {
          x: event.clientX - 30,
          y: event.clientY + 5
        },
        callBack: (type) => {
          if (type === 3) { // 搜索成员
            console.log('搜索成员')
          } else if (type === 4) { // 添加成员
            this.addTeamMember()
          } else if (type === 2) { // 移出成员
            this.removeTeamMember()
          }
        }
      })
    },
    showMemberOptions (event, member) {
      /**
       * 群成员管理
       * @params  this.power---当前登录用户的身份：normal---普通群成员；owner---管理员
       * * */
      if (member.account === this.myInfo.account) return // 我自己
      let key = ''
      if (event.button === 2) {
        if (this.power === 'owner') { // 管理员
          key = 'owner-member-manager'
        } else if (this.power === 'normal') { // 普通群成员
          key = 'normal-member-manager'
        }
        this.$store.dispatch('showListOptions', {
          id: member.id,
          key,
          show: true,
          pos: {
            x: event.clientX - 40,
            y: event.clientY + 15
          },
          callBack: (type) => {
            switch (type) {
              case 1:
                // 发消息
                this.sendMsg(this.userInfos[member.account])
                break
              case 5:
                // 查看资料
                this.checkUserInfo(event, member)
                break
              case 6:
                // 添加常用联系人
                this.addContact(member)
                break
              case 7:
                // 移出本群
                if (this.memberList.length === 1) return
                this.$store.dispatch('removeTeamMembers', {accounts: [member.account], teamId: this.teamId})
                break
              default:
                break
            }
          }
        })
      }
    },
    addTeamMember () {
      // 添加成员
      this.$store.commit('updateOrgDisabledlist', {type: 'concat', userlist: this.memberList})
      this.eventBus.$emit('selectOrgnize', {type: 3, teamId: this.teamId})
    },
    removeTeamMember () {
      // 移出成员
      let sidelist = Object.assign([], this.memberList)
      if (this.power === 'owner') {
        for (let key in sidelist) {
          if (sidelist[key].account === this.myInfo.account) {
            sidelist[key].hasExit = true
            break
          }
        }
      } else if (this.power === 'manager') {
        sidelist.map(item => {
          if (item.type !== 'normal') {
            item.hasExit = true
          }
        })
      }
      this.eventBus.$emit('selectContact', {type: 6, sidelist, teamId: this.teamId})
    },
    addContact (member) {
      let params = {
        accid: member.account,
        userType: 1
      }
      // 添加常用联系人 userType === 1 ---添加； userType === 2 ---删除
      Fetch.post('api/appPc/addOrDelContactUser', params, this).then(ret => {
      }).catch(() => {
      })
    },
    sendMsg (userInfos) {
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
    }
  }
}
</script>

<style>
	.m-chat-nt {
		position: absolute;
		top: 31px;
		right: 0;
		width: 152px;
		height: 100%;
		border-left: 1px solid rgb(220, 222, 224);
    background-color: #fff;
    box-sizing: border-box;
    z-index: 30;
  }

  .m-chat-nt .m-content {
    position: relative;
    width: 100%;
    height: 150px;
    border-bottom: 1px solid rgb(220, 222, 224);
  }

  .m-chat-nt .m-title {
    padding: 8px 12px;
    font-size: 12px;
    color: #999999;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .m-chat-nt .team-control {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .m-chat-nt .team-control .point {
    width: 17px;
    height: 17px;
    background: url('../../../../static/img/team/point.png') no-repeat center center;
    background-size: 100% 3px;
  }

  .m-chat-nt .notice {
    font-size: 14px;
    color: #333;
  }
  
  .m-chat-nt .m-u-list {
    position: absolute;
    top: 185px;
    bottom: 0;
    width: 100%;
    height: auto;
    overflow-y: auto;
  }

  .m-chat-nt .m-u-list .m-u-list-item {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 6px 12px;
    cursor: default;
  }
  .m-chat-nt .m-u-list .m-u-list-item:hover {
    background: rgba(247,247,247,1);
  }

  .m-chat-nt .m-u-list .m-u-list-item .m-left {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 80%;
  }

  .m-chat-nt .t-style {
    font-size: 12px;
    color: #000;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-height: 1.2rem;
  }

  .m-chat-nt .m-u-list .m-u-list-item .t-img {
    width: 24px;
    height: 24px;
    background-color:#eee;
    border-radius: 50%;
    margin-right: 9px;
  }

  .m-chat-nt .m-u-list .m-u-list-item .owner {
    width: 13px;
    height: 13px;
    background: url('../../../../static/img/team/owner.png') no-repeat center center;
    background-size: 100% 100%;
  }
  .m-chat-nt .m-u-list .m-u-list-item .manager {
    width: 13px;
    height: 13px;
    background: url('../../../../static/img/team/manager.png') no-repeat center center;
    background-size: 100% 100%;
  }

  .m-chat-nt .m-content .m-edit {
    position: absolute;
    top: 37px;
    bottom: 0;
    padding: 0 11px 11px;
    cursor: default;
  }

  .m-chat-nt .m-content .m-edit > span {
    width: 100%;
    height: 100%;
    line-height: 17px;
    text-align: left;
    font-size: 12px;
    color: rgba(148,153,150,1);
    display:-webkit-box;
    -webkit-line-clamp:6;
    -webkit-box-orient:vertical;
    overflow:hidden;
    word-break:break-all;
  }

  .m-chat-nt .m-content .b-edit {
    position: absolute;
    right: 12px;
    top: 12px;
    width: 14px;
    height: 14px;
    background: url('../../../../static/img/team/edit.png') no-repeat center center;
    background-size: 100% 100%;
    transition: all .2s linear;
  }
  .m-chat-nt .m-content .b-edit:hover, .b-edit:focus {
    background-image: url('../../../../static/img/team/edit-h.png');
  }
  .m-chat-nt .m-content .b-edit:active {
    background-image: url('../../../../static/img/team/edit-p.png');
  }
</style>

