<template>
    <div class="g-window" @mouseup="onCloseListOptions">
        <div class="g-inherit" :style="{borderWidth: !path ? '0' : '1px'}">
            <nav-bar/>
            <div class="m-main" :style="{borderWidth: !path ? '1px' : '0'}">
              <keep-alive :include="['session-page', 'orgnize']">
                <router-view></router-view>
              </keep-alive>
            </div>
            <select-user/>
            <find-x/>
            <img-modal />
            <list-options />
            <unread-modal />
            <check-user/>
            <my-Info/>
            <select-contact/>
            <select-orgnize/>
            <clear-record/>
            <edit-notice/>
            <toast /> 
            <dismiss-team/>
            <general-setting/>
            <setting-detail/>
            <forword-fail />
            <logout/>
            <setting-name/>
            <down-line/>
            <team-code/>
        </div>
    </div>
</template>

<script>
  import NavBar from './controls/NavBar.vue'
  import MyInfo from './float/MyInfo.vue'
  import SelectUser from './float/SelectUser.vue'
  import util from '../utils'
  import FindX from './float/FindX.vue'
  import ImgModal from './float/ImgModal.vue'
  import ListOptions from './float/ListOptions.vue'
  import UnreadModal from './float/UnreadModal.vue'
  import CheckUser from './float/CheckUser.vue'
  import SelectContact from './float/SelectContact.vue'
  import SelectOrgnize from './float/SelectOrgnize.vue'
  import EditNotice from './float/EditNotice.vue'
  import ClearRecord from './float/ClearRecord.vue'
  import Toast from './toast/toast.vue'
  import DismissTeam from './float/DismissTeam.vue'
  import ForwordFail from './float/ForwordFail.vue'
  import GeneralSetting from './float/GeneralSetting.vue'
  import SettingDetail from './float/SettingDetail.vue'
  import SettingName from './float/SettingName.vue'
  import Logout from './float/Logout.vue'
  import DownLine from './float/DownLine.vue'
  import TeamCode from './float/TeamCode.vue'
  import Resize from '../utils/resize.js'
  const electron = require('electron')
  const ipcRenderer = electron.ipcRenderer
  export default {
    name: 'main-page',
    components: {MyInfo, NavBar, SelectUser, FindX, ImgModal, CheckUser, ListOptions, SelectContact, SelectOrgnize, ClearRecord, EditNotice, Toast, DismissTeam, GeneralSetting, SettingDetail, UnreadModal, Logout, ForwordFail, SettingName, DownLine, TeamCode},
    mounted () {
      // 初始化窗口拖拽函数
      Resize.changeSideRange({max: 300, min: 250})
    },
    watch: {
      incomingMsg (newMsg, oldMsg) {
        let showMsg = ''
        if (newMsg.type === 'text') {
          showMsg = newMsg.text || ''
        } else if (newMsg.type === 'custom') {
          showMsg = util.parseCustomMsg(newMsg)
        } else if (newMsg.scene === 'team' && newMsg.type === 'notification') {
          showMsg = util.generateTeamSysmMsg(newMsg)
        } else if (util.mapMsgType(newMsg)) {
          showMsg = `[${util.mapMsgType(newMsg)}]`
        } else {
          showMsg = ''
        }
        let isCurrent = newMsg.sessionId === this.$store.state.currSessionId
        let href = `#/mainpage/session/chat?sessionId=` + newMsg.sessionId
        let data = {body: showMsg, current: isCurrent, href: href}
        ipcRenderer.send('onReceiveMsg', data)
      }
    },
    computed: {
      incomingMsg () {
        return this.$store.state.newMsg
      },
      path () {
        return this.$route.path === '/'
      }
    },
    methods: {
      onCloseListOptions () {
        if (this.$store.state.showListOptions) {
          this.$store.dispatch('showListOptions', {
            show: false
          })
        }
      }
    }
  }
</script>

<style>

</style>
