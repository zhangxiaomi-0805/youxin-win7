<template>
  <li 
    class="list-item"
    @click.stop="isCheckMore ? checkItemFn(msg) : null"
    :id="`${idClient}_serarch`"
  >
    <div  class="list-item" style="position: relative">
      <div 
        class="left"
      >
        <!-- 选择框 -->
        <span v-show="isCheckMore" :class="className(msg)"></span>
        
        <img :src="msg.avatar" alt="" class="avatar">
        <div style="padding:0 8px; width:85%">
          <span style="font-size:12px; color:#999">{{msg.fromNick}}</span>
          <span v-if="msg.custom && JSON.parse(msg.custom).isSmsMsg" class="msg-short"><i class="send-short-msg"></i></span>
          <textarea style="width: 1px;height: 1px;position: absolute;left: -10px;" ref="clipboard"></textarea>
          <div
            v-if="msg.type==='text'"
            style="outline:0;font-size:13px; color:#333; line-height:18px;padding-top:2px; -webkit-user-select: text;word-wrap: break-word;"
            @mouseup.stop="isCheckMore ? null : showListOptions($event, msg)"
            @click="openAplWindow($event)"
            v-html="msg.showText"
            :ref="`copy_${msg.idClient}`"
            @keydown.stop="shearBoard($event)"
            @dblclick.stop="copyAll()"
            tabindex="1"
          ></div>
          <div v-else-if="msg.type==='custom-type1'" ref="mediaMsg">
            <img :src="msg.imgUrl" style="width: 230px; height: 230px"/> 
          </div>
          <div v-else-if="msg.type==='custom-type3'" ref="mediaMsg"
           @mouseup.stop="isCheckMore ? null : showListOptions($event, msg)" 
           style="background:transparent;border:none;"
           >
            <img :src="msg.imgUrl" style="width: 230px; height: 230px"/> 
          </div>
          <div v-else-if="msg.type==='custom-type7'" class="mediaMsg"  
          @mouseup.stop="showListOptions($event, msg)"
          >
            <!-- <webview style="height:auto" class="webview-box" ref="webview"  autosize="on" minwidth="300" minheight="20" maxheight='auto' nodeintegration disablewebsecurity src="../../../../static/windows/webview.html"></webview> -->
            <iframe ref="iframe" @load="sendMsgToIframe(msg)" style="height: auto" src="./static/windows/webview.html" minwidth="300" minheight="20" frameborder="0" scrolling="no"></iframe>
          </div>
          <span v-else-if="msg.type==='custom-type8'" class="msg-text custom-type8-box" @mouseup.stop="isCheckMore ? null : showListOptions($event, msg)">
            <span class="custom-type8-title">邀请你加入群聊</span>
            <span class="custom-type8-content-box">
              <span class="custom-type8-content">{{msg.showText.description}}</span>
              <img :src="msg.showText.teamAvatarUrl" alt="" style="width: 50px; height:50px">
            </span>
          </span>
          <div v-else-if="msg.type==='image'"  ref="mediaMsg" 
          @mouseup.stop="isCheckMore ? null : showListOptions($event, msg)" 
          :style="{cursor: 'pointer', width: msg.w + 'px', height: msg.h + 'px', background: 'transparent', border: 'none'}"
          >
            <img :src="msg.originLink" style="width: 100%; height: 100%"/> 
          </div>
          <div v-else-if="msg.type==='video'"  ref="mediaMsg">
            <video :src="msg.src" autoStart="false" controls="controls" style="width:230px; height:230px"></video>
          </div>
          <div v-else-if="msg.type==='audio'"  :class="isPlay ? 'zel-play' : ''" @click="isCheckMore ? null : playAudio(msg.audioSrc, msg)" @mouseup.stop="isCheckMore ? null : showListOptions($event, msg)"><span>{{msg.showText.split(' ')[0]}}</span></div>
          <div v-else-if="msg.type==='file'" class="msg-text msg-file" 
          @mouseup.stop="showListOptions($event, msg)" 
          @click="openItemFile(msg)" 
          :style="{cursor: hasFileUrl ? 'pointer' : 'default'}"
          >
            <span class="file-icon" :style="{backgroundImage: `url(${fileIcon(msg)})`, backgroundSize: '100%', backgroundRepeat: 'no-repeat'}"></span>
            <span class="file-content">
              <span class="file-title">
                {{msg.file.name}}
              </span>
              <span class="file-bottom">
                <span class="file-size">
                  {{fileSize(msg)}}
                </span>
                <span v-if="msg.status === 'fail'" style="color: red;font-size: 12px;">
                  发送失败
                </span>
                <span v-else-if="msg.flow === 'in' && isDownloaded(msg) === 0 && curDownloadStatus(msg) === 0" class="file-downloadBtn" @click.stop="handleDownloadFile(msg)">
                </span>
                <span v-else style="color: #999;font-size: 12px;">
                  {{msg.flow === 'out' ? '已发送' : '已下载'}}
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
      <!-- 时间 -->
      <div class="time">{{manageTime(msg.time)}}</div>
    </div>
        
  </li>
