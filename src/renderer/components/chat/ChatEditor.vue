<template>
  <div class="m-chat-editor">
    <div class="u-editor-contants" v-if="showAtList && members.length !== 0" ref="atList" :style="{left: atListPos.left + 'px', top: atListPos.top + 'px', height: members.length * 24 + 'px', maxHeight: '160px' }" >
      <div v-for="(member, index) in members" :key="index" v-if="member.account !== $store.state.userUID" :class="index === atListIndex ? 'z-sel' : ''" @mouseenter="changeAtListIndex(index)" @click.stop="selectAtItem">
        <span>{{member.alias}}</span>
      </div>
    </div>
    <chat-emoji
      v-bind:type="type"
      v-bind:scene="scene"
      v-bind:to="to"
      v-show="isEmojiShown"
      v-on:add-emoji="addEmoji"
      v-on:hide-emoji="hideEmoji"
    ></chat-emoji>
    <div class="m-chat-editor-main">
      <span id="span" style="position: fixed;left: -20px;top: -20px;font-size: 14px;"></span>
      <div class="u-editor-input">
        <div class="u-editor-body" @mouseup="showPaste" contenteditable="false">
          <div class="u-editor-paste-btn" v-if="showPasteBtn" :style="{left: pasteLeft + 'px', top: pasteTop + 'px'}" @click="onPaste($event, 'click')" >粘贴</div>
          <!-- <input type="text" class="u-editor-at" :style="{left: inputPos.left + 'px', top: inputPos.top + 'px'}" v-model="inAtText" ref="atInput" @input="changeAtText($event)" /> -->
          <div
            @selectstart="preventDefault($event)"
            contenteditable="true"
            @keydown="inputMsg($event)"
            @input="changeMsg($event)"
            ref="editDiv"
            class="edit-div"
            @paste="onPaste($event)"
            @click="changeEditRange($event)"
            @keyup="changeEditRange"
            @drop="onDragFile($event, 'drop')"
            @dragenter="onDragFile($event, 'dragenter')"
            @dragover="onDragFile($event, 'dragover')"
          />
        </div>
      </div>
      <div class="u-editor-icons">
        <div style="display: flex, flex-direction: row, align-items: center, ">
          <!-- 表情 -->
          <div v-if="!isRobot" class="u-editor-icon" @click.stop="showEmoji">
            <a class="b-common b-emoji"/>
          </div>
          <!-- 截图 -->
          <div v-if="!isRobot" class="u-editor-icon" @click="screenShot">
            <a class="b-common b-screenshot"/>
          </div>
          <!-- 图片 -->
          <div v-if="!isRobot" class="u-editor-icon" @click="createInput" style="cursor: pointer">
            <!-- <i class="u-icon-img">
              <img :src="icon2"/>
            </i> -->
            <a class="b-common b-image" style="cursor: pointer;">
            </a>
          </div>
          <!-- 文件 -->
          <div v-if="!isRobot" class="u-editor-icon" @click="handleClickOpenIp" >
            <a class="b-common b-file"/>
            <input type="file" @change="onSendFlie($event)" style="display: none;" ref="fileIp" />
          </div>
          <!-- 远程协助 -->
          <!-- <div v-if="!isRobot" class="u-editor-icon" @click.stop="showEmoji">
            <a class="b-common b-remote"/>
          </div> -->
        </div>
        <!-- 短信发送 -->
        <div
          v-if="!isRobot"
          style="padding-right: 50px;paddingTop: 7px;"
          @click.stop="isMsg = !isMsg"
          @mouseover="showPrompt = true"
          @mouseout="showPrompt = false"
        >
          <a :class="isMsg ? 'b-common b-message-active' : 'b-common b-message'" style="width: 22px ; height: 20px"/>
        </div>

        <!-- 短信发送鼠标悬停时，显示的提示框 -->
        <transition name="fade">
          <div v-if="showPrompt"
               class="prompt"
          >
            <div class="triangle_border_down"></div>
            用短信发送
          </div>
        </transition>
      </div>

      <div  class="u-positive-btn btn-send-box">
        <a @click.stop="sendBlendMsg" class="btn-send">发送</a>
        <div class="btn-send-quickSet noevent" @click.stop="showQuickSet = true">
          <a class="quick-send noevent"></a>
        </div>

        <!-- 发送快捷键选择弹框 -->
        <transition name="fade">
          <ul v-if="showQuickSet" class="quick-set-modal" v-clickoutside="closeQuickSet">
            <li :class="quickIndex === $index ? 'modal-content-sel' : 'modal-content'" v-for="(item, $index) in quickSetList" :key="$index" @click.stop="chooseQuickSet($index)">
              <div :class="quickIndex === $index ? 'selected-style': 'noselected-style'"/>
              <span>{{item.name}}</span>
            </li>
          </ul>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
  import ChatEmoji from './ChatEmoji'
  import config from '../../configs'
  import emojiObj from '../../configs/emoji'
  import { getPinyin } from '../../utils/pinyin'
  import util from '../../utils'
  import getFile from '../../utils/getFile'
  import pageUtil from '../../utils/page'
  import clickoutside from '../../utils/clickoutside.js'
  import NativeLogic from '../../utils/nativeLogic.js'
  export default {
    directives: {clickoutside},
    components: {
      ChatEmoji
    },
    updated () {
      window.document.body.addEventListener('click', () => {
        this.isEmojiShown = false
        this.showPasteBtn = false
        this.resetAtInfo()
      })
    },
    props: {
      type: String,
      scene: String,
      to: String,
      isRobot: {
        type: Boolean,
        default () {
          return false
        }
      },
      invalid: {
        type: Boolean,
        default: false
      },
      invalidHint: {
        type: String,
        default: '您无权限发送消息'
      },
      advancedTeam: {
        type: Boolean,
        default: false
      },
      teamId: String,
      teamInfo: {
        type: Object,
        default () {
          return {}
        }
      },
      userInfos: {
        type: Object,
        default () {
          return {}
        }
      }
    },
    mounted () {
      if (config.environment === 'web') { // web分支
        // let code = NativeLogic.native.screenShot()
        // if (Number(code) === 200) {
        //   this.onPaste()
        // }
      } else { // electron分支
        let { ipcRenderer } = require('electron')
        ipcRenderer.on('screenShotCb', (evt, arg) => {
          if (arg.isChange === 2) {
            this.onPaste()
          }
        })
      }
    },
    watch: {
      continueRobotAccid (curVal, oldVal) {
        if (curVal && this.robotInfos[curVal]) {
          this.msgToSent = `@${this.robotInfos[curVal].nick} `
        }
        // 重置
        this.$store.dispatch('continueRobotMsg', '')
      },
      msgToSent (curVal, oldVal) {
        if (this.isRobot) {
          return
        }
        let indexAt = this.msgToSent.indexOf('@')
        if (indexAt >= 0 && (indexAt === this.msgToSent.length - 1)) {
          if (this.robotslist && this.robotslist.length > 0) {
            this.isRobotListShown = true
          }
        } else if (this.isRobotListShown === true) {
          this.isRobotListShown = false
        }
      },
      $route () {
        this.$refs.editDiv.innerHTML = ''
        this.isMsg = false
      }
    },
    data () {
      return {
        quickSetList: [{name: '按Enter键发送消息'}, {name: '按Ctrl+Enter键发送消息'}],
        showQuickSet: false,
        quickIndex: localStorage.QUICKSET ? JSON.parse(localStorage.QUICKSET) : 0,
        showPrompt: false,
        isMsg: false,
        isEmojiShown: false,
        isRobotListShown: false,
        icon1: `${config.resourceUrl}/im/chat-editor-1.png`,
        icon2: `${config.resourceUrl}/im/chat-editor-2.png`,
        icon3: `${config.resourceUrl}/im/chat-editor-3.png`,
        lastEditRange: null,
        msgFileObj: {},
        showPasteBtn: false,
        pasteLeft: -1,
        pasteTop: -1,
        inputIndex: 0,
        showAtList: false,
        atListPos: {
          left: 0,
          top: 0
        },
        members: [],
        inAtText: '',
        atDelText: '',
        atListIndex: 0,
        atStartOffset: 0,
        atRange: null,
        atAccounts: [],
        rangeInfo: null
      }
    },
    computed: {
      continueRobotAccid () {
        return this.$store.state.continueRobotAccid
      },
      robotslist () {
        return this.$store.state.robotslist
      },
      robotInfos () {
        return this.$store.state.robotInfos
      },
      robotInfosByNick () {
        return this.$store.state.robotInfosByNick
      }
    },
    methods: {
      // 文件发送
      onSendFlie (e) {
        if (e.target.files[0].size > 100 * 1024 * 1024) {
          this.$store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: '文件不能大于100M'
          })
          e.target.value = ''
          return
        }
        this.$store.dispatch('sendFileMsg', {scene: this.scene, to: this.to, file: e.target.files[0]})
          .then(() => {
            e.target.value = ''
          })
      },
      handleClickOpenIp () {
        this.$refs.fileIp.click()
      },
      // 文件、图片拖拽上传
      async onDragFile (e, key) {
        e.stopPropagation()
        e.preventDefault()
        if (key === 'drop') {
          const file = e.dataTransfer.files[0]
          if (file.type.indexOf('image') > -1) {
            const newFile = await getFile(file.path)
            this.sendImgMsg(newFile)
          } else {
            if (file.size > 100 * 1024 * 1024) {
              this.$store.commit('toastConfig', {
                show: true,
                type: 'fail',
                toastText: '文件不能大于100M'
              })
              return
            }
            this.$store.dispatch('sendFileMsg', {scene: this.scene, to: this.to, file})
          }
        }
      },
      closeQuickSet (el, e) {
        let className = e.target.className
        if (className.indexOf('noevent') > -1) return
        this.showQuickSet = false
      },
      chooseQuickSet (index) {
        this.showQuickSet = false
        this.quickIndex = index
        localStorage.setItem('QUICKSET', this.quickIndex)
      },
      createInput () {
        let input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/gif, image/jpeg, image/png, image/bmp, image/jpg'
        input.id = `input${this.inputIndex++}`
        input.click()
        input.onchange = () => {
          this.sendImgMsg(input.files[0])
          this.$refs.editDiv.focus()
          setTimeout(() => {
            this.$refs.editDiv.scrollTop = this.$refs.editDiv.scrollHeight
          }, 0)
        }
      },
      screenShot () {
        if (config.environment === 'web') { // web分支
          NativeLogic.native.screenShot()
          // if (Number(code) === 200) {
          //   this.onPaste()
          // }
        } else { // electron分支
          let { ipcRenderer } = require('electron')
          ipcRenderer.on('screenShotCb', (evt, arg) => {
            if (arg.isChange === 2) {
              this.onPaste()
            }
          })
        }
      },
      preventDefault (e) {
        e.stopPropagation()
      },
      // 右键粘贴
      showPaste (e) {
        if (e.button === 2 && config.environment !== 'web') {
          e.preventDefault()
          this.showPasteBtn = true
          this.pasteLeft = e.offsetX
          this.pasteTop = e.offsetY
        }
      },
      // 更改光标
      changeEditRange (e) {
        let selection = getSelection()
        // 设置最后光标对象
        this.lastEditRange = selection.getRangeAt(0)
      },
      // 设置光标位置
      setEditRange () {
        let selection = getSelection()
        if (this.lastEditRange) {
          // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
          selection.removeAllRanges()
          selection.addRange(this.lastEditRange)
        } else {
          // 创建range
          var range = window.getSelection()
          // range 选择obj下所有子内容
          range && range.selectAllChildren(this.$refs.editDiv)
          // 光标移至最后
          range && range.collapseToEnd()
        }
      },
      // 粘贴事件
      async onPaste (e) {
        e && e.preventDefault()
        let text = null
        let file = null
        if (config.environment === 'web') {
          for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
            var item = e.clipboardData.items[i]
            if (item.kind === 'string') {
              item.getAsString(function (str) {
                // str 是获取到的字符串
                text = str
              })
            } else if (item.kind === 'file') {
              var pasteFile = item.getAsFile()
              file = new File([pasteFile], 'image.png', {type: 'image/png'})
            }
          }
        } else {
          const { clipboard } = require('electron')
          if (clipboard.readText() && !clipboard.read('public.file-url')) {
            text = clipboard.readText()
          } else if (clipboard.read('FileNameW') || clipboard.read('public.file-url')) {
            let filePath = ''
            if (clipboard.read('FileNameW')) {
              // 通过electron获取文件夹复制的文件
              let rawFilePath = clipboard.readBuffer('FileNameW').toString('ucs2')
              filePath = rawFilePath.replace(new RegExp(String.fromCharCode(0), 'g'), '')
            } else {
              filePath = clipboard.read('public.file-url').replace('file://', '')
            }
            try {
              file = await getFile(filePath)
            } catch (err) {}
          } else if (clipboard.readImage()) {
            let nativeImage = clipboard.readImage()
            let base64Str = nativeImage.toDataURL()
            let arr = base64Str.split(',')
            let mime = arr[0].match(/:(.*?);/)[1]
            let bstr = atob(arr[1])
            let n = bstr.length
            let u8arr = new Uint8Array(n)
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n)
            }
            file = new File([u8arr], 'image.png', {type: mime})
            file.base64Str = base64Str
            let image = new Image()
            image.onload = () => {
              file.w = image.width
              file.h = image.height
            }
            image.src = base64Str
          } else if (e && e.clipboardData && e.clipboardData.items) {
            for (let i = 0, len = e.clipboardData.items.length; i < len; i++) {
              let item = e.clipboardData.items[i]
              if (item.kind === 'file') {
                file = item.getAsFile()
              } else {
                console.log('粘贴的不是文件')
              }
            }
          }
        }
        if (text) {
          // 粘贴文字
          // 得到剪贴板中的文本
          let showText = ''
          if (text.length + this.msgTransform().textLen > 5000) {
            showText = text.slice(0, 5000 - this.msgTransform().textLen)
          } else {
            showText = text
          }
          let emojiItems = showText.match(/\[[\u4e00-\u9fa5]+\]/g)
          let copyText = showText
          let emojiCnt = emojiObj.emojiList.emoji
          if (emojiItems && emojiItems.length > 0) {
            emojiItems.forEach((item) => {
              let index = copyText.indexOf(item)
              if (index !== 0) {
                document.execCommand('insertText', false, copyText.slice(0, index))
              }
              if (emojiCnt[item]) {
                let dataKey = item.slice(1, -1)
                let emoji = `<img class="emoji-small" style="width: 24px;height: 24px;vertical-align: middle;" data-key="${dataKey}" src="${emojiCnt[item].img}">`
                document.execCommand('insertHTML', false, emoji)
              } else {
                document.execCommand('insertText', false, item)
              }
              copyText = copyText.slice(index + item.length)
            })
          }
          if (copyText) {
            document.execCommand('insertText', false, copyText)
          }
        } else if (file && file.type.match('^image/')) {
          // 图片粘贴
          this.sendImgMsg(file)
        }
      },
      inputMsg (e) {
        if (this.showAtList && this.members.length !== 0) {
          switch (e.keyCode) {
            case 13: // 回车选中at列表
              e.preventDefault()
              this.selectAtItem()
              break
            case 38: // 上方向键
              e.preventDefault()
              if (this.atListIndex > 0) {
                this.atListIndex--
                this.$refs.atList.scrollTop -= this.atListIndex === 0 ? 27 : 24
              }
              break
            case 40: // 下方向键
              e.preventDefault()
              if (this.atListIndex < (this.members.length - 1)) {
                this.atListIndex++
                this.$refs.atList.scrollTop += this.atListIndex === 1 ? 27 : 24
              }
              break
          }
        } else if (this.quickIndex === 0 && !e.ctrlKey && e.keyCode === 13) {
          // 回车发送消息
          e.preventDefault()
          this.sendBlendMsg()
        } else if (this.quickIndex === 1 && e.ctrlKey && e.keyCode === 13) {
          // ctrl+回车发送消息
          e.preventDefault()
          this.sendBlendMsg()
        } else if (this.quickIndex === 0 && e.ctrlKey && e.keyCode === 13) {
          // ctrl + enter换行
          const newlineType = this.manageNewLine()
          if (newlineType === 1) {
            document.execCommand('insertHTML', false, '<br /><br />')
          } else {
            document.execCommand('insertHTML', false, '<br />')
          }
          this.changeEditRange()
        }
      },
      // 换行处理
      manageNewLine () {
        const containerNode = this.lastEditRange.commonAncestorContainer
        const brNodes = [...containerNode.childNodes].filter(item => {
          return item.tagName === 'BR'
        })
        const nodeLength = brNodes.length === 0 ? containerNode.childNodes.length : containerNode.childNodes.length - 1
        if (containerNode.nodeType === 3) {
          const curIndex = [...this.$refs.editDiv.childNodes].findIndex(item => {
            return item === containerNode
          })
          const hasBr = this.$refs.editDiv.childNodes[curIndex + 1] && this.$refs.editDiv.childNodes[curIndex + 1].tagName === 'BR'
          if (this.lastEditRange.endOffset === containerNode.length && !hasBr) {
            return 1
          } else {
            return 2
          }
        } else if (containerNode === this.$refs.editDiv) {
          if (this.lastEditRange.endOffset === nodeLength) {
            return 1
          } else {
            return 2
          }
        }
      },
      selectAtItem () {
        let start = this.atStartOffset - 1
        let end = this.atStartOffset + this.inAtText.length
        let acAtName = this.members[this.atListIndex].showAlias
        let dataAt = this.members[this.atListIndex].account
        if (dataAt === '@') {
          acAtName = '所有人'
        }
        let calcSpan = document.getElementById('span')
        let oldWidth = calcSpan.offsetWidth
        calcSpan.innerText = '@' + acAtName + ' '
        let width = calcSpan.offsetWidth - oldWidth
        let key = '@' + acAtName + ' '
        this.insertHtmlAtCaret(`<input type="text" readonly value="@${acAtName} " style="border: none;font-size: 14px;width: ${width + 5}px;margin-top: -8px;font-family: 'PingFangSC', 'Microsoft YaHei', 'Helvetica Neue', 'Helvetica, Arial', 'sans-serif';" data-at=${dataAt} />`, start, end)
        this.atAccounts[this.atAccounts.length] = {
          [key]: this.members[this.atListIndex].showAlias
        }
        calcSpan.innerText = ''
        this.changeEditRange()
        this.resetAtInfo()
      },
      getOffset (node, offset) {
        let length = 0
        if (node.nodeType === 3) {
          length = node.length
        } else {
          length = node.textContent.length
        }
        if (offset >= length) {
          offset = length - 1
        }
        return offset < 0 ? 0 : offset
      },
      // 键盘输入
      changeMsg (e) {
        if (this.msgTransform().textLen > 5000 && e.data && e.data.indexOf('\'') === -1) {
          let selection = window.getSelection()
          let lastRange = selection.getRangeAt(0)
          let range = document.createRange()
          let start = lastRange.startOffset + 5000 - this.msgTransform().textLen
          range.setStart(selection.anchorNode, start < 0 ? 0 : start)
          range.setEnd(selection.focusNode, lastRange.startOffset)
          selection.removeAllRanges()
          selection.addRange(range)
          document.execCommand('forwardDelete')
          range.setEnd(selection.anchorNode, start)
          selection.removeAllRanges()
          selection.addRange(range)
          return false
        }
        if ((e.data === '@' || this.showAtList) && this.scene === 'team') {
          let textComputed = () => {
            if (e.data === '@') {
              // 根据光标位置获取@后面字符串
              if (this.showAtList) {
                this.inAtText += '@'
                return
              }
              this.inAtText = ''
              let sel = window.getSelection()
              let range = sel.getRangeAt(0)
              this.anchorNode = sel.anchorNode // 光标所在的开始节点
              this.focusNode = sel.focusNode // 光标所在的结束节点
              let allText = this.getNodeData(this.anchorNode)
              this.atRange = range
              this.atStartOffset = range.startOffset
              this.atDelText = allText ? allText.slice(range.startOffset) : ''
            } else {
              let lastText = this.getNodeData(this.anchorNode).slice(this.atStartOffset)
              this.inAtText = lastText.replace(this.atDelText, '')
            }
          }
          textComputed()
          let memList = this.resetMemberList()
          if ((!memList || memList.length === 0) && e.data === '@') {
            // 重新进入@流程
            this.resetAtInfo()
            textComputed()
            this.resetMemberList()
          } else if (e.data !== '@') {
            let allText = this.getNodeData(this.anchorNode)
            if (allText.length < this.atStartOffset || allText.charAt(this.atStartOffset - 1) !== '@') {
              this.resetAtInfo()
            }
          }
          let rangePos = this.getRangeOffset()
          let _rangePos = JSON.stringify(rangePos)
          let pos = this.getAListPos(JSON.parse(_rangePos))
          this.atListPos = {
            left: pos.left,
            top: pos.top + pos.height
          }
          this.showAtList = true
          this.inputPos = {
            left: rangePos.left,
            top: rangePos.top - 4
          }
        }
      },
      getNodeData (node) {
        if (node.data) {
          return node.data
        } else if (node.innerHTML) {
          return node.innerHTML
        } else if (node.innerText) {
          return node.innerText
        } else {
          return ''
        }
      },
      // 更改atList 当前选中项
      changeAtListIndex (index) {
        this.atListIndex = index
      },
      // 获取at列表定位
      getAListPos (obj) {
        let pos = obj
        let listH = this.members.length * 24 + 16 > 160 ? 160 : this.members.length * 24 + 16
        pos.top = obj.top - listH - obj.height - obj.height
        if (pos.top + pos.height + listH > document.body.clientHeight) {
          pos.top = document.body.clientHeight - listH - obj.height - 40
        }
        return pos
      },
      // 图文混合消息发送拆分
      async sendBlendMsg () {
        if (this.scene === 'team' && !this.teamInfo.valid) return
        let msgToSent = this.getEditText(this.$refs.editDiv)
        let imgExcess = false
        let imgCount = msgToSent.filter((item) => {
          if (item && item.size) {
            if (item.size > 5 * 1024 * 1024) {
              imgExcess = true
            }
            return item
          }
        })
        if (imgExcess) {
          this.$store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: '图片大小已超过5M'
          })
          return
        }
        if (imgCount.length > 20) {
          this.$store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: '最多只能发送20张图片'
          })
          return
        }
        this.$refs.editDiv.innerHTML = ''
        pageUtil.scrollChatListDown()
        for (let i = 0; i < msgToSent.length; i++) {
          let item = msgToSent[i]
          try {
            if (!item.size) {
              let text = item.text.trim()
              let dataAt = item.atInfo
              if (text) {
                await this.sendTextMsg(text, dataAt)
              }
            } else if (item.type && item.type.match('^image/')) {
              await this.sendFileMsg(item)
            }
          } catch (err) {}
        }
        this.isMsg = false
        this.eventBus.$emit('toggleSession')
      },
      // 获取编辑器信息
      getEditText (dom, msgToSent = []) {
        let i = msgToSent.length - 1 >= 0 ? msgToSent.length - 1 : 0
        if (msgToSent.length !== 0 && msgToSent[i] && msgToSent[i].text) {
          msgToSent[i].text += '\r\n'
        }
        let childNodes = [...(dom.childNodes)] // dom节点不是真正的数组，不能用forEach,需转化为数组
        childNodes.forEach((item, index) => {
          if (item.nodeType === 3) {
            if (msgToSent[i]) {
              if (msgToSent[i].size) {
                msgToSent[++i] = {}
                msgToSent[i].text = item.data
              } else {
                msgToSent[i].text += item.data
              }
            } else {
              msgToSent[i] = {}
              msgToSent[i].text = item.data
            }
          } else if (item.nodeType === 1) {
            if (item.outerHTML === '<div><br></div>' || item.tagName === 'BR') {
              if (!msgToSent[i]) {
                msgToSent[i] = {}
                msgToSent[i].text = '\r\n'
              } else {
                msgToSent[i].text += '\r\n'
              }
            } else if (item.tagName === 'INPUT') {
              if (msgToSent[i]) {
                msgToSent[i].text += item.value
                if (!msgToSent[i].atInfo) {
                  msgToSent[i].atInfo = item.getAttribute('data-at')
                } else {
                  msgToSent[i].atInfo += '&&' + item.getAttribute('data-at')
                }
              } else {
                msgToSent[i] = {}
                msgToSent[i].text = item.value
                if (!msgToSent[i].atInfo) {
                  msgToSent[i].atInfo = item.getAttribute('data-at')
                } else {
                  msgToSent[i].atInfo += '&&' + item.getAttribute('data-at')
                }
              }
            } else if (item.tagName === 'IMG') {
              let dataKey = item.getAttribute('data-key')
              if (dataKey) { // 表情图片
                if (msgToSent[i]) {
                  msgToSent[i].text += '[' + dataKey + ']'
                } else {
                  msgToSent[i] = {}
                  msgToSent[i].text = '[' + dataKey + ']'
                }
              } else {
                let dataObj = item.getAttribute('data-obj').slice(1, -1)
                if (msgToSent[i]) {
                  msgToSent[++i] = this.msgFileObj[dataObj]
                  i++
                } else {
                  msgToSent[i] = this.msgFileObj[dataObj]
                  i++
                }
              }
            } else if (item.tagName === 'DIV') {
              return this.getEditText(item, msgToSent)
            }
          }
        })
        return msgToSent
      },
      // 发送文本消息
      sendTextMsg (text, dataAt) {
        if (this.invalid) {
          this.$toast(this.invalidHint)
          return
        }
        text = text.trim()
        return new Promise((resolve, reject) => {
          if (this.type === 'session') {
            // 如果是机器人
            if (this.isRobot) {
              this.$store.dispatch('sendRobotMsg', {
                type: 'text',
                scene: this.scene,
                to: this.to,
                robotAccid: this.to,
                // 机器人后台消息
                content: text,
                // 显示的文本消息
                body: text
              })
            } else {
              let robotAccid = ''
              let robotText = ''
              let atUsers = text.match(/@[^\s@$]+/g)
              if (atUsers) {
                for (let i = 0; i < atUsers.length; i++) {
                  let item = atUsers[i].replace('@', '')
                  if (this.robotInfosByNick[item]) {
                    robotAccid = this.robotInfosByNick[item].account
                    robotText = (text + '').replace(atUsers[i], '').trim()
                    break
                  }
                }
              }
              if (robotAccid) {
                if (robotText) {
                  this.$store.dispatch('sendRobotMsg', {
                    type: 'text',
                    scene: this.scene,
                    to: this.to,
                    robotAccid,
                    // 机器人后台消息
                    content: robotText,
                    // 显示的文本消息
                    body: text
                  })
                } else {
                  this.$store.dispatch('sendRobotMsg', {
                    type: 'welcome',
                    scene: this.scene,
                    to: this.to,
                    robotAccid,
                    // 显示的文本消息
                    body: text
                  })
                }
              } else {
                this.$store.dispatch('sendMsg', {
                  type: 'text',
                  scene: this.scene,
                  to: this.to,
                  text: text,
                  dataAt,
                  needMsgReceipt: this.scene === 'team',
                  custom: {isSmsMsg: this.isMsg}
                }).then(() => {
                  resolve()
                }).catch(() => {})
              }
            }
          } else if (this.type === 'chatroom') {
            let robotAccid = ''
            let robotText = ''
            let atUsers = text.match(/@[^\s@$]+/g)
            if (atUsers) {
              for (let i = 0; i < atUsers.length; i++) {
                let item = atUsers[i].replace('@', '')
                if (this.robotInfosByNick[item]) {
                  robotAccid = this.robotInfosByNick[item].account
                  robotText = (text + '').replace(atUsers[i], '').trim()
                  break
                }
              }
            }
            if (robotAccid) {
              if (robotText) {
                this.$store.dispatch('sendChatroomRobotMsg', {
                  type: 'text',
                  robotAccid,
                  // 机器人后台消息
                  content: robotText,
                  // 显示的文本消息
                  body: text
                })
              } else {
                this.$store.dispatch('sendChatroomRobotMsg', {
                  type: 'welcome',
                  robotAccid,
                  // 显示的文本消息
                  body: text
                })
              }
            } else {
              this.$store.dispatch('sendChatroomMsg', {
                type: 'text',
                text: text
              })
            }
          }
        })
      },
      sendPlayMsg () {
        if (this.invalid) {
          this.$toast(this.invalidHint)
          return
        }
        // 发送猜拳消息
        if (this.type === 'session') {
          this.$store.dispatch('sendMsg', {
            type: 'custom',
            scene: this.scene,
            to: this.to,
            pushContent: '[猜拳]',
            content: {
              type: 1,
              data: {
                value: Math.ceil(Math.random() * 3)
              }
            }
          })
        } else if (this.type === 'chatroom') {
          this.$store.dispatch('sendChatroomMsg', {
            type: 'custom',
            pushContent: '[猜拳]',
            content: {
              type: 1,
              data: {
                value: Math.ceil(Math.random() * 3)
              }
            }
          })
        }
      },
      // 预览图片
      sendImgMsg (imageFile) {
        if (this.invalid) {
          this.$toast(this.invalidHint)
          return
        }
        if (imageFile.name) {
          if (!/\.(png|jpg|bmp|jpeg|gif)$/i.test(imageFile.name)) {
            return
          }
          if (imageFile.size > 5 * 1024 * 1024) {
            this.$store.commit('toastConfig', {
              show: true,
              type: 'fail',
              toastText: '图片不能大于5M'
            })
            return
          }
          this.setEditRange()
          this.$store.dispatch('showLoading')
          let reader = new FileReader()
          reader.onload = (event) => {
            // event.target.result 即为图片的Base64编码字符串
            let base64Str = event.target.result
            let key = util.uuid()
            imageFile.base64Str = base64Str
            this.msgFileObj[key] = imageFile
            let image = new Image()
            image.onload = () => {
              this.msgFileObj[key].w = image.width
              this.msgFileObj[key].h = image.height
            }
            image.src = base64Str
            document.execCommand('insertHTML', false, `<img data-obj="[${key}]" src="${base64Str}" style="max-width: 300px;max-height: 300px;margin-right: 10px;"/>`)
            this.changeEditRange()
            setTimeout(() => {
              if (this.$refs.editDiv) {
                this.$refs.editDiv.scrollTop = this.$refs.editDiv.scrollHeight
              }
            }, 0)
          }
          reader.readAsDataURL(imageFile)
        }
      },
      // 发送文件
      sendFileMsg (imageFile) {
        if (this.invalid) {
          this.$toast(this.invalidHint)
          return
        }
        return new Promise((resolve, reject) => {
          if (this.type === 'session') {
            this.$store.dispatch('sendImgMsg', {
              scene: this.scene,
              to: this.to,
              imageFile
            }).then(() => {
              resolve()
            }).catch(() => {})
          } else if (this.type === 'chatroom') {
            this.$store.dispatch('sendChatroomFileMsg', {
              imageFile
            })
          }
        })
      },
      showEmoji () {
        this.isEmojiShown = true
      },
      hideEmoji () {
        this.isEmojiShown = false
      },
      addEmoji (emoji) {
        const oldTop = this.$refs.editDiv.scrollTop
        this.setEditRange()
        if ((5000 - this.msgTransform().textLen) >= emoji.key.length || this.getSelectedText().length >= emoji.key.length) {
          let dataKey = emoji.key.slice(1, -1)
          document.execCommand('insertHTML', false, `<img style="width: 24px;height: 24px;vertical-align: middle;" data-key="${dataKey}" src="${emoji.img}" />`)
        }
        this.hideEmoji()
        this.changeEditRange()
        this.$refs.editDiv.scrollTop = oldTop
      },
      chooseRobot (robot) {
        if (robot && robot.account) {
          let len = this.msgToSent.length
          if (len === 0 || this.msgToSent[len - 1] !== '@') {
            this.msgToSent += '@' + robot.nick + ' '
          } else {
            this.msgToSent += robot.nick + ' '
          }
        }
      },
      hideRobotList () {
        this.isRobotListShown = false
      },
      turnToMsgReceipt () {
        if (this.invalid) {
          this.$toast(this.invalidHint)
          return
        }
        this.location = `#/teamSendMsgReceipt/${this.to}`
      },
      msgTransform () {
        let msgText = ''
        let msgImg = 0
        let childNodes = [...(this.$refs.editDiv.childNodes)]
        // let nodes = this.$refs.editDiv.childNodes
        // for(let i = 0; i < nodes.length; i++) {
        //   if (nodes[i].nodeType === 3) {
        //     msgText += nodes[i].data
        //   } else if (nodes[i].nodeType === 1) {
        //     if (nodes[i].outerHTML === '<div><br></div>') {
        //       msgText += '\r\n'
        //     } else if (nodes[i].tagName === 'IMG') {
        //       if (nodes[i].getAttribute('data-key')) {
        //         msgText += nodes[i].getAttribute('data-key')
        //       }
        //       if (nodes[i].getAttribute('data-obj')) {
        //         msgImg++
        //       }
        //     } else if (nodes[i].tagName === 'DIV') {
        //       msgText += '\r\n' + nodes[i].innerText
        //     }
        //   }
        // }
        childNodes.forEach((item, index) => {
          if (item.nodeType === 3) {
            msgText += item.data
          } else if (item.nodeType === 1) {
            if (item.outerHTML === '<div><br></div>') {
              msgText += '\r\n'
            } else if (item.tagName === 'IMG') {
              if (item.getAttribute('data-key')) {
                msgText += item.getAttribute('data-key')
              }
              if (item.getAttribute('data-obj')) {
                msgImg++
              }
            } else if (item.tagName === 'DIV') {
              msgText += '\r\n' + item.innerText
            }
          }
        })
        return {
          textLen: msgText.length,
          imgLen: msgImg
        }
      },
      // 获取选中
      getSelectedText () {
        if (window.getSelection) {
          return window.getSelection().toString()
        } else if (document.getSelection) {
          return document.getSelection()
        } else if (document.selection) {
          return document.selection.createRange().text
        } else {
          return ''
        }
      },
      insertHtmlAtCaret (html, start, end) {
        var sel, range
        if (window.getSelection) {
          // IE9 and non-IE
          sel = window.getSelection()
          // var div = document.getElementById('div')
          if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0)
            range.setStart(this.anchorNode, start)
            range.setEnd(this.focusNode, end)
            range.deleteContents()
            var el = document.createElement('div')
            el.innerHTML = html
            var node = el.firstChild
            range.surroundContents(node)
            // Preserve the selection
            if (node) {
              range = range.cloneRange()
              range.setStartAfter(node)
              range.collapse(true)
              sel.removeAllRanges()
              sel.addRange(range)
            }
          }
        } else if (document.selection && document.selection.type !== 'Control') {
          // IE < 9
          document.selection.createRange().pasteHTML(html)
        }
      },
      // 获取光标位置
      getRangeOffset () {
        let range = window.getSelection().getRangeAt(0)
        let offset
        if (range.endOffset - 1 > 0) {
          let clonedRange = range.cloneRange()
          clonedRange.setStart(range.endContainer, range.endOffset - 1)
          clonedRange.setEnd(range.endContainer, range.endOffset)
          let rect = clonedRange.getBoundingClientRect()
          offset = {
            height: rect.height,
            left: rect.left + rect.width,
            top: rect.top
          }
          clonedRange.detach()
        } else {
          let clonedRange = range.cloneRange()
          let shadowCaret = document.createTextNode('|')
          clonedRange.insertNode(shadowCaret)
          clonedRange.selectNode(shadowCaret)
          let rect = clonedRange.getBoundingClientRect()
          offset = {
            height: rect.height,
            left: rect.left,
            top: rect.top
          }
          this.$refs.editDiv.removeChild(shadowCaret)
          clonedRange.detach()
        }
        return offset
      },
      getMemberList () {
        if (this.teamInfo) {
          let teamMembers = this.$store.state.teamMembers
          let members = teamMembers && teamMembers[this.teamId]
          if (members) {
            let resultMembers = members.filter(item => {
              if (item.account !== this.$store.state.userUID) {
                if (this.userInfos[item.account]) {
                  // 因群成员列表已经更新过userInfos了
                  let userInfo = this.userInfos[item.account]
                  item.nick = userInfo.nick
                  item.nickPy = getPinyin(item.nick, '')
                  item.alias = item.nickInTeam || userInfo.nick
                  item.showAlias = item.nickInTeam || item.nick
                }
                item.nickInTeam = item.nickInTeam ? item.nickInTeam : ''
                item.nickInTeamPy = item.nickInTeam ? getPinyin(item.nickInTeam, '') : ''
                let userInfo = this.userInfos[item.account]
                if (userInfo && userInfo.alias) {
                  item.alias = userInfo.alias
                  item.aliasPy = getPinyin(userInfo.alias, '')
                }
                item.allMatch = item.nick + item.nickPy + item.nickInTeam + item.nickInTeamPy + item.alias || '' + item.aliasPy || ''
                return item
              }
              return false
            })
            // resultMembers = listSort(resultMembers)
            resultMembers.unshift({
              alias: `所有人(${resultMembers.length})`,
              account: '@',
              allMatch: '所有人suoyouren'
            })
            this.members = resultMembers
            return resultMembers
          }
        } else return []
      },
      resetMemberList () {
        let allMembers = this.getMemberList()
        if (this.inAtText) {
          let lowerAtText = this.inAtText.toLowerCase()
          let curMembers = allMembers.filter((item, index) => {
            if (item.allMatch.indexOf(lowerAtText) !== -1) {
              return item
            }
          })
          this.members = curMembers
        } else {
          this.members = allMembers
        }
        this.atListIndex = 0
        return this.members
      },
      resetAtInfo () {
        this.atListPos = {}
        this.atDelText = ''
        this.atListIndex = 0
        this.inAtText = ''
        this.showAtList = false
        this.atStartOffset = 1
        this.atRange = null
        this.members = []
      }
    }
  }
