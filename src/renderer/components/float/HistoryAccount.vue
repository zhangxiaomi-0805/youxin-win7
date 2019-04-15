<template>
  <div v-if="isShow && accountList.length>0" class="account-box" v-clickoutside="closeModal">
    <div class='account-title'>使用以下账号登录:</div>
    <ul class='account-content'>
      <li :class="selectedId == item.id ? 'item item-select' : 'item'" v-for="(item) in accountList" :key="item.id"
        @mouseenter="onMouseenter(item.id)"
        @mouseleave="onMouseleave(item.id)"
        @click="callBack(item)"
        >
          <div>{{item.account}}</div>
          <span v-if='selectedId == item.id' class="clear"/>
      </li>
    </ul>
  </div>
</template>

<script>
import clickoutside from '../../utils/clickoutside.js'
export default {
  name: 'history-account',
  directives: {clickoutside},
  data () {
    return {
      accountList: [],
      selectedId: 0,
      isShow: false
    }
  },
  mounted () {
    this.eventBus.$on('showAccountModal', (data) => {
      this.accountList = data.rememberAccount
      this.isShow = data.isShow
    })
  },
  beforeDestroy () {
    this.eventBus.$off('showAccountModal')
  },
  methods: {
    onMouseenter (id) {
      this.selectedId = id
    },
    onMouseleave (id) {
      this.selectedId = id
    },
    callBack (item) {
      console.log(item)
    },
    closeModal () {
      this.isShow = false
    }
  }
}
</script>

<style>
.account-box {
  position: absolute;
  top: 200px;
  width: 260px;
  height: 132px;
  background: #fff;
  border: 1px solid #049AFF;
  z-index: 1000;
  box-sizing: border-box;
}
.account-box .account-title {
  height: 34px;
  line-height: 34px;
  color: #666666;
  font-size: 12px;
  padding: 0 8px;
  box-sizing: border-box;
}
.account-box .account-content {
  height: 90px;
  width: 100%;
  overflow-y: scroll;
}
.account-box .account-content .item {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  height: 30px;
  line-height: 30px;
  color: #333;
  font-size: 14px;
  transition: all .2s;
  padding: 0 8px;
  box-sizing: border-box;
}
.account-box .account-content .item-select{
  background: rgba(4,254,255,0.15);
}
.account-box .account-content .clear {
    display: block;
    width: 14px;
    height: 14px;
    background-image: url('../../../../static/img/setting/delete.png');
    background-size: 100% 100%;
    cursor: pointer;
}

</style>

