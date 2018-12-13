<template>
<!-- 公告、群成员管理 -->
<div class="m-chat-nt" v-if="scene === 'team'">
  <div v-if="!teamInfo.valid || !teamInfo.validToCurrentUser" class="invalid"/>
  <div v-if="!isDiscussGroup" class="m-content">
    <div class="m-title notice">
      <span class="notice">公告</span>
    </div>
    <div class="m-edit" @click="showEditNotice('check')"><span>{{teamInfo.announcement ? teamInfo.announcement : '暂无公告'}}</span></div>
    <a v-if="power !== 'normal'" class="b-edit" @click="showEditNotice('edit')"/>
  </div>
  <div v-if="!showSearch" class="m-title team-control"><span>{{sessionName}}</span><a v-if="teamInfo.valid && teamInfo.validToCurrentUser" class="point" @click.stop="showListOptions($event)" ></a></div>
  <div v-else class="search-bar">
    <input ref="searchInput" :class="showSearch ? 'active' : ''" type="text" autofocus="autofocus" v-model="searchValue" placeholder="搜索" @focus="showSearch = true" v-clickoutside="clearStatus"/>
    <span v-if="showSearch" class="clear" @click="clearStatus"/>
  </div>
  <search-member
    v-if="showSearch"
    :isDiscussGroup="isDiscussGroup"
    :value="searchValue"
    :memberList="memberList"
    :userInfos="userInfos"
    :myInfo="myInfo"
    :clearStatus="clearStatus"/>
  <ul class="m-u-list" :style="{top: isDiscussGroup ? '34px' : '185px', bottom: '31px'}">
    <li 
      class="m-u-list-item" 
      v-for="member in memberList"
      :key="member.id" 
      :id="member.id"
      @click="checkUserInfo($event, member)" 
      @mouseup.stop="showMemberOptions($event, member)"
      :style="hasBorder && member.id === acNoticeId ? {border: '1px solid #4F8DFF'} : {border: '1px solid transparent'}"
    >
      <div class="m-left">
        <div class="t-img">
          <img style="width: 100%;height: 100%;border-radius: 50%;" :src="member.avatar">
          <!-- <div v-if="member.status !== 0 && !member.isSelf" style="position: absolute;left: 0;top: 0;z-index: 10;width: 100%;height: 100%;background: rgba(255, 255, 255, 0.4);" /> -->
        </div>
        <span class="t-style">{{member.alias}}</span>
      </div>
      <span :class="member.type" v-show="member.type !== 'normal' && !isDiscussGroup"/>
    </li>
  </ul>
</div>
</template>

<script>
import Request from '../../utils/request.js'
import util from '../../utils'
import SearchMember from '../search/SearchMember'
import clickoutside from '../../utils/clickoutside.js'
export default {
  name: 'chat-notice',
  directives: {clickoutside},
  components: {SearchMember},
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
      settingIcon: './static/img/nav/icon-plus.png',
      showSearch: false,
      searchValue: '',
      onlineMembers: 0
    }
  },
  computed: {
    hasBorder () {
      if (this.$store.state.showListOptions) {
        return true
      }
      return false
    },
    isDiscussGroup () {
      return util.isDiscussGroup(this.teamInfo)
    },
    acNoticeId () {
      return this.$store.state.noticeAc
    },
    sessionlist () {
      return this.$store.state.sessionlist
    },
    sessionName () {
      if (this.teamInfo && this.teamInfo.valid && this.teamInfo.validToCurrentUser) {
        // teamInfo中的人数为初始获取的值，在人员增减后不会及时更新，而teamMembers在人员增减后同步维护的人员信息
        var members = this.$store.state.teamMembers && this.$store.state.teamMembers[this.teamInfo.teamId]
        var memberCount = members && members.length
        return '成员 ' + (memberCount ? `${this.onlineMembers}/${memberCount}` : '')
      }
      return '成员'
    },
    memberList () {
      if (this.teamInfo && this.teamInfo.valid && this.teamInfo.validToCurrentUser) {
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
              member.isSelf = true
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
          members.forEach(item => {
            if (this.$store.state.friendsStatusList[item.account] > -1) {
              item.status = this.$store.state.friendsStatusList[item.account]
            }
          })
          // 统计在线人数
          let onlineMembers = members.filter(item => {
            return item.status === 0
          })
          // 加上自己
          this.onlineMembers = onlineMembers.length + 1
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
    },
    teamMembers () {
      return this.$store.state.teamMembers
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
      if (userInfos === 1) {
        this.eventBus.$emit('showMyInfo', {event, userInfos})
      } else {
        this.eventBus.$emit('checkUser', {event, userInfos})
      }
    },
    showListOptions (event) {
      /**
       * 群设置
       * * */
      let key = 'team-member'
      if (this.isDiscussGroup) {
        key = 'discuss-group-member'
      } else {
        if (this.power === 'normal') {
          key = 'team-member-normal'
        }
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
            this.showSearch = true
            setTimeout(() => {
              this.$refs.searchInput.focus()
            }, 0)
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
        } else if (this.power === 'normal' || this.power === 'manager') { // 普通群成员
          key = 'normal-member-manager'
        }
        this.$store.dispatch('showListOptions', {
          id: member.id,
          key,
          show: true,
          isDiscussGroup: this.isDiscussGroup,
          pos: {
            x: event.clientX - 150,
            y: event.clientY - 20
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
      this.eventBus.$emit('selectOrgnize', {type: 3, teamId: this.teamId, isDiscussGroup: this.isDiscussGroup})
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
      // 添加常用联系人
      Request.AddOrDelContactUser({accid: member.account, userType: 1}, this)
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
    },
    clearStatus (el, e) {
      if (e) {
        let className = e.target.className
        if (className.indexOf('searchevent') > -1) return
      }
      this.showSearch = false
      this.searchValue = ''
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

  .m-chat-nt .m-title span {
    max-width: 120px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
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
    max-width: 65px;
  }

  .m-chat-nt .m-u-list .m-u-list-item .t-img {
    position: relative;
    width: 24px;
    height: 24px;
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

  .search-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 34px;
    box-sizing: border-box;
    padding: 5px 10px;
  }
  .search-bar input {
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
  .search-bar input.active {
    border: 1px solid rgba(4,154,255,1);
  }
  .search-bar .clear {
    position: absolute;
    right: 16px;
    top: 10px;
    display: block;
    width: 13px;
    height: 13px;
    background-image: url('../../../../static/img/setting/delete.png');
    background-size: 100% 100%;
    cursor: pointer;
  }

  .m-chat-nt .invalid {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    background: transparent;
    z-index: 101;
  }
</style>