</template>

<script type="text/javascript">
import util from '../../utils'
import config from '../../configs'
import MsgRecordFn from './msgRecord.js'
import NativeLogic from '../../utils/nativeLogic.js'
import getFile from '../../utils/getFile.js'
export default {
  name: 'msg-item',
  props: {
    isCheckMore: Boolean,
    scene: String,
    to: String,
    teamId: String,
    idClient: String,
    sessionId: String,
    msg: {
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
    },
    myInfo: {
      type: Object,
      default () {
        return {}
      }
    },
    isRobot: {
      type: Boolean,
      default () {
        return false
      }
    },
    isHistory: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      isPlay: false,
      currentAudio: null,
      myGroupIcon: config.defaultGroupIcon
    }
  },
  computed: {
    myPhoneId () {
      return `${this.$store.state.userUID}`
    },
    checkedMsgList () {
      // 多选时选中的消息
      if (this.$store.state.checkedMsgs && this.$store.state.checkedMsgs.length > 0) {
        return this.$store.state.checkedMsgs
      } else {
        return []
      }
    }
  },
  mounted () {
    this.eventBus.$on('sendMsgToChild', () => { // 监听到子窗口加载完成，向子窗口发送数据
      this.sendMsgToChild()
    })
    let item = this.msg
    this.iframe = this.$refs.iframe
    // 自定义消息（7）
    // let webview = this.$refs.webview
    if (item.type === 'custom-type7' && this.iframe) {
      this.bindEvent(window, 'message', (e) => { // 获取iframe页面内容高度
        if (e.data.cmd === 'returnHeight') {
          if (item.idClient === e.data.params.idClient) {
            this.iframe.style.height = (e.data.params.contentHeight) + 'px'
          }
        }
      })
    }
  },
  beforeDestroy () {
    this.eventBus.$off('sendMsgToChild')
  },
  methods: {
    // 双击文本全选
    copyAll () {
      let target = this.$refs[`copy_${this.idClient}`]
      MsgRecordFn.copyAll(target)
    },
    bindEvent (element, eventName, eventHandler) {
      if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false)
      } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler)
      }
    },
    sendMsgToIframe (msg) {
      this.iframe.contentWindow && this.iframe.contentWindow.postMessage({
        params: {showText: msg.showText, idClient: msg.idClient}
      }, '*')
      setTimeout(() => {
        this.iframe.contentWindow.document.body.onmouseup = (e) => {
          this.showListOptions(e, msg)
        }
        var a = [...(this.iframe.contentWindow.document.getElementsByTagName('a'))]
        for (let i = 0; i < a.length; i++) {
          a[i].addEventListener('click', (e) => {
            e.preventDefault()
            let url = a[i].getAttribute('href')
            if (url) {
              if (url.indexOf('yximcreatesession.telecomjs.com') > -1) {
                // 发起会话处理
                let account = e.url.split('?account=')[1]
                if (account) {
                  if (config.environment === 'web') { // web分支
                    Request.GetAccid({userName: account}, this).then(ret => {
                      let accid = ret.accid
                      // 根据account 获取 accid 发起会话
                      this.createSession(accid)
                    })
                  } else { // electron分支
                    let { ipcRenderer } = require('electron')
                    ipcRenderer.send('sendAccount', {account})
                  }
                }
              }
            }
            let openType = 1
            if (url.indexOf('#browserWindow') > -1) {
              openType = 2
            }
            this.openAplWindow({url}, openType)
          })
        }
      }, 1000)
    },
    openAplWindow (evt, openType) {
      let url = ''
      if (!openType) {
        url = evt.target.getAttribute('data-url')
        if (url) {
          url = url.substr(1, url.length - 2)
        }
      } else {
        url = evt.url
      }
      if (url) {
        // 打开营业精灵
        let thirdUrls = this.$store.state.thirdUrls
        let regDomain = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62}|(:[0-9]{1,6}))+\.?/
        let domain = url.match(regDomain)[0]
        if (url.split('://').length <= 1) url = 'http://' + url
        for (let i in thirdUrls) {
          if (thirdUrls[i].url === domain) {
            Request.ThirdConnection({url: encodeURIComponent(url), appCode: thirdUrls[i].appCode}).then(res => {
              if (openType && openType === 2) {
                if (config.environment === 'web') {
                  this.webOpenOutWin(res)
                } else {
                  this.electronOpenOutWin(res)
                }
              } else {
                if (config.environment === 'web') {
                  this.webOpenInWin(res)
                } else {
                  this.electronOpenInWin(res)
                }
              }
            }).catch(() => {})
            return false
          }
        }
        if (openType && openType === 1) {
          if (config.environment === 'web') {
            this.webOpenInWin(url)
          } else {
            this.electronOpenInWin(url)
          }
        } else {
          if (config.environment === 'web') {
            this.webOpenOutWin(url)
          } else {
            this.electronOpenOutWin(url)
          }
        }
      }
    },
    webOpenOutWin (url) {
      // web端打开外部窗口
      NativeLogic.native.openShell(3, url, true) // type: 打开类型（1-文件，2-文件所在目录，3-外部浏览器） url
    },
    webOpenInWin (url) {
      // web端打开内部窗口
      let itemInfo = {
        url,
        title: this.msg.fromNick,
        icon: this.msg.avatar,
        appCode: this.msg.sessionId,
        showHideWinCheck: localStorage.SHOWHIDEWINCHECK
      }
      localStorage.setItem('ItemInfo', JSON.stringify(itemInfo)) // 保存当前点击tab的信息
      // 1、创建窗口
      // params: windowName, path, height, width
      let AppDirectory = window.location.pathname.slice(1) // 应用所在目录
      if (AppDirectory.indexOf('dist') > -1) {
        let urlArr = AppDirectory.split('dist')
        AppDirectory = urlArr[0]
      }
      const winURL = AppDirectory + '/dist/static/windows/applicationXp.html'
      NativeLogic.native.createWindows('营业精灵', winURL, config.aplWinWidth, config.aplWinHeight).then(res => {
        this.sendMsgToChild()
      })
    },
    // 跟子页面通信
    sendMsgToChild () {
      let itemInfo = localStorage.getItem('ItemInfo')
      if (itemInfo) {
        let dataObj = JSON.parse(itemInfo)
        let data = JSON.stringify(dataObj)
        NativeLogic.native.sendEvent('营业精灵', data, 'asyncMessage')
      }
    },
    electronOpenOutWin (url) {
      // electron端打开外部窗口
      let { shell } = require('electron')
      shell.openExternal(url)
    },
    electronOpenInWin (url) {
      // electron端打开内部窗口
      let { ipcRenderer } = require('electron')
      ipcRenderer.send('openAplWindow', {url, title: this.msg.fromNick, icon: this.msg.avatar, appCode: this.msg.sessionId, showHideWinCheck: localStorage.SHOWHIDEWINCHECK})
    },
    className (msg) {
      // 选择框样式
      let className = 'check common'
      for (let i in this.checkedMsgList) {
        let idClient = this.checkedMsgList[i].idClient
        if (idClient === msg.idClient) {
          className = 'checked common'
          break
        }
      }
      return className
    },
    // 消息时间戳处理 --- 年-月-日 时-分-秒
    manageTime (time) {
      return util.DateFormat(time)
    },
    playAudio (src, msg) {
      if (!this.currentAudio) {
        this.currentAudio = new Audio(src)
        this.currentAudio.play()
        this.isPlay = true
        this.currentAudio.onended = () => {
          this.currentAudio = null
          this.isPlay = false
        }
      }
    },
    getOffSet (curEle) {
      var totalLeft = null
      var totalTop = null
      var par = curEle.offsetParent
      // 首先把自己本身的相加
      totalLeft += curEle.offsetLeft
      totalTop += curEle.offsetTop
      // 现在开始一级一级往上查找，只要没有遇到body，我们就把父级参照物的边框和偏移相加
      while (par) {
        // if (navigator.userAgent.indexOf("MSIE 8.0") === -1){
        //   // 不是IE8我们才进行累加父级参照物的边框
        //   totalTop += par.clientTop;
        //   totalLeft += par.clientLeft;
        // }
        // 把父级参照物的偏移相加
        totalTop += par.offsetTop
        totalLeft += par.offsetLeft
        par = par.offsetParent
      }
      const list = document.querySelector('#msg-record-box')
      return {left: totalLeft, top: totalTop - list.scrollTop}
    },
    showListOptions (e, msg) {
      let offset = {
        x: e.clientX,
        y: e.clientY
      }
      if (msg.type === 'custom-type7') {
        const obj = this.getOffSet(this.iframe)
        offset.x = 150 + e.clientX
        offset.y = obj.top + e.clientY
      }
      if (msg.type === 'text' && e.button === 2) {
        let target = this.$refs[`copy_${this.idClient}`]
        MsgRecordFn.copyAll(target)
      }
      if (e.button === 2) {
        let key = ''
        if (msg.type === 'text') {
          key = 'msg-record'
        } else if (msg.type === 'custom-type8') {
          key = 'custom-type8-msg-record'
        } else {
          key = 'image-msg-record'
        }
        this.$store.dispatch('showListOptions', {
          key,
          show: true,
          id: msg,
          pos: {
            x: offset.x,
            y: offset.y
          },
          that: this,
          msg,
          callBack: (type) => {
            switch (type) {
              case 0: // 多选
                this.checkMoreFn(msg)
                break
              case 2: // 转发
                // 转发消息 ***** type=8---多条转发， type=7---单条转发， msg---要转发的消息
                let sidelist = MsgRecordFn.forwordMsg(this.to, this.myPhoneId, this.userInfos, this.myInfo, this.myGroupIcon) // type:8---多条转发， type:7---单条转发
                this.eventBus.$emit('selectContact', {type: 7, sidelist, msg: this.msg})
                break
              case 3: // 复制
                this.shearBoard(e)
                break
              // case 4: // 删除
              //   this.$store.dispatch('deleteMsg', this.msg)
              //   break
            }
          }
        })
      } else {
        this.$store.dispatch('showListOptions', {
          show: false
        })
      }
      // 处理拖拽窗口事件移除
      document.onmousemove = null
      document.onmouseup = null
      document.body.style.cursor = 'default'
    },
    shearBoard (e) {
      // Ctrl + C写入剪切版
      let copyText = MsgRecordFn.getCopyText(e)
      document.addEventListener('copy', function copy (e) {
        e.clipboardData.setData('text/plain', copyText)
        e.preventDefault()
      })
      document.execCommand('copy')
    },
    checkMoreFn (msg) {
      this.$emit('checkMore')
      this.$store.commit('updateCheckedMsgs', [msg])
    },
    checkItemFn (msg) {
      const index = this.checkedMsgList.findIndex(item => {
        return item.idClient === msg.idClient
      })
      if (index === -1) {
        this.checkedMsgList.push(msg)
      } else {
        this.checkedMsgList.splice(index, 1)
      }
      this.$store.commit('updateCheckedMsgs', this.checkedMsgList)
    },
    /**
     * 新增文件相关处理
     */
    hasFileUrl (msg) {
      if (msg.localCustom && msg.localCustom.downloadUrl) {
        return msg.localCustom.downloadUrl
      } else {
        return false
      }
    },
    fileSize (msg) {
      if (msg.type === 'file') {
        const size = util.fileSize(msg.file.size)
        return size
      }
      return 0
    },
    // 文件格式匹配icon
    fileIcon (msg) {
      const iconList = ['word', 'zip', 'excel', 'git', 'html', 'jpg', 'mp3', 'mp4', 'pdf', 'png', 'ppt', 'rar', 'txt']
      if (msg.type === 'file') {
        let ext = msg.file.ext
        if (ext === 'docx' || ext === 'dotx' || ext === 'dotm' || ext === 'docm' || ext === 'doc') {
          ext = 'word'
        }
        if (ext === 'xlsx' || ext === 'xlsm' || ext === 'xltx' || ext === 'xls') {
          ext = 'excel'
        }
        if (ext === 'pptx' || ext === 'pptm' || ext === 'ppsx') {
          ext = 'ppt'
        }
        if (ext === 'jpeg') {
          ext = 'jpg'
        }
        if (iconList.includes(ext)) {
          return `./static/img/file/file-icon-${ext}.png`
        } else {
          return `./static/img/file/file-icon-unknow.png`
        }
      }
    },
    async openItemFile (msg) {
      const fileUrl = msg.localCustom.downloadUrl
      if (config.environment === 'web') {
        // 调用native
        NativeLogic.native.openShell(1, fileUrl, true)
          .then(() => {})
          .catch(() => {
            // 重新触发下载逻辑
            this.handleDownloadFile(msg)
          })
      } else {
        try {
          await getFile(fileUrl)
          let { shell } = require('electron')
          shell.openItem(msg.localCustom.downloadUrl)
        } catch (err) {
          // 重新触发下载逻辑
          this.handleDownloadFile(msg)
        }
      }
    },
    handleDownloadFile (msg) {
      if (config.environment === 'web') {
        const session = `${msg.scene}-${msg.to}`
        NativeLogic.native.fileDownload(this.downloadFile(msg), '', true, msg, session)
      } else {
        var $a = document.createElement('a')
        $a.setAttribute('href', this.downloadFile(msg))
        $a.setAttribute('download', '*')
        var evObj = document.createEvent('MouseEvents')
        evObj.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, true, false, 0, null)
        $a.dispatchEvent(evObj)
      }
    },
    downloadFile (msg) {
      if (msg.type === 'file') {
        const nim = this.$store.state.nim
        const nameUrl = nim.packFileDownloadName({
          url: msg.file.url,
          name: msg.file.name
        })
        return nameUrl + '#' + msg.idClient
      }
    },
    // 0 -未下载 1 -已下载
    isDownloaded (msg) {
      // 文件下载后保存的地址
      if (msg.type === 'file' && msg.flow === 'in') {
        const url = msg.localCustom && msg.localCustom.downloadUrl
        if (!url) {
          return 0
        } else {
          return 1
        }
      }
      return false
    },
    curDownloadStatus (msg) {
      const list = this.$store.state.downloadFileList
      let status = 0
      list.forEach(item => {
        if (item.id === msg.idClient) {
          status = item.status
        }
      })
      return status
    }
  }
}
</script>

