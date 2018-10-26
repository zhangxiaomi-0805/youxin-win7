<template>
<div style="height:100%;">
  <orgnize-list/>
  <div class="m-main-content" id="resize-side-rt" style="margin-left:271px;">
    <system-caption/>
    <div class="c-default">
      <div class="title" style="borderBottomWidth: 0"></div>
      <div class="body" style="backgroundColor: #fff">
        <div style="paddingTop: 7%;"><span class="nice"/><div class="no-msg" style="color: #999;fontSize: 14px;">优信</div></div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import SystemCaption from '../controls/SystemCaption.vue'
import OrgnizeList from '../module/OrgnizeList.vue'
import Resize from '../../utils/resize.js'
export default {
  name: 'orgnize',
  components: {OrgnizeList, SystemCaption},
  mounted () {
    // 初始化窗口拖拽函数
    Resize.changeSideRange({max: 300, min: 250})
  }
}
</script>