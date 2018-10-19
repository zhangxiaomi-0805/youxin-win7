<template>
<div style="height:100%;">
  <contacts-list/>
  <div class="m-main-content" id="resize-side-rt" style="margin-left:271px;">
    <system-caption/>
    <router-view/>
  </div> 
</div>
</template>

<script>
import ContactsList from '../module/ContactsList.vue'
import SystemCaption from '../controls/SystemCaption.vue'
import Resize from '../../utils/resize.js'
export default {
  name: 'contacts-page',
  components: {ContactsList, SystemCaption},
  mounted () {
    // 初始化窗口拖拽函数
    Resize.changeSideRange({max: 300, min: 250})
  }
}
</script>

<style>

</style>

