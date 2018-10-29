<template>
<!-- 侧滑菜单 -->
<div id="sliderMenu" :class="className" v-clickoutside="closeMenu">
  <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center">
    <h4>{{this.scene === 'p2p' ? '聊天设置' : '群设置'}}</h4>
    <div style="width: 24px; height: 24px" v-if="this.scene !== 'p2p'">
      <img src="../../../../static/img/setting/er-wei-ma.png" alt="" style="width: 100%">
    </div>
  </div> 

  <div v-if='scene === "p2p"'>
    <ul class="m-u-list">
      <li class="m-u-list-item"><a class="add-parentNode" @click="createTeam()"><div class="b-add"/><div class="t-style t-add">添加</div></a></li>
      <li 
        class="m-u-list-item" 
        v-for="member in memberList" 
        :key="member.id" 
        :id="member.id"
      >
        <a class="add-parentNode" @click="showCheckUser($event)"><img class="t-img" :src="member.avatar"><div class="t-style">{{member.alias}}</div></a> 
      </li>
    </ul>
    <div>
      <div class="m-setting-u">
        <div class="t-style title">置顶聊天</div>
        <a class="t-btn" style="margin-bottom: 10px;" @click="openUpChat()"><a :class="isTop ? 'toggle-active' : 'toggle'"></a><span>{{isTop ? '关闭' : '开启'}}</span></a>
        <div class="t-style title">消息免打扰</div>
        <a class="t-btn" @click="openNoMsg"><a :class="isMute ? 'toggle-active' : 'toggle'"></a><span>{{isMute ? '关闭' : '开启'}}</span></a>
      </div>
      <div class="m-setting-u" style="border-bottom:none;"><div class="t-style title" style="margin-bottom: 10px;">聊天记录</div><a class="empty" @click="clearRecord">清 空</a></div>
    </div>
  </div>
  <div v-else>
    <div class="team-avatar">
      <div style="display:none;">{{teamAvatar}}</div>
      <img :src="avatar">
      <div 
        style="position: relative;overflow: hidden;"
        v-if="teamInfo.updateTeamMode === 'all' || power !== 'normal'">
        <a class="b-edit">编辑</a>
        <input @change="previewFile($event.target)" class="b-input" type="file" ref="imgToSent" accept="image/gif, image/jpeg, image/png, image/bmp, image/jpg" title=" " />
      </div>
    </div>
    <div class="team-block">
      <div style="display:none;">{{teamName}}</div>
      <div class="team-title" style="margin-bottom:0;">群名称</div>
      <input
          ref="teamNick"
          :class="isActive1 ? 'team-input active' : 'team-input'"
          type="text"
          placeholder="请输入群名称"
          maxlength="16"
          v-model="teamNick"
          :disabled="!(teamInfo.updateTeamMode === 'all' || power !== 'normal')"
          @focus="setStyle(1)"
          @blur="modifyTeamNick"
          @keyup="keyupModifyTeamNick($event)">
    </div>
    <div class="team-block">
      <div style="display:none;">{{nickInTeam}}</div>
      <div style="display: flex; flex-direction：row">
        <div class="team-title" style="margin-bottom:0;" >我在本群的昵称</div>
        <!-- <div style="width: 14px; height: 14px">
          <img src="../../../../static/img/setting/edit-nick-name.png" alt="" style="width: 100%">
        </div> -->
      </div>
      <input
          @mouseover="showEditIcon = true"
          @mouseout="showEditIcon = false"
          ref="myNick"
          :class="isActive2 ? 'team-input active' : 'team-input'"
          type="text"
          maxlength="16"
          placeholder="请输入你在本群的昵称"
          v-model="myNick"
          @focus="setStyle(2)"
          @blur="modifyNickInTeam"
          @keyup="keyupModifyNickInTeam($event)">
    </div>
    <div class="team-block">
      <div style="display:none;">{{muteNotiType}}</div>
      <div class="team-title">消息提醒</div>
      <a class="t-btn" style="margin-bottom: 5px;" @click="toggleRemindType(0)">
        <a :class="remindMsgType === 0 ? 'radio-active' : 'radio'"></a><span>提醒所有消息</span>
      </a>
      <a class="t-btn" style="margin-bottom: 5px;" @click="toggleRemindType(2)">
        <a :class="remindMsgType === 2 ? 'radio-active' : 'radio'"></a><span>只提醒管理员消息</span>
      </a>
      <a class="t-btn" @click="toggleRemindType(1)">
        <a :class="remindMsgType === 1 ? 'radio-active' : 'radio'"></a><span>不提醒任何消息</span>
      </a>
    </div>
    <div class="team-block">
      <div class="team-title">置顶聊天</div>
      <a 
        class="t-btn" 
        style="margin-bottom: 10px;" 
        @click="openUpChat()"
      >
        <a :class="isTop ? 'toggle-active' : 'toggle'"></a><span>{{isTop ? '关闭' : '开启'}}</span>
      </a>
    </div>
    <!-- <div class="team-block" v-if="power !== 'normal'">
      <div class="team-title">群资料修改权限</div>
      <a 
        class="t-btn" 
        style="margin-bottom: 5px;" 
        @click="modifyTeamMode('manager')"
      >
        <a :class="teamMode === 'manager' ? 'radio-active' : 'radio'"></a><span>群主和管理员</span>
      </a>
      <a 
        class="t-btn" 
        style="margin-bottom: 5px;" 
        @click="modifyTeamMode('all')"
      >
        <a :class="teamMode === 'all' ? 'radio-active' : 'radio'"></a><span>所有人</span>
      </a>
    </div> -->
    <div class="team-block" v-if="power === 'owner'">
      <div class="team-title-two">
        <!-- <span>设置管理员</span><span>(已设置</span><span style="color: #F5A623;font-size: 13px;">{{managerlist.length + '/5'}}</span><span>名管理员)</span> -->
        <span>当前群聊人数上限200，升级为500人</span>
      </div>
      <div class="set-manager">
        <a class="b-update-manager"  @click="updateTeam"><span>升级</span></a>
        <!-- <a class="b-add-manager" @click="addManager"><i></i><span>添加管理员</span></a>
        <a :class="managerlist.length > 0 ? 'b-remove-manager' : 'b-remove-manager disabled'" @click="removeManager"><i></i><span>移出管理员</span></a> -->
      </div>
    </div>  
    <div class="team-block" v-if="power !== 'owner'">
      <div class="team-title">退出群：</div><a class="b-edit" style="color: rgba(244,53,48,1);" @click="leaveTeam">退出群</a>
    </div>
    <div class="team-block" v-if="power === 'owner'">
      <div class="team-title">群转让：</div><a class="b-edit" @click="transferTeam">群转让</a>
    </div>
    <div class="team-block" v-if="power === 'owner'">
      <div class="team-title">群解散：</div><a class="b-edit" style="color: rgba(244,53,48,1);" @click="dismissTeam">解散群</a>
    </div>
  </div>
