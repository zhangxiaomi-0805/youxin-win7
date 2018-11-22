<template>
<!-- 清除聊天记录 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="showUpdateApp">
    <div class="m-selectcontact-cover"></div>
    <div class="m-clear-body update-app">
      <div class="drag"><div class="u-sysbtn close"><a class="btn-close" @click="closeModal" v-if="content.forceUpdate !== 1"/></div></div>
      <div class="content">
        <img class="logo" :src="logo">
        <div class="version">{{`优信${content.versionNum}`}}</div>
        <div class="update-content">
          {{content.updateContent}}
        </div>
      </div>
      <div class="update-footer">
        <div class="btn confirm"><span>立即升级</span></div>
        <div v-if="content.forceUpdate !== 1" class="btn cancel">忽略</div>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
export default {
  name: 'update-app',
  mounted () {
    this.eventBus.$on('updateApp', (data) => {
      this.showUpdateApp = true
      this.content = data
    })
  },
  data () {
    return {
      showUpdateApp: false,
      logo: './static/img/logo.png',
      content: {}
    }
  },
  methods: {
    closeModal () {
      this.showUpdateApp = false
    }
  }
}
</script>

<style scoped>
  .update-app {
    width: 360px;
    height: 471px;
  }

  .update-footer {
    padding: 0 30px;
  }

  .update-footer .btn {
    width: 100%;
    height: 45px;
    line-height: 45px;
    text-align: center;
    color: #fff;
    font-size: 16px;
    background-color: rgba(4,154,255,1);
    border-radius: 10px;
    cursor: pointer;
    transition: background .2s linear;
  }
  .update-footer .btn:hover {
    background: rgb(1, 138, 230);
  }

  .update-footer .cancel {
    background-color: transparent;
    color: #aaa;
  }
  .update-footer .cancel:hover {
    background-color: transparent;
  }

  .update-app .logo {
    width: 130px;
    width: 130px;
    margin-bottom: 10px;
  }

  .update-app .content {
    text-align: center;
  }

  .update-app .version {
    font-size: 16px;
    color: #333;
    margin-bottom: 20px;
  }

  .update-app .update-content {
    text-align: left;
    height: 110px;
    overflow-y: auto;
    font-size: 14px;
    line-height: 22px;
    color: #999;
    padding: 0 20px;
  }
</style>
