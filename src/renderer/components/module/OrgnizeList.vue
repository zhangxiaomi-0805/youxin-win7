<template>
<!-- 组织架构 -->
<div class="m-main-list" id="resize-side-lf" style="width:270px;">
  <div class="u-search searchevent">
    <div class="u-cont">
      <input :class="showSearch ? 'active' : ''" type="text" v-model="searchValue" placeholder="搜索" @focus="showSearch = true" v-clickoutside="clearStatus"/>
      <span v-if="showSearch" class="clear" @click="clearStatus"/>
    </div>
  </div>
  <search v-if="showSearch" type="orgnize" :value="searchValue" :clearStatus="clearStatus"/>
  <div class="t-title-con">
    <div class="t-title">
      <a :class="listType === 'team' ? 't-title-item t-title-team active' : 't-title-item t-title-team'" @click="toggleList('team')">组织架构</a>
      <a :class="listType === 'myDept' ? 't-title-item t-title-myDept active' : 't-title-item t-title-myDept'" @click="toggleList('myDept')">我的部门</a>
    </div>
  </div>
  <div class="contact-con" ref="contactCon" @scroll="scrollTop = $event.target.scrollTop">
    <tree v-show="listType === 'team'" :callBack="callBack" listType = 'team'/>
    <tree v-show="listType === 'myDept'" :callBack="callBack" listType = 'myDept'/>
  </div>
  <div class="border" id="resize-we"></div>
</div>
</template>

<script>
import Tree from '../tree/Tree.vue'
import Search from '../search/Search.vue'
import clickoutside from '../../utils/clickoutside.js'
export default {
  name: 'orgnize-list',
  directives: {clickoutside},
  components: {Tree, Search},
  props: {
    callBack: Function
  },
  data () {
    return {
      scrollTop: 0,
      showSearch: false,
      searchValue: '',
      listType: 'team'
    }
  },
  activated () {
    // 重置滚动条位置、重置路由
    this.$refs.contactCon.scrollTop = this.scrollTop
  },
  methods: {
    toggleList (value) {
      if (this.listType === value) return
      this.listType = value
    },
    clearStatus (el, e) {
      if (e) {
        let className = e.target.className
        if (className.indexOf('searchevent') > -1) return
      }
      this.showSearch = false
      this.searchValue = ''
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
    overflow-y: auto;
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
  .t-title-con .t-title-myDept {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
</style>