</div>
</template>

<script>
import clickoutside from '../../utils/clickoutside.js'
import util from '../../utils'
export default {
  name: 'slider-menu',
  props: {
    scene: String,
    to: String,
    teamId: String,
    sessionId: String,
    teamInfo: { type: Object, default () { return {} } },
    myInfo: { type: Object, default () { return {} } }
  },
  directives: {clickoutside},
  data () {
    return {
      settingIcon: './static/img/nav/icon-plus.png',
      teamNick: '',
      teamNickCopy: '',
      myNick: '',
      myNickCopy: '',
      avatar: '',
      isActive1: false,
      isActive2: false,
      remindMsgType: 1,
      showEditIcon: false
    }
  },
  computed: {
    muteTeamIds () {
      return this.$store.state.muteTeamIds
    },
    userInfos () {
      return this.$store.state.userInfos
    },
    teamMembers () {
      let teamMembers = this.$store.state.teamMembers
      let members = teamMembers && teamMembers[this.teamId]
      return members
    },
    moveStatus () {
      let slideMenuStatus = this.$store.state.slideMenuStatus
      if (slideMenuStatus === 2 || slideMenuStatus === 4) {
        let dom = document.getElementById('sliderMenu')
        if (dom) dom.scrollTop = 0
      }
      return slideMenuStatus
    },
    className () {
      if (this.moveStatus === 1 && this.scene === 'p2p') {
        return 'm-slidermenu'
      }
      if (this.moveStatus === 1 && this.scene !== 'p2p') {
        return 'm-slidermenu team'
      }
      if (this.moveStatus === 2 && this.scene === 'p2p') {
        return 'm-slidermenu k-moveleft'
      }
      if (this.moveStatus === 2 && this.scene !== 'p2p') {
        return 'm-slidermenu k-moveleft team'
      }
      if (this.moveStatus === 3 && this.scene === 'p2p') {
        return 'm-slidermenu k-moveright'
      }
      if (this.moveStatus === 3 && this.scene !== 'p2p') {
        return 'm-slidermenu k-moveright team'
      }
      if (this.scene === 'p2p') return 'm-slidermenu k-display'
      else return 'm-slidermenu k-display team'
    },
    isMute () {
      let mute = this.$store.state.mutelist.find(item => {
        return item.account === this.to
      })
      if (mute) return mute.isMute
      else return null
    },
    isTop () {
      let session = this.$store.state.sessionlist.find(item => {
        return item.id === this.$store.state.currSessionId
      })
      if (session && session.localCustom && session.localCustom.topTime) {
        return true
      }
      return false
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
    teamAvatar () {
      this.avatar = this.teamInfo.avatar
      return this.teamInfo.avatar
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
    },
    teamName () {
      this.teamNick = this.teamInfo.name
      this.teamNickCopy = this.teamInfo.name
      return this.teamInfo.name
    },
    power () {
      let type = 'normal'
      if (this.teamMembers) {
        for (let i = 0; i < this.teamMembers.length; i++) {
          if (this.teamMembers[i].account === this.myInfo.account) {
            type = this.teamMembers[i].type
            break
          }
        }
      }
      return type
    },
    teamMode () {
      return this.teamInfo.updateTeamMode
    },
    managerlist () {
      let managerlist = []
      if (this.teamMembers) {
        for (let i = 0; i < this.teamMembers.length; i++) {
          if (this.teamMembers[i].type === 'manager') {
            managerlist.push(this.teamMembers[i])
          }
        }
      }
      return managerlist
    },
    muteNotiType () {
      this.remindMsgType = this.teamInfo.muteNotiType
      return this.teamInfo.muteNotiType
    },
    teamlist () {
      let teamlist = this.$store.state.teamlist.filter(item => {
        return item.valid && item.validToCurrentUser
      })
      return teamlist
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
    closeMenu (el, e) {
      if (e.target.className.indexOf('b-more') > -1) return
      if (this.moveStatus === 1) return
      if (this.moveStatus === 2) {
        this.$store.commit('toggleSlideMenuStatus', 3)
      }
    },
    previewFile (target) {
      let ipt = target
      if (ipt.value) {
        if (!/\.(png|jpg|bmp|jpeg|gif)$/i.test(ipt.value)) {
          this.$store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: '图片格式不正确'
          })
          return
        }
        if (target.files[0].size > 10 * 1024 * 1024) {
          this.$store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: '图片不能大于10M'
          })
          return
        }
        this.$store.dispatch('previewFile', {
          type: 'image',
          fileInput: ipt,
          callback: (file) => {
            this.teamInfo.avatar = file.url
            this.$store.dispatch('updateTeam', {
              teamInfo: {
                teamId: this.teamInfo.teamId,
                avatar: this.teamInfo.avatar
              },
              callback: () => {
                this.avatar = ipt.files[0].path
              }
            })
          }
        })
      }
    },
    modifyTeamNick () {
      this.isActive1 = false
      if (this.teamNick === '') {
        this.teamNick = this.teamNickCopy
      }
      if (this.teamNick === this.teamNickCopy) return
      // 修改群名称
      this.teamInfo.name = this.teamNick
      this.$store.dispatch('updateTeam', {
        teamInfo: {
          teamId: this.teamInfo.teamId,
          name: this.teamInfo.name
        }
      })
    },
    keyupModifyTeamNick (event) {
      if (event.keyCode === 13) {
        this.$refs.teamNick.blur()
      }
    },
    modifyNickInTeam () {
      this.isActive2 = false
      if (this.myNick === '') {
        this.myNick = this.myNickCopy
      }
      if (this.myNick === this.myNickCopy) return
      // 修改群昵称
      this.$store.dispatch('updateInfoInTeam', {
        teamInfo: this.teamInfo,
        nickInTeam: this.myNick
      })
    },
    keyupModifyNickInTeam (event) {
      if (event.keyCode === 13) {
        this.$refs.myNick.blur()
      }
    },
    modifyTeamMode (type) {
      if (this.teamMode === type) return
      // 群资料修改权限
      this.$store.dispatch('updateTeam', {
        teamInfo: {
          teamId: this.teamInfo.teamId,
          updateTeamMode: type
        }
      })
    },
    createTeam () {
      this.$store.commit('toggleSlideMenuStatus', 3)
      this.$store.commit('updateOrgDisabledlist', {type: 'put', accid: this.to})
      this.eventBus.$emit('selectOrgnize', {type: 2})
    },
    openUpChat () {
      // 消息置顶
      this.$store.dispatch('setTopSession', {
        id: this.$store.state.currSessionId,
        key: !this.isTop
      })
    },
    openNoMsg () {
      this.$store.dispatch('updateMute', {account: this.to, isMute: !this.isMute})
      this.$store.commit('toggleSlideMenuStatus', 3)
    },
    clearRecord () {
      this.eventBus.$emit('clearRecord', {account: this.to, sessionId: this.sessionId})
      this.$store.commit('toggleSlideMenuStatus', 3)
    },
    showCheckUser (event) {
      let userInfos = this.userInfos[this.to]
      if (this.to === this.$store.state.userUID) {
        userInfos = 1
      }
      // 查看个人资料
      this.$store.commit('toggleSlideMenuStatus', 3)
      this.eventBus.$emit('checkUser', {event, userInfos})
    },
    setStyle (type) {
      // 设置选中样式
      if (type === 1) {
        this.isActive1 = true
      } else {
        this.isActive2 = true
      }
    },
    removeStyle (type) {
      // 移除选中样式
      if (type === 1) {
        this.isActive1 = false
      } else {
        this.isActive2 = false
      }
    },
    addManager () {
      // 添加管理员
      let sidelist = []
      if (this.memberList) {
        this.memberList.map(item => {
          if (item.type !== 'owner') {
            sidelist.push(item)
          }
        })
        this.$store.commit('toggleSlideMenuStatus', 3)
        this.eventBus.$emit('selectContact', {type: 2, sidelist, teamId: this.teamId})
      }
    },
    removeManager () {
      if (this.managerlist.length <= 0) return
      // 移除管理员
      let sidelist = []
      if (this.memberList) {
        this.memberList.map(item => {
          if (item.type === 'manager') {
            sidelist.push(item)
          }
        })
        this.$store.commit('toggleSlideMenuStatus', 3)
        this.eventBus.$emit('selectContact', {type: 3, sidelist, teamId: this.teamId})
      }
    },
    transferTeam () {
      // 转让群
      let sidelist = []
      if (this.memberList) {
        this.memberList.map(item => {
          if (item.type !== 'owner') {
            sidelist.push(item)
          }
        })
        this.$store.commit('toggleSlideMenuStatus', 3)
        this.eventBus.$emit('selectContact', {type: 4, sidelist, teamId: this.teamId})
      }
    },
    dismissTeam () {
      // 解散群
      this.$store.commit('toggleSlideMenuStatus', 3)
      this.eventBus.$emit('dismissTeam', {teamId: this.teamId, type: 1})
    },
    leaveTeam () {
      // 退出群
      this.$store.commit('toggleSlideMenuStatus', 3)
      this.eventBus.$emit('dismissTeam', {teamId: this.teamId, type: 2, teamInfo: this.teamInfo})
    },
    updateTeam () {
      // 升级群
      this.$store.commit('toggleSlideMenuStatus', 3)
      this.eventBus.$emit('dismissTeam', {teamId: this.teamId, type: 3})
    },
    toggleRemindType (type) {
      if (this.remindMsgType === type) return
      // 消息提醒
      this.remindMsgType = type
      this.$store.dispatch('updateInfoInTeam', {
        teamInfo: this.teamInfo,
        nickInTeam: this.myNick,
        muteNotiType: type
      })
    }
  }
}
</script>

