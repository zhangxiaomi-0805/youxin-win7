<template>
<!-- 退出登录 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="showLogout" style="zIndex: 1002">
    <div class="m-selectcontact-cover"></div>
    <div class="m-clear-body m-dismiss-body">
      <div class="drag">
        <span class="title">退出登录</span>
        <div class="u-sysbtn close"><a class="btn-close" @click="closeModal"/></div>
      </div>
      <div class="content" style="paddingBottom: 45px;">
        <!-- <span class="warning"></span> -->
        <span style="width: 88%">确定退出登录？</span>
      </div>
      <div v-if="platform" class="footer">
        <a class="b-confirm" @click="confirmManage" style="width: 55px;margin-right: 10px;">
          <span v-if="!loading">确定</span><span v-else-if="loading" class="loading"></span>
        </a>
        <a class="b-cancel" @click="closeModal">取消</a>
      </div>
      <div v-else class="footer">
        <a class="b-cancel" @click="closeModal" style="margin-right: 10px;">取消</a>
        <a class="b-confirm" @click="confirmManage" style="margin-right: 0;width: 55px;">
          <span v-if="!loading">确定</span><span v-else-if="loading" class="loading"></span>
        </a>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import platform from '../../utils/platform'
import Request from '../../utils/request'
import config from '../../configs'
import IndexedDB from '../../utils/indexedDB'
import NativeLogic from '../../utils/nativeLogic.js'
export default {
  name: 'logout',
  mounted () {
    this.eventBus.$on('logout', (data) => {
      this.showLogout = true
    })
  },
  beforeDestroy () {
    this.eventBus.$off('logout')
  },
  data () {
    return {
      showLogout: false,
      loading: false
    }
  },
  computed: {
    platform () {
      return platform.getOsInfo() === 'Windows'
    }
  },
  methods: {
    closeModal () {
      this.showLogout = false
      this.loading = false
    },
    confirmManage () {
      if (this.loading) return
      this.loading = true
      Request.Logout({}, this)
        .then(res => {
          IndexedDB.clear('AUTOLOGIN')
          if (config.environment === 'web') { // web分支
            localStorage.removeItem('UserName')
            // 先关闭所有子窗口，再重启主窗口
            NativeLogic.native.setWinStatus('aplWindow', 4) // 类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
            NativeLogic.native.setWinStatus('main', 5)
          } else { // electron分支
            let { ipcRenderer } = require('electron')
            ipcRenderer.send('relaunch-app')
          }
        }).catch(() => {
          this.loading = false
        })
    }
  }
}
</script>