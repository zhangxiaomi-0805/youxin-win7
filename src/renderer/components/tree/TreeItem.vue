<template>
<div>
  <ul class="t-u-list"  
  style="{height: 'auto',overflow: 'hidden'}">
    <li class="t-u-list-item" v-for="(orgnize, $index) in orgnizelist" :key="orgnize.id" :id="orgnize.id">
      <div 
        class="t-orgname" 
        :style="{paddingLeft: (orgnize.orgLevel + (showTitle ? 2 : listType === 'group' ? 0 : 1)) * 14 + 'px'}" 
        @click="toggleStatus(orgnize.id, orgnize, $index)" 
        @mouseenter="mouseenter('orgAddAllId', orgnize.id)"
        @mouseleave="mouseleave('orgAddAllId')">
        <span v-if="orgnize.hasChild" :class="activeId === orgnize.id ? 't-open' : 't-takeup'"/>
        <span v-else class="t-common"/>
        <span class="orgname" :title="orgnize.name">{{orgnize.name}}</span>
        <transition name="fade"><a v-if="orgnize.id === orgAddAllId && showCheck" class="t-addAll" @click.stop="selectAllMember(orgnize, orgnize.id, $index)">+</a></transition>
      </div>
      <div    
        v-if="getNextOrgnizeObj(orgnize.id)"
        :class="activeId === orgnize.id ? 't-body active' : 't-body'">
        <tree-item
          :noAdd="noAdd"
          :showTitle="showTitle"
          :showCheck="showCheck"
          :orgnizeObj="orgnizeObj"
          :orgnizeLevelObj="getNextOrgnizeObj(orgnize.id)"
          :orgLevel="listType === 'group' ?  orgnize.orgLevel : orgnize.orgLevel + 1"
          :orgSelectId="orgSelectId"
          :orgSelectLevel="orgSelectLevel"
          :orgSelectHandle="orgSelectHandle"
          :renderOrgData="renderOrgData"/>
      </div>
    </li>
  </ul>
  <ul 
    v-if="userlist"
    class="t-u-list t-body active" 
    style="{height: 'auto',overflow: 'hidden'}">
    <li class="t-u-list-item" v-for="user in userlist" :key="user.id" :id="user.id">
      <div 
        :class="!showCheck && (orgSelectId === user.accid && orgSelectLevel === currentId) ? 't-orgname active' : 't-orgname'"
        :style="{paddingLeft: (orgLevel + (showTitle ? 2 : 1)) * 14 + 'px', height: '31px'}" 
        @click="orgHandle(user)">
        <span v-if="!showCheck && (orgSelectId === user.accid && orgSelectLevel === currentId)" class="t-side"></span>
        <span v-if="showCheck" :class="className(user)"></span>
        <img :src="user.avatar && (user.avatar !== 'undefined') ? user.avatar : defaultUserIcon"/>
        <span class="orgname" :title="user.name">{{user.name}}</span>
      </div>
    </li>
  </ul>
</div>
</template>

<script>
import configs from '../../configs/index.js'
import TreeItem from './TreeItem.vue'
import Request from '../../utils/request.js'
export default {
  name: 'tree-item',
  components: {TreeItem},
  props: {
    showTitle: Boolean,
    showCheck: Boolean,
    noAdd: Boolean,
    orgnizeObj: Object,
    orgnizeLevelObj: Object,
    orgLevel: Number,
    orgSelectId: String,
    orgSelectLevel: Number,
    orgSelectHandle: Function,
    renderOrgData: Function,
    listType: String // lisType='team'---组织架构；lisType='group'---我的部门
  },
  data () {
    return {
      activeId: -1,
      orgAddAllId: -1,
      defaultUserIcon: configs.defaultUserIcon,
      myDept: this.$store.state.personInfos.companyName, // 获取我的组织
      myDeptId: this.$store.state.personInfos.companyId // 获取我的组织id
    }
  },
  computed: {
    orgnizelist () {
      return (this.orgnizeLevelObj && this.orgnizeLevelObj.orgnizelist) || []
    },
    userlist () {
      return (this.orgnizeLevelObj && this.orgnizeLevelObj.userlist) || []
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
    toggleStatus (id, orgnize, index) {
      if (id === this.activeId) {
        this.activeId = -1
        return false
      }
      if (id === this.myDeptId) {
        this.activeId = id
        return
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
        if (!this.isDisabled(user.accid)) {
          this.orgSelectHandle(params)
        }
      } else {
        this.orgSelectHandle(params)
      }
    },
    async selectAllMember (orgnize, id, index) {
      // 选取全部成员
      let orgnizeObj = this.orgnizeObj[id]
      if (!orgnizeObj) {
        try {
          orgnizeObj = await this.getNextMember(id, 0)
        } catch (error) {}
      }
      for (let i in orgnizeObj.userlist) {
        let user = Object.assign({}, orgnizeObj.userlist[i])
        if (!this.isDisabled(user.accid)) {
          user.type = 'cover'
          this.$store.commit('upadteCreateTeamSelect', {type: 'update', data: user})
        }
      }
    },
    getNextMember (depId, tag) {
      return new Promise((resolve, reject) => {
        Request.PullDepartment({
          depId, tag
        }, this).then(ret => {
          if (ret) resolve(ret)
        }).catch((err) => reject(err))
      })
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
    },
    mouseenter (type, id) {
      if (this.noAdd) return
      this[type] = id
    },
    mouseleave (type) {
      if (this.noAdd) return
      this[type] = -1
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

  .t-addAll {
    position: absolute;
    right: 12px;
    top: 7px;
    width:22px;
    height:22px;
    line-height: 20px;
    border-radius: 50%;
    background-color: #049AFF;
    text-align: center;
    color: #fff;
    font-size: 20px;
  }
</style>