<style>
  .m-slidermenu {
    box-sizing: border-box;
    position: absolute;
    top: 31px;
    right: -226px;
    width: 240px;
    height: 100%;
    background-color: #fff;
    box-shadow: -0.2rem 0 0.4rem -0.1rem #ccc;
    padding: 24px 12px 40px 17px;
    background: rgba(250,250,250,1);
    z-index: 50;
    overflow-y: auto;
    display: block;
  }
  .m-slidermenu.team {
    right: -266px;
    width: 268px;
  }

  .m-slidermenu > h4 {
    font-size: 16px;
    color: rgba(11,13,12,1);
    text-align: left;
    margin-bottom: 10px;
  }

  .m-slidermenu.k-moveleft {
    right: 0;
    animation: moveLeft 500ms;
  }
  .m-slidermenu.k-moveleft.team {
    right: 0;
    animation: moveLeftTeam 500ms;
  }

  .m-slidermenu.k-moveright {
    right: -226px;
    animation: moveRight 500ms;
  }
  .m-slidermenu.k-moveright.team {
    right: -266px;
    animation: moveRightTeam 500ms;
  }

  .m-slidermenu.k-display {
    right: -226px;
    display: none;
  }
  .m-slidermenu.k-display.team {
    right: -266px;
    display: none;
  }

  @keyframes moveLeft {
    from { right: -226px }
    to { right: 0 }
  }

  @keyframes moveRight {
    from { right: 0 }
    to { right: -226px }
  }

  @keyframes moveLeftTeam {
    from { right: -266px }
    to { right: 0 }
  }

  @keyframes moveRightTeam {
    from { right: 0 }
    to { right: -266px }
  }

  .m-slidermenu .m-u-list {
    margin-top: 10px;
    height: auto;
    border-bottom: 1px solid #ccc;
  }

  .m-slidermenu .m-u-list .m-u-list-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    margin-bottom: 10px;
    cursor: default;
  }

  .m-slidermenu .m-u-list .m-u-list-item:hover {
    background: none;
  }

  .m-slidermenu .m-u-list .m-u-list-item:last-child {
    margin-bottom: 20px;
  }

  .m-slidermenu .t-style {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: rgba(11,13,12,1);
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  .m-slidermenu .m-u-list .m-u-list-item .t-img {
    width: 32px;
    height: 32px;
    background-color:#eee;
    border-radius: 16px;
    margin-right: 8px;
  }

  .m-slidermenu .m-setting-u {
    padding-top: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(214,214,214,1);
  }

  .m-slidermenu .m-setting-u .title {
    font-size: 14px;
    color: rgba(153,153,153,1);
    margin-bottom: 7px;
  }

  .m-slidermenu .m-setting-u .empty {
    width: 58px;
    height: 26px;
    line-height: 26px;
    background: rgba(242,242,242,1);
    border-radius: 2px;
    text-align: center;
    font-size: 12px;
    color: rgba(244,53,48,1);
    transition: all .3s linear;
  }
  .m-slidermenu .m-setting-u .empty:hover {
    background-color: rgba(223, 219, 219, 1);
  }

  .m-slidermenu .t-btn {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #000;
  }

  .m-slidermenu .toggle {
    display: inline-block;
    width: 15px;
    height: 15px;
    margin-right: 9px;
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
  }
  .m-slidermenu .toggle:hover, .toggle:focus {
    background-image: url('../../../../static/img/setting/checkboxborder-p.png');
    background-size: 100% 100%;
  }
  .m-slidermenu .toggle-active {
    display: inline-block;
    vertical-align: middle;
    width: 15px;
    height: 15px;
    margin-right: 9px;
    background-image: url('../../../../static/img/setting/checkbox-c.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
  }

  .m-slidermenu .radio {
    display: inline-block;
    width: 15px;
    height: 15px;
    margin-right: 9px;
    background-image: url('../../../../static/img/setting/radio.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear; 
  }
  .m-slidermenu .radio:hover, .radio:focus {
    background-image: url('../../../../static/img/setting/radio-p.png');
    background-size: 100% 100%;
  }
  .m-slidermenu .radio-active {
    display: inline-block;
    vertical-align: middle;
    width: 15px;
    height: 15px;
    margin-right: 9px;
    background-image: url('../../../../static/img/setting/radio-c.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
  }

  .m-slidermenu .add-parentNode {
    display: flex;
    align-content: center;
    flex-direction: row;
    cursor: pointer;
  }

  .m-slidermenu .add-parentNode .b-add {
    display: inline-block;
    width: 32px;
    height: 32px;
    margin-right: 8px;
    background-image: url('../../../../static/img/setting/add.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 100% 100%;
    transition: all .2s linear;
  }

  .m-slidermenu .add-parentNode:hover .b-add, .add-parentNode:focus .b-add {
    background-image: url('../../../../static/img/setting/add-p.png');
    background-size: 100% 100%;
  }
  .m-slidermenu .add-parentNode .t-add {
    transition: all .2s linear;
  }
  .m-slidermenu .add-parentNode:hover .t-add, .add-parentNode:focus .t-add {
    color: rgb(165, 196, 253);
  }

  /* 群设置样式 */
  .m-slidermenu .team-avatar {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px 0 20px;
  }
  
  .m-slidermenu .team-avatar > img {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    margin-right: 10px;
  }

  .m-slidermenu .b-edit {
    display: inline-block;
    width: 55px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    background-color: rgba(242,242,242,1);
    border-radius: 4px;
    font-size: 12px;
    color: #333;
    transition: all .3s linear;
  }
  .m-slidermenu .b-edit:hover {
    background-color: rgb(223, 219, 219);
  }
  
  .m-slidermenu .b-input {
    position: absolute;
    width: 55px;
    height: 28px;
    top: 0;
    padding-left: 55px;
    z-index: 10;
  }

  .m-slidermenu .team-block {
    margin-bottom: 18px;
    color: #000;
  }

  .m-slidermenu .team-block .team-title {
    width: 100%;
    font-size: 14px;
    color: #999;
    margin-bottom: 7px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
  .m-slidermenu .team-block .team-title-two {
    width: 100%;
    font-size: 14px;
    color: #999;
    margin-bottom: 7px;
    word-break: break-all
  }

  .m-slidermenu .team-block .team-input {
    box-sizing: border-box;
    width: 100%;
    height: 27px;
    font-size: 14px;
    color: #000;
    font-family: "PingFangSC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
    line-height: 25px;
    border: none;
    padding: 0 5px;
    margin: 0;
    background-color: rgba(250,250,250,1);
    overflow:hidden;
    text-overflow:ellipsis;
    text-align:left;
    white-space:nowrap
  }
  .m-slidermenu .team-block .team-input.active {
    background-color: #fff;
    border: 1px solid rgba(79,141,255,1);
    border-radius: 4px;
  }

  .m-slidermenu .set-manager {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .m-slidermenu .set-manager a {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 26px;
    background: rgba(242,242,242,1);
    border-radius: 2px;
    font-size: 12px;
    color: #000;
    transition: all .3s linear;
  }
  .m-slidermenu .set-manager a:hover {
    background-color: rgb(223, 219, 219);
  }
  .m-slidermenu .set-manager a.disabled {
    cursor: default;
    opacity: 0.5;
  }
  .m-slidermenu .set-manager a.disabled:hover {
    background: rgba(242,242,242,1);
  }

  .m-slidermenu .set-manager .b-add-manager i,
  .m-slidermenu .set-manager .b-remove-manager i {
    display: inline-block;
    width: 12px;
    height: 12px;
    background: url('../../../../static/img/team/add.png') no-repeat center center;
    background-size: 100% 100%;
    margin-right: 5px;
  }
  .m-slidermenu .set-manager .b-remove-manager i {
    background: url('../../../../static/img/team/remove.png') no-repeat center center;
    background-size: 100% 100%;
  }
</style>