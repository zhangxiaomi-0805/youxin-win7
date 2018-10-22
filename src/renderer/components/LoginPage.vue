<template>
  <div class="g-window g-bg">
    <div class="g-inherit">
        <system-caption :resizable="false"/>
        <select-area/>
        <div v-if="loading" class="m-cover"/>
        <!-- 手机号或邮箱登录 -->
        <div v-if="type === 'phoneEmail'" class="m-login-con">
          <div class="m-login-logo"><img class="logo" :src="logo"></div>
          <div class="m-login-ipt" ref="loginIpt">
            <input 
              class="ipt"
              maxlength="64"
              autofocus
              v-model="account"
              placeholder="请输入手机号/邮箱地址"
              @focus="focusFn($refs.loginIpt)"
              @blur="blurFn($refs.loginIpt)"
              @keyup="keyToNext($event, 1)"/>
              <span v-if="account.length > 0" class="clear" @click="account = ''"/>
          </div>
          <div class="m-login-errmsg"><span>{{errMsg}}</span></div>
          <login-button text="下一步" :disabled="!account" :loading="loading" :callBack="accountNext"/>
          <div class="m-login-type"><a @click="toggleType('overseasCode', 3)">海外手机号登录</a></div>
        </div>
        <!-- 获取验证码 -->
        <div v-if="type === 'getCode'" class="m-login-con">
          <div class="m-login-logo"><img class="logo" :src="logo"></div>
          <div class="m-login-ipt sendcode" ref="loginIpt">
            <input
              class="ipt"
              style="width: 50%;"
              maxlength="6"
              autofocus
              v-model="vertifyCode"
              placeholder="请输入验证码"
              @focus="focusFn($refs.loginIpt)"
              @blur="blurFn($refs.loginIpt)"
              @keyup="keyToNext($event, 2)"/>
            <span v-if="vertifyCode.length > 0" class="clear" @click="vertifyCode = ''" style="right: 105px;"/>
            <send-code :account="account" :areacode="areacode" :codeType="isForget ? '2' : '1'" :loginType="loginType"/>
          </div>
          <div class="m-login-errmsg"><span>{{errMsg}}</span></div>
          <login-button :text="isActive ? '登录' : '下一步'" :disabled="!vertifyCode" :loading="loading" :callBack="codeNext"/>
          <div class="m-login-type"><a @click="toggleType(befObj.type, befObj.loginType, true)">上一步</a></div>
        </div>
        <!-- 设置密码 -->
        <div v-if="type === 'setPassword'" class="m-login-con">
          <h3>{{isForget ? '设置新密码' : '设置密码'}}</h3>
          <div class="m-login-ipt" ref="loginIpt">
            <input
              type="password" 
              class="ipt"
              style="fontSize: 19px;letterSpacing: 2px;"
              maxlength="20"
              autofocus
              v-model="password"
              :placeholder="isForget ? '请输入新密码' : '请输入密码'"
              @focus="focusFn($refs.loginIpt)"
              @blur="blurFn($refs.loginIpt)"/>
              <span v-if="password.length > 0" class="clear" @click="password = ''"/>
          </div>
          <div class="toast-text">密码长度6-20位数字、字母组合</div>
          <div class="m-login-errmsg" style="height: 18px;"><span>{{errMsgOth}}</span></div>
          <div class="m-login-ipt" ref="loginIptAgain">
            <input
              type="password" 
              class="ipt"
              style="fontSize: 19px;letterSpacing: 2px;"
              maxlength="20"
              v-model="confirmPassword"
              :placeholder="isForget ? '请再次确认新密码' : '请再次确认密码'"
              @focus="focusFn($refs.loginIptAgain)"
              @blur="blurFn($refs.loginIptAgain)"
              @keyup="keyToNext($event, 3)"/>
              <span v-if="confirmPassword.length > 0" class="clear" @click="confirmPassword = ''"/>
          </div>
          <div class="toast-text">密码长度6-20位数字、字母组合</div>
          <div class="m-login-errmsg" style="height: 31px;"><span>{{errMsg}}</span></div>
          <login-button text="完成" :disabled="!(password && confirmPassword)" :loading="loading" :callBack="setPwdNext"/>
        </div>
        <!-- 密码登录 -->
        <div v-if="type === 'passwordActive'" class="m-login-con">
          <div class="m-login-logo" style="paddingBottom: 50px;"><img class="logo" :src="logo"></div>
          <div class="m-login-ipt" ref="loginIpt">
            <input
              type="password" 
              class="ipt"
              style="fontSize: 19px;letterSpacing: 2px;"
              maxlength="20"
              v-model="password"
              placeholder="请输入密码"
              @focus="focusFn($refs.loginIpt)"
              @blur="blurFn($refs.loginIpt)"
              @keyup="keyToNext($event, 4)"/>
              <span v-if="password.length > 0" class="clear" @click="password = ''"/>
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
            <a @click="getBackPwd">忘记密码</a>
          </div>
          <div class="m-login-errmsg" style="height: 31px;"><span>{{errMsg}}</span></div>
          <login-button text="登录" :disabled="!password" :loading="loading" :callBack="pwdNext"/>
        </div>
        <!-- 海外手机号登录 -->
        <div v-if="type === 'overseasCode'" class="m-login-con">
          <div class="m-login-logo"><img class="logo" :src="logo"></div>
          <div class="m-login-ipt" ref="loginIpt">
            <a class="areacode" @click="selectArea"><span style="marginRight: 6px;">{{areacode}}</span><span class="dropdown"></span></a>
            <input
              class="ipt"
              style="width: 60%;"
              maxlength="15"
              autofocus
              v-model="account"
              placeholder="请输入手机号"
              @focus="focusFn($refs.loginIpt)"
              @blur="blurFn($refs.loginIpt)"
              @keyup="keyToNext($event, 6)"/>
              <span v-if="account.length > 0" class="clear" @click="account = ''"/>
          </div>
          <div class="m-login-errmsg"><span>{{errMsg}}</span></div>
          <login-button text="下一步" :disabled="!account" :loading="loading" :callBack="accountNext"/>
          <div class="m-login-type"><a @click="toggleType('phoneEmail', 1)">手机号或邮箱登录</a></div>
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
  import SelectArea from './login/SelectArea.vue'
  import Toast from './toast/toast.vue'
  import Fetch from '../utils/fetch.js'
  import util from '../utils'
  import IndexedDB from '../utils/indexedDB'
  import platform from '../utils/platform'
  const electron = require('electron')
  const ipcRenderer = electron.ipcRenderer
  export default {
    name: 'login-page',
    components: {SystemCaption, LoginButton, SendCode, SelectArea, Toast},
    data () {
      return {
        type: 'phoneEmail', // 登录首页渲染类型：phoneEmail-手机号或邮箱登录， getCode-获取验证码，setPassword-未激活设置密码，passwordActive-已激活密码登录，overseasCode-海外手机号登录
        logo: './static/img/logo.png',
        loading: false,
        loginType: 1, // 1-手机号或邮箱，3-海外手机号
        isActive: false, // 是否激活
        autoLogin: false, // 是否自动登录
        isForget: false, // 是否为忘记密码类型
        showPrompt: false,
        errMsg: '',
        errMsgOth: '',
        account: '',
        vertifyCode: '',
        password: '',
        confirmPassword: '',
        areacode: '+86',
        befObj: {}
      }
    },
    computed: {
      platform () {
        return platform.getOsInfo() === 'Windows'
      }
    },
    mounted () {
      if (localStorage.AUTOLOGIN) {
        // 已开启自动登录(30天内)
        let USERINFO = JSON.parse(localStorage.AUTOLOGIN)
        let nowDate = new Date().getTime()
        if (nowDate - USERINFO.dateTime <= 30 * 24 * 3600 * 1000) {
          this.type = 'passwordActive'
          this.loading = true
          this.autoLogin = true
          this.account = USERINFO.account
          this.password = DES.decryptByDESModeEBC(USERINFO.password)
          this.pwdNext()
        } else {
          localStorage.removeItem('AUTOLOGIN')
        }
      } else if (localStorage.LOGININFO) {
        // 退出登录记住账号
        let loginInfo = JSON.parse(localStorage.LOGININFO)
        this.type = loginInfo.type
        this.account = loginInfo.account
        this.areacode = loginInfo.areacode
        this.loginType = loginInfo.loginType
      }
    },
    methods: {
      keyToNext (e, type) {
        if (e.keyCode === 13) {
          e.target.blur()
          switch (type) {
            case 1 :
              this.accountNext()
              break
            case 2 :
              this.codeNext()
              break
            case 3 :
              this.setPwdNext()
              break
            case 4 :
              this.pwdNext()
              break
            case 5 :
              break
            case 6 :
              this.accountNext()
              break
          }
        }
      },
      accountNext () {
        // 手机号或邮箱登录
        if (this.account.length <= 0) return
        this.loading = true
        let errMsg = ''
        if (this.loginType === 1) {
          let regPhone = util.regExp.regPhone
          let regEmail = util.regExp.regEmail
          if (this.account.indexOf('@') > -1) {
            // 邮箱
            if (!regEmail.test(this.account)) {
              errMsg = '账号格式不正确，请重新输入'
            }
          } else {
            if (!regPhone.test(this.account)) {
              errMsg = '账号格式不正确，请重新输入'
            }
          }
        } else {
          if (!/^[0-9]*$/.test(this.account)) {
            errMsg = '账号格式不正确，请重新输入'
          }
          if (this.areacode === '+86' && (this.account.length > 11 || !/^1[345678]\d{9}$/.test(this.account))) {
            errMsg = '账号格式不正确，请重新输入'
          }
        }
        this.errMsg = errMsg
        if (errMsg) {
          this.loading = false
          return
        }
        /*
         * 校验账号是否已激活
         * @params  account: 账号 后台注册的 手机号或者邮箱 注意:海外手机号 格式:+xx-xxxx
         * @receive isActive  1-已激活，2-未激活
         */
        let params = { account: this.account }
        if (this.loginType === 3) params.account = this.areacode + '-' + this.account
        Fetch.post('api/niceAccount/isActivated', params, this).then(ret => {
          this.loading = false
          if (ret) {
            switch (ret.isActive) {
              case 1 :
                this.isActive = true
                this.type = 'passwordActive'
                break
              case 2 :
                this.isActive = false
                this.befObj = {
                  type: this.type,
                  loginType: this.loginType
                }
                this.type = 'getCode'
                break
            }
          }
        }).catch(err => {
          this.loading = false
          if (err) this.errMsg = err.msg
        })
      },
      codeNext () {
        // 获取验证码
        if (this.vertifyCode.length <= 0) return
        this.loading = true
        /*
         * 账号激活  api/niceAccount/activeAccount
         * 校验忘记密码验证码  api/appPc/validForgetPasswordCode
         * @params  account: 账号 后台注册的 手机号或者邮箱 注意:海外手机号 格式:+xx-xxxx
         * @params  code: 验证码
         * @receive invalid  1-验证码失效，2-验证码错误
         */
        let params = {
          account: this.account,
          code: this.vertifyCode
        }
        let url = 'api/niceAccount/activeAccount'
        if (this.isForget) url = 'api/appPc/validForgetPasswordCode'
        if (this.loginType === 3) params.account = this.areacode + '-' + this.account
        Fetch.post(url, params, this).then(ret => {
          this.loading = false
          if (ret) {
            switch (ret.invalid) {
              case 1 :
                this.errMsg = '验证码失效'
                break
              case 2 :
                this.errMsg = '验证码错误'
                break
            }
          } else {
            this.errMsg = ''
            this.type = 'setPassword'
          }
        }).catch((err) => {
          this.loading = false
          if (err) this.errMsg = err.msg
        })
      },
      setPwdNext () {
        // 设置密码
        if (!(this.password && this.confirmPassword)) return
        this.loading = true
        let errMsg = ''
        let errMsgOth = ''
        if (!/[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/.test(this.password) || this.password.length < 6) {
          errMsgOth = '密码格式不正确'
        } else if (this.password !== this.confirmPassword) {
          errMsg = '两次输入的密码不一致'
        }
        this.errMsg = errMsg
        this.errMsgOth = errMsgOth
        if (errMsg || errMsgOth) {
          this.loading = false
          return
        }
        /*
         * 设置密码
         * @params  account: 账号 后台注册的 手机号或者邮箱 注意:海外手机号 格式:+xx-xxxx
         * @params  password: 要设置的密码(需要使用DES进行加密,秘钥:8fgt6jhk45frgt5k)
         */
        let params = {
          account: this.account,
          password: DES.encryptByDES(this.password)
        }
        let url = 'api/niceAccount/setPassword'
        if (this.isForget) url = 'api/appPc/resetPassword'
        if (this.loginType === 3) params.account = this.areacode + '-' + this.account
        Fetch.post(url, params, this).then(ret => {
          if (ret) {
            localStorage.setItem('sessionToken', ret.token)
            this.login()
          } else {
            this.loading = false
          }
        }).catch((err) => {
          this.loading = false
          if (err) this.errMsg = err.msg
        })
      },
      pwdNext () {
        // 已激活密码登录
        if (!this.password) return
        this.loading = true
        let errMsg = ''
        if (!/[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/.test(this.password) || this.password.length < 6) {
          errMsg = '密码格式不正确'
        }
        this.errMsg = errMsg
        if (errMsg) {
          this.loading = false
          return
        }
        /*
         * PC端登录
         * @params  isQuickLogin: 是否是快捷登录 是-true 否-false
         * @params  username: 账号 后台注册的 手机号或者邮箱 注意:海外手机号 格式:+xx-xxxx
         * @params  password: 输入密码(需要使用DES进行加密,秘钥:8fgt6jhk45frgt5k)
         */
        let params = {
          isQuickLogin: false,
          username: this.account,
          password: DES.encryptByDES(this.password)
        }
        if (this.loginType === 3) params.username = this.areacode + '-' + params.username
        Fetch.post('api/appPc/login/auth', params, this).then(ret => {
          if (ret) {
            localStorage.setItem('sessionToken', ret.token)
            this.login()
          } else {
            this.loading = false
          }
        }).catch((err) => {
          this.loading = false
          if (err) {
            if (err.code === 416) {
              this.errMsg = '账号或密码错误，请重新输入'
            } else {
              this.errMsg = err.msg
            }
          }
        })
      },
      focusFn (dom) {
        dom.style.borderBottomColor = 'rgba(79,141,255,1)'
      },
      blurFn (dom) {
        dom.style.borderBottomColor = 'rgba(216,220,222,1)'
      },
      login () {
        /*
         * 获取用户基本信息
         * @params(header)  platformType: 平台类型,可选值:1,2 1-移动端 , 2-PC端
         * @params(header)  token: 初次设置密码&登录成功,返回token,携带获取用户登录信息
         */
        Fetch.post('api/appPc/userInfo', {}, this).then(ret => {
          if (ret) {
            if (this.isForget) {
              this.$store.commit('toastConfig', {
                show: true,
                type: 'success',
                toastText: '密码设置成功'
              })
            }
            // 登录sdk
            LocalStorage.setItem('uid', ret.accid)
            LocalStorage.setItem('sdktoken', ret.token)
            this.$store.commit('updatePersonInfos', ret)
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
            IndexedDB.getAll('contactHistoryObj', 'object')
              .then(data => {
                this.$store.commit('updateContactHistoryObj', {data, type: 'init'})
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
                this.$store.commit('updateLoginInfo', {
                  type: this.loginType === 1 ? 'phoneEmail' : 'overseasCode',
                  account: this.account,
                  areacode: this.areacode,
                  loginType: this.loginType
                })
                if (localStorage.LOGININFO) {
                  localStorage.removeItem('LOGININFO')
                }
                ipcRenderer.send('onReset')
                location.href = config.homeUrl
              }
            })
          } else {
            this.loading = false
          }
        }).catch((err) => {
          this.loading = false
          if (err) this.errMsg = err.msg
        })
      },
      toggleType (type, loginType, empty) {
        // 切换登录方式
        this.type = type
        this.loginType = loginType
        this.loading = false
        this.autoLogin = false
        this.isForget = false
        this.showPrompt = false
        this.errMsg = ''
        this.errMsgOth = ''
        if (!empty && type !== 'getCode') {
          this.account = ''
          this.areacode = '+86'
        }
        this.vertifyCode = ''
        this.password = ''
        this.confirmPassword = ''
        this.befPage = ''
      },
      selectArea () {
        let $this = this
        this.eventBus.$emit('selectArea', {
          callback: (area) => {
            if (area) {
              $this.areacode = '+' + area.code
            }
          }
        })
      },
      getBackPwd () {
        // 忘记密码
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
    padding-bottom: 60px;
  }

  .m-login-con .m-login-logo img {
    width: 100px;
    height: 100px;
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
    color: rgba(245,99,97,1);
  }

  .m-login-con .m-login-ipt {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
    border-bottom: 1px solid rgba(216,220,222,1);
    transition: all .2s linear;
  }
  .m-login-con .m-login-ipt.sendcode {
    flex-direction: row;
    justify-content: space-between;
  }

  .m-login-con .m-login-ipt .areacode {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-right: 5px;
    width: 61px;
    height: 24px;
    border-right: 1px solid rgba(146,152,163,1);
    margin-right: 15px;
  }
  .m-login-con .m-login-ipt .areacode span {
    vertical-align: middle;
    font-size: 14px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap
  }

  .m-login-con .m-login-ipt .ipt {
    width: 90%;
    border: 0;
    padding: 0;
    font-size: 14px;
    color: #333;
    font-family: "PingFangSC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  .m-login-con .m-login-ipt .ipt::-webkit-input-placeholder {
    font-size: 14px;
    color: rgba(198,203,212,1);
  }

  .m-login-con .clear {
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
</style>
