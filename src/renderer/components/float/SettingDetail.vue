<template>
<!-- 设置浮层 -->
<transition name="fade">
  <div class="m-set-dtl-con" v-if="showSettingDetail">
    <div class="m-set-dtl-cover"></div>
    <div class="m-set-dtl" :style="{height: type === 4 ? '412px' : '354px'}">
      <select-area modify/>
      <div v-if="loading" class="m-cover"/>
      <div class="title"><span>{{titleName()}}</span><div class="u-sysbtn close"><a class="btn-close" @click="closeModal()"/></div></div>
      <!-- 验证密码 -->
      <div class="m-set-com" v-if="type === 1" style="paddingTop: 90px;">
        <div class="m-set-ipt" ref="loginIpt" style="marginBottom: 30px;">
          <input
            type="password"
            class="ipt"
            style="fontSize: 19px;letterSpacing: 2px;"
            maxlength="20"
            autofocus
            v-model="vertifyPassword"
            placeholder="请输入密码"
            @focus="focusFn($refs.loginIpt)"
            @blur="blurFn($refs.loginIpt)"
            @keyup="keyToNext($event, 1)"/>
            <span v-if="vertifyPassword.length > 0" class="clear" @click="vertifyPassword = ''"/>
        </div>
        <login-button text="下一步" :disabled="!vertifyPassword" :loading="loading" :callBack="vertifyPwd"/>
      </div>
      <!-- 更换手机号 / 更换邮箱地址 -->
      <div class="m-set-com" v-else-if="type === 2 || type === 3">
        <div class="m-set-title">{{type === 2 ? '更换手机号后，下次将使用新的手机号登录' : '更换邮箱地址后，下次将使用新的邮箱地址登录'}}</div>
        <div class="m-set-ipt" ref="loginIpt" style="marginBottom: 20px;">
          <a v-if="type === 2" class="areacode" @click="selectArea"><span style="marginRight: 6px;">{{areacode}}</span><span class="dropdown"></span></a>
          <input
            class="ipt"
            :style="{width: type === 2 ? '60%' : '80%', textIndent: '3px'}"
            :maxlength="type === 2 ? 15 : 64"
            autofocus
            v-model="account"
            :placeholder="type === 2 ? '请输入手机号' : '请输入邮箱地址'"
            @focus="focusFn($refs.loginIpt)"
            @blur="blurFn($refs.loginIpt)"/>
            <span v-if="account.length > 0" class="clear" @click="account = ''"/>
        </div>
        <div class="m-set-ipt sendcode" ref="loginIptCode" style="marginBottom: 30px;">
          <input
            type="email"
            class="ipt"
            style="width: 50%;text-indent: 3px"
            maxlength="6"
            autofocus
            v-model="vertifyCode"
            placeholder="请输入验证码"
            @focus="focusFn($refs.loginIptCode)"
            @blur="blurFn($refs.loginIptCode)"
            @keyup="keyToNext($event, 2)"/>
          <span v-if="vertifyCode.length > 0" class="clear" @click="vertifyCode = ''" style="right: 105px;"/>
          <div style="position: relative;">
            <send-code :account="account" :areacode="areacode" autoStart codeType="3" :loginType="type === 2 ? 3 : 2"/>
            <div v-if="canSend()" @click="canSend(true)" class="send-code-cover"></div>
          </div>
        </div>
        <login-button text="更换" :disabled="!(account && vertifyCode)" :loading="loading" :callBack="changePhone"/>
      </div>
      <!-- 修改密码 -->
      <div class="m-set-com" v-else-if="type === 4" style="paddingTop: 20px;">
        <div class="mdy-title">原密码</div>
        <div class="m-set-ipt" ref="loginIpt" style="marginBottom: 20px;">
          <input
            type="password"
            class="ipt"
            style="fontSize: 19px;letterSpacing: 2px;"
            maxlength="20"
            autofocus
            v-model="password"
            placeholder="请输入原密码"
            @focus="focusFn($refs.loginIpt)"
            @blur="blurFn($refs.loginIpt)"/>
            <span v-if="password.length > 0" class="clear" @click="password = ''"/>
        </div>
        <div class="mdy-title">新密码</div>
        <div class="m-set-ipt" ref="loginIptNew">
          <input
            type="password"
            class="ipt"
            style="fontSize: 19px;letterSpacing: 2px;"
            maxlength="20"
            v-model="newPwd"
            placeholder="请设置新密码"
            @focus="focusFn($refs.loginIptNew)"
            @blur="blurFn($refs.loginIptNew)"/>
            <span v-if="newPwd.length > 0" class="clear" @click="newPwd = ''"/>
        </div>
        <div class="toast-text" style="marginBottom: 20px;">密码长度8-20位</div>
        <div class="mdy-title">确认密码</div>
        <div class="m-set-ipt" ref="loginIptConfirm">
          <input
            type="password"
            class="ipt"
            style="fontSize: 19px;letterSpacing: 2px;"
            maxlength="20"
            v-model="confirmNewPwd"
            placeholder="请再次确认新密码"
            @focus="focusFn($refs.loginIptConfirm)"
            @blur="blurFn($refs.loginIptConfirm)"
            @keyup="keyToNext($event, 3)"/>
            <span v-if="confirmNewPwd.length > 0" class="clear" @click="confirmNewPwd = ''"/>
        </div>
        <div class="toast-text" style="marginBottom: 30px;">密码长度8-20位</div>
        <login-button text="确定" :disabled="!(password && newPwd && confirmNewPwd)" :loading="loading" :callBack="modifyPwd"/>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import LoginButton from '../login/LoginButton.vue'
