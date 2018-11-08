<template>
  <a :class="!status ? 's-contain' : 's-contain disabled'" @click="sendCode">
    <span v-if="!status">获取验证码</span>
    <span v-else>{{time + '秒后重发'}}</span>
  </a>
</template>

<script>
import Request from '../../utils/request.js'
export default {
  name: 'send-code',
  props: {
    autoStart: Boolean,
    codeType: String, // 1-获取激活验证码，2-忘记密码获取验证码，3-更换手机号或邮箱获取验证码
    account: String,
    areacode: String,
    loginType: Number
  },
  data () {
    return {
      time: 60,
      status: false,
      times: null
    }
  },
  mounted () {
    this.times && this.reset()
    !this.autoStart && this.sendCode()
  },
  methods: {
    sendCode () {
      if (this.status) return
      this.sendRequest()
      this.status = true
      this.times = setInterval(() => {
        this.time--
        if (this.time === 0) {
          this.reset()
        }
      }, 1000)
    },
    reset () {
      clearInterval(this.times)
      this.times = null
      this.time = 60
      this.status = false
    },
    sendRequest () {
      /*
       * 获取激活验证码  api/niceAccount/genAuthCode
       * 获取忘记密码验证码  api/appPc/getForgetPasswordCode
       * 获取修改手机号和邮箱的验证码  api/appPc/getModifyCode
       */
      let url = ''
      if (this.codeType === '1') {
        url = 'api/niceAccount/genAuthCode'
      } else if (this.codeType === '2') {
        url = 'api/appPc/getForgetPasswordCode'
      } else if (this.codeType === '3') {
        url = 'api/appPc/getModifyCode'
      }
      if (url && this.account) {
        let account = this.account
        if (this.loginType === 3) {
          account = this.areacode + '-' + this.account
        }
        Request.GetCode(url, {
          account
        }, this).then(() => {
        }).catch(() => {
        })
      }
    }
  }
}
</script>

<style scoped>
  .s-contain {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 93px;
    height: 32px;
    background: rgba(239,239,243,1);
    border-radius: 5px;
    font-size: 14px;
    color: rgba(79,141,255,1);
    transition: all .3s linear;
    cursor: pointer;
  }
  .s-contain:hover {
    background: rgb(221, 221, 226);
  }

  .s-contain.disabled {
    color: rgba(179,179,186,1);
  }
  .s-contain.disabled:hover {
    background: rgba(239,239,243,1);
    cursor: default;
  }
</style>


