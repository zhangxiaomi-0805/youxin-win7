<template>
<!-- 历史消息记录 -->
<transition name="fade">
  <div class="m-historymsg-contain" v-if="showHistoryMsg">
    <div class="m-historymsg-cover" @click="closeCover"></div>
    <div class="m-info-box" style="width:600px;height:502px;">
      <div class="drag" id="historyMsgDrag">
        <span>{{type === 2 ? '个人' : '群组'}}</span>
        <div class="u-sysbtn close">
          <a class="btn-close" @click="closeModal"/>
        </div>
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
      loading: false,
      type: 2 // 2-单聊，3-群组
    }
  },
  computed: {
  },
  updated () {
    drag.dragPosition('historyMsgDrag', 1)
  },
  methods: {
    closeModal () {
      this.showHistoryMsg = false
      this.loading = false
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
</style>

