<template>
<!-- 群组 -->
<div class="m-main-list" id="resize-side-lf" style="width:270px;">
  <div class="u-search searchevent">
    <div class="u-cont">
      <input :class="showSearch ? 'active' : ''" type="text" v-model="searchValue" placeholder="搜索" @focus="showSearch = true" v-clickoutside="clearStatus"/>
      <span v-if="showSearch" class="clear" @click="clearStatus"/>
    </div>
  </div>
  <search v-if="showSearch" type="team" :value="searchValue" :clearStatus="clearStatus"/>
  <div class="t-title-con">
    <div class="t-title">
      <a :class="listType === 'team' ? 't-title-item t-title-team active' : 't-title-item t-title-team'" @click="toggleList('team')">交流群</a>
      <a :class="listType === 'group' ? 't-title-item t-title-group active' : 't-title-item t-title-group'" @click="toggleList('group')">讨论组</a>
    </div>
  </div>
  <ul class="u-list t-u-list apply-team" v-if="listType === 'team' && sysMsgs.length > 0" style="position: relative;">
    <li
      ref="sysmsgs"
      :class='activeId === 1 ? "u-list-item-active t-u-list-item t-center" : "u-list-item t-u-list-item t-center"'
      @click="checkApplyTeamMsg"
    >
      <div class="t-list-item-left t-center">
        <img :src="sysmsg"/>
        <span class="teamname">群聊验证消息</span>
      </div>
      <span v-if="sysMsgUnread > 0" class="u-unread">{{sysMsgUnread}}</span>
    </li>
  </ul>
  <div class="contact-con" :style="{top: listType === 'team' && sysMsgs.length > 0 ? '188px' : '120px'}">
    <ul class="u-list t-u-list" v-show="teamlist.length > 0 && listType === 'team'">
      <li
        :class='activeId === team.teamId ? "u-list-item-active t-u-list-item t-center" : "u-list-item t-u-list-item t-center"'
        :style="hasBorder && team.teamId === acTeamId ? {border: '1px solid rgba(4,154,255,1)'}: {border: '1px solid transparent'}"
        v-for="team in teamlist"
        :key="team.id" 
        :id="team.id"
        @click="checkCard(team)"
        @mouseup.stop="onShowMenu($event, team)"
      >
        <div class="t-list-item-left t-center">
          <img :src="team.avatar || defaultGroupIcon"/>
          <span class="teamname" :title="team.name">{{team.name}}</span>
        </div>
        <span class="t-num">{{team.memberNum}}</span>
      </li>
    </ul>
    <ul class="u-list t-u-list" v-show="grouplist.length > 0 && listType === 'group'">
      <li
        :class='activeId === group.teamId ? "u-list-item-active t-u-list-item t-center" : "u-list-item t-u-list-item t-center"'
        :style="hasBorder && group.teamId === acTeamId ? {border: '1px solid rgba(4,154,255,1)'}: {border: '1px solid transparent'}"
        v-for="group in grouplist"
        :key="group.id" 
        :id="group.id"
        @click="checkCard(group)"
        @mouseup.stop="onShowMenu($event, group, 'group')"
      >
        <div class="t-list-item-left t-center">
          <img :src="group.avatar || defaultDiscussGroupIcon"/>
          <span class="teamname" :title="group.name">{{group.name}}</span>
        </div>
        <span class="t-num">{{group.memberNum}}</span>
      </li>
    </ul>
  </div>
  <div class="border" id="resize-we"></div>
</div>
</template>

