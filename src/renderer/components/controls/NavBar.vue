<template>
<div class="m-nav">
  <div class="u-nav-avatar" :style="{marginTop}">
    <img @click="getUserInfo($event)" :src="myInfo.avatar || defaultUserIcon"/>
  </div>
  <div class="u-nav-status">
    <!-- <span>在线</span><i></i> -->
  </div>
  <!-- 单聊 -->
  <div @click="navTo('session')" :class="selectedItem === 'session' ? 'nav-item u-nav-session z-sel' : 'u-nav-session'"></div>
  <!-- 常用联系人 -->
  <div @click="navTo('contacts')" :class="selectedItem === 'contacts' ? 'nav-item u-nav-friends z-sel' : 'u-nav-friends'"></div>
  <!-- 群&讨论组 -->
  <div @click="navTo('team')" :class="selectedItem === 'team' ? 'nav-item u-nav-work z-sel' : 'u-nav-work'">
    <div class="u-unread" v-if="sysMsgUnread">{{sysMsgUnread}}</div>
  </div>
  <!-- 组织架构 -->
  <div @click="navTo('orgnize')" :class="selectedItem === 'orgnize' ? 'nav-item u-nav-jiagou z-sel' : 'u-nav-jiagou'"></div>
  <!-- 第三方应用 -->
  <div @click="navTo('workbench')" :class="selectedItem === 'workbench' ? 'nav-item u-nav-yingyong z-sel' : 'u-nav-yingyong'"></div>
  <!-- 添加-发起群聊 -->
  <div @click.stop="launchChat($event)" class="u-nav-add"></div>
  <!-- 设置 -->
  <div class="u-nav-setting" @click="eventBus.$emit('generalSetting', {show: true})"></div>
</div>
</template>

<script>
import platform from '../../utils/platform'
import config from '../../configs'
export default {
  name: 'nav-bar',
  data () {
    return {
      defaultUserIcon: config.defaultUserIcon,
      selectedItem: 'session',
      marginTop: platform.getOsInfo() === 'Windows' ? '17px' : '2rem'
    }
  },
  mounted () {
    this.eventBus.$on('updateNavBar', (data) => {
      this.selectedItem = data.navTo
    })
  },
  watch: {
    $route () {
      let rotueName = this.$route.name
      switch (rotueName) {
        case 'session':
          this.selectedItem = 'session'
          break
        case 'chat':
          this.selectedItem = 'session'
          break
        case 'contacts':
          this.selectedItem = rotueName
          break
        case 'team':
          this.selectedItem = rotueName
          break
        case 'orgnize':
          this.selectedItem = rotueName
          break
        case 'workbench':
          this.selectedItem = rotueName
          break
      }
    }
  },
  methods: {
    getUserInfo ($event) {
      this.eventBus.$emit('showMyInfo', {userInfos: 1, event})
    },
    createTeam () {
      let data = {teamId: '', selectMode: 'createTeam'}
      this.eventBus.$emit('openSelect', data)
    },
    navTo (to) {
      if (this.selectedItem === to) return
      this.selectedItem = to
      this.$router.push({name: to})
    },
    launchChat (e) {
      // 发起群聊
      this.$store.dispatch('showListOptions', {
        key: 'launch-chat',
        show: true,
        pos: {
          x: e.clientX + 15,
          y: e.clientY - 30
        },
        callBack: (type) => {
          this.eventBus.$emit('selectOrgnize', {type: type === 2 ? 4 : 1})
        }
      })
    }
  },
  computed: {
    myInfo () {
      return this.$store.state.myInfo
    },
    teamlist () {
      let teamlist = this.$store.state.teamlist.filter(item => {
        return item.valid && item.validToCurrentUser
      })
      return teamlist
    },
    sysMsgUnread () {
      let temp = this.$store.state.sysMsgUnread
      return temp.applyTeam
    }
  }
}
</script>

