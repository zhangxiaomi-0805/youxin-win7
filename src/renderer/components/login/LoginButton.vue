<template>
  <a :class="!disabled ? 'b-contain' : 'b-contain disabled'" @click="callBack">
    <span class="loading" v-if="loading"/><span v-else>{{text}}</span>
  </a>
</template>

<script>
  export default {
    name: 'login-button',
    props: {
      text: String,
      disabled: Boolean,
      loading: Boolean,
      callBack: Function
    }
  }
</script>

<style scoped>
  .b-contain {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 44px;
    background: rgba(79,141,255,1);
    border-radius: 10px;
    font-size: 16px;
    color: #fff;
    transition: all .2s linear;
    cursor: pointer;
  }
  .b-contain:hover {
    background: rgb(77, 128, 223);
  }

  .b-contain.disabled {
    background: rgba(79,141,255,.5);
    cursor: default;
  }
  .b-contain.disabled:hover {
    background: rgba(79,141,255,.5);
  }

  .b-contain .loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url('../../../../static/img/setting/loading-blur.gif') no-repeat center center;
    background-size: 100% 100%;
  }
</style>

