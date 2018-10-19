<template>
<!-- 设置浮层 -->
<transition name="fade">
  <div class="m-gen-set-con" v-if="showGeneralSetting">
    <div class="m-gen-set-cover"></div>
    <div class="m-gen-set">
      <div class="title"><span>设置</span><div class="u-sysbtn close"><a class="btn-close" @click="closeModal()"/></div></div>
      <div class="set-act">
        <div class="set-act-lf"><div class="set-act-task active"><span>账号与安全</span><span class="set-active"></span></div></div>
        <div class="set-act-rt">
          <div class="set-block">
            <div class="title">手机号</div>
            <div class="set-block-show"><span :title="personInfos.phone">{{personInfos.phone}}</span><a @click="showDetail($event, 2)" class="toggle">更换</a></div>
          </div>
          <div class="set-block">
            <div class="title">邮箱地址</div>
            <div class="set-block-show"><span :title="personInfos.email">{{personInfos.email}}</span><a @click="showDetail($event, 3)" class="toggle">更换</a></div>
          </div>
          <div class="set-block">
            <div class="title">密码</div>
            <div class="set-block-show"><span>已设置</span><a @click="showDetail($event, 4)" class="toggle">修改</a></div>
          </div>
          <div class="set-block logout">
            <a @click="eventBus.$emit('logout')">退出登录</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
export default {
  name: 'general-setting',
  data () {
    return {
      showGeneralSetting: false,
      phone: '',
      email: ''
    }
  },
  mounted () {
    this.eventBus.$on('generalSetting', (data) => {
      this.showGeneralSetting = data.show
    })
  },
  methods: {
    closeModal () {
      this.showGeneralSetting = false
    },
    showDetail (event, setType) {
      this.eventBus.$emit('settingDetail', {event, setType})
    }
  },
  computed: {
    personInfos () {
      return this.$store.state.personInfos
    }
  }
}
</script>

<style scoped>
  .m-gen-set-con {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1001;
  }

  .m-gen-set-con .m-gen-set-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }

  .m-gen-set-con .m-gen-set {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 500px;
    height: 339px;
    transform: translate(-50%, -50%);
    background: #fff;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    border-radius: 0 0 4px 4px;
    z-index: 100;
  }

  .m-gen-set-con .title {
    font-size: 14px;
    color: #999;
  }
  .m-gen-set-con .title > span {
    display: inline-block;
    padding: 4px 0 0 10px;
  }

  .m-gen-set-con .set-act {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    position: absolute;
    top: 25px;
    bottom: 0;
    width: 100%;
    padding: 38px 40px 30px;
  }

  .m-gen-set-con .set-act .set-act-lf {
    width: 90px;
    height: 100%;
    border-right: 1px solid rgba(216,220,222,1);
  }
  .m-gen-set-con .set-act .set-act-rt {
    width: 330px;
    height: 100%;
    padding-left: 20px;
  }

  .m-gen-set-con .set-act-task {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 20px;
    font-size: 14px;
    color: #999;
  }
  .m-gen-set-con .set-act-task.active {
    color: rgba(79,141,255,1);
  }
  .m-gen-set-con .set-active {
    display: inline-block;
    width: 2px;
    height: 20px;
    background: rgba(79,141,255,1);
  }

  .m-gen-set-con .set-block {
    margin-bottom: 20px;
  }

  .m-gen-set-con .logout {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 0;
    height: 44px;
  }

  .m-gen-set-con .logout > a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 76px;
    height: 28px;
    background-color: rgba(242,242,242,1);
    border-radius: 2px;
    font-size: 12px;
    color: rgba(245,99,97,1);
    transition: all .3s linear;
  }
  .m-gen-set-con .logout > a:hover {
    background-color: rgb(235, 228, 228);
  }

  .m-gen-set-con .set-block .set-block-show {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: #000;
    line-height: 26px;
  }

  .m-gen-set-con .set-block .set-block-show > span {
    display: inline-block;
    height: 26px;
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: default;
  }

  .m-gen-set-con .set-block .toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 26px;
    background: rgba(242,242,242,1);
    border-radius: 2px;
    font-size: 12px;
    color: #333;
    transition: all .3s linear;
  }
  .m-gen-set-con .set-block .toggle:hover {
    background: rgb(235, 228, 228);
  }
</style>

