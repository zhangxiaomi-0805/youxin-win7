<template>
  <div style="height:100%;">
    <orgnize-list :callBack="checkCard"/>
    <div class="m-main-content" id="resize-side-rt" style="margin-left:271px;">
      <system-caption/>
      <div class="c-default">
        <div class="title" style="borderBottomWidth: 0"></div>
        <div v-if="!showCard" class="body" style="backgroundColor: #fff">
          <div style="paddingTop: 7%;"><img class="nice" :src="logoGray"/><div class="no-msg" style="color: #999;fontSize: 14px;">优信</div></div>
        </div>
        <name-card v-else pageType="p2p" :accid="accid"/>
      </div>
    </div>
  </div>
</template>

<script>
  import SystemCaption from '../controls/SystemCaption.vue'
  import OrgnizeList from '../module/OrgnizeList.vue'
  import Resize from '../../utils/resize.js'
  import NameCard from '../module/NameCard.vue'
  export default {
    name: 'orgnize',
    components: {OrgnizeList, SystemCaption, NameCard},
    data () {
      return {
        accid: '',
        showCard: false,
        logoGray: './static/img/orgnize/logo-gray.png'
      }
    },
    mounted () {
      // 初始化窗口拖拽函数
      Resize.changeSideRange({max: 300, min: 250})
    },
    methods: {
      checkCard (params) {
        this.showCard = true
        this.accid = params.accid
      }
    }
  }
</script>
<style>
  .nice {
    display: block;
    width: 120px;
    height: 120px;
    margin-bottom: 5px;
  }
</style>
