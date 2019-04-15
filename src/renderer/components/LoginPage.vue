<template>
  <div class="g-window g-bg">
    <div class="g-inherit" style="position: relative">
        <system-caption :resizable="false"/>
        <div v-if="loading" class="m-cover"/>
        <!-- 账号登录 -->
        <div v-if="type === 'accountNumber'" class="m-login-con">

          <!-- logo -->
          <div class="m-login-logo"><img class="logo" :src="logo"></div>

          <!-- 记住密码账号弹框 -->
          <div v-if="showModal" class="account-box" v-clickoutside="closeModal">
            <div class='account-title'>使用以下账号登录:</div>
            <ul class='account-content'>
              <li class='account-item' v-for="(item, index) in rememberAccount" :key="item.id"
                @mouseenter="onMouseenter(item.id)"
                @mouseleave="onMouseleave(item.id)"
                @click.stop="selectAccount(item)"
                >
                  <div>{{item.account}}</div>
                  <span class="clear" @click.stop="deleteAccount(index)"/>
              </li>
            </ul>
          </div>

          <!-- 账号 -->
          <div :class="account ? 'm-login-ipt m-login-ipt-active' : 'm-login-ipt'" ref="loginIpt">
            <input
              class="ipt"
              maxlength="32"
              autofocus
              v-model="account"
              placeholder="请输入账号"/>
              <!-- 下拉箭头 -->
              <div @click.stop="showAccountModal" :class="showModal ? 'm-click-up noevent' : 'm-click-down noevent'">
              </div>
          </div>

          <!-- 密码 -->
          <div :class="password ? 'm-login-ipt m-login-ipt-active' : 'm-login-ipt'" ref="loginIpt">
            <input
              type="password"
              class="ipt"
              style="fontSize: 19px;letterSpacing: 2px;"
              maxlength="32"
              v-model="password"
              placeholder="请输入密码"/>
          </div>

          <!-- 图形验证码 -->
          <div :class="verifyCodeImg ? 'm-login-ipt m-login-ipt-active' : 'm-login-ipt'">
            <input
              type="text"
              class="ipt"
              style="fontSize: 19px;letterSpacing: 2px;width: 60%"
              maxlength="4"
              v-model="verifyCodeImg"
              placeholder="请输入图形验证码"
              @keyup="keyToNext($event, 1)"/>
              <a style="width: 60%; height: 70%; text-align: right" @click="verifyCodeUrlCtrl('')">
                <img style="width: 80%;height: 100%" :src="verifyCodeUrl"/>
              </a>
          </div>

          <div class="m-login-ctl">
            <transition name="fade"><div v-if="showPrompt" class="prompt">支持30天内自动登录</div></transition>
            <span></span>
            <!-- <a
              @click="autoLogin = !autoLogin, isRember = true"
              @mouseover="showPrompt = true"
              @mouseout="showPrompt = false"
            >
              <span :class="autoLogin ? 'common checked' : 'common check'"></span><span>自动登录</span>
            </a> -->
            <a @click="isRember = !isRember,autoLogin = autoLogin ? false : false">
              <span :class="isRember ||  autoLogin ? 'common checked' : 'common check'"></span><span>记住密码</span>
            </a>
          </div>

          <login-button style="margin-top: 5px" :text="loading ?  '登录中...':'登录'"  :disabled="!account || !password || !verifyCodeImg"  :callBack="login"/>
          <div class="m-login-errmsg"><span>{{errMsg}}</span></div>

        </div>

        <!-- 设置新密码 -->
        <div v-if="type === 'setPassword'" class="m-login-con">
          <h3>{{'设置新密码'}}</h3>
          <div :class="newPassword ? 'm-login-ipt m-login-ipt-active' : 'm-login-ipt'" ref="loginIpt">
            <input
              type="password"
              class="ipt"
              style="fontSize: 19px;letterSpacing: 2px;"
              maxlength="20"
              autofocus
              v-model="newPassword"
              placeholder="请输入新密码"/>
              <span v-if="newPassword.length > 0" class="clear" @click="newPassword = ''"/>
          </div>
          <div class="toast-text">密码长度8-20位</div>
          <div class="m-login-errmsg" style="height: 18px;"><span>{{errMsgOth}}</span></div>
          <div :class="confirmPassword ? 'm-login-ipt m-login-ipt-active' : 'm-login-ipt'" ref="loginIptAgain">
            <input
              type="password"
              class="ipt"
              style="fontSize: 19px;letterSpacing: 2px;"
              maxlength="20"
              v-model="confirmPassword"
              placeholder="请再次确认新密码"
              @keyup="keyToNext($event, 2)"
              />
              <span v-if="confirmPassword.length > 0" class="clear" @click="confirmPassword = ''"/>
          </div>
          <div class="toast-text">密码长度8-20位</div>
          <div class="m-login-errmsg" style="height: 31px;"><span>{{errMsg}}</span></div>
          <login-button text="完成" :disabled="!(newPassword && confirmPassword)" :loading="loading" :callBack="setNewPwd"/>
        </div>

      <!-- 版本更新 -->
      <update-app-first/>
    </div>
    <toast/>
  </div>
