<template>
<!-- 转发失败 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="showForwordFail">
    <div class="m-selectcontact-cover"></div>
    <div class="m-clear-body m-dismiss-body" style="width: 380px;height: auto;">
      <div class="drag" id="dismissTeamDrag">
        <span class="title">提示</span>
        <div class="u-sysbtn close">
          <a class="btn-close" @click="closeModal"/>
        </div>
      </div>
      <div class="content">
        <span class="warning"></span>
        <div v-if="type === 1" style="width: 88%">
          <div class="content-title">
            部分转发失败
          </div>
          <div class="content-account">
            <div>成功转发到{{successNum}}个聊天，转发失败的有</div>
            <div v-for="(item, index) in failAccount" :key="index">{{index === failAccount.length - 1 ? `“${item}”` : `“${item}”、`}}</div>
            <div>等{{failNum}}个聊天</div>
          </div>
        </div>
        <div v-else-if="type === 2" style="width: 88%">
          <div>创建失败！建群数量已达上限</div>
          <!-- <div>（最多可扩展至2000）</div>      -->
        </div>
        <div v-else style="width: 88%">
          <div>抱歉，您的体验时长到期，无法正常使用，</div>
          <div>请联系相应的商务经理</div>
        </div>
      </div>
      <div class="footer">
        <a class="cancel" @click="closeModal">知道了</a>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import drag from '../../utils/drag.js'
import config from '../../configs'
import IndexedDB from '../../utils/indexedDB'
import NativeLogic from '../../utils/nativeLogic.js'
export default {
  name: 'dismiss-team',
  mounted () {
    let _this = this
    this.eventBus.$on('forwordFail', (data) => {
      _this.showForwordFail = true
      if (data.type === 1) {
        _this.failAccount = data.failAccount.slice(0, 5)
        _this.failNum = data.failAccount.length
        _this.successNum = data.successNum
      }
      _this.type = data.type
    })
  },
  beforeDestroy () {
    this.eventBus.$off('forwordFail')
  },
  data () {
    return {
      showForwordFail: false,
      successNum: 0,
      failNum: 0,
      failAccount: [],
      type: 1 // 1-转发失败，2-发起群聊失败，3-企业过期
    }
  },
  updated () {
    drag.dragPosition('dismissTeamDrag')
  },
  methods: {
    closeModal () {
      this.showForwordFail = false
      this.loading = false
      if (this.type === 3) {
        if (config.environment === 'web') { // web分支
          localStorage.removeItem('UserName')
          // 先关闭所有子窗口，再重启主窗口
          NativeLogic.native.setWinStatus('aplWindow', 3) // 类型（1-最小化，2-最大化，3-关闭，4-重启，5-隐藏，6-显示）
          NativeLogic.native.setWinStatus('main', 4)
        } else { // electron分支
          let { ipcRenderer } = require('electron')
          ipcRenderer.send('relaunch-app')
        }
        IndexedDB.clear('AUTOLOGIN')
        console.log('forwordFail 移除AUTOLOGIN===', localStorage.AUTOLOGIN)
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
    z-index: 90;
    width: 380px;
    height: auto;
    transform: translate(-50%, -50%);
    background: #fff;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    border-radius: 4px;
    box-sizing: border-box;
    z-index: 1100;
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
  .m-dismiss-body .content .content-title {
    font-size: 16px;
    color: #333;
    margin-bottom: 6px;
  }
  .m-dismiss-body .content .content-account {
    font-size: 14px;
    color: #666;
    line-height: 16px;
    word-wrap: break-word;word-break: break-all;overflow: hidden;
    text-align: justify;
    text-indent: 5px;
  }
  .m-dismiss-body .content .content-account div {
    font-size: 14px;
    color: #666;
    word-wrap: nowrap;
    float: left;
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
    padding: 0px 20px 20px 20px;
  }

  .m-clear-body .loading {
    display: inline-block;
    width: 15px;
    height: 15px;
    background: url('../../../../static/img/setting/loading-r.gif') no-repeat center center;
    background-size: 100% 100%;
  }

  .m-clear-body .footer .cancel {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 55px;
    height: 28px;
    border-radius: 4px;
    font-size: 12px;
    transition: all .3s linear;
  }

  .m-clear-body .footer .cancel {
    background-color: #4F8DFF;
    color: #fff;
  }
  .m-dismiss-body .footer .b-confirm {
    width: 76.2px;
  }
</style>
