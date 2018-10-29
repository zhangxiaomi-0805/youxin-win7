<template>
<!-- 群组 -->
<div class="m-main-list" id="resize-side-lf" style="width:270px;">
  <div class="u-search">
    <div class="u-cont">
      <input type="text" v-model="searchValue" placeholder="搜索" />
      <span v-if="searchValue.length > 0" class="clear" @click="searchValue = ''"/>
    </div>
  </div>
  <div class="contact-con" ref="contactCon" @scroll="scrollTop = $event.target.scrollTop">
    <ul class="u-list t-u-list" v-if="grouplist.length > 0">
      <li
        :class='activeId === group.teamId ? "u-list-item-active t-u-list-item t-center" : "u-list-item t-u-list-item t-center"'
        v-for="group in grouplist"
        :key="group.id" 
        :id="group.id"
        @click="checkCard(group)"
      >
        <div class="t-list-item-left t-center">
          <img :src="group.avatar || defaultIcon"/>
          <span class="teamname" :title="group.name">{{group.name}}</span>
        </div>
        <span class="t-num">{{group.memberNum}}</span>
      </li>
    </ul>
  </div>
  <div class="border" id="resize-we"></div>
</div>
</template>

<script>
export default {
  name: 'team-list',
  props: {
    callBack: Function
  },
  data () {
    return {
      scrollTop: 0,
      searchValue: '',
      activeId: ''
    }
  },
  computed: {
    grouplist () {
      let grouplist = this.$store.state.teamlist.filter(item => {
        return item.valid && item.validToCurrentUser
      })
      return grouplist
    }
  },
  activated () {
    // 重置滚动条位置
    this.$refs.contactCon.scrollTop = this.scrollTop
  },
  methods: {
    checkCard (group) {
      if (this.activeId === group.teamId) return
      this.activeId = group.teamId
      this.callBack({pageType: 'team', id: group.teamId})
    }
  }
}
</script>

<style scoped>
  .contact-con {
    position: absolute;
    top: 56px;
    bottom: 0;
    width: 100%;
  }

  .t-center {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .t-u-list {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    overflow-y: auto;
  }

  .t-u-list-item {
    justify-content: space-between;
    width: 100%;
    height: 68px;
    box-sizing: border-box;
    padding: 0 12px;
    cursor: default;
  }
  .t-u-list-item img {
    width: 42px;
    height: 42px;
    border-radius: 50%;
  }

  .t-list-item-left {
    width: 90%;
  }

  .t-u-list-item .teamname {
    font-size: 14px;
    padding-left: 10px;
  }

  .t-u-list-item .t-num {
    font-size: 13px;
    color: #999;
  }
</style>
