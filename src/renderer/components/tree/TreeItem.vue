<template>
<div>
  <ul class="t-u-list">
    <li class="t-u-list-item" v-for="(orgnize, $index) in orgnizelist" :key="orgnize.id" :id="orgnize.id">
      <div class="t-orgname" :style="{paddingLeft: (orgnize.orgLevel + (showTitle ? 2 : 1)) * 13 + 'px'}" @click="toggleStatus(orgnize, orgnize.id, $index)" >
        <span v-if="orgnize.hasChild" :class="activeId === orgnize.id ? 't-open' : 't-takeup'"/>
        <span v-else class="t-common"/>
        <span class="orgname" :title="orgnize.name">{{orgnize.name}}</span>
      </div>
      <div    
        v-if="getNextOrgnizeObj(orgnize.id)"
        :class="activeId === orgnize.id ? 't-body active' : 't-body'">
        <tree-item
          :showTitle="showTitle"
          :showCheck="showCheck"
          :orgnizeObj="orgnizeObj"
          :orgnizeLevelObj="getNextOrgnizeObj(orgnize.id)"
          :orgLevel="orgnize.orgLevel + 1"
          :orgSelectId="orgSelectId"
          :orgSelectLevel="orgSelectLevel"
          :orgSelectHandle="orgSelectHandle"
          :renderOrgData="renderOrgData"/>
      </div>
    </li>
  </ul>
  <ul 
    v-if="userlist"
    class="t-u-list t-body active">
    <li class="t-u-list-item" v-for="user in userlist" :key="user.id" :id="user.id">
      <div 
        :class="!showCheck && (orgSelectId === user.accid && orgSelectLevel === currentId) ? 't-orgname active' : 't-orgname'"
        :style="{paddingLeft: (orgLevel + (showTitle ? 2 : 1)) * 14 + 'px', height: '31px'}" 
        @click="orgHandle(user)">
        <span v-if="!showCheck && (orgSelectId === user.accid && orgSelectLevel === currentId)" class="t-side"></span>
        <span v-if="showCheck" :class="className(user)"></span>
        <img :src="user.avatar ? user.avatar : defaultUserIcon"/>
        <span :class="user.userStatus === 2 ? 'orgname' : 'orgname notActive'" :title="user.name">{{user.name}}</span>
      </div>
    </li>
  </ul>
</div>
</template>

<script>
import configs from '../../configs/index.js'
import TreeItem from './TreeItem.vue'
export default {
  name: 'tree-item',
  components: {TreeItem},
  props: {
    showTitle: Boolean,
    showCheck: Boolean,
    orgnizeObj: Object,
    orgnizeLevelObj: Object,
    orgLevel: Number,
    orgSelectId: String,
    orgSelectLevel: Number,
    orgSelectHandle: Function,
    renderOrgData: Function
  },
  data () {
    return {
      activeId: -1,
      defaultUserIcon: configs.defaultUserIcon
    }
  },
  computed: {
    orgnizelist () {
      return this.orgnizeLevelObj.orgnizelist
    },
    userlist () {
      return this.orgnizeLevelObj.userlist
    },
    currentId () {
      return this.orgnizeLevelObj.currentId
    },
    createTeamSelect () {
      return this.$store.state.createTeamSelect
    },
    orgDisabledlist () {
      return this.$store.state.orgDisabledlist
    },
    personInfos () {
      return this.$store.state.personInfos
    }
  },
  methods: {
    className (user) {
      if (user.userStatus === 1) {
        // 未激活
        return 'unActive common'
      }
      if (this.isDisabled(user.accid)) {
        return 'disabled common'
      }
      if (this.isChecked(user.accid)) {
        return 'checked common'
      }
      return 'check common'
    },
    getNextOrgnizeObj (id) {
      // 获取下一个父节点
      return this.orgnizeObj[id]
    },
    toggleStatus (orgnize, id, index) {
      if (id === this.activeId) {
        this.activeId = -1
        return false
      }
      if (orgnize.hasChild) {
        // 切换展开、收起状态
        this.activeId = id
        let tag = (this.getNextOrgnizeObj(id) && this.getNextOrgnizeObj(id).tag) || 0
        this.renderOrgData({depId: id, tag, parentId: this.currentId})
      }
    },
    orgHandle (user) {
      let params = Object.assign({}, user)
      params.level = this.currentId
      if (this.showCheck) {
        if (user.userStatus === 2 && !this.isDisabled(user.accid)) {
          this.orgSelectHandle(params)
        }
      } else {
        this.orgSelectHandle(params)
      }
    },
    isDisabled (accid) {
      for (let i in this.orgDisabledlist) {
        if (this.orgDisabledlist[i] === accid) {
          return true
        }
      }
      if (this.personInfos.accid === accid) return true
      return false
    },
    isChecked (accid) {
      for (let i in this.createTeamSelect) {
        if (this.createTeamSelect[i].accid === accid) {
          return true
        }
      }
      return false
    }
  }
}
</script>

<style scoped>
  .t-u-list .t-u-list-item .t-orgname {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 36px;
    padding-left: 12px;
    padding-right: 12px;
    font-size: 14px;
    color: #333;
    transition: all .3s linear;
    cursor: default;
  }
  .t-u-list .t-u-list-item .t-orgname:hover {
    background-color: rgba(242,242,242,1);
  }
  .t-u-list .t-u-list-item .t-orgname.active {
    background-color: #F7F7F7;
    transition: all .2s linear;
  }

  .t-orgname .t-common {
    width: 15px;
    height: 15px;
    margin-right: 3.5px;
    margin-left: 5px;
  }

  .t-orgname .t-takeup {
    width: 15px;
    height: 15px; 
    background: url('../../../../static/img/orgnize/takeup.png') no-repeat center center;
    background-size: 7px 9px;
    margin-right: 3.5px;
  }

  .t-orgname .t-open {
    width: 15px;
    height: 15px;
    margin-right: 3.5px;
    background: url('../../../../static/img/orgnize/open.png') no-repeat center center;
    background-size: 9px 7px;
  }

  .t-orgname .orgname {
    display: inline-block;
    width: 86%;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
  .t-orgname .orgname.notActive {
    color: #ccc;
  }

  .t-orgname > img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 6px;
  }

  .t-orgname .t-file {
    width: 16px;
    height: 12px;
    background: url('../../../../static/img/orgnize/org-logo.png') no-repeat center center;
    background-size: 100% 100%;
    margin-right: 6px;
  }

  .t-body {
    overflow: hidden;
    height: 0;
  }
  .t-body.active {
    height: auto;
  }

  .t-u-list .t-u-list-item .common {
    display: inline-block;
    width: 15px;
    height: 15px;
    margin-right: 6px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
  }

  .t-u-list .t-u-list-item .check {
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 100% 100%;
  }
  .t-u-list .t-u-list-item .check:hover, .check:focus {
    background-image: url('../../../../static/img/setting/checkboxborder-p.png');
  }

  .t-u-list .t-u-list-item .disabled {
    background-image: url('../../../../static/img/setting/checkbox-d.png');
    background-size: 100% 100%;
  }

  .t-u-list .t-u-list-item .unActive {
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 100% 100%;
    opacity: .5;
  }

  .t-u-list .t-u-list-item .checked {
    background-image: url('../../../../static/img/setting/checkbox-c.png');
    background-size: 100% 100%;
  }

  .t-side {
    position: absolute;
    right: 0;
    width:2px;
    height:31px;
    background:rgba(4,154,255,1);
  }
</style>


