<template>
<!-- 历史消息记录 -->
<transition name="fade">
  <div class="m-historymsg-contain" v-if="showHistoryMsg">
    <div class="m-historymsg-cover" @click="closeCover"></div>
    <div class="m-info-box" style="width:600px;height:502px;">
      <!-- 头部 -->
      <div class="drag" id="historyMsgDrag">
        <span>{{type === 2 ? '个人' : '群组'}}</span>
        <div class="u-sysbtn close">
          <a class="btn-close" @click="closeModal"/>
        </div>
      </div>
      <!-- 内容 -->
      <div class="m-historymsg-content">
        <!-- 搜索 -->
        <div class="search-box">
          <div class="search-img"></div>
          <!-- <img class="search-img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR…I6vSXCIp4eS+/iopLIDyItL7dMWMTz+XzjwtLSEyR4/h8s8iA5AK+B4wAAAABJRU5ErkJggg=="/> -->
          <span class="search">搜索</span>
        </div>

        <!-- 全部 && 图片 && 文件 -->
        <div class="tab-title">
          <a :class="checkType === 'all' ? 'tab-title-item active' : 'tab-title-item'" @click="toggleList('all')">全部</a>
          <a :class="checkType === 'pic' ? 'tab-title-item active' : 'tab-title-item'" @click="toggleList('pic')">图片</a>
          <a :class="checkType === 'file' ? 'tab-title-item active' : 'tab-title-item'" @click="toggleList('file')">文件</a>
        </div>

        <!-- 短信选择 -->
        <div
          class="message-box"
          @click.stop="messageCheck = !messageCheck"
        >
          <span :class="messageCheck ? 'checked common':'check common'"></span>
          <span style="font-size: 12px; color: #333; line-height:40px">短信</span>
        </div>

         <!-- 内容列表 -->
      <ul style="width: 100%;">
        <li 
        v-for="(msg, $index) in msgList"
        :key="$index"
        class="list-item"
        >
          <div class="left">
            <img :src="msg.avatar" alt="" class="avatar">
            <div style="padding:0 8px">
              <span style="font-size:12px; color:#999">{{msg.nickName}}</span>
              <div style="font-size:13px; color:#333; line-height:18px;padding-top:2px">{{msg.message}}</div>
            </div>
          </div>
          <div style="font-size:12px; color:#999">{{msg.time}}</div>
        </li>
      </ul>
      </div>
    </div>    
  </div>
</transition>
</template>

<script>
// import platform from '../../utils/platform'
import drag from '../../utils/drag.js'
// import configs from '../../configs/index.js'
// import Request from '../../utils/request.js'
export default {
  name: 'check-history-msg',
  mounted () {
    this.eventBus.$on('checkHistoryMsg', (data) => {
      this.showHistoryMsg = true
      console.log(this.showHistoryMsg)
      this.type = data.type
    })
  },
  data () {
    return {
      showHistoryMsg: false,
      showConfirmCover: false,
      loading: false,
      messageCheck: false, // 短信勾选状态
      checkType: 'all', // all---全部; pic---图片; file---文件
      type: 2, // 2-单聊，3-群组
      msgList: [{avatar: 'http://www.qqzhi.com/uploadpic/2014-06-06/000435511.jpg', nickName: '苏大元', message: '我那个时候考上公务员的城管 供电局也考上了 去了供电局 感觉比城管好 我那个时候考上公务员的城管', time: '12:42:00'}, {avatar: 'http://www.qqzhi.com/uploadpic/2014-06-06/000435511.jpg', nickName: '苏大元', message: '他以为自己是什么小饼干', time: '12:42:00'}, {avatar: 'http://tx.haiqq.com/uploads/allimg/150323/151500B45-1.jpg', nickName: '大西瓜的瓜', message: '这是什么鬼登西', time: '12:42:00'}]
    }
  },
  computed: {
  },
  updated () {
    drag.dragPosition('historyMsgDrag', 1)
  },
  methods: {
    closeCover () {
      this.showConfirmCover = false
    },
    closeModal () {
      this.showHistoryMsg = false
      this.loading = false
    },
    toggleList (value) {
      if (this.checkType === value) return
      this.checkType = value
    }
  }
}
</script>

<style scoped>
  .m-historymsg-contain {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1001;
  }
  .m-historymsg-contain .m-historymsg-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }
  .m-historymsg-contain .m-info-box {
    box-sizing: border-box;
		position: absolute;
		top: 1px;
    left: 50%;
    transform: translateX(-50%);
		width: 600px;
		height: 502px;
    background: #fff;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    z-index: 100;
    padding: 0 0 0 40px;
  }
  .m-historymsg-contain .m-info-box .drag {
    -webkit-app-region: no-drag;
    box-sizing: border-box;
    position: relative;
    width: 100%;
    padding: 9px 10px;
    font-size: 14px;
    color: #999;
  }
  
  .m-info-box .close {
    position: absolute;
    right: 0;
    top: 0;
  }
  .m-historymsg-content {
    padding: 0 40px 0 0;
  }

  /* 搜索框 */
  .m-info-box .search-box {
    width: 520px;
    height:28px;
    background-color: #F0F0F0;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F0F0F0 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR…I6vSXCIp4eS+/iopLIDyItL7dMWMTz+XzjwtLSEyR4/h8s8iA5AK+B4wAAAABJRU5ErkJggg==) 8px center no-repeat;
    background-size: 12px 12px;

  }
  .m-info-box .search-box .search {
    font-size: 12px;
    color: #7D807E
  }
  .m-info-box .search-box .search-img{
    width:28px;
    height:28px;
    background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR…I6vSXCIp4eS+/iopLIDyItL7dMWMTz+XzjwtLSEyR4/h8s8iA5AK+B4wAAAABJRU5ErkJggg==) 8px center no-repeat;
    background-size: 12px 12px;
  }
  /* tab头 */
  .m-info-box .tab-title {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    width: 100%;
    padding: 10px 0;
    border-bottom: 1px solid rgba(0,0,0,0.15)
  }
  .m-info-box .tab-title .tab-title-item {
    width: 15%;
    height: 100%;
    line-height: 27px;
    text-align: left;
    color: #333;
    font-size: 12px;
    transition: opacity .3s linear;
  }
  .m-info-box .tab-title .tab-title-item:hover {
    opacity: 0.7;
  }

  .m-info-box .tab-title .tab-title-item.active {
    color: #049AFF;
  }
  /* 短信选择 */
  .m-info-box .message-box{
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding:5px 0
  } 
  .m-info-box .common {
    display: inline-block;
    width: 15px;
    height: 15px;
    margin-right: 6px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
  }
  .m-info-box  .check {
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 14px 14px;
  }
  .m-info-box  .check:hover, .check:focus {
    background-image: url('../../../../static/img/setting/checkboxborder-p.png');
  }

  .m-info-box  .checked {
    background-image: url('../../../../static/img/setting/checkbox-c.png');
    background-size: 100% 100%;
  }
  .m-info-box  .list-item {
    width:100%;
    overflow-x: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 10px;

  }
  .m-info-box  .list-item .left{
    display: flex;
    flex-direction: row;
  }
  .m-info-box .list-item .avatar {
    width:32px;
    height:32px;
    border-radius: 50%;
    margin-top: 5px;
  }
</style>

