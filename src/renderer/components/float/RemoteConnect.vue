<template>
<!-- 收到远程桌面消息 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="modalVisible">
    <div class="m-selectcontact-cover"></div>
    <div class="m-clear-body m-dismiss-body">
      <div class="drag"><span class="title">远程桌面</span></div>
      <div class="content"><span class="warning"></span><span style="width: 88%">{{modalContent}}</span></div>
      <div class="footer">
        <a class="b-confirm" @click="clickCb(1)">接受</a>
        <a class="b-cancel" @click="clickCb(2)">拒绝</a>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
export default {
  name: 'remote-connect',
  computed: {
    account () {
      return this.$store.state.remoteConnectObj.account
    },
    nick () {
      return this.$store.state.remoteConnectObj.nick
    },
    type () {
      return this.$store.state.remoteConnectObj.type
    },
    modalVisible () {
      return this.$store.state.remoteConnectObj.showModal
    },
    modalContent () {
      let content = ''
      switch (this.type) {
        case 1:
          content = this.nick + '请求远程控制您的电脑，请选择接受或拒绝该请求。'
          break
        case 2:
          content = this.nick + '邀请您远程控制他/她的电脑，请选择接受或者拒绝该邀请。'
          break
        default :
          break
      }
      return content
    }
  },
  methods: {
    closeModal () {
      this.$store.commit('updateRemoteConnectObj', { showModal: false })
    },
    clickCb (type) {
      // type  1-接受，2-拒绝
      let account = this.account
      let reqType = this.type
      let myInfo = this.$store.state.myInfo
      let content = { status: 'response', type, reqType, nick: myInfo.nick || myInfo.account }
      this.$store.dispatch('sendCustomSysMsg', {account, content: JSON.stringify(content)})
      this.closeModal()
      if (type === 1) {
        this.$store.commit('updateRemoteWaitingObj', { showModal: true, noCancel: true, account, role: 'Initiator' })
        if (reqType === 1) {
          let ipcRenderer = require('electron').ipcRenderer
          try {
            ipcRenderer.send('remoteConnection', account)
          } catch (error) {
            console.log('remoteConnection error', error)
            this.$store.commit('toastConfig', {
              show: true,
              type: 'fail',
              toastText: '网络连接状态异常，请在办公内网环境或网络良好的场景下使用远程协助'
            })
          }
        }
      }
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
</style>
