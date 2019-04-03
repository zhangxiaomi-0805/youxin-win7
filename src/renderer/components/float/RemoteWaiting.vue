<template>
<!-- 收到远程桌面消息 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="modalVisible">
    <div class="m-selectcontact-cover"></div>
    <div class="m-clear-body m-dismiss-body">
      <div class="drag"><span class="title">远程桌面</span></div>
      <div class="content"><span class="warning"></span><span style="width: 88%">{{modalContent}}</span></div>
      <div class="footer">
        <a class="b-cancel" @click="cancel">取消</a>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
export default {
  name: 'remote-waiting',
  computed: {
    nick () {
      return this.$store.state.remoteWaitingObj.nick
    },
    type () {
      return this.$store.state.remoteWaitingObj.type
    },
    role () {
      return this.$store.state.remoteWaitingObj.role
    },
    account () {
      return this.$store.state.remoteWaitingObj.account
    },
    noCancel () {
      return this.$store.state.remoteWaitingObj.noCancel
    },
    modalVisible () {
      return this.$store.state.remoteWaitingObj.showModal
    },
    modalContent () {
      let content = ''
      switch (this.type) {
        case 1:
          content = `您正在请求远程控制${this.nick}的电脑，请等待对方回应...`
          break
        case 2:
          content = `您正在邀请${this.nick}远程控制您的电脑，请等待对方回应...`
          break
        default :
          break
      }
      if (this.noCancel) {
        content = '正在建立远程连接，请稍后...'
      }
      return content
    }
  },
  methods: {
    cancel () {
      let myInfo = this.$store.state.myInfo
      let content = { status: 'request', type: 3, nick: myInfo.nick || myInfo.account, role: this.role }
      if (this.noCancel) {
        content = { status: 'dismiss', nick: myInfo.nick || myInfo.account, role: this.role }
      }
      this.$store.dispatch('sendCustomSysMsg', {account: this.account, content: JSON.stringify(content)})
      this.$store.commit('updateRemoteWaitingObj', { showModal: false })
    }
  }
}
</script>

<style scoped>
  .m-clear-body {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 1010;
    width: 380px;
    height: 197px;
    transform: translate(-50%, -50%);
    background: #fff;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    border-radius: 4px;
    box-sizing: border-box;
  }

  .m-clear-body .title {
    display: inline-block;
    font-size: 14px;
    color: #999;
    letter-spacing: 0;
    text-align: left;
    line-height: 14px;
    padding: 11px 10px;
  }

  .m-clear-body .drag {
    -webkit-app-region: no-drag;
  }

  .m-clear-body .content {
    font-size: 14px;
    color: #333;
    letter-spacing: 0;
    text-align: left;
    line-height: 18px;
    padding: 35px 20px;
  }

  .m-dismiss-body .content {
    display: flex;
    align-items: center;
    padding: 25px 20px;
  }
  .m-dismiss-body .content .warning {
    width: 34px;
    height: 34px;
    background: url('../../../../static/img/setting/prompt-big.png') no-repeat center center;
    background-size: 100% 100%;
    margin-right: 10px;
  }

  .m-clear-body .footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding: 20px 20px;
  }

  .m-clear-body .loading {
    display: inline-block;
    width: 15px;
    height: 15px;
    background: url('../../../../static/img/setting/loading-r.gif') no-repeat center center;
    background-size: 100% 100%;
  }

  .m-clear-body .footer .b-confirm,
  .m-clear-body .footer .b-cancel {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 55px;
    height: 28px;
    border-radius: 4px;
    font-size: 12px;
    transition: all .3s linear;
  }

  .m-clear-body .footer .b-confirm {
    background-color: rgba(245,99,97,1);
    color: #fff;
    margin-right: 20px;
  }
  .m-clear-body .footer .b-confirm:hover {
    background-color: rgba(221, 85, 82, 1);
  }

  .m-clear-body .footer .b-cancel {
    background-color: rgba(242,242,242,1);
    color: #333;
  }
  .m-clear-body .footer .b-cancel:hover {
    background-color: rgba(223, 219, 219, 1);
  }

  .m-dismiss-body .footer .b-confirm {
    width: 76.2px;
  }
</style>
