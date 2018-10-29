<template>
<!-- 组织架构 -->
<div class="m-main-list" id="resize-side-lf" style="width:270px;">
  <div class="u-search">
    <div class="u-cont">
      <input type="text" v-model="searchValue" placeholder="搜索" />
      <span v-if="searchValue.length > 0" class="clear" @click="searchValue = ''"/>
    </div>
  </div>
  <div class="contact-con" ref="contactCon" @scroll="scrollTop = $event.target.scrollTop"><tree :callBack="callBack"/></div>
  <div class="border" id="resize-we"></div>
</div>
</template>

<script>
import Tree from '../tree/Tree.vue'
export default {
  name: 'orgnize-list',
  components: {Tree},
  props: {
    callBack: Function
  },
  data () {
    return {
      scrollTop: 0,
      searchValue: ''
    }
  },
  activated () {
    // 重置滚动条位置、重置路由
    this.$refs.contactCon.scrollTop = this.scrollTop
  }
}
</script>

<style scoped>
  .contact-con {
    position: absolute;
    top: 60px;
    bottom: 0;
    width: 100%;
    overflow-y: auto;
  }
</style>
