<template>
<div style="height:100%;position:relative;">
  <system-caption/>
  <div class="third-box">
    <div class="body" style="backgroundColor: #fff;">
      <div class="title webkit-drag" style="borderBottom: 0;">外部接入系统</div>

      <ul class="list-box">
        <li
          :class="selectedIndex === $index ? 'list-item active' : 'list-item'"
          v-for="(item, $index) of dataList"
          :key="$index"
          @mouseover.stop="selectedIndex = $index"
          @mouseout.stop="selectedIndex = -1"
        >
          <div class="list-content-box">
            <div style="width: 55px; height: 55px;display: flex; align-items: center; margin-right: 10px">
              <img :src="item.appIconUrl" alt="" style="width: 100%">
            </div>

            <div style="width: 75%">
              <div class="item-title">{{item.appName}}</div>
              <div class="item-content">{{item.remark}}</div>
            </div>
          </div>

          <!-- btn -->
          <transition name="fade"><a class="btn" v-if="selectedIndex === $index" @click="openWindow(item)">立即进入</a></transition>
        </li>
      </ul>
    </div>
  </div>
</div>
</template>

<script>
import SystemCaption from '../controls/SystemCaption.vue'
import Request from '../../utils/request'
import config from '../../configs'
import NativeLogic from '../../utils/nativeLogic.js'
export default {
  name: 'workbench',
  components: {SystemCaption},
  data () {
    return {
      selectedIndex: -1,
      logo: './static/img/no-msg.png',
      dataList: []
    }
  },
  mounted () {
    this.getThirdList()
  },
  methods: {
    getThirdList () {
      // 获取接入系统列表
      Request.GetThirdList({}, this).then(ret => {
        this.dataList = ret
      }).catch(() => {})
    },
    async openWindow (item) {
      let url = item.url
      if (item.freeLogin === 1) {
        try {
          url = await Request.ThirdConnection({ url, appCode: item.appCode }, this)
        } catch (error) {}
      }
      if (url) {
        if (item.openType === 1) { // 1-客户端内部浏览器打开 2-外部web浏览器打开
          if (config.environment === 'web') { // web分支
            this.webOpenInWin(url, item)
          } else {
            this.electronOpenInWin(url, item)
          }
        } else { // 1-客户端内部浏览器打开 2-外部web浏览器打开
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
      NativeLogic.native.openShell(3, url) // type: 打开类型（1-文件，2-文件所在目录，3-外部浏览器） url
    },
    webOpenInWin (url, item) {
      // web端打开内部窗口
      // 1、创建窗口
      // params: windowName, path, height, width
      let AppDirectory = window.location.pathname.slice(1) // 应用所在目录
      if (AppDirectory.indexOf('dist') > -1) {
        let urlArr = AppDirectory.split('dist')
        AppDirectory = urlArr[0]
      }
      // const winURL = AppDirectory + 'static/windows/application.html'
      const winURL = 'D:/vue_workspace/youxin-new/static/windows/applicationXp.html'
      NativeLogic.native.createWindows('营业精灵', winURL, config.aplWinWidth, config.aplWinHeight).then((result) => {
      }).catch(error => console.log(error))

      // 注册事件监听子页面是否加载完成
      window.NimCefWebInstance && window.NimCefWebInstance.register('OnReceiveEvent', (params) => {
        if (params.eventName === 'childIsLoaded') {
          // 2、跨窗口通信,等子页面准备完成再发送事件
          // params: windowName, data{}, eventName
          let dataObj = {url, title: item.appName, appCode: item.appCode}
          let data = JSON.stringify(dataObj)
          NativeLogic.native.sendEvent('营业精灵', data, 'asyncMessage')
        }
      })
    },
    electronOpenOutWin (url) {
      // electron端打开外部窗口
      let { shell } = require('electron')
      shell.openExternal(url)
    },
    electronOpenInWin (url, item) {
      // electron端打开内部窗口
      let { ipcRenderer } = require('electron')
      ipcRenderer.send('openAplWindow', {url, title: item.appName, appCode: item.appCode})
    },
  }
}
</script>
<style>
.webkit-drag {
  -webkit-app-region: drag;
}
.third-box .title {
  width: 100%;
  height: 40px;
  color: #333;
  font-size: 15px;
  margin: 0 auto;
  margin-left: 43px;
}
.third-box .body {
  position: absolute;
  top: 31px;
  bottom: 0;
  padding-bottom: 56px;
  width: 100%;
}
.third-box .list-box {
  position: absolute;
  top: 71px;
  bottom: 0;
  overflow: auto;
  box-sizing: border-box;
  padding: 0 42px;
}
.third-box .list-item {
  float: left;
  width: 327px;
  height: 104px;
  padding: 20px 17px;
  box-sizing: border-box;
  border: 1px solid rgba(0,38,63,0.1);
  border-radius: 2px;
  margin-bottom: 30px;
  margin-right: 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  transition: all .3s linear;
}
.third-box .list-item.active {
  box-shadow: 0 10px 12px 0 rgba(0,88,148,0.13);
}
.third-box .list-item .list-content-box {
  width: 75%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.third-box .list-item .item-title {
  color: #333;
  font-size: 17px;
  line-height: 24px;
  width: 90%;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.third-box .list-item .item-content {
  width: 90%;
  overflow:hidden;
  text-overflow:ellipsis;
  text-align:left;
  white-space:nowrap;
  color: #999;
  font-size: 15px;
  line-height: 21px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.third-box .btn {
  width:72px;
  height:26px;
  box-sizing: border-box;
  background-color: rgba(4,154,255,1);
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: all .3s linear;
}
.third-box .btn:hover {
  background-color: rgb(1, 139, 231);
}
</style>