<script>
import util from '../../utils'
import Search from '../search/Search.vue'
import clickoutside from '../../utils/clickoutside.js'
import configs from '../../configs'
export default {
  name: 'team-list',
  directives: {clickoutside},
  components: {Search},
  props: {
    isApplyTeam: Boolean,
    callBack: Function
  },
  data () {
    return {
      showSearch: false,
      searchValue: '',
      activeId: '',
      listType: 'team',
      myNick: '',
      myNickCopy: '',
      defaultGroupIcon: configs.defaultGroupIcon,
      defaultDiscussGroupIcon: configs.defaultDiscussGroupIcon,
      sysmsg: './static/img/team/sysmsg.png'
    }
  },
  computed: {
    teamlist () {
      let teamlist = this.$store.state.teamlist.filter(item => {
        return item.valid && item.validToCurrentUser && !util.isDiscussGroup(item)
      })
      return teamlist
    },
    grouplist () {
      let grouplist = this.$store.state.teamlist.filter(item => {
        return item.valid && item.validToCurrentUser && util.isDiscussGroup(item)
      })
      return grouplist
    },
    sysMsgUnread () {
      let temp = this.$store.state.sysMsgUnread
      return temp.applyTeam
    },
    sysMsgs () {
      let sysMsgs = this.$store.state.sysMsgs.filter(msg => {
        return msg.type === 'applyTeam'
      })
      return sysMsgs
    },
    hasBorder () {
      if (this.$store.state.showListOptions) {
        return true
      }
      return false
    },
    acTeamId () {
      return this.$store.state.teamAc
    },
    nickInTeam () {
      let nickInTeam = ''
      let teamMembers = this.$store.state.teamMembers
      let members = teamMembers && teamMembers[this.teamId]
      for (let key in members) {
        if (members[key].account === this.myInfo.account) {
          nickInTeam = members[key].nickInTeam || this.myInfo.nick
          this.myNick = nickInTeam
          this.myNickCopy = nickInTeam
          return nickInTeam
        }
      }
      return nickInTeam
    }
  },
  mounted () {
    this.isApplyTeam && this.$refs.sysmsgs.click()
  },
  methods: {
    checkCard (group) {
      if (this.activeId === group.teamId) return
      this.activeId = group.teamId
      this.callBack({type: 'team', teamId: group.teamId})
    },
    toggleList (value) {
      if (this.listType === value) return
      this.listType = value
    },
    onShowMenu (e, group, key) {
      // 单个列表右击事件
      if (e.button === 2) {
        if (key === 'group') {
          this.$store.dispatch('showListOptions', {
            key: 'group',
            show: true,
            id: group.teamId,
            pos: {
              x: e.clientX,
              y: e.clientY
            },
            callBack: (type) => {
              switch (type) {
                case 7:
                  // this.toggleRemindType(1, group)
                  console.log('消息免打扰')
                  break
                case 1:
                  console.log('邀请成员')
                  break
                case 2:
                  console.log('退出群')
                  break
                default:
                  break
              }
            }
          })
        } else {
          this.$store.dispatch('showListOptions', {
            key: 'team',
            show: true,
            id: group.teamId,
            pos: {
              x: e.clientX,
              y: e.clientY
            },
            callBack: (type) => {
              switch (type) {
                case 7:
                  // this.toggleRemindType(1, group)
                  console.log('消息免打扰')
                  break
                case 1:
                  console.log('邀请成员')
                  break
                case 2:
                  console.log('退出群')
                  break
                default:
                  break
              }
            }
          })
        }
      }
    },
    toggleRemindType (type, group) {
      if (this.remindMsgType === type) return
      // 消息提醒
      this.remindMsgType = type
      this.$store.dispatch('updateInfoInTeam', {
        teamInfo: group,
        nickInTeam: this.myNick,
        muteNotiType: type
      })
    },
    clearStatus (el, e) {
      if (e) {
        let className = e.target.className
        if (className.indexOf('searchevent') > -1) return
      }
      this.showSearch = false
      this.searchValue = ''
    },
    checkApplyTeamMsg () {
      this.activeId = 1
      this.callBack({type: 'sysmsgs'})
    }
  }
}
</script>

<style scoped>
  .contact-con {
    position: absolute;
    top: 120px;
    bottom: 0;
    width: 100%;
  }

  .t-center {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .t-u-list {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    overflow-y: auto;
  }

  .t-u-list-item {
    justify-content: space-between;
    width: 100%;
    height: 68px;
    box-sizing: border-box;
    padding: 0 12px;
    cursor: default;
  }
  .t-u-list-item img {
    width: 42px;
    height: 42px;
    border-radius: 50%;
  }

  .t-list-item-left {
    width: 90%;
  }

  .t-u-list-item .teamname {
    display: inline-block;
    width: 75%;
    font-size: 14px;
    padding-left: 11px;
    color: rgba(51,51,51,1);
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  .t-u-list-item .t-num {
    font-size: 14px;
    color: rgba(153,153,153,1);
  }

  .t-title-con {
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    height: 64px;
    padding: 10px 0 24px;
  }
  .t-title-con .t-title {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    width:143px;
    height:30px;
    border-radius:4px;
    border:1px solid #049AFF;
  }
  .t-title-con .t-title-item {
    width: 50%;
    height: 100%;
    line-height: 27px;
    text-align: center;
    color: rgba(51,51,51,1);
    font-size: 15px;
    transition: opacity .3s linear;
  }
  .t-title-con .t-title-item:hover {
    opacity: 0.7;
  }

  .t-title-con .t-title-item.active {
    color: rgba(255,255,255,1);
    background-color: #049AFF;
  }

  .t-title-con .t-title-team {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  .t-title-con .t-title-group {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .apply-team .teamname {
    font-size: 15px;
    color:rgba(51,51,51,1);
  }
</style>
