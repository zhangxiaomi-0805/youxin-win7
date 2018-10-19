<template>
  <transition name="fade">
    <div class="u-toast" v-if="toastConfig.show">
      <i :class="toastConfig.type"></i>
      <span>{{toastConfig.toastText}}</span>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'toast',
  computed: {
    toastConfig () {
      return this.$store.state.toastConfig
    }
  }
}
</script>

<style>
.g-window .u-toast{
  position: fixed;
  z-index: 1100;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
  height: 40px;
  padding: 0 40px;
  background: #FFF2CE;
  border: 1 solid #E0CAAE;
  box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
  border-radius: 4px;
}

.g-window .u-toast span{
  font-size: 14px;
  color: #333;
}

.g-window .u-toast i{
  width: 23px;
  height: 23px;
  margin-right: 7px;
}

.g-window .u-toast .fail{
  background: url(../../../../static/img/toast/toast-fail.png) no-repeat center center;
  background-size: 100% 100%;
}

.g-window .u-toast .success{
  background: url(../../../../static/img/toast/toast-success.png) no-repeat center center;
  background-size: 100% 100%;
}
</style>
