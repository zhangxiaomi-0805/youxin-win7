<template>
<!-- 是否发起远程桌面 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="showRemoteConfirm">
    <div class="m-selectcontact-cover"></div>
    <div class="m-clear-body m-dismiss-body">
      <div class="drag" id="remoteConfirmDrag">
        <span class="title">远程桌面</span>
        <div class="u-sysbtn close"><a class="btn-close" @click="closeModal"/></div>
      </div>
      <div class="content">
          <span class="warning"></span>
          <div style="width: 88%">
            <div>确定发起远程连接吗？</div>
            <div style="color: #999;font-size: 13px;margin-top: 10px">远程连接仅支持双方再内网环境下使用，请确认双方的网络环境。</div>
            <div style="margin-top: 10px">
              <span style="color: #333;font-size: 12px;">以后不再提示</span>
            </div>
          </div>
      </div>
      <div class="footer">
        <a class="b-confirm" @click="confirm()">确定</a>
        <a class="b-cancel" @click="closeModal">取消</a>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import drag from '../../utils/drag.js'
export default {
  name: 'remote-confirm',
  data () {
    return {
      showRemoteConfirm: false,
      content: {}
    }
  },
  updated () {
    drag.dragPosition('remoteConfirmDrag')
  },
  mounted () {
    this.eventBus.$on('remoteConfirm', (data) => {
      this.showRemoteConfirm = true
      this.content = data
    })
  },
  methods: {
    closeModal () {
      this.showRemoteConfirm = false
    },
    confirm () {
      this.showRemoteConfirm = false
      this.$store.commit('updateRemoteWaitingObj', { showModal: true, ...this.content })
      this.$store.dispatch('sendCustomSysMsg', {account: this.content.account, content: JSON.stringify(this.content)})
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
    height: 220px;
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
    padding: 0px 20px;
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
