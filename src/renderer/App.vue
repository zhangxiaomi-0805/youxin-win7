<template>
  <div id="app" style="-webkit-user-select: none;" @dragstart="eventDefault($event)" @dragover="eventDefault($event)" @drop="eventDefault($event)">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'NICE',
    // 所有页面更新都会触发此函数
    updated () {
      // 提交sdk连接请求
      // this.$store.dispatch('connect')
      // this.$store.dispatch('updateRefreshState')
    },
    methods: {
      eventDefault (e) {
        // 阻止浏览器默认事件
        e.preventDefault()
        return false
      }
    }
  }
</script>

<style>
  /* CSS */
</style>