</script>

<style scoped>
  .prompt {
    width: 76px;
    height: 25px;
    line-height: 25px;
    position: absolute;
    z-index: 1005;
    right: 25px;
    top: -25px;
    background: #fff;
    border: 1px solid #D9D9D9;
    border-radius: 2px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
    font-size: 12px;
    color: #888893;
    text-align: center;
  }
  .triangle_border_down{
    width:0;
    height:0;
    border-width: 6px 8px 0;
    border-style:solid;
    border-color:#fff transparent transparent;
    position: absolute;
    top: 25px;
    right: 28px;
  }
  .g-window .m-chat-editor {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: white;
  }
  /* 聊天按钮组件 */
  .g-window .m-chat-editor-main {
    position: relative;
    display: block;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  .g-window .m-chat-editor-main .u-editor-input {
    position: relative;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    margin: 2px;
    padding: 2.5rem 0.5rem 0.5rem 0.5rem;
    height: 100%;
    width: 100%;
  }

  .g-window .m-chat-editor-main .u-editor-input .edit-div {
    position: relative;
    left: 0;
    top: 0;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    border: none;
    cursor: text;
    font-size: 14px;
    color: rgba(6,6,6,1);
    height: 100%;
    width: 100%;
    word-break:break-all;
    line-height: 21px;
    text-align: left;
    resize:none;
    overflow-x:hidden;
    overflow-y:auto;
    outline: none;
  }
  .g-window .m-chat-editor-main .u-editor-input .edit-div div{
    width: auto;
  }
  .g-window .m-chat-editor-main .u-editor-input .edit-div img{
    float: left;
  }
  .g-window .m-chat-editor .u-editor-contants {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 75;
    padding: 8px 0;
    overflow-y: auto;
    max-height: 205px;
    width: 130px;
    background: #FDFDFD;
    border: 1px solid #BEBEBE;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.16);
    border-radius: 10px;
  }
  .g-window .m-chat-editor .u-editor-contants .z-sel{
    background: #e3e3e3;
  }
  .g-window .m-chat-editor .u-editor-contants span{
    display: block;
    transition: all .3s;
    width: 100%;
    height: 24px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space:nowrap;
    cursor: pointer;
    text-indent: 29px;
    line-height: 24px;
    font-size: 14px;
    color: #333333;
  }

  .g-window .m-chat-editor-main .u-editor-input .u-editor-paste-btn {
    position: absolute;
    z-index: 70;
    width: 88px;
    height: 30px;
    background: rgba(255,255,255,0.90);
    border: 1px solid #BEBEBE;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.16);
    border-radius: 10px;
    text-align: center;
    line-height: 30px;
    cursor: pointer;
    color: #333;
    font-size: 14px;
  }

  .g-window .m-chat-editor-main .u-editor-input .u-editor-at{
    position: fixed;
    opacity: 1;
    border: none;
    line-height: 26px;
    font-size: 14px;
  }

  .g-window .m-chat-editor-main .btn-send-box {
    position: absolute;
    float: right;
    right: 12px;
    bottom: 12px;
    width: 70px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    border-radius: 4px;
    background-color: #F2F2F2;
    transition: all .3s linear;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .g-window .m-chat-editor-main .btn-send {
    width: 50px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    color: #323232;
    font-size: 12px;
    transition: all .3s linear;
  }
  .btn-send-quickSet {
    width: 20px;
    height: 28px;
    line-height: 24px;
    text-align: center;
    transition: all .2s linear;
  }
  .btn-send-quickSet:hover {
    background-color: #E9E9E9;
  }
  .quick-send {
    display: inline-block;
    width: 10px;
    height: 6px;
    background: url('../../../../static/img/setting/dropdown.png') no-repeat center center;
    background-size: 100% 100%;
  }
  .g-window .m-chat-editor-main .btn-send:hover {
    background-color: #E9E9E9;
  }
  /* 发送快捷键选择弹框 */
  .quick-set-modal {
    position: absolute;
    float: right;
    right: 0px;
    bottom: 40px;
    background: #fff;
    z-index: 1005;
    width: 196px;
    height: 80px;
    padding: 12px 10px;
    box-sizing: border-box;
    border-radius: 4px;
    box-shadow: 0 4px 8px 4px rgba(0, 0, 0, 0.14);
  }
  .quick-set-modal .modal-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #333;
    font-size: 13px;
    transition: all .2s linear;
  }
  .quick-set-modal .modal-content-sel,.modal-content:hover {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 13px;
    color: #049AFF;
  }
  .quick-set-modal .selected-style {
    width: 15px;
    height: 12px;
    margin-right: 10px;
    background: url("../../../../static/img/edit/checked.png");
    background-size: 100% 100%
  }
  .quick-set-modal .noselected-style {
    width: 13px;
    height: 13px;
    margin-right: 10px;
  }
  .g-window .m-chat-editor-main .u-editor-icons {
    position: absolute;
    display: inline-block;
    left: 0;
    top: 0;
    width: 100%;
    height: 2rem;
    padding-left: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between
  }

  .g-window .m-chat-editor-main .u-editor-icons .u-editor-icon {
    cursor: pointer;
  }

  .g-window .m-chat-editor-main .u-editor-icons .u-editor-icon a{
    width: 20px;
    background-size: 100%;
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-common {
    display: inline-block;
    vertical-align: middle;
    width: 22px;
    height: 20px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .3s linear;
  }

  /* 发送表情 */
  .g-window .m-chat-editor-main .u-editor-icons .b-emoji {
    background-image: url('../../../../static/img/edit/emoji.png');
    background-size: 100% 100%;
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-emoji:hover, .b-emoji:focus {
    background-image: url('../../../../static/img/edit/emoji-h.png');
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-emoji:active {
    background-image: url('../../../../static/img/edit/emoji-p.png');
  }

  /* 剪切图片 */
  .g-window .m-chat-editor-main .u-editor-icons .b-screenshot {
    background-image: url('../../../../static/img/edit/screenshot.png');
    background-size: 100% 100%;
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-screenshot:hover, .b-screenshot:focus {
    background-image: url('../../../../static/img/edit/screenshot-h.png');
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-screenshot:active {
    background-image: url('../../../../static/img/edit/screenshot-p.png');
  }

  /* 发送图片 */
  .g-window .m-chat-editor-main .u-editor-icons .b-image {
    background-image: url('../../../../static/img/edit/image.png');
    background-size: 100% 100%;
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-image:hover, .b-image:focus {
    background-image: url('../../../../static/img/edit/image-h.png');
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-image:active {
    background-image: url('../../../../static/img/edit/image-p.png');
  }

  /* 发送文件 */
  .g-window .m-chat-editor-main .u-editor-icons .b-file {
    background-image: url('../../../../static/img/edit/file.png');
    background-size: 100% 100%;
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-file:hover, .b-file:focus {
    background-image: url('../../../../static/img/edit/file-h.png');
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-file:active {
    background-image: url('../../../../static/img/edit/file-p.png');
  }

  /* 发送文件 */
  .g-window .m-chat-editor-main .u-editor-icons .b-file {
    background-image: url('../../../../static/img/edit/file.png');
    background-size: 100% 100%;
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-file:hover, .b-file:focus {
    background-image: url('../../../../static/img/edit/file-h.png');
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-file:active {
    background-image: url('../../../../static/img/edit/file-p.png');
  }

  /* 远程协助 */
  .g-window .m-chat-editor-main .u-editor-icons .b-remote {
    background-image: url('../../../../static/img/edit/remote.png');
    background-size: 100% 100%;
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-remote:hover, .b-remote:focus {
    background-image: url('../../../../static/img/edit/remote-h.png');
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-remote:active {
    background-image: url('../../../../static/img/edit/remote-p.png');
  }

  /* 短信发送 */
  .g-window .m-chat-editor-main .u-editor-icons .b-message {
    background-image: url('../../../../static/img/edit/message.png');
    background-size: 22px 16px;
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-message:hover, .b-message:focus {
    background-image: url('../../../../static/img/edit/message-h.png');
    background-size: 22px 16px;
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-message-active {
    background-image: url('../../../../static/img/edit/message-p.png');
    background-size: 22px 16px;
  }

  /* 语音聊天 */
  .g-window .m-chat-editor-main .u-editor-icons .b-microphone {
    background-image: url('../../../../static/img/edit/microphone.png');
    background-size: 100% 100%;
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-microphone:hover, .b-microphone:focus {
    background-image: url('../../../../static/img/edit/microphone-h.png');
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-microphone:active {
    background-image: url('../../../../static/img/edit/microphone-p.png');
  }

  /* 视频聊天 */
  .g-window .m-chat-editor-main .u-editor-icons .b-camera {
    background-image: url('../../../../static/img/edit/camera.png');
    background-size: 100% 100%;
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-camera:hover, .b-camera:focus {
    background-image: url('../../../../static/img/edit/camera-h.png');
  }

  .g-window .m-chat-editor-main .u-editor-icons .b-camera:active {
    background-image: url('../../../../static/img/edit/camera-p.png');
  }

  .g-window .m-chat-editor-main .u-editor-icons .u-editor-icon {
    position: relative;
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-right: 21.4px;
    vertical-align: middle;
  }
  .g-window .m-chat-editor-main .u-editor-icons .u-editor-icon input[type="file"] {
    position: absolute;
    display: inline-block;
    left: 0;
    top: 0;
    width: 1px;
    height: 1px;
    opacity: 0;
    font-size: 1rem;
    cursor: pointer;
  }
  .g-window .u-icon {
    display: inline-block;
    width: inherit;
    height: inherit;
    background-size: 20rem;
    background-image: url(http://yx-web.nos.netease.com/webdoc/h5/im/icons.png);
  }

  .g-window .u-icon-img {
    position: relative;
    width: inherit;
    height: inherit;
  }
  .g-window .u-icon-img img {
    position: relative;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  .m-chat-editor-main .u-editor-body {
    position: absolute;
    width: 96%;
    top: 2.5rem;
    bottom: 45px;
  }


</style>
