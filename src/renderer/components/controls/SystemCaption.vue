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
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
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
    ipcRenderer.on('doMax', () => {
      this.$store.commit('updateWindowMax', true)
    })

    ipcRenderer.on('doRestore', () => {
      this.$store.commit('updateWindowMax', false)
    })
  },
  methods: {
    onClose () {
      if (localStorage.CLOSEMETHOD && (JSON.parse(localStorage.CLOSEMETHOD) === 2)) {
        ipcRenderer.send('quitApp')
        return
      }
      ipcRenderer.send('onClose')
    },
    onMax () {
      ipcRenderer.send('onMax')
    },
    onRestore () {
      ipcRenderer.send('onRestore')
    },
    onMinimize () {
      ipcRenderer.send('onMinimize')
    }
  }
}
</script>

<style>

</style>


