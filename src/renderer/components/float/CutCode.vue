<template>
  <transition name="fade">
    <div class="m-gen-set-con" v-if="showCutCodeModal" @keydown="settingCode($event)" tabindex="1">
      <div class="m-gen-set-cover"></div>
      <div class="set-q-modal">
        <div style="color: #999;font-size: 12px;">请直接在键盘上输入新的快捷键</div>
        <div class="modal-input">{{setCutCode}}</div>
        <div class="modal-foot">
          <span style="color: #F56361;font-size: 12px;" @click="confirm">确定</span>
          <span style="color: #999;font-size: 12px;" @click="closeModal">取消</span>
        </div>
      </div>
    </div>  
  </transition>
</template>

<script>
import config from '../../configs'
import NativeLogic from '../../utils/nativeLogic.js'
export default {
  name: 'cut-code',
  data () {
    return {
      setCutCode: '',
      showCutCodeModal: false,
      keyCodeObj: {},
      callBack: null
    }
  },
  mounted () {
    this.eventBus.$on('cutCode', (data) => {
      this.showCutCodeModal = true
      if (data) {
        this.setCutCode = data.code
        this.callBack = data.callBack
      }
      this.renderKeyCodeObj()
    })
  },
  beforeDestroy () {
    this.eventBus.$off('cutCode')
  },
  methods: {
    closeModal () {
      this.showCutCodeModal = false
      this.setCutCode = ''
      this.callBack = null
    },
    renderKeyCodeObj () {
      let keyCodeObj = {}
      let start = 65
      let code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      for (let i = 0; i < code.length; i++) {
        keyCodeObj[start] = code[i]
        start++
      }
      this.keyCodeObj = keyCodeObj
    },
    settingCode (e) {
      // 键盘code处理
      let keyCode = e.keyCode || e.which || e.charCode
      let ctrlKey = e.ctrlKey || e.metaKey
      let altKey = e.altKey
      let shiftKey = e.shiftKey
      let setCutCode = ''
      if (this.keyCodeObj[keyCode]) {
        if (ctrlKey && altKey && shiftKey) {
          setCutCode = 'Ctrl + Alt + Shift + ' + this.keyCodeObj[keyCode]
        } else if (ctrlKey && altKey) {
          setCutCode = 'Ctrl + Alt + ' + this.keyCodeObj[keyCode]
        } else if (ctrlKey && shiftKey) {
          setCutCode = 'Ctrl + Shift + ' + this.keyCodeObj[keyCode]
        } else if (altKey && shiftKey) {
          setCutCode = 'Alt + Shift + ' + this.keyCodeObj[keyCode]
        } else if (ctrlKey) {
          setCutCode = 'Ctrl + ' + this.keyCodeObj[keyCode]
        } else if (altKey) {
          if (Number(keyCode) === 83) {
            this.$store.commit('toastConfig', {
              show: true,
              type: 'fail',
              toastText: '截屏快捷键被占用！'
            })
            return
          }
          setCutCode = 'Alt + ' + this.keyCodeObj[keyCode]
        } else if (shiftKey) {
          setCutCode = 'Shift + ' + this.keyCodeObj[keyCode]
        } else {
          setCutCode = this.keyCodeObj[keyCode]
        }
        this.setCutCode = setCutCode
      }
    },
    confirm () {
      localStorage.setItem('CUTCODE', this.setCutCode)
      this.callBack && this.callBack(this.setCutCode)
      if (config.environment !== 'web') {
        // 通知主进程注册事件
        const ipcRenderer = require('electron').ipcRenderer
        ipcRenderer.send('registerShortcut', this.setCutCode)
      } else {
        // 设置截屏快捷键
        let isCtrl = false
        let isShift = false
        let isAlt = true
        let virtualKey = 'A'
        let cutCode = this.setCutCode.replace(/\s+/g, '') // 去除所有空格
        let codeArr = cutCode.split('+')
        if (codeArr.indexOf('Shift') > -1) {
          isShift = true
        } else {
          isShift = false
        }
        if (codeArr.indexOf('Ctrl') > -1) {
          isCtrl = true
        } else {
          isCtrl = false
        }
        if (codeArr.indexOf('Alt') > -1) {
          isAlt = true
        } else {
          isAlt = false
        }
        virtualKey = codeArr[codeArr.length - 1]
        NativeLogic.native.setCaptureHotkey(isCtrl, isShift, isAlt, virtualKey).then(res => {
        }).catch(() => {
          this.$store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: '截屏快捷键与其他软件冲突，请重新设置！'
          })
        })
      }
      this.closeModal()
    }
  }
}
</script>

<style scoped>
  .m-gen-set-con {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 890;
  }

  .m-gen-set-con .m-gen-set-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }

  .m-gen-set-con .set-q-modal {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 51;
    width:304px;
    height:170px;
    background:rgba(255,255,255,1);
    box-shadow:0px 5px 10px 0px rgba(0,0,0,0.1);
    border-radius:1px;
    border:1px solid rgba(229,229,229,1);
    padding: 10px 15px;
    box-sizing: border-box;
  }

  .m-gen-set-con .set-q-modal .modal-foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .m-gen-set-con .set-q-modal .modal-foot > span {
    display: flex;
    align-items: center;
    justify-content: center;
    width:77px;
    height:29px;
    background:rgba(242,242,242,1);
    border-radius:2px;
    cursor: pointer;
    transition: all .2s linear;
    margin-left: 10px;
  }
  .m-gen-set-con .set-q-modal .modal-foot > span:hover {
    background:rgb(235, 228, 228);
  }

  .m-gen-set-con .set-q-modal .modal-input {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    outline: 0;
  }
</style>

