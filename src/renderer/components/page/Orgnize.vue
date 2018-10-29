<template>
<div style="height:100%;">
  <orgnize-list :callBack="checkCard"/>
  <div class="m-main-content" id="resize-side-rt" style="margin-left:271px;">
    <system-caption/>
    <div class="c-default">
      <div class="title" style="borderBottomWidth: 0"></div>
      <div v-if="!showCard" class="body" style="backgroundColor: #fff">
        <div style="paddingTop: 7%;"><span class="nice"/><div class="no-msg" style="color: #999;fontSize: 14px;">优信</div></div>
      </div>
      <name-card v-else pageType="p2p" :id="id" :accid="accid"/>
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
      id: 0,
      accid: '',
      showCard: false
    }
  },
  mounted () {
    // 初始化窗口拖拽函数
    Resize.changeSideRange({max: 300, min: 250})
  },
  methods: {
    checkCard (params) {
      this.showCard = true
      this.id = params.id
      this.accid = params.accid
    }
  }
}
</script>