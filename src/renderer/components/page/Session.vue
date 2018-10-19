<template>
<div style="height:100%;">
  <session-list/>
  <div class="m-main-content" id="resize-side-rt" style="margin-left:271px;">
    <system-caption/>
    <router-view/>
  </div>
</div>
</template>

<script>
import SessionList from '../module/SessionList.vue'
import SystemCaption from '../controls/SystemCaption.vue'
import Resize from '../../utils/resize.js'
export default {
  name: 'session-page',
  components: {SessionList, SystemCaption},
  mounted () {
    // 初始化窗口拖拽函数
    Resize.changeSideRange({max: 300, min: 250})
  }
}
</script>
