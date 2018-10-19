<template>
<div style="height:100%;position:relative;">
  <system-caption/>
  <div class="c-default">
    <div class="title" style="borderBottom: 0;"></div>
    <div class="body" style="backgroundColor: #fff;">
      <div>
        <img style="width: 158px; height: 131px;" :src="logo"/>
        <div class="no-msg">敬请期待</div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import SystemCaption from '../controls/SystemCaption.vue'
export default {
  name: 'workbench',
  components: {SystemCaption},
  data () {
    return {
      logo: './static/img/no-msg.png'
    }
  }
}
</script>