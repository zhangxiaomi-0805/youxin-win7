<template>
<!-- 群组 -->
<div class="m-main-list" id="resize-side-lf" style="width:270px;">
  <div class="u-search">
    <div class="u-cont">
      <input type="text" v-model="searchValue" placeholder="搜索" />
      <span v-if="searchValue.length > 0" class="clear" @click="searchValue = ''"/>
    </div>
  </div>
  <div class="t-title-con">
    <div class="t-title">
      <a :class="listType === 'team' ? 't-title-item t-title-team active' : 't-title-item t-title-team'" @click="toggleList('team')">交流群</a>
      <a :class="listType === 'group' ? 't-title-item t-title-group active' : 't-title-item t-title-group'" @click="toggleList('group')">讨论组</a>
    </div>
  </div>
  <div class="contact-con" ref="contactCon" @scroll="scrollTop = $event.target.scrollTop">
    <ul class="u-list t-u-list" v-show="grouplist.length > 0 && listType === 'team'">
      <li
        :class='activeId === group.teamId ? "u-list-item-active t-u-list-item t-center" : "u-list-item t-u-list-item t-center"'
        :style="hasBorder && group.id === acSessionId ? {border: '1px solid #4F8DFF'}: {border: '1px solid transparent'}"
        v-for="group in grouplist"
        :key="group.id" 
        :id="group.id"
        @click="checkCard(group)"
        @mouseup.stop="onShowMenu($event, group)"
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
      activeId: '',
      listType: 'team'
    }
  },
  computed: {
    grouplist () {
      let grouplist = this.$store.state.teamlist.filter(item => {
        return item.valid && item.validToCurrentUser
      })
      return grouplist
    },
    hasBorder () {
      if (this.$store.state.showListOptions) {
        return true
      }
      return false
    },
    acSessionId () {
      return this.$store.state.sessionAc
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
      this.callBack({teamId: group.teamId})
    },
    toggleList (value) {
      if (this.listType === value) return
      this.listType = value
    },
    onShowMenu (e, session) {
      // 单个列表右击事件
      if (e.button === 2) {
        // to do soming
      }
    }
  }
}
</script>

<style scoped>
  .contact-con {
    position: absolute;
    top: 120px;
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
    height: 67px;
    box-sizing: border-box;
    padding: 0 10px;
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
    padding-left: 11px;
    color: rgba(51,51,51,1);
  }

  .t-u-list-item .t-num {
    font-size: 14px;
    color: rgba(153,153,153,1);
  }

  .t-title-con {
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    height: 64px;
    padding: 10px 0 24px;
  }
  .t-title-con .t-title {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    width:143px;
    height:30px;
    border-radius:4px;
    border:1px solid #049AFF;
  }
  .t-title-con .t-title-item {
    width: 50%;
    height: 100%;
    line-height: 27px;
    text-align: center;
    color: rgba(51,51,51,1);
    font-size: 15px;
    transition: opacity .3s linear;
  }
  .t-title-con .t-title-item:hover {
    opacity: 0.7;
  }

  .t-title-con .t-title-item.active {
    color: rgba(255,255,255,1);
    background-color: #049AFF;
  }

  .t-title-con .t-title-team {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  .t-title-con .t-title-group {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
</style>
