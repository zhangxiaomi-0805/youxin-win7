<template>
<div class="c-default">
  <div class="title" :style="{borderBottomWidth: !pageType ? '1px' : '0'}"></div>
  <div class="body" :style="{backgroundColor: !pageType ? 'rgba(242,242,242,1)' : '#fff'}">
    <div v-if="!pageType"><img style="width: 158px; height: 131px;" :src="logo"/><div class="no-msg">暂无消息</div></div>
    <div v-else style="paddingTop: 7%;"><span class="nice"/><div class="no-msg" style="color: #999;fontSize: 14px;">优信</div></div>
  </div>
</div>
</template>

<script>
export default {
  name: 'default',
  data () {
    return {
      logo: './static/img/no-msg.png'
    }
  },
  computed: {
    pageType () {
      return this.$route.query.pageType
    }
  }
}
</script>

<style>
  .c-default {
    position: absolute;
    top: 25px;
    bottom: 0;
    width: 100%;
  }

  .c-default .title {
    -webkit-app-region: drag;
    box-sizing: border-box;
    width: 100%;
    height: 31px;
    background-color: #fff;
    border-bottom: 1px solid rgba(214,214,214,1);
  }

  .c-default .body {
    position: absolute;
    top: 31px;
    bottom: 0;
    padding-bottom: 56px;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: rgba(242,242,242,1);
  }

  .c-default .body .no-msg {
    font-size: 16px;
    color: #333;
    letter-spacing: 0;
    text-align: center;
  }

  .c-default .body .nice {
    display: block;
    width: 120px;
    height: 120px;
    margin-bottom: 5px;
    background: url('../../../../static/img/orgnize/logo-gray.png') no-repeat center center;
    background-size: 100% 100%;
  }
</style>
