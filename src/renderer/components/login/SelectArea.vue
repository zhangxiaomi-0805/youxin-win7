<template>
  <!-- 选择地区 -->
  <div :class="className()">
    <a @click="closeModal" class="close-btn"><span class="close"></span></a>
    <h3>选择国家或地区</h3>
    <div class="s-body">
      <div style="marginBottom: 15px;">
        <div class="title">常用国家和地区</div>
        <ul class="u-list">
          <li class="u-list-item" v-for="area in usualArea" :key="area.id" :id="area.id" @click="callBack(area)">
            <span>{{area.label}}</span><span class="code">{{'+' + area.code}}</span>
          </li>
        </ul>
      </div>
      <div style="marginBottom: 15px;" v-for="areas in sortArea" :key="areas.id" :id="areas.id">
        <div class="title">{{areas.letter}}</div>
        <ul class="u-list">
          <li class="u-list-item" v-for="area in areas.area" :key="area.id" :id="area.id" @click="callBack(area)">
            <span>{{area.label}}</span><span class="code">{{'+' + area.code}}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import areaObj from '../../configs/area.js'
export default {
  name: 'select-area',
  props: {
    modify: Boolean
  },
  data () {
    return {
      showSelectArea: 1,
      usualArea: areaObj.Usual,
      sortArea: areaObj.Region,
      callback: Function
    }
  },
  mounted () {
    let $this = this
    this.eventBus.$on('selectArea', (data) => {
      $this.showSelectArea = 2
      $this.callback = data.callback
    })
  },
  methods: {
    className () {
      if (this.showSelectArea === 1 && !this.modify) {
        return 's-area'
      }
      if (this.showSelectArea === 1 && this.modify) {
        return 's-area modify'
      }
      if (this.showSelectArea === 2 && !this.modify) {
        return 's-area k-movetop'
      }
      if (this.showSelectArea === 2 && this.modify) {
        return 's-area k-movetop modify'
      }
      if (!this.modify) return 's-area k-movebottom'
      else return 's-area k-movebottom modify'
    },
    closeModal () {
      this.showSelectArea = 3
    },
    callBack (area) {
      this.callback(area)
      this.showSelectArea = 3
    }
  }
}
</script>

<style scoped>
  .s-area {
    position: absolute;
    bottom: -393px;
    left: 0;
    width: 100%;
    height: 393px;
    background: #fff;
    z-index: 10;
  }
  .s-area.modify {
    bottom: -329px;
    height: 329px;
  }

  .s-area .close-btn {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 30px;
    padding: 0 30px;
  }

  .s-area .close-btn .close {
    display: inline-block;
    width: 25px;
    height: 10px;
    background: url('../../../../static/img/setting/takeup.png') no-repeat center center;
    background-size: 100% 100%
  }

  .s-area.k-movetop {
    bottom: 0;
    animation: moveTop 600ms;
  }
  .s-area.k-movebottom {
    bottom: -393px;
    animation: moveBottom 600ms;
  }
  @keyframes moveTop {
    from { bottom: -393px }
    to { bottom: 0 }
  }
  @keyframes moveBottom {
    from { bottom: 0 }
    to { bottom: -393px }
  }

  .s-area.k-movetop.modify {
    bottom: 0;
    animation: moveTopModify 600ms;
  }
  .s-area.k-movebottom.modify {
    bottom: -329px;
    animation: moveBottomModify 600ms;
  }
  @keyframes moveTopModify {
    from { bottom: -329px }
    to { bottom: 0 }
  }
  @keyframes moveBottomModify {
    from { bottom: 0 }
    to { bottom: -329px }
  }

  .s-area > h3 {
    font-size: 18px;
    color: #333;
    text-align: left;
    padding: 0 30px;
    margin-top: 5px;
    margin-bottom: 20px;
  }

  .s-area .s-body {
    box-sizing: border-box;
    position: absolute;
    top: 77px;
    bottom: 0;
    width: 100%;
    padding: 0 30px;
    overflow-y: auto;
  }

  .s-area .title {
    padding: 3px 0;
    border-bottom: 1px solid rgba(239,239,243,1);
    font-size: 12px;
    color: rgba(177,177,177,1);
    text-align: left;
    line-height: 14px;
  }

  .s-area .u-list-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 28px;
    font-size: 14px;
    color: #333;
  }

  .s-area .code {
    font-size: 12px;
    color: rgba(177,177,177,1);
  }
</style>


