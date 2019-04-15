<template>
<!-- 清除聊天记录 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="showClearRecord">
    <div class="m-selectcontact-cover"></div>
    <div class="m-clear-body" style="width: 380px;height: 197px;">
      <div class="drag" id="clearRecordDrag">
        <span class="title">清空聊天记录</span>
        <div class="u-sysbtn close">
          <a class="btn-close" @click="closeModal"/>
        </div>
      </div>
      <div class="content">确定清空该对话聊天记录吗？</div>
      <div style="display:none;">{{networkStatus}}</div>
      <div v-if="platform" class="footer">
        <a class="b-confirm" @click="cleaRecord">
          <span v-if="!loading">确定</span>
          <span v-else-if="loading" class="loading"></span>
        </a>
        <a class="b-cancel" @click="closeModal">取消</a>
      </div>
      <div v-else class="footer">
        <a class="b-cancel" @click="closeModal" style="margin-right:20px;">取消</a>
        <a class="b-confirm" @click="cleaRecord" style="margin-right:0;">
          <span v-if="!loading">确定</span>
          <span v-else-if="loading" class="loading"></span>
        </a>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import platform from '../../utils/platform'
import drag from '../../utils/drag.js'
export default {
  name: 'clear-record',
  mounted () {
    this.eventBus.$on('clearRecord', (data) => {
      this.showClearRecord = true
      this.account = data.account
      this.sessionId = data.sessionId
    })
  },
  beforeDestroy () {
    this.eventBus.$off('clearRecord')
  },
  data () {
    return {
      showClearRecord: false,
      loading: false,
      account: null,
      sessionId: null
    }
  },
  computed: {
    platform () {
      return platform.getOsInfo() === 'Windows'
    },
    networkStatus () {
      let networkStatus = this.$store.state.networkStatus
      if (networkStatus !== 200) {
        // 断网超时
        this.loading = false
      }
      return networkStatus
    }
  },
  updated () {
    drag.dragPosition('clearRecordDrag')
  },
  methods: {
    closeModal () {
      this.showClearRecord = false
      this.loading = false
    },
    cleaRecord () {
      if (!this.account || this.loading) return
      this.loading = true
      let _this = this
      this.$store.dispatch('deleteLocalMsgsBySession', {
        account: this.account,
        sessionId: this.sessionId,
        callback: () => {
          _this.showClearRecord = false
          _this.loading = false
        }
      })
    }
  }
}
</script>

<style>
  .m-clear-body {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 90;
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
    background: url('../../../../static/img/setting/loading-w.gif') no-repeat center center;
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