<style scoped>
  .list-item {
    width:100%;
    box-sizing: border-box;
    overflow-x: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 16px 10px 0;
    position: relative
  }
  .list-item .left{
      display: flex;
      flex-direction: row;
      width: 88%
  }
  .list-item .avatar {
      width:32px;
      height:32px;
      border-radius: 50%;
      margin-top: 5px;
  }
  .list-item .msg-short .send-short-msg {
    display: inline-block;
    vertical-align: middle;
    padding-left: 5px;
    width: 16px;
    height: 12px;
    background-repeat: no-repeat;
    background-position: center center;
    background-image: url('../../../../static/img/edit/message-h.png');
    background-size: 16px 12px;
  }
  .list-item .msg-audio{
    position: relative;
    overflow: visible !important;
    width: 60px;
    height: 20px;
    transition: all .2s;
    cursor: pointer;
    background: url('/../../../../static/img/edit/voice-y.png') 12px center no-repeat;
    background-size: 14px 20px;
  }
  .list-item .msg-audio.zel-play{
    background: url('../../../../static/img/edit/voice-y-p.gif') 12px center no-repeat;
    background-size: 14px 20px;
  }
  .msg-audio span{
    position: absolute;
    bottom: -2px;
    right: 0;
    display: block;
    color: #999;
    font-size: 14px;
  }
  .list-item .common {
    display: inline-block;
    width: 15px;
    height: 32px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
    margin: 5px 5px 0 0 ;
  }
  .list-item .check {
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 15px 15px;
  }
  .list-item .checked {
    background-image: url('../../../../static/img/setting/checkbox-c.png');
    background-size: 15px 15px;
  }
  .custom-type8-box {
    display: flex;
    flex-direction: column;
    /* align-items: center; */
    justify-content: space-between;
    padding: 0 15px;
    width: 235px;
    height: 100px;
    background: #fff !important;
    border: 1px solid #529EFF;
    border-radius: 6px;
    overflow: hidden;
  }
  .custom-type8-box .custom-type8-content-box {
    display: flex;
    flex-direction: row;
    /* align-items: center; */
    justify-content: space-between;
    background: #fff !important;
    margin-top: 10px
  }
  .custom-type8-box .custom-type8-title {
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    font-size: 14px;
    color: #333;
  }
  .custom-type8-box .custom-type8-content {
    margin-right: 10px;
    width: 150px;
    height: 68px;
    font-size: 12px;
    color: #999;
    overflow : hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .list-item .msg-file {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    width: 263px;
    height: 85px;
    background: #fff !important;
    border: 1px solid #529EFF;
    border-radius: 2px 10px 10px 10px;
  }

  .list-item .msg-file .file-icon {
    margin-left: 5px;
    width: 60px;
    height: 70px;
  }

  .list-item .msg-file .file-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 10px;
    width: 144px;
    height: 68px;
  }

  .list-item .msg-file .file-title {
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    font-size: 14px;
    color: #333;
  }

  .list-item .msg-file .file-size {
    color: #999;
    font-size: 12px;
  }

  .list-item .msg-file .file-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .list-item .msg-file .file-downloadBtn {
    width: 20px;
    height: 20px;
    cursor: pointer;
    border: 2px solid #d8d8d8;
    border-radius: 50%;
    background: center center url(../../../../static/img/setting/arrow-bot.png) no-repeat;
    background-size: 14px;
  }
  .list-item .time {
    font-size:12px;
    color:#999;
    position: absolute;
    top: 0;
    right: 0
  }
</style>