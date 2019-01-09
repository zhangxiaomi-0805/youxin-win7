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
      <msg-record/>
      <update-app/>
      <group-invite/>
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
  import Request from '../utils/request.js'
  import MsgRecord from './msgRecord/MsgRecord.vue'
  import UpdateApp from './float/UpdateApp.vue'
  import GroupInvite from './float/groupInvite.vue'
  import config from '../configs'
  // import NativeLogic from '../utils/nativeLogic.js'
  export default {
    name: 'main-page',
    components: {MyInfo, NavBar, SelectUser, FindX, ImgModal, CheckUser, ListOptions, SelectContact, SelectOrgnize, ClearRecord, EditNotice, Toast, DismissTeam, GeneralSetting, SettingDetail, UnreadModal, Logout, ForwordFail, SettingName, DownLine, TeamCode, MsgRecord, UpdateApp, GroupInvite},
    mounted () {
      // 初始化窗口拖拽函数
      Resize.changeSideRange({max: 300, min: 250})
      if (config.environment === 'web') { // web分支
        // NativeLogic.native.sendEvent() // 跨窗口通信
      } else { // electron分支
        let { ipcRenderer } = require('electron')
        ipcRenderer.on('getAccid', (evt, arg) => {
          Request.GetAccid({userName: arg.account}, this).then(ret => {
            let accid = ret.accid
            // 根据account 获取 accid 发起会话
            this.createSession(accid)
          })
        })
      }
      // 检查更新
      if (localStorage.APPVERSIONS) {
        let APPVERSIONS = JSON.parse(localStorage.APPVERSIONS)
        if (APPVERSIONS.ignore) return false
        let nowDate = new Date().getTime()
        if (nowDate - APPVERSIONS.dateTime > 24 * 3600 * 1000) {
          Request.AppVersions().then(res => this.eventBus.$emit('updateApp', res)).catch(() => {})
        }
      } else Request.AppVersions().then(res => this.eventBus.$emit('updateApp', res)).catch(() => {})
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
        // let { ipcRenderer } = require('electron')
        // ipcRenderer.send('onReceiveMsg', data)
      }
    },
    computed: {
      incomingMsg () {
        return this.$store.state.newMsg
      },
      path () {
        return this.$route.path === '/'
      },
      sessionlist () {
        return this.$store.state.sessionlist
      }
    },
    methods: {
      onCloseListOptions () {
        if (this.$store.state.showListOptions) {
          this.$store.dispatch('showListOptions', {
            show: false
          })
        }
      },
      createSession (accid) {
        let sessionId = ''
        for (let i in this.sessionlist) {
          if (this.sessionlist[i].to === accid) {
            sessionId = this.sessionlist[i].id
            break
          }
        }
        if (sessionId) {
          this.eventBus.$emit('updateNavBar', {navTo: 'session'})
          this.eventBus.$emit('toggleSelect', {sessionId})
          this.$router.push({name: 'chat', query: {sessionId, firstFlag: true}})
        } else {
          this.$store.dispatch('insertLocalSession', {
            scene: 'p2p',
            account: accid,
            callback: (sessionId) => {
              this.eventBus.$emit('updateNavBar', {navTo: 'session'})
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

</style>
