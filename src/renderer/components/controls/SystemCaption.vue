<template>
<div class="u-caption">
  <div class="u-sysbtn"  v-if="showSystemCaption">
    <a class="btn-min" @click="onMinimize"/>
    <a class="btn-max" @click="onMax" v-if="resizable && !isWindowMax"/>
    <a class="btn-restore" @click="onRestore" v-else-if="resizable && isWindowMax"/>
    <a class="btn-close" @click="onClose"/>
  </div>
</div>
</template>

<script>
import platform from '../../utils/platform'
import config from '../../configs'
import NativeLogic from '../../utils/nativeLogic.js'
export default {
  name: 'system-caption',
  props: {
    resizable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    showSystemCaption () {
      return platform.getOsInfo() === 'Windows'
    },
    isWindowMax () {
      return this.$store.state.isWindowMax
    }
  },
  mounted () {
    if (config.environment === 'web') { // web分支
      // NativeLogic.native.setWinStatus('main', 2) // params: windowName:窗口名称； type： 类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
      // NativeLogic.native.setWinStatus('main', 5)
    } else { // electron分支
      let electron = require('electron')
      let ipcRenderer = electron.ipcRenderer
      ipcRenderer.on('doMax', () => {
        this.$store.commit('updateWindowMax', true)
      })
      ipcRenderer.on('doRestore', () => {
        this.$store.commit('updateWindowMax', false)
      })
    }
  },
  methods: {
    onClose () {
      if (localStorage.CLOSEMETHOD && (JSON.parse(localStorage.CLOSEMETHOD) === 2)) {
        if (config.environment === 'web') { // web分支
          NativeLogic.native.setWinStatus('main', 4) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
        } else { // electron分支
          let electron = require('electron')
          let ipcRenderer = electron.ipcRenderer
          ipcRenderer.send('quitApp')
        }
        return
      }
      if (config.environment === 'web') { // web分支
        NativeLogic.native.setWinStatus('main', 4) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
      } else { // electron分支
        let electron = require('electron')
        let ipcRenderer = electron.ipcRenderer
        ipcRenderer.send('onClose')
      }
    },
    onMax () {
      if (config.environment === 'web') { // web分支
        NativeLogic.native.setWinStatus('main', 2) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
      } else { // electron分支
        let electron = require('electron')
        let ipcRenderer = electron.ipcRenderer
        ipcRenderer.send('onMax')
      }
    },
    onRestore () {
      if (config.environment === 'web') { // web分支
        NativeLogic.native.setWinStatus('main', 5) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
      } else { // electron分支
        let electron = require('electron')
        let ipcRenderer = electron.ipcRenderer
        ipcRenderer.send('onRestore')
      }
    },
    onMinimize () {
      if (config.environment === 'web') { // web分支
        console.log('最小化')
        NativeLogic.native.setWinStatus('main', 1) // params: 1.窗口名称 2.类型（1-最小化，2-最大化，3-还原，4-关闭，5-重启，6-隐藏，7-显示）
      } else { // electron分支
        let electron = require('electron')
        let ipcRenderer = electron.ipcRenderer
        ipcRenderer.send('onMinimize')
      }
    }
  }
}
</script>

<style>

</style>


