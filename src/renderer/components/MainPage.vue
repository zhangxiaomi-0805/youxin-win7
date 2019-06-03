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
      <cut-code/>
      <remote-waiting/>
      <remote-connect/>
      <remote-confirm/>
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
  import CutCode from './float/CutCode.vue'
  import RemoteWaiting from './float/RemoteWaiting.vue'
  import RemoteConnect from './float/RemoteConnect.vue'
  import RemoteConfirm from './float/RemoteConfirm.vue'
  import config from '../configs'
  import NativeLogic from '../utils/nativeLogic.js'
  // import operateFs from '../utils/operateFs'
  export default {
    name: 'main-page',
    components: {
      MyInfo,
      NavBar,
      SelectUser,
      FindX,
      ImgModal,
      CheckUser,
      ListOptions,
      SelectContact,
      SelectOrgnize,
      ClearRecord,
      EditNotice,
      Toast,
      DismissTeam,
      GeneralSetting,
      SettingDetail,
      UnreadModal,
      Logout,
      ForwordFail,
      SettingName,
      DownLine,
      TeamCode,
      MsgRecord,
      UpdateApp,
      GroupInvite,
      CutCode,
      RemoteWaiting,
      RemoteConnect,
      RemoteConfirm
    },
    mounted () {
      // 初始化窗口拖拽函数
      Resize.changeSideRange({max: 300, min: 250})
      if (config.environment === 'web') { // web分支
        let AppDirectory = window.location.pathname.slice(1) // 应用所在目录
        if (AppDirectory.indexOf('dist') > -1) {
          let urlArr = AppDirectory.split('dist')
          AppDirectory = urlArr[0]
        }
        NativeLogic.native.setWindowIcon(AppDirectory + '/dist/static/img/systry-logo.png') // 设置窗口图标

        // 点击系统托盘图标 ---- 定位会话列表
        window.NimCefWebInstance && window.NimCefWebInstance.register('OnClickedTrayIcon', (params) => {
          if (params.button === 'left') { // 左击
            this.eventBus.$emit('positionSession')
          }
        })

        // 点击右下角退出按钮时的通知--这里是隐藏
        window.NimCefWebInstance && window.NimCefWebInstance.register('OnAppExit', (params) => {
          NativeLogic.native.setWinStatus('main', 6).then(res => { // 1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示
          }).catch(err => console.log(err))
        })

        // 监听子窗口通信方法
        window.NimCefWebInstance && window.NimCefWebInstance.register('onReceiveEvent', (params) => {
          // 营业精灵唤起截屏
          console.log(params.eventName)
          if (params.eventName === 'callScreenShot') {
            this.eventBus.$emit('screenShot', {type: 'isCallScreenShot'})
          }
          // 发起会话
          if (params.eventName === 'createSession') {
            let arg = params.data
            Request.GetAccid({userName: arg.account}, this).then(ret => {
              let accid = ret.accid
              // 发起会话前，最小化子窗口
              NativeLogic.native.setWinStatus('营业精灵', 1).then(res => { // 1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示
              }).catch(err => console.log(err))
              // 根据account 获取 accid 发起会话
              this.createSession(accid)
            })
          }
          if (params.eventName === 'childIsLoaded') {
            // 2、跨窗口通信,等子页面准备完成再发送事件
            // params: windowName, data{}, eventName
            this.eventBus.$emit('sendMsgToChild')
          }
        })

        // 初始化设置截屏快捷键
        let isCtrl = false
        let isShift = false
        let isAlt = true
        let virtualKey = 'A'
        if (localStorage.CUTCODE) {
          let cutCode = localStorage.CUTCODE
          cutCode = cutCode.replace(/\s+/g, '') // 去除所有空格
          let codeArr = cutCode.split('+')
          if (codeArr.indexOf('Shift') > -1) {
            isShift = true
          } else {
            isShift = false
          }
          if (codeArr.indexOf('Ctrl') > -1) {
            isCtrl = true
          } else {
            isCtrl = false
          }
          if (codeArr.indexOf('Alt') > -1) {
            isAlt = true
          } else {
            isAlt = false
          }
          virtualKey = codeArr[codeArr.length - 1]
        }
        NativeLogic.native.setCaptureHotkey(isCtrl, isShift, isAlt, virtualKey).then(res => {
        }).catch(() => {
          this.$store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: '截屏快捷键与其他软件冲突，请重新设置！'
          })
        })
        // 监听截屏快捷键方法
        window.NimCefWebInstance && window.NimCefWebInstance.register('onReceiveHotkeyEvent', (params) => {
          this.eventBus.$emit('screenShot', {type: 'isHotKeyScreenShot'})
        })
      } else { // electron分支
        let { ipcRenderer } = require('electron')
        ipcRenderer.on('getAccid', (evt, arg) => {
          Request.GetAccid({userName: arg.account}, this).then(ret => {
            let accid = ret.accid
            // 根据account 获取 accid 发起会话
            this.createSession(accid)
          })
        })
        // 注册快捷键
        ipcRenderer.send('registerShortcut', localStorage.CUTCODE || 'Alt+A')
        // 点击系统托盘图标 ---- 定位会话列表
        ipcRenderer.on('positionSession', (evt, arg) => {
          this.eventBus.$emit('positionSession')
        })

        /**
         * 远程协助
         */
        // 发起远程协助通知
        ipcRenderer.on('sendRemoteConnection', (evt, arg) => {
          let content = { status: 'connect', ipconfig: arg.content }
          this.$store.dispatch('sendCustomSysMsg', {account: arg.account, content: JSON.stringify(content)})
          this.$store.commit('updateRemoteWaitingObj', { showModal: false })
        })
        // 关闭远程通信通知
        ipcRenderer.on('closeRemoteWindow', (evt, arg) => {
          let content = { status: 'disConnect' }
          this.$store.dispatch('sendCustomSysMsg', {account: arg, content: JSON.stringify(content)})
        })

        // 创建默认图片存储文件夹
        // operateFs.createDefaltDir({})
      }
      // 检查更新
      Request.AppVersions().then(res => {
        if (res) {
          let APPVERSIONS = localStorage.APPVERSIONS ? JSON.parse(localStorage.APPVERSIONS) : null
          if (APPVERSIONS && APPVERSIONS.ignore && (APPVERSIONS.versionNum === res.versionNum)) {
            return false
          }
          this.eventBus.$emit('updateApp', res)
        }
      }).catch(() => {})
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
        if (config.environment === 'web') { // web分支
          // NativeLogic.native.sendEvent() // 跨窗口通信
        } else { // electron分支
          let { ipcRenderer } = require('electron')
          ipcRenderer.send('onReceiveMsg', data)
        }
      }
    },
    computed: {
      incomingMsg () {
        return this.$store.state.newMsg
      },
      path () {
        return this.$route.path === '/'
      },
      myInfo () {
        return this.$store.state.myInfo
      },
      myPhoneId () {
        return `${this.$store.state.userUID}`
      },
      userInfos () {
        return this.$store.state.userInfos
      },
      sessionlist () {
        let sessionlist = this.$store.state.sessionlist.filter(item => {
          item.name = ''
          item.avatar = ''
          if (item.scene === 'p2p') {
            let userInfo = null
            if (item.to !== this.myPhoneId) {
              userInfo = this.userInfos[item.to]
            } else {
              userInfo = Object.assign({}, this.myInfo)
            }
            if (userInfo) {
              item.name = util.getFriendAlias(userInfo)
              item.avatar = userInfo.avatar
            }
          } else if (item.scene === 'team') {
            let teamInfo = this.$store.state.teamlist.find(team => {
              return team.teamId === item.to
            })
            if (teamInfo) {
              item.name = teamInfo.name
              item.avatar = teamInfo.avatar || this.myGroupIcon
            } else if (item.lastMsg && item.lastMsg.attach && item.lastMsg.attach.team) {
              item.name = item.lastMsg.attach.team.name
              item.avatar = item.avatar || this.myGroupIcon
            } else {
              item.name = item.to
              item.avatar = item.avatar || this.myGroupIcon
            }
          }
          if (item.name && item.avatar) { // 避免显示空的现象 和 已解散的群组
            return item
          }
        })
        return sessionlist
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