<style>
  .u-nav-avatar{
    margin-top: 17px;
    width: 36px;
    height: 36px;
    -webkit-app-region: no-drag;
    border-radius: 50%;
    overflow: hidden;
  }
  .u-nav-avatar img{
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  .u-nav-status{
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
  .u-nav-status span{
    color: #fff;
    font-size: 11px;
  }
  .u-nav-status i{
    margin-left: 4px;
    width: 5px;
    height: 3px;
    background-image: url(../../../../static/img/nav/main-tab-status-icon.png);
    background-size: 100%;
  }
  .u-nav-session{
    margin-top: 20px;
    width: 69px;
    height: 40px;
    -webkit-app-region: no-drag;
    background: url(../../../../static/img/nav/main-tab-session-normal.png) no-repeat center center;
    background-size: 22px 22px;

  }
  .u-nav-session a{
    display: block;
    width: 100%;
    height: 100%;
  }
  .u-nav-session.z-sel{
    background: url(../../../../static/img/nav/main-tab-session-activated.png) no-repeat center center;
    background-size: 22px 22px;
  }

  .u-nav-work{
    width: 69px;
    height: 40px;
    -webkit-app-region: no-drag;
    background: url(../../../../static/img/nav/main-tab-qun-normal.png) no-repeat center center;
    background-size: 22px 22px;
    box-sizing: border-box;
    padding: 0 12px;
    margin-top: 5px;
  }
  .u-nav-work.z-sel{
    background: url(../../../../static/img/nav/main-tab-qun-activated.png) no-repeat center center;
    background-size: 22px 22px;
  }

  .u-nav-friends{
    width: 69px;
    height: 40px;
    -webkit-app-region: no-drag;
    background: url(../../../../static/img/nav/main-tab-friends-normal.png) no-repeat center center;
    background-size: 22px 22px;
    margin-top: 5px;
  }
  .u-nav-friends.z-sel{
    background: url(../../../../static/img/nav/main-tab-friends-activated.png) no-repeat center center;
    background-size: 22px 22px;
  }

  .u-nav-jiagou{
    width: 69px;
    height: 40px;
    -webkit-app-region: no-drag;
    background: url(../../../../static/img/nav/main-tab-jiagou-normal.png) no-repeat center center;
    background-size: 22px 22px;
    margin-top: 5px;
  }
  .u-nav-jiagou.z-sel{
    background: url(../../../../static/img/nav/main-tab-jiagou-activated.png) no-repeat center center;
    background-size: 22px 22px;
  }

  .u-nav-yingyong{
    width: 69px;
    height: 40px;
    -webkit-app-region: no-drag;
    background: url(../../../../static/img/nav/main-tab-third-normal.png) no-repeat center center;
    background-size: 22px 22px;
    margin-top: 5px;
  }
  .u-nav-yingyong:active{
    background: url(../../../../static/img/nav/main-tab-third-normal.png) no-repeat center center;
    background-size: 22px 22px;
  }
  .u-nav-yingyong.z-sel{
    background: url(../../../../static/img/nav/main-tab-third-activated.png) no-repeat center center;
    background-size: 22px 22px;
  }
  .u-nav-yingyong.z-sel:active{
    background: url(../../../../static/img/nav/main-tab-third-activated.png) no-repeat center center;
    background-size: 22px 22px;
  }

  .u-nav-setting,
  .u-nav-add {
    position: absolute;
    bottom: 18px;
    left: 50%;
    margin-left: -11px;
    width: 25px;
    height: 25px;
    -webkit-app-region: no-drag;
    background: url(../../../../static/img/nav/main-tab-setting-normal.png) no-repeat center center;
    background-size: 22px 22px;
  }

  .u-nav-add {
    bottom: 60px;
    background: url(../../../../static/img/nav/main-tab-add-normal.png) no-repeat center center;
    background-size: 21px 21px;
  }

</style>