</template>

<script>
  import SystemCaption from './controls/SystemCaption.vue'
  import DES from '../utils/des.js'
  import config from '../configs'
  import LocalStorage from 'localStorage'
  import LoginButton from './login/LoginButton.vue'
  import SendCode from './login/SendCode.vue'
  import Toast from './toast/toast.vue'
  import Request from '../utils/request.js'
  import IndexedDB from '../utils/indexedDB'
  import platform from '../utils/platform'
  import clickoutside from '../utils/clickoutside.js'
  import NativeLogic from '../utils/nativeLogic.js'
  import UpdateAppFirst from './float/UpdateAppFirst.vue'
  export default {
    name: 'login-page',
    directives: {clickoutside},
    components: {SystemCaption, LoginButton, SendCode, Toast, UpdateAppFirst},
    data () {
      return {
        type: 'accountNumber', // 登录首页渲染类型：accountNumber-账号登录，setPassword-未激活设置密码
        logo: './static/img/logo.png',
        loading: false,
        loginType: 1, // 1-账号登录
        isActive: false, // 是否激活
        autoLogin: false, // 是否自动登录
        isRember: false, // 是否为记住密码类型
        showPrompt: false,
        errMsg: '',
        errMsgOth: '',
        account: '',
        vertifyCode: '',
        password: '', // 密码
        newPassword: '', // 新密码
        confirmPassword: '', // 确认新密码
        befObj: {},
        showModal: false,
        selectedId: 0, // 历史账号当前选中的id
        rememberAccount: [], // 保存记住用户的信息
        verifyCodeImg: '', // 图形验证码
        verifyCodeUrl: ''
      }
    },
    computed: {
      platform () {
        return platform.getOsInfo() === 'Windows'
      }
    },
    mounted () {
      // this.checkUpdate() // 检查版本更新
      if (config.environment === 'web') {
        // 设置可拖拽范围
        NativeLogic.native.setDraggableArea(0, 30, 30, 70)
      }
      if (localStorage.HistoryAccount) {
        this.rememberAccount = JSON.parse(localStorage.HistoryAccount)
      }
      if (localStorage.LOGININFO) {
        // 退出登录记住账号
        let loginInfo = JSON.parse(localStorage.LOGININFO)
        this.account = loginInfo.account
        this.isRember = loginInfo.isRember
        if (loginInfo.isRember) {
          this.password = DES.decryptByDESModeEBC(loginInfo.password, 2)
        }
      }
      // 获取sessionId
      Request.GetSessionId({}, (value) => this.verifyCodeUrlCtrl(value))
    },
    methods: {
      checkUpdate () {
        // 检查更新
        Request.AppVersions().then(res => {
          let APPVERSIONS = localStorage.APPVERSIONS ? JSON.parse(localStorage.APPVERSIONS) : null
          if (APPVERSIONS && APPVERSIONS.ignore && (APPVERSIONS.versionNum === res.versionNum)) {
            return false
          }
          if (res && Number(res.forceUpdate) === 1) { // 强制升级时才弹出升级弹框
            this.eventBus.$emit('updateAppFirst', res)
          }
        }).catch((err) => { console.log(err) })
      },
      keyToNext (e, type) {
        if (e.keyCode === 13) {
          e.target.blur()
          switch (type) {
            case 1 :
              this.login()
              break
            case 2 :
              this.setNewPwd()
              break
          }
        }
      },
      showAccountModal () {
        if (this.rememberAccount.length === 0) return false
        this.showModal = !this.showModal
      },
      onMouseenter (id) {
        this.selectedId = id
      },
      onMouseleave (id) {
        this.selectedId = id
      },
      closeModal (el, e) {
        let className = e.target.className
        if (className.indexOf('noevent') > -1) return
        this.showModal = false
      },
      deleteAccount (index) {
        // 删除账户
        let obj = this.rememberAccount[index]
        if (obj.account === this.account) {
          this.account = ''
          this.password = ''
          this.isRember = false
          this.autoLogin = false
        }
        // 清除本地缓存
        let HistoryAccount = localStorage.HistoryAccount ? JSON.parse(localStorage.HistoryAccount) : ''
        if (HistoryAccount) {
          HistoryAccount = HistoryAccount.filter(item => {
            return item.id !== obj.id
          })
          localStorage.setItem('HistoryAccount', JSON.stringify(HistoryAccount))
        }
        this.rememberAccount.splice(index, 1)
        this.showModal = false
      },
      selectAccount (item) {
        this.account = item.account
        this.password = DES.decryptByDESModeEBC(item.password, 2)
        this.isRember = item.isRember
        this.showModal = false
        this.autoLogin = item.autoLogin
      },
      setNewPwd () {
        // 设置新密码
        if (!(this.newPassword && this.confirmPassword)) return
        this.loading = true
        let errMsg = ''
        let errMsgOth = ''
        if (this.newPassword.length < 8) {
          errMsgOth = '新密码格式不正确'
        } else if (this.newPassword !== this.confirmPassword) {
          errMsg = '两次输入的密码不一致'
        }
        this.errMsg = errMsg
        this.errMsgOth = errMsgOth
        if (errMsg || errMsgOth) {
          this.loading = false
          return
        }
        // 设置新密码
        let params = {
          account: this.account,
          password: DES.encryptByDES(this.newPassword, 2),
          confirmPassword: DES.encryptByDES(this.confirmPassword, 2)
        }
        Request.ResetPassword(params, this).then(ret => {
          if (ret) {
            localStorage.setItem('sessionToken', ret.token)
            this.loginPC(ret)
          } else {
            this.loading = false
          }
        }).catch((err) => {
          this.loading = false
          if (err) this.errMsg = err.msg
        })
      },
      async login (type) {
        if (this.errMsg) {
          this.errMsg = ''
        }
        if (!(this.account && this.password && this.verifyCodeImg)) return
        /**
         * type===1,直接密码登录，type===2,首次登录密码激活后登录
         *  */
        this.loading = true
        let errMsg = ''
        this.password = type && type === 2 ? this.newPassword : this.password
        if (this.account.length < 2) {
          errMsg = '用户或账号密码错误，登录失败'
        }
        if (this.password.length < 4) {
          errMsg = '用户或账号密码错误，登录失败'
        }
        this.errMsg = errMsg
        if (errMsg) {
          this.loading = false
          return
        }

        // 登录鉴权
        Request.LoginAuth({
          account: this.account,
          password: DES.encryptByDES(this.password, 2),
          verifyCode: this.verifyCodeImg
        }, this).then(ret => {
          if (ret.type === 'setPassword') {
            this.$store.commit('updateCurrentUserSecret', ret.secret)
            this.type = 'setPassword'
            this.loading = false
          } else {
            this.$store.commit('updateCurrentUserSecret', ret.secretKey)
            localStorage.setItem('sessionToken', ret.token)
            this.loginPC(ret)
          }
        }).catch(err => {
          this.loading = false
          if (err) this.errMsg = err.msg
          // 自动登录情况且密码错误
          if (localStorage.AUTOLOGIN) {
            this.password = ''
            this.isRember = false
            localStorage.removeItem('AUTOLOGIN')
          }
          // 更新图形验证码
          this.verifyCodeUrlCtrl()
        })
      },
      async loginPC (ret) {
        let {userInfo} = ret
        try {
          LocalStorage.setItem('uid', userInfo.accid)
          LocalStorage.setItem('sdktoken', userInfo.token)
        } catch (error) {}
        // 获取用户基本信息
        Request.GetUserInfo({accid: userInfo.accid}, this).then(ret => {
          if (ret) {
            this.$store.commit('updatePersonInfos', userInfo)
            Request.getContactUserList({tag: 0}, this).then(ret => {
              this.$store.commit('updateContactsToplist', {type: 'update', data: ret})
            }).catch(() => {})
            Request.ThirdUrls()

            // 登录sdk
            this.$store.dispatch('connect', {
              force: true,
              done: (error) => {
                if (error !== 200) {
                  this.errMsg = error
                  this.loading = false
                  // 更新图形验证码
                  this.verifyCodeUrlCtrl()
                  return
                }
                // 初始化组织架构、我的部门、联系、常用联系人列表（是否清除组织数据 (clearOrg：2-清除)）
                if (ret.clearOrg === 2) {
                  IndexedDB.clear('orgnizeObj')
                  IndexedDB.clear('myDeptObj')
                  IndexedDB.clear('contactslist')
                } else {
                  IndexedDB.getItem('orgnizeObj')
                    .then(data => {
                      data && this.$store.commit('updateOrgnizeObj', {data, type: 'replace', pageType: 'orgnize'})
                    })
                    .catch(() => {})
                  IndexedDB.getItem('myDeptObj')
                    .then(data => {
                      data && this.$store.commit('updateOrgnizeObj', {data, type: 'replace', pageType: 'myDept'})
                    })
                    .catch(() => {})
                  IndexedDB.getAll('contactslist')
                    .then(data => {
                      data && this.$store.commit('updateContactslist', {data, type: 'replace'})
                    })
                    .catch(() => {})
                }
                IndexedDB.getAll('contactsToplist')
                  .then(data => {
                    data && this.$store.commit('updateContactsToplist', {data, type: 'init'})
                  })
                  .catch(() => {})
                Request.ThirdUrls()
                // 开启自动登录
                if (this.autoLogin && !localStorage.AUTOLOGIN) {
                  let USERINFO = {
                    account: this.account,
                    password: DES.encryptByDES(this.password, 2),
                    dateTime: new Date().getTime()
                  }
                  this.isRember = true
                  localStorage.setItem('AUTOLOGIN', JSON.stringify(USERINFO))
                }
                // 记住账户
                let loginInfo = {
                  account: this.account,
                  password: DES.encryptByDES(this.password, 2),
                  isRember: this.isRember,
                  autoLogin: this.autoLogin
                }
                localStorage.setItem('LOGININFO', JSON.stringify(loginInfo))
                // 记住密码
                if (this.isRember) {
                  let accountInfo = {
                    id: ret.accid,
                    account: this.account,
                    password: DES.encryptByDES(this.password, 2),
                    isRember: true,
                    autoLogin: this.autoLogin
                  }
                  if (this.rememberAccount && this.rememberAccount.length >= 5) { // 最多保留5条最新的记住密码的用户
                    this.rememberAccount.pop()
                  }
                  this.rememberAccount.map((item, index) => { // 登录账号相同则合并
                    if (this.account === item.account) {
                      this.rememberAccount.splice(index, 1)
                    }
                  })
                  this.rememberAccount.unshift(accountInfo)
                  localStorage.setItem('HistoryAccount', JSON.stringify(this.rememberAccount))
                }
                this.$store.commit('updateLoginInfo', loginInfo)
                if (config.environment === 'web') { // web分支
                  NativeLogic.native.setBounds(config.mainWinWidth, config.mainWinHeight) // 設置窗口大小:922 645
                  let AppDirectory = window.location.pathname.slice(1) // 应用所在目录
                  if (AppDirectory.indexOf('dist') > -1) {
                    let urlArr = AppDirectory.split('dist')
                    AppDirectory = urlArr[0]
                  }
                  localStorage.setItem('UserName', userInfo.name) // 本地保存登录用户名，收到新消息设置系统托盘应用图标和tip时用
                  // 设置系统托盘应用图标
                  NativeLogic.native.setTrayImage(AppDirectory + '/dist/static/img/systry-logo.png', userInfo.name)
                } else { // electron分支
                  const electron = require('electron')
                  const ipcRenderer = electron.ipcRenderer
                  ipcRenderer.send('onReset', {userInfo}) // 设置系统托盘，设置窗口大小
                  // NativeLogic.electron.setBounds(userInfo)
                }
                location.href = config.homeUrl
              }
            })
          } else this.loading = false
        }).catch((err) => {
          this.loading = false
          if (err) this.errMsg = err.msg
        })
      },
      remberPwd () {
        // 记住密码
        this.errMsg = ''
        this.befObj = {
          type: this.type,
          loginType: this.loginType
        }
        this.type = 'getCode'
        this.isForget = true
        this.isActive = false
        this.password = ''
      },
      verifyCodeUrlCtrl (sessionId) {
        // 获取图形验证码
        this.verifyCodeImg = ''
        let currentDate = new Date().getTime()
        sessionId = sessionId || localStorage.sessionId
        this.verifyCodeUrl = config.postUrl + 'api/appPc/getVerifyCode?sessionId=' + sessionId + '&&time=' + currentDate
      }
    }
  }
