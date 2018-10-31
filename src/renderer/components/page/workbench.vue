<template>
<div style="height:100%;position:relative;">
  <system-caption/>
  <div class="third-box">
    <div class="body" style="backgroundColor: #fff;">
      <div class="title" style="borderBottom: 0;">外部接入系统</div>

      <ul class="list-box">
        <li 
          class="list-item" v-for="(item, $index) of dataList" :key="$index"
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
          <div class="btn" v-if="selectedIndex === $index">立即进入</div>
        </li>
      </ul>
    </div>
  </div>
</div>
</template>

<script>
import SystemCaption from '../controls/SystemCaption.vue'
import Fetch from '../../utils/fetch'
export default {
  name: 'workbench',
  components: {SystemCaption, Fetch},
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
      Fetch.post('api/appPc/thirdList', {}, this).then(ret => {
        console.log(ret)
        this.dataList = ret
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>
<style>
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
  box-sizing: border-box;
  padding: 42px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
}
.third-box .list-item {
  width: 46%;
  height: 15%;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid rgba(0,38,63,0.1);
  border-radius: 2px;
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.third-box .list-item:after {
  content: "";
  display: block;
  position: absolute;
  bottom: -1px;
  left: 0;
  height:12px;
  width: 100%;
  box-shadow: 0 10px 12px 0 rgba(0,88,148,0.13);
  transform: translateY(1);
  transition: all 800ms;
}
.third-box .list-item:hover {
  transform: translateY(1px);
  transition: all 1000ms;
}
.third-box .list-item:hover:after {
  transform: translateY(1px);
  transform: scale(0.9);
  transition: all 1000ms;
}
.third-box .list-item .list-content-box {
  width: 85%;
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
  width: 4rem;
  height: 1.5rem;
  padding: 2px 5px;
  box-sizing: border-box;
  background-color: #049AFF;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
