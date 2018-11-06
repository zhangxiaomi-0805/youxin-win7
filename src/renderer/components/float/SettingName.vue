<template>
<!-- 设置群、讨论组名称 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="showSettingName">
    <div class="m-selectcontact-cover"></div>
    <div class="m-clear-body m-dismiss-body" style="width: 380px;height: 197px;">
      <div class="drag" id="settingNameDrag">
        <span class="title">{{type === 1 ? '设置群名称' : '设置讨论组名称'}}</span>

        <div class="u-sysbtn close"><a class="btn-close" @click="closeModal"/></div>
      </div>
      <div class="content">
        <input
          :class="showBorder ? 'active' : ''"
          type="text"
          v-model="name"
          maxlength="32"
          :placeholder="type === 1 ? '请输入群名称' : '请输入讨论组名称'"
          @focus="showBorder = true"
          @blur="showBorder = false">
          <span v-if="name" class="clear" @click="name = ''"/>
      </div>
      <div class="footer">
        <a :class="name ? 'b-confirm' : 'b-confirm disabled'" @click="confirmManage">创建</a>
        <a class="b-cancel" @click="closeModal">取消</a>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import drag from '../../utils/drag.js'
export default {
  name: 'setting-name',
  mounted () {
    this.eventBus.$on('settingName', (data) => {
      this.type = data.type
      this.callBack = data.callBack
      this.showSettingName = true
    })
  },
  data () {
    return {
      showSettingName: false,
      type: 1,
      name: '',
      callBack: '',
      showBorder: false
    }
  },
  updated () {
    drag.dragPosition('settingNameDrag')
  },
  methods: {
    closeModal () {
      this.showSettingName = false
      this.loading = false
    },
    confirmManage () {
      if (!this.name) return
      this.closeModal()
      this.callBack && this.callBack(this.name)
    }
  }
}
</script>

<style scoped>
  .m-clear-body {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 101;
    width: 380px;
    height: 197px;
    transform: translate(-50%, -50%);
    background: #fff;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    border-radius: 4px;
    box-sizing: border-box;
  }

  .m-clear-body .title {
    display: inline-block;
    font-size: 14px;
    color: #999;
    letter-spacing: 0;
    text-align: left;
    line-height: 14px;
    padding: 11px 10px;
  }

  .m-clear-body .drag {
    -webkit-app-region: no-drag;
  }

  .m-clear-body .content {
    position: relative;
    font-size: 14px;
    color: #333;
    letter-spacing: 0;
    text-align: left;
    line-height: 18px;
    padding: 30px 20px;
  }

  .m-clear-body .content input {
    width: 100%;
    border: 0;
    box-sizing: border-box;
    padding: 5px 22px 5px 0;
    font-size: 13px;
    color: #333;
    font-family: "PingFangSC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
    border-bottom: 1px solid rgba(216,220,222,1);
    transition: all .2s linear;
  }
  .m-clear-body .content input::-webkit-input-placeholder {
    font-size: 14px;
    color: rgba(198,203,212,1);
  }
  .m-clear-body .content input.active {
    border-bottom: 1px solid rgba(4,154,255,1);
  }

  .m-clear-body .content .clear {
    position: absolute;
    right: 22px;
    top: 37px;
    display: block;
    width: 14px;
    height: 14px;
    background-image: url('../../../../static/img/setting/delete.png');
    background-size: 100% 100%;
    cursor: pointer;
  }

  .m-clear-body .footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding: 20px 20px;
  }

  .m-clear-body .footer .b-confirm,
  .m-clear-body .footer .b-cancel {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 55px;
    height: 28px;
    border-radius: 4px;
    font-size: 12px;
    transition: all .3s linear;
  }

  .m-clear-body .footer .b-confirm {
    background-color: rgba(4,154,255,1);
    color: #fff;
    margin-right: 20px;
  }
  .m-clear-body .footer .b-confirm:hover {
    background-color: rgb(1, 138, 230);
  }
  .m-clear-body .footer .b-confirm.disabled {
    background: rgba(4,154,255,.5);
    cursor: default;
  }

  .m-clear-body .footer .b-cancel {
    background-color: rgba(242,242,242,1);
    color: #333;
  }
  .m-clear-body .footer .b-cancel:hover {
    background-color: rgba(223, 219, 219, 1);
  }
</style>