</script>

<style scoped>
  .g-window .m-cover {
    position: absolute;
    top: 25px;
    bottom: 0;
    width: 100%;
    z-index: 10;
  }

  .g-bg {
    background-color: #fff;
  }

  .m-login-con {
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    top: 25px;
    bottom: 0;
    padding: 0 30px;
  }

  .m-login-con .m-login-logo {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    width: 100%;
    padding-top: 15px;
  }

  .m-login-con .m-login-logo img {
    width: 130px;
    height: 130px;
  }

  .m-login-con .m-login-type {
    display: flex;
    /* flex-direction: row; */
    align-items: center;
    justify-content: center;
    padding: 15px;
    font-size: 14px;
    color: rgba(79,141,255,1);
  }

  .m-login-con .m-login-errmsg {
    display: flex;
    align-items: center;
    height: 36px;
    font-size: 12px;
    color: rgba(255,45,40,1);
  }

  .m-login-con .m-login-ipt {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 45px;
    border-bottom: 1px solid rgba(216,220,222,1);
    transition: all .2s linear;
  }

  .m-login-con .m-login-ipt-active {
    border-bottom: 1px solid rgba(4,154,255,1);
  }

  .m-login-con .m-login-ipt.sendcode {
    flex-direction: row;
    justify-content: space-between;
  }

  .m-login-con .ipt {
    width: 90%;
    border: 0;
    padding: 0;
    font-size: 16px;
    color: #333;
    font-family: "PingFangSC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  .m-login-con .ipt::-webkit-input-placeholder {
    font-size: 14px;
    color: rgba(198,203,212,1);
  }

  .m-login-con .m-login-ipt .clear {
    position: absolute;
    right: 0;
    top: 13.5px;
    display: block;
    width: 14px;
    height: 14px;
    background-image: url('../../../static/img/setting/delete.png');
    background-size: 100% 100%;
    cursor: pointer;
  }

  .m-login-con > h3 {
    padding: 25px 0 30px;
    font-size: 24px;
    color: #333;
    text-align: left;
  }

  .m-login-con .m-login-ctl {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
  }

  .m-login-con .m-login-ctl a {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 12px;
    color: rgba(136,136,147,1);
  }

  .m-login-con .prompt {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: -20px;
    top: -30px;
    z-index: 10;
    width: 146px;
    height: 34px;
    background: #fff;
    border: 1px solid rgba(219,219,219,1);
    border-radius: 4px;
    font-size: 14px;
    color: #333;
    letter-spacing: -0.34px;
  }

  .m-login-con .dropdown {
    display: inline-block;
    width: 12px;
    height: 7px;
    background: url('../../../static/img/setting/dropdown.png') no-repeat center center;
    background-size: 100% 100%
  }

  .m-login-con .common {
    display: inline-block;
    width: 15px;
    height: 15px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
    margin-right: 4px;
  }
  .m-login-con .check {
    background-image: url('../../../static/img/setting/checkboxborder.png');
    background-size: 100% 100%;
  }
  .m-login-con .check:hover, .check:focus {
     background-image: url('../../../static/img/setting/checkboxborder-p.png');
  }
  .m-login-con .checked {
     background-image: url('../../../static/img/setting/checkbox-c.png');
    background-size: 100% 100%;
  }

  .m-login-con .toast-text {
    font-size: 12px;
    color: rgba(136,136,147,1);
    padding-top: 4px;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .3s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
  .m-login-con .m-click-down{
    position: absolute;
    right: 0;
    bottom: 0;
    display: block;
    width: 26px;
    height: 40px;
     background-image: url('../../../static/img/click-down.png');
    background-repeat: no-repeat;
    background-position-x: center;
    background-position-y: center;
    background-size: 13px 7px;
  }
  .m-login-con .m-click-up{
    position: absolute;
    right: 0;
    bottom: 0;
    display: block;
    width: 26px;
    height: 40px;
     background-image: url('../../../static/img/click-down.png');
    background-repeat: no-repeat;
    background-position-x: center;
    background-position-y: center;
    background-size: 13px 7px;
    transform: rotate(180deg);
    -ms-transform: rotate(180deg); 	/* IE 9 */
    -moz-transform: rotate(180deg); 	/* Firefox */
    -webkit-transform: rotate(180deg); /* Safari 和 Chrome */
    -o-transform: rotate(180deg);
  }
  /* 记住登录账号弹框 */
  .account-box {
  position: absolute;
  top: 200px;
  width: 260px;
  height: 132px;
  background: #fff;
  border: 1px solid #049AFF;
  z-index: 1000;
  box-sizing: border-box;
}
.account-box .account-title {
  height: 34px;
  line-height: 34px;
  color: #666666;
  font-size: 12px;
  padding: 0 8px;
  box-sizing: border-box;
}
.account-box .account-content {
  height: 90px;
  width: 100%;
  overflow-y: scroll;
}
.account-box .account-content .account-item {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  height: 30px;
  line-height: 30px;
  color: #333;
  font-size: 14px;
  transition: all .2s;
  padding: 0 8px;
  box-sizing: border-box;
}
.account-box .account-content .account-item:hover{
  background: rgba(4,154,255,0.15);
}
.account-box .account-content .clear {
    display: block;
    width: 14px;
    height: 14px;
    transition: all .2s;
     background-image: url('../../../static/img/setting/delete.png');
    background-size: 100% 100%;
    cursor: pointer;
    opacity: 0;
}

.account-box .account-content .account-item:hover .clear {
  opacity: 1;
}

</style>
