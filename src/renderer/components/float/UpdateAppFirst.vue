<template>
<!-- 版本升级 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="showUpdateApp">
    <div class="m-selectcontact-cover"></div>
    <div class="m-clear-body update-app">
      <div class="drag"><div class="u-sysbtn close"><a class="btn-close" @click="closeModal" v-if="content.forceUpdate !== 1"/></div></div>
      <div class="content">
        <img class="logo" :src="logo">
        <div class="version">{{`优信${content.versionNum || content.appVersion || ''}`}}</div>
        <div class="update-content" v-html="content.updateContent"></div>
      </div>
      <div class="update-footer">
        <div class="btn confirm" @click="goUpdate"><span>立即升级</span></div>
        <div v-if="content.forceUpdate !== 1" class="btn cancel" @click="Ignore">忽略</div>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import config from '../../configs'
import NativeLogic from '../../utils/nativeLogic.js'
export default {
  name: 'update-app-first',
  mounted () {
    this.eventBus.$on('updateAppFirst', (data) => {
      console.log(data)
      this.showUpdateApp = true
      this.content = data || {}
      this.updateLocalVersion()
    })
  },
  data () {
    return {
      showUpdateApp: false,
      logo: './static/img/logo.png',
      content: {}
    }
  },
  methods: {
    closeModal () {
      this.showUpdateApp = false
    },
    goUpdate () {
      if (config.environment === 'web') { // web分支
        NativeLogic.native.openShell(3, this.content.downloadUrl) // 1.打开类型（1-文件，2-文件所在目录，3-外部浏览器） 2.路径
      } else { // electron分支
        let { shell } = require('electron')
        this.content && shell.openExternal(this.content.downloadUrl)
      }
    },
    Ignore () {
      // 忽略更新
      this.updateLocalVersion(true)
      this.closeModal()
    },
    updateLocalVersion (ignore) {
      // 更新本地存储
      let APPVERSIONS = localStorage.APPVERSIONS ? JSON.parse(localStorage.APPVERSIONS) : {}
      APPVERSIONS.versionNum = this.content.versionNum
      if (ignore) APPVERSIONS.ignore = ignore
      localStorage.setItem('APPVERSIONS', JSON.stringify(APPVERSIONS))
    }
  }
}
</script>

<style scoped>
  .update-app {
    width: 264px;
    height: 358px;
    position: absolute;
    top: 30px;
    left: 28px;
    -webkit-box-shadow: 0 0 4px 4px rgba(0,0,0,0.05);
    -moz-box-shadow: 0 0 4px 4px rgba(0,0,0,0.05);
    box-shadow: 0 0 4px 4px rgba(0,0,0,0.05);
    border-radius: 2px;
    z-index: 1000;
    background-color: #fff
  }

  .update-footer {
    padding: 0 20px;
  }

  .update-footer .btn {
    width: 100%;
    height: 45px;
    line-height: 45px;
    text-align: center;
    color: #fff;
    font-size: 16px;
    background-color: rgba(4,154,255,1);
    border-radius: 10px;
    cursor: pointer;
    transition: background .2s linear;
  }
  .update-footer .btn:hover {
    background: rgb(1, 138, 230);
  }

  .update-footer .cancel {
    background-color: transparent;
    color: #aaa;
  }
  .update-footer .cancel:hover {
    background-color: transparent;
  }

  .update-app .logo {
    width: 104px;
    height: 104px;
    margin: 10px 0 0 20px;
  }

  .update-app .content {
    text-align: center;
  }

  .update-app .version {
    font-size: 16px;
    color: #333;
    margin-bottom: 20px;
  }

  .update-app .update-content {
    text-align: left;
    height: 80px;
    overflow-y: auto;
    font-size: 14px;
    line-height: 22px;
    color: #999;
    padding: 0 20px;
    margin-bottom: 20px
  }
</style>
