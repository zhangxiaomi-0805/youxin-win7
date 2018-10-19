<template>
<div class="m-nav">
  <div class="u-nav-avatar" :style="{marginTop}">
    <img @click="showUserCard($event)" :src="myInfo.avatar"/>
  </div>
  <!-- <div class="u-nav-status"><span>在线</span><i></i></div> -->
  <div @click="navTo('session')" :class="selectedItem === 'session' ? 'u-nav-session z-sel' : 'u-nav-session'"></div>
  <div @click="navTo('workbench')" :class="selectedItem === 'workbench' ? 'u-nav-work z-sel' : 'u-nav-work'"></div>
  <div @click="navTo('contacts')" :class="selectedItem === 'contacts' ? 'u-nav-friends z-sel' : 'u-nav-friends'"></div>
  <div @click="launchChat($event)" class="u-nav-add"></div>
  <div class="u-nav-setting" @click="eventBus.$emit('generalSetting', {show: true})"></div>
</div>
</template>

<script>
import platform from '../../utils/platform'
export default {
  name: 'nav-bar',
  data () {
    return {
      selectedItem: 'session',
      marginTop: platform.getOsInfo() === 'Windows' ? '17px' : '2rem'
    }
  },
  mounted () {
    this.eventBus.$on('updateNavBar', (data) => {
      this.selectedItem = data.navTo
    })
  },
  methods: {
    createTeam () {
      let data = {teamId: '', selectMode: 'createTeam'}
      this.eventBus.$emit('openSelect', data)
    },
    navTo (to) {
      if (this.selectedItem === to) return
      this.selectedItem = to
      this.$router.push({name: to})
    },
    showUserCard (event) {
      this.eventBus.$emit('checkUser', {userInfos: 1, event})
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
        callBack: () => {
          this.eventBus.$emit('selectOrgnize', {type: 1})
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
    margin-top: 30px;
    width: 22px;
    height: 22px;
    -webkit-app-region: no-drag;
    background-image: url(../../../../static/img/nav/main-tab-session-normal.png);
    background-size: 100%;
  }
  .u-nav-session a{
    display: block;
    width: 100%;
    height: 100%;
  }
  .u-nav-session:active{
    background-image: url(../../../../static/img/nav/main-tab-session-pushed.png);
  }
  .u-nav-session.z-sel{
    background-image: url(../../../../static/img/nav/main-tab-session-activated.png);
  }
  .u-nav-session.z-sel:active{
    background-image: url(../../../../static/img/nav/main-tab-session-activated-pushed.png);
  }

  .u-nav-work{
    margin-top: 20px;
    width: 22px;
    height: 22px;
    -webkit-app-region: no-drag;
    background-image: url(../../../../static/img/nav/main-tab-work-normal.png);
    background-size: 100%;
  }
  .u-nav-work:active{
    background-image: url(../../../../static/img/nav/main-tab-work-pushed.png);
  }
  .u-nav-work.z-sel{
    background-image: url(../../../../static/img/nav/main-tab-work-activated.png);
  }
  .u-nav-work.z-sel:active{
    background-image: url(../../../../static/img/nav/main-tab-work-activated-pushed.png);
  }

  .u-nav-friends{
    margin-top: 20px;
    width: 22px;
    height: 22px;
    -webkit-app-region: no-drag;
    background-image: url(../../../../static/img/nav/main-tab-friends-normal.png);
    background-size: 100%;
  }
  .u-nav-friends:active{
    background-image: url(../../../../static/img/nav/main-tab-friends-pushed.png);
  }
  .u-nav-friends.z-sel{
    background-image: url(../../../../static/img/nav/main-tab-friends-activated.png);
  }
  .u-nav-friends.z-sel:active{
    background-image: url(../../../../static/img/nav/main-tab-friends-activated-pushed.png);
  }

  .u-nav-setting, 
  .u-nav-add {
    position: absolute;
    bottom: 18px;
    left: 50%;
    margin-left: -11px;
    width: 22px;
    height: 22px;
    -webkit-app-region: no-drag;
    background-image: url(../../../../static/img/nav/main-tab-setting-normal.png);
    background-size: 100% 100%;
  }
  .u-nav-setting:active{
    background-image: url(../../../../static/img/nav/main-tab-setting-pushed.png);
  }

  .u-nav-add {
    bottom: 60px;
    background-image: url(../../../../static/img/nav/main-tab-add-normal.png);
    background-size: 100% 100%;
  }
  .u-nav-add:active{
    background-image: url(../../../../static/img/nav/main-tab-add-pushed.png);
  }
</style>

