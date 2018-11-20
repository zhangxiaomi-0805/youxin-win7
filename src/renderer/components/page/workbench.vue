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
import { shell } from 'electron'
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
        if (item.openType === 1) {
          const electron = require('electron')
          const ipRenderer = electron.ipcRenderer
          ipRenderer.send('openAplWindow', {url: item.url, title: item.appName, appCode: item.appCode, type: 1})
        } else {
          shell.openExternal(url)
        }
      }
    }
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
