<template>
<!-- 下线通知 -->
<transition name="fade">
  <div class="m-selectcontact-contain m-downline-contain" v-if="downlineStatus">
    <div class="m-selectcontact-cover"></div>
    <div class="m-clear-body m-dismiss-body" style="width: 380px;height: 197px;">
      <div class="drag" id="downLineDrag">
        <span class="title">下线通知</span>

        <div class="u-sysbtn close"><a class="btn-close" @click="closeModal"/></div>
      </div>
      <div class="content">
        <span class="warning"></span>
        <div style="width: 86%">
          <div style="fontSize: 16px; color: #000; marginBottom: 5px;">{{reason}}</div>
          <div style="fontSize: 16px; color: #999;">如果这不是您本人的操作，您的密码很可能已经泄露，建议您修改密码。</div>
        </div>
      </div>
      <div class="footer">
        <a class="b-confirm" @click="confirmManage"><span>重新登录</span></a>
        <a class="b-cancel" @click="closeModal">确定</a>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import Request from '../../utils/request.js'
import drag from '../../utils/drag.js'
import config from '../../configs'
import LocalDB from '../../utils/LocalIndexedDB'
import NativeLogic from '../../utils/nativeLogic.js'
export default {
  name: 'down-line',
  data () {
    return {
      showDismissTeam: true
    }
  },
  computed: {
    downlineStatus () {
      return this.$store.state.downlineStatus.status
    },
    reason () {
      let reason = this.$store.state.downlineStatus.reason
      let content = ''
      switch (reason) {
        case 'samePlatformKick':
          content = '您的账号在另一地点登录，您被迫下线。'
          break
        case 'serverKick':
          content = '您的账号被服务端下线。'
          break
        case 'otherPlatformKick':
          content = '您已通过手机优信退出电脑优信。'
          break
      }
      return content
    }
  },
  updated () {
    drag.dragPosition('downLineDrag')
  },
  methods: {
    closeModal () {
      Request.Logout({}, this)
        .then(res => {
          // let loginInfo = this.$store.state.loginInfo
          // localStorage.setItem('LOGININFO', JSON.stringify(loginInfo))
          LocalDB.clear('autoLogin')
          console.log('downLine 移除autoLogin===', localStorage.autoLogin)
          this.$store.commit('updateDownlineModal', {status: false, reason: this.reason})
          if (config.environment === 'web') { // web分支
            localStorage.removeItem('UserName')
            // 先关闭所有子窗口，再重启主窗口
            NativeLogic.native.setWinStatus('aplWindow', 4) // 类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
            NativeLogic.native.setWinStatus('main', 5)
          } else { // electron分支
            let { ipcRenderer } = require('electron')
            ipcRenderer.send('relaunch-app')
          }
        }).catch(() => {})
    },
    confirmManage () {
      this.$store.dispatch('connect', {
        force: true,
        done: (error) => {
          if (error !== 200) {
            return
          }
          this.$store.commit('updateDownlineModal', {status: false, reason: this.reason})
        }
      })
    }
  }
}
</script>

<style scoped>
  .m-downline-contain {
    z-index: 2000;
  }

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

  .m-dismiss-body .content {
    display: flex;
    align-items: center;
    padding: 20px 20px;
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
    background-color: rgba(242,242,242,1);
    color: #049AFF;
    margin-right: 20px;
  }
  .m-clear-body .footer .b-confirm:hover {
    background-color: rgba(223, 219, 219, 1);
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
