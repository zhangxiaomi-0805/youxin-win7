<template>
<!-- 忘记密码二次确认框 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="showTwiceConfirm">
    <div class="m-selectcontact-cover"></div>
    <div class="twice-modal">
        <div class="u-sysbtn close">
          <a class="btn-close" @click="closeModal"/>
        </div>
      <div class="content-box">
        <!-- <img :src="logo"> -->
        <div class="content-text">{{content}}</div>
      </div>
      <div class="footer">
        <div class="btn confirm" @click="confirm"><span>确定</span></div>
        <div class="btn cancel" @click="closeModal"><span>取消</span></div>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import config from '../../configs'
import NativeLogic from '../../utils/nativeLogic.js'
export default {
  name: 'twice-confirm',
  data () {
    return {
      showTwiceConfirm: false,
      logo: './static/img/excl-mark.png',
      content: `请确保在办公网络中进行此操作`
    }
  },
  mounted () {
    this.eventBus.$on('twiceConfirm', () => {
      this.showTwiceConfirm = true
    })
  },
  methods: {
    closeModal () {
      this.showTwiceConfirm = false
    },
    confirm () {
      let url = `https://youx.telecomjs.com:10582/sm/user/resetPwdIndex`
      if (config.environment === 'web') {
        // web端打开外部窗口
        NativeLogic.native.openShell(3, url) // type: 打开类型（1-文件，2-文件所在目录，3-外部浏览器） url
      } else {
        // electron端打开外部窗口
        let { shell } = require('electron')
        shell.openExternal(url)
      }
      setTimeout(() => {
        this.closeModal()
      }, 0)
    }
  }
}
</script>

<style scoped>
  .m-selectcontact-contain {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1002;
  }

  .m-selectcontact-contain .m-selectcontact-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }
  .twice-modal {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 90;
    width: 264px;
    height: 158px;
    transform: translate(-50%, -50%);
    background: #fff;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    border-radius: 4px;
    box-sizing: border-box;
    z-index: 1100;  }
  .twice-modal .content-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 30px 0;
  }
  .twice-modal .content-box>img {
    width: 60px;
    height: 60px;
  }
  .twice-modal .content-box .content-text {
    margin-top: 15px;
    color: #333333;
    font-size: 16px;
  }
  .twice-modal .footer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 20px;
  }

  .twice-modal .footer .btn {
    width: 85px;
    height: 35px;
    line-height: 35px;
    text-align: center;
    color: #fff;
    font-size: 16px;
    border-radius: 6px;
    cursor: pointer;
  }
  .twice-modal .footer .confirm {
    color: #fff;
    background-color: rgba(79,141,255,1);
  }
  .twice-modal .footer .confirm:hover {
    background-color: rgb(1, 138, 230);
  }
  .twice-modal .footer .cancel {
    background-color: #F2F2F2;
    color: #666666;
  }
  .twice-modal .footer .cancel:hover {
    background-color: #e6e6e6;
  }
</style>
