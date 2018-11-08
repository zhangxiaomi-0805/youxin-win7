<template>
  <div class="g-window g-bg">
    <div class="g-inherit">
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
              <div @click.stop= "showAccountModal" :class="showModal ? 'm-click-up' : 'm-click-down'">
              </div>
          </div>

          <!-- 密码 -->
          <div  :class="password ? 'm-login-ipt m-login-ipt-active' : 'm-login-ipt'" ref="loginIpt">
            <input
              type="password" 
              class="ipt"
              style="fontSize: 19px;letterSpacing: 2px;"
              maxlength="20"
              v-model="password"
              placeholder="请输入密码"
              @keyup="keyToNext($event, 1)"/>
          </div>

          <div class="m-login-ctl">
            <transition name="fade"><div v-if="showPrompt" class="prompt">支持30天内自动登录</div></transition>
            <a 
              @click="autoLogin = !autoLogin" 
              @mouseover="showPrompt = true" 
              @mouseout="showPrompt = false"
            >
              <span :class="autoLogin ? 'common checked' : 'common check'"></span><span>自动登录</span>
            </a>
            <a @click="isRember = !isRember">
              <span :class="isRember ? 'common checked' : 'common check'"></span><span>记住密码</span>
            </a>
          </div>

          <login-button :text="loading ?  '登录中...':'登录'"  :disabled="!account || !password"  :callBack="login"/>
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
  const electron = require('electron')
  const ipcRenderer = electron.ipcRenderer
  export default {
    name: 'login-page',
    directives: {clickoutside},
    components: {SystemCaption, LoginButton, SendCode, Toast},
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
        rememberAccount: [] // 保存记住用户的信息
      }
    },
    computed: {
      platform () {
        return platform.getOsInfo() === 'Windows'
      }
    },
    mounted () {
      if (localStorage.HistoryAccount) {
        this.rememberAccount = JSON.parse(localStorage.HistoryAccount)
      }
      if (localStorage.AUTOLOGIN) {
        // 已开启自动登录(30天内)
        let USERINFO = JSON.parse(localStorage.AUTOLOGIN)
        let nowDate = new Date().getTime()
        if (nowDate - USERINFO.dateTime <= 30 * 24 * 3600 * 1000) {
          this.loading = true
          this.autoLogin = true
          this.account = USERINFO.account
          this.password = DES.decryptByDESModeEBC(USERINFO.password)
          this.login(1)
        } else {
          localStorage.removeItem('AUTOLOGIN')
        }
      } else if (localStorage.LOGININFO) {
        // 退出登录记住账号
        let loginInfo = JSON.parse(localStorage.LOGININFO)
        this.type = loginInfo.type
        this.account = loginInfo.account
        this.loginType = loginInfo.loginType
      }
    },
    methods: {
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
        if (this.rememberAccount.length > 0) {
          this.showModal = !this.showModal
        } else {
          return null
        }
      },
      onMouseenter (id) {
        this.selectedId = id
      },
      onMouseleave (id) {
        this.selectedId = id
      },
      closeModal () {
        this.showModal = false
      },
      deleteAccount (index) {
        this.rememberAccount.map((obj, i) => {
          if (index === i) {
            this.rememberAccount.splice(index, 1)
          }
        })
      },
      selectAccount (item) {
        this.account = item.account
        this.password = item.password
        this.isRember = true
        this.showModal = false
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
          password: DES.encryptByDES(this.newPassword),
          confirmPassword: DES.encryptByDES(this.confirmPassword)
        }
        Request.ResetPassword(params, this).then(ret => {
          if (ret) {
            localStorage.setItem('sessionToken', ret.token)
            ipcRenderer.send('onReset')
            location.href = config.homeUrl
          } else {
            this.loading = false
          }
        }).catch((err) => {
          this.loading = false
          if (err) this.errMsg = err.msg
        })
      },
      login (type) {
        if (!(this.account && this.password)) return
        /**
         * type===1,直接密码登录，type===2,首次登录密码激活后登录
         *  */
        this.loading = true
        let errMsg = ''
        this.password = type && type === 2 ? this.newPassword : this.password
        if (this.account.length < 2) {
          errMsg = '账号或密码错误，登录失败'
        }
        if (this.password.length < 8) {
          errMsg = '账号或密码错误，登录失败'
        }
        this.errMsg = errMsg
        if (errMsg) {
          this.loading = false
          return
        }
        // 登录鉴权
        Request.LoginAuth({
          account: this.account,
          password: DES.encryptByDES(this.password)
        }, this).then(ret => {
          if (ret.type === 'setPassword') {
            this.type = 'setPassword'
            this.loading = false
          } else {
            localStorage.setItem('sessionToken', ret.token)
            this.loginPC(ret.userInfo)
          }
        }).catch(err => {
          this.loading = false
          if (err) this.errMsg = err.msg
          // 自动登录情况且密码错误
          if (localStorage.AUTOLOGIN) {
            localStorage.removeItem('AUTOLOGIN')
          }
        })
      },
      loginPC (userInfo) {
        // 获取用户基本信息
        Request.GetUserInfo({accid: userInfo.accid}, this).then(ret => {
          if (ret) {
            // 登录sdk
            LocalStorage.setItem('uid', userInfo.accid)
            LocalStorage.setItem('sdktoken', userInfo.token)
            this.$store.commit('updatePersonInfos', userInfo)
            // 初始化组织架构、联系、历史联系人列表
            IndexedDB.getItem('orgnizeObj')
              .then(data => {
                this.$store.commit('updateOrgnizeObj', {data, type: 'replace'})
              })
              .catch(() => {})
            IndexedDB.getAll('contactslist')
              .then(data => {
                this.$store.commit('updateContactslist', {data, type: 'replace'})
              })
              .catch(() => {})
            this.$store.dispatch('connect', {
              force: true,
              done: (error) => {
                if (error !== 200) {
                  this.errMsg = error
                  this.loading = false
                  return
                }
                if (this.autoLogin && !localStorage.AUTOLOGIN) {
                  // 开启自动登录
                  let USERINFO = {
                    account: this.account,
                    password: DES.encryptByDES(this.password),
                    dateTime: new Date().getTime()
                  }
                  localStorage.setItem('AUTOLOGIN', JSON.stringify(USERINFO))
                }
                if (this.isRember) {
                  // 记住密码
                  let accountInfo = {
                    id: ret.userInfo.userId,
                    account: this.account,
                    password: this.password,
                    isRember: true
                  }
                  if (this.rememberAccount && this.rememberAccount >= 5) { // 最多保留5条最新的记住密码的用户
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
                ipcRenderer.send('onReset')
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
    width: 140px;
    height: 140px;
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
    padding: 40px 0 30px;
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