import SelectArea from '../login/SelectArea.vue'
import SendCode from '../login/SendCode.vue'
import DES from '../../utils/des.js'
import Request from '../../utils/request.js'
import util from '../../utils'
export default {
  name: 'setting-detail',
  components: {LoginButton, SelectArea, SendCode},
  data () {
    return {
      showSettingDetail: false,
      loading: false,
      setType: 1,
      type: 1, // 1-验证密码, 2-更换手机, 3-更换邮箱地址, 4-修改密码
      vertifyPassword: '',
      account: '',
      vertifyCode: '',
      password: '',
      newPwd: '',
      confirmNewPwd: '',
      areacode: '+86'
    }
  },
  mounted () {
    this.eventBus.$on('settingDetail', (data) => {
      this.showSettingDetail = true
      this.setType = data.setType
      if (this.setType === 4) {
        this.type = this.setType
      } else {
        this.type = 1
      }
    })
  },
  beforeDestroy () {
    this.eventBus.$off('settingDetail')
  },
  computed: {
    personInfos () {
      return this.$store.state.personInfos
    }
  },
  methods: {
    titleName () {
      let title = ''
      switch (this.type) {
        case 1:
          title = '验证密码'
          break
        case 2:
          title = '更换手机号'
          break
        case 3:
          title = '更换邮箱地址'
          break
        case 4:
          title = '修改密码'
          break
      }
      return title
    },
    closeModal () {
      this.showSettingDetail = false
      this.loading = false
      this.setType = 1
      this.type = 1
      this.vertifyPassword = ''
      this.account = ''
      this.vertifyCode = ''
      this.password = ''
      this.newPwd = ''
      this.confirmNewPwd = ''
      this.areacode = '+86'
    },
    keyToNext (e, type) {
      if (e.keyCode === 13) {
        e.target.blur()
        switch (type) {
          case 1 :
            this.vertifyPwd()
            break
          case 2 :
            this.changePhone()
            break
          case 3 :
            this.modifyPwd()
            break
        }
      }
    },
    regCheck () {
      let errMsg = ''
      if (this.type === 2) {
        if (!/^[0-9]*$/.test(this.account)) {
          errMsg = '手机格式不正确，请重新输入'
        }
        if (this.areacode === '+86' && (this.account.length > 11 || !/^1[345678]\d{9}$/.test(this.account))) {
          errMsg = '手机格式不正确，请重新输入'
        }
        if (this.account === this.personInfos.phone) {
          errMsg = '该手机号与当前绑定的手机号相同'
        }
      } else if (this.type === 3) {
        let regEmail = util.regExp.regEmail
        if (!regEmail.test(this.account)) {
          errMsg = '邮箱格式不正确，请重新输入'
        }
        if (this.account === this.personInfos.email) {
          errMsg = '该邮箱与当前绑定的邮箱相同'
        }
      }
      return errMsg
    },
    canSend (val) {
      if (!this.account) return true
      let errMsg = this.regCheck()
      if (val) {
        this.$store.commit('toastConfig', {
          show: true,
          type: 'fail',
          toastText: errMsg
        })
        return
      }
      if (errMsg) return true
      return false
    },
    vertifyPwd () {
      // 验证密码
      if (!this.vertifyPassword) return
      this.loading = true
      // 登录成功后确认原密码
      Request.ConfirmOrigPassword({
        password: DES.encryptByDES(this.vertifyPassword, 2)
      }, this).then(ret => {
        this.loading = false
        this.type = this.setType
      }).catch((err) => {
        this.loading = false
        if (err) {
          let toastText = err.msg
          if (err.code === 413) {
            toastText = '密码输入错误，请重新输入'
          }
          this.$store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: toastText
          })
        }
      })
    },
    changePhone () {
      // 更换手机 / 邮箱地址
      if (!(this.account && this.vertifyCode)) return
      let errMsg = this.regCheck()
      if (errMsg) {
        this.$store.commit('toastConfig', {
          show: true,
          type: 'fail',
          toastText: errMsg
        })
        return
      }
      this.loading = true
      let url = 'api/appPc/modifyMobile'
      let params = {
        mobile: this.areacode + '-' + this.account,
        code: this.vertifyCode
      }
      if (this.type === 3) {
        url = 'api/appPc/modifyEmail'
        params = {
          email: this.account,
          code: this.vertifyCode
        }
      }
      Request.ModifyMobileOrEmail(url, params, this).then(ret => {
        this.loading = false
        if (ret) {
          let errMsg = ''
          switch (ret.invalid) {
            case 1 :
              errMsg = '验证码失效'
              break
            case 2 :
              errMsg = '验证码错误'
              break
          }
          if (errMsg) {
            this.$store.commit('toastConfig', {
              show: true,
              type: 'fail',
              toastText: errMsg
            })
          }
        } else this.complete()
      }).catch((err) => {
        this.loading = false
        if (err) {
          this.$store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: err.msg
          })
        }
      })
    },
    modifyPwd () {
      // 修改密码
      if (!(this.password && this.newPwd && this.confirmNewPwd)) return
      let errMsg = ''
      if (this.password.length < 8 || this.newPwd.length < 8) {
        errMsg = '密码格式不正确'
      } else if (this.newPwd !== this.confirmNewPwd) {
        errMsg = '两次输入的密码不一致'
      }
      if (errMsg) {
        this.$store.commit('toastConfig', {
          show: true,
          type: 'fail',
          toastText: errMsg
        })
        return
      }
      this.loading = true
      Request.ModifyPassword({
        password: DES.encryptByDES(this.newPwd, 2),
        oldPassword: DES.encryptByDES(this.password, 2),
        confirmPassword: DES.encryptByDES(this.confirmNewPwd, 2)
      }, this).then(ret => {
        this.loading = false
        this.$store.commit('toastConfig', {
          show: true,
          type: 'success',
          toastText: '密码修改成功'
        })
        // 状态重置
        this.closeModal()
        this.eventBus.$emit('generalSetting', {show: false})
        // 更新密码
        let USERINFO = localStorage.AUTOLOGIN
        if (USERINFO) {
          USERINFO = JSON.parse(USERINFO)
          USERINFO.password = DES.encryptByDES(this.password, 2)
          USERINFO.pageType = 'settingDetail'
          console.log('settingDetail set AUTOLOGIN ===', USERINFO)
          localStorage.setItem('AUTOLOGIN', JSON.stringify(USERINFO))
        }
      }).catch((err) => {
        this.loading = false
        if (err) {
          this.$store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: err.msg
          })
        }
      })
    },
    focusFn (dom) {
      dom.style.borderBottomColor = 'rgba(79,141,255,1)'
    },
    blurFn (dom) {
      dom.style.borderBottomColor = 'rgba(216,220,222,1)'
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
    complete () {
      this.$store.commit('toastConfig', {
        show: true,
        type: 'success',
        toastText: this.type === 2 ? '手机号更换成功' : '邮箱更换成功'
      })
      // 更新用户基本信息
      let personInfos = Object.assign({}, this.$store.state.personInfos)
      if (this.type === 2) {
        personInfos.phone = this.areacode + '-' + this.account
      } else if (this.type === 3) {
        personInfos.email = this.account
      }
      this.$store.commit('updatePersonInfos', personInfos)
      // 状态重置
      this.closeModal()
      this.eventBus.$emit('generalSetting', {show: false})
    }
  }
}
</script>

<style scoped>
  .m-set-dtl-con {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1010;
  }

  .m-set-dtl-con .m-set-dtl-con-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }

  .m-set-dtl-con .m-set-dtl {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 340px;
    height: 354px;
    background: #fff;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    border-radius: 0 0 4px 4px;
    z-index: 100;
    overflow: hidden;
  }

  .m-set-dtl-con .m-cover {
    position: absolute;
    top: 25px;
    bottom: 0;
    width: 100%;
    z-index: 10;
  }

  .m-set-dtl-con .title {
    font-size: 14px;
    color: #999;
  }
  .m-set-dtl-con .title > span {
    display: inline-block;
    padding: 4px 0 0 10px;
  }

  .m-set-dtl-con .m-set-com {
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    top: 25px;
    bottom: 0;
    padding: 0 30px;
  }

  .m-set-dtl-con .m-set-com .m-set-ipt {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
    border-bottom: 1px solid rgba(216,220,222,1);
    transition: all .2s linear;
  }

  .m-set-dtl-con .m-set-com .m-set-ipt .ipt {
    width: 90%;
    border: 0;
    padding: 0;
    font-size: 14px;
    line-height: 1.8;
    color: #333;
    font-family: "PingFangSC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  .m-set-dtl-con .m-set-com .m-set-ipt .ipt::-webkit-input-placeholder {
    font-size: 14px;
    color: rgba(198,203,212,1);
  }

  .m-set-dtl-con .m-set-com .clear {
    position: absolute;
    right: 0;
    top: 13.5px;
    display: block;
    width: 14px;
    height: 14px;
    background-image: url('../../../../static/img/setting/delete.png');
    background-size: 100% 100%;
    cursor: pointer;
  }

  .m-set-dtl-con .m-set-title {
    padding: 40px 0 30px;
    font-size: 14px;
    color: #999;
  }

  .m-set-dtl-con .areacode {
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
  .m-set-dtl-con .areacode span {
    vertical-align: middle;
    font-size: 14px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap
  }

  .m-set-dtl-con .dropdown {
    display: inline-block;
    width: 12px;
    height: 7px;
    background: url('../../../../static/img/setting/dropdown.png') no-repeat center center;
    background-size: 100% 100%
  }

  .m-set-dtl-con .m-set-ipt.sendcode {
    flex-direction: row;
    justify-content: space-between;
  }

  .m-set-dtl-con .send-code-cover {
    position: absolute;
    top: 0;
    width: 93px;
    height: 32px;
    z-index: 10;
  }

  .m-set-dtl-con .toast-text {
    font-size: 12px;
    color: rgba(136,136,147,1);
    padding-top: 4px;
  }

  .m-set-dtl-con .mdy-title {
    font-size: 12px;
    color: #333;
  }
</style>


