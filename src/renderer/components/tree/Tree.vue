<template>
<div>
  <!-- 常用联系人 -->
  <div v-if="showTeam && contactsToplist.length > 0">
    <a class="t-list" @click="contactsopen = !contactsopen">
      <div class="t-center t-title">
        <span :class="contactsopen ? 't-up' : 't-down'"/>
        <div class="t-center"><span style="line-height: 14px;">常用联系人</span></div>
      </div>
    </a>
    <div :class="contactsopen ? 't-body active' : 't-body'">
      <ul class="t-u-list">
        <li 
          class="t-u-list-item t-center"
          v-for="contact in contactsToplist" 
          :key="contact.id"
          :id="contact.id"
          @click="orgSelectHandle(contact)"
        >
          <span v-if="showCheck" :class="className(contact)"></span>
          <img :src="contact.avatar || defaultUserIcon"/>
          <span class="teamname" :title="contact.name">{{contact.name}}</span>
        </li>
      </ul>
    </div>
  </div>
  <!-- 交流群 -->
  <div v-if="showTeam && teamlist.length > 0">
    <a class="t-list" @click="teamopen = !teamopen">
      <div class="t-center t-title">
        <span :class="teamopen ? 't-up' : 't-down'"/>
        <div class="t-center"><span style="line-height: 14px;">交流群</span></div>
      </div>
    </a>
    <div :class="teamopen ? 't-body active' : 't-body'">
      <ul class="t-u-list">
        <li 
          class="t-u-list-item t-center"
          v-for="team in teamlist" 
          :key="team.id"
          :id="team.id"
          @click="noAdd && groupSelectHandle(team)"
          @mouseenter="mouseenter('teamAddAllId', team.teamId)"
          @mouseleave="mouseleave('teamAddAllId')"
        >
          <span v-if="noAdd" :class="classNameTeam(team)"></span>
          <img :src="team.avatar || defaultIcon"/>
          <span class="teamname" :title="team.name">{{team.name}}</span>
          <transition name="fade"><a v-if="team.teamId === teamAddAllId" class="t-addAll" @click.stop="groupSelectHandle(team)">+</a></transition>
        </li>
      </ul>
    </div>
  </div>
  <!-- 讨论组 -->
  <div v-if="showTeam && grouplist.length > 0">
    <a class="t-list" @click="groupopen = !groupopen">
      <div class="t-center t-title">
        <span :class="groupopen ? 't-up' : 't-down'"/>
        <div class="t-center"><span style="line-height: 14px;">讨论组</span></div>
      </div>
    </a>
    <div :class="groupopen ? 't-body active' : 't-body'">
      <ul class="t-u-list">
        <li 
          class="t-u-list-item t-center"
          v-for="group in grouplist" 
          :key="group.id"
          :id="group.id"
          @click="noAdd && groupSelectHandle(group)"
          @mouseenter="mouseenter('groupAddAllId', group.teamId)"
          @mouseleave="mouseleave('groupAddAllId')"
        >
          <span v-if="noAdd" :class="classNameTeam(group)"></span>
          <img :src="group.avatar || defaultIcon"/>
          <span class="teamname" :title="group.name">{{group.name}}</span>
          <transition name="fade"><a v-if="group.teamId === groupAddAllId" class="t-addAll" @click.stop="groupSelectHandle(group)">+</a></transition>
        </li>
      </ul>
    </div>
  </div>
  <!-- 组织树 -->
  <div>
    <a v-if="showTitle" class="t-list" @click="toggleOrg">
      <div class="t-center t-title">
        <span :class="orginzeopen ? 't-up' : 't-down'"/>
        <div class="t-center"><span style="line-height: 14px;">组织架构</span></div>
      </div>
    </a>

    <!-- 我的部门-我所在部门 -->
    <div 
      v-if="listType === 'group'"
      class="t-orgname" 
      style="paddingLeft: 13px"
      @click="toggleDept"  
    >
      <div v-if="groupObj[myDeptId]" :class="myDeptOpen ? 't-open' : 't-takeup'"/>
      <div v-else class="t-common"/>
      <span class="mydept" :title="myDept || ''">{{myDept || ''}}</span>
    </div>

    <div :class="(orginzeopen &&listType !== 'group') || (myDeptOpen &&listType === 'group') ? 't-body active' : 't-body'">
      <tree-item
        :listType="listType"
        :noAdd="noAdd"
        :showTitle="showTitle"
        :showCheck="showCheck"
        :orgnizeObj="listType === 'team' ? orgnizeObj : groupObj"
        :orgnizeLevelObj="listType === 'team' ? orgnizeObj[0] : groupObj[myDeptId]"
        :orgLevel="1"
        :orgSelectId="orgSelectId"
        :orgSelectLevel="orgSelectLevel"
        :orgSelectHandle="orgSelectHandle"
        :renderOrgData="listType === 'team' ? renderOrgData : renderGroupData"/>
    </div>
  </div>
</div>
</template>

<script>
import configs from '../../configs/index.js'
import util from '../../utils'
import TreeItem from './TreeItem.vue'
import Request from '../../utils/request.js'
import SearchData from '../search/search.js'
export default {
  name: 'tree',
  props: {
    showTitle: Boolean,
    showTeam: Boolean,
    showCheck: Boolean,
    noAdd: Boolean,
    callBack: Function,
    listType: String // lisType='team'---组织架构；lisType='group'---我的部门
  },
  components: {TreeItem},
  data () {
    return {
      defaultIcon: './static/img/orgnize/team-head.png',
      defaultUserIcon: configs.defaultUserIcon,
      orginzeopen: !this.showTitle, // 组织机构展开状态
      myDeptOpen: false, // 我的部门展开状态
      companyopen: false, // 公司展开状态
      teamopen: false, // 群展开状态
      groupopen: false, // 讨论组
      contactsopen: false,
      companyInfo: {}, // 公司信息
      orgSelectId: '', // 选中组织成员id
      orgSelectLevel: -1, // 选中组织成员所属组织
      teamAddAllId: -1,
      groupAddAllId: -1,
      myDept: this.$store.state.personInfos.companyName, // 获取我的组织
      myDeptId: this.$store.state.personInfos.companyId // 获取我的组织id
    }
  },
  mounted () {
    if (this.listType === 'team') {
      this.orgDataInit()
    } else if (this.listType === 'group') {
      this.groupDataInit()
    }
  },
  computed: {
    orgnizeObj () {
      return this.$store.state.orgnizeObj
    },
    groupObj () {
      return this.$store.state.groupObj
    },
    contactsToplist () {
      return this.$store.state.contactsToplist
    },
    teamlist () {
      let teamlist = this.$store.state.teamlist.filter(item => {
        return item.valid && item.validToCurrentUser && !util.isDiscussGroup(item)
      })
      return teamlist
    },
    grouplist () {
      let grouplist = this.$store.state.teamlist.filter(item => {
        return item.valid && item.validToCurrentUser && util.isDiscussGroup(item)
      })
      return grouplist
    },
    createTeamSelect () {
      return this.$store.state.createTeamSelect
    }
  },
  methods: {
    className (contact) {
      if (this.isDisabled(contact.accid)) {
        return 'disabled common'
      }
      for (let i in this.createTeamSelect) {
        let item = this.createTeamSelect[i]
        if (item.accid === contact.to || item.accid === contact.accid) {
          return 'checked common'
        }
      }
      return 'check common'
    },
    classNameTeam (group) {
      for (let i in this.createTeamSelect) {
        let item = this.createTeamSelect[i]
        if (item.teamId === group.teamId) {
          return 'checked common'
        }
      }
      return 'check common'
    },
    toggleOrg () {
      // 组织架构展开、收起
      this.orginzeopen = !this.orginzeopen
    },
    toggleDept () {
      // 我的部门展开、收起
      this.myDeptOpen = !this.myDeptOpen
    },
    orgSelectHandle (user) {
      if (this.showCheck) {
        if (this.isDisabled(user.accid)) return
        this.$store.commit('upadteCreateTeamSelect', {type: 'update', data: user})
        return false
      }
      if ((user.accid === this.orgSelectId) && (user.level === this.orgSelectLevel)) {
        return false
      }
      this.orgSelectId = user.accid
      this.orgSelectLevel = user.level
      this.$store.commit('upadteContactSelectObj', {type: 'p2p', accid: user.accid})
      this.callBack({accid: user.accid})
    },
    async groupSelectHandle (group) {
      if (this.noAdd) {
        group.scene = 'team'
        group.to = group.teamId
        this.$store.commit('upadteCreateTeamSelect', {type: 'update', data: group})
        return
      }
      // 群成员全选
      let teamMembers = []
      try {
        teamMembers = await SearchData.getTeamMembers(group.teamId)
      } catch (error) {}
      let userInfos = this.$store.state.userInfos
      for (let i in teamMembers) {
        let member = {}
        if (teamMembers[i].account) {
          if (userInfos[teamMembers[i].account] === undefined) {
            try {
              member = await SearchData.getMemberInfo(teamMembers[i].account)
            } catch (error) {}
          } else {
            member = userInfos[teamMembers[i].account]
          }
        }
        if (Object.keys(member).length > 0 && !this.isDisabled(member.account)) {
          member.type = 'cover'
          member.accid = member.account
          this.$store.commit('upadteCreateTeamSelect', {type: 'update', data: member})
        }
      }
    },
    isDisabled (accid) {
      let orgDisabledlist = this.$store.state.orgDisabledlist
      for (let i in orgDisabledlist) {
        if (orgDisabledlist[i] === accid) {
          return true
        }
      }
      if (this.$store.state.personInfos.accid === accid) return true
      return false
    },
    groupDataInit () {
      // 我的部门数据初始化
      let tag = 0
      if (this.groupObj[0] && this.groupObj[0].tag) {
        tag = this.groupObj[0].tag
      }
      let params = {depId: this.myDeptId, tag, parentId: 0}
      this.renderGroupData(params)
    },
    orgDataInit () {
      // 组织数据初始化
      let tag = 0
      if (this.orgnizeObj[0] && this.orgnizeObj[0].tag) {
        tag = this.orgnizeObj[0].tag
      }
      let params = {depId: 0, tag}
      this.renderOrgData(params)
    },
    toggleCheck () {
      // 切换公司展开状态
      if (!this.companyopen) {
        this.orgDataInit()
      }
      this.companyopen = !this.companyopen
    },
    renderOrgData (params) {
      // 拉取组织框架
      let {depId, tag, parentId} = params
      let type = 'init'
      tag = tag || 0
      Request.PullDepartment({
        depId, tag
      }, this).then(ret => {
        if (ret) {
          if (tag) type = 'update'
          this.$store.commit('updateOrgnizeObj', {
            type,
            set: this.$set,
            currentId: depId,
            parentId: parentId,
            orgnizelist: ret.orgList,
            userlist: ret.userList,
            tag: ret.tag,
            pullTag: ret.pullTag
          })
        }
      }).catch(() => {
      })
    },
    renderGroupData (params) {
      // 拉取我的部门框架
      let {depId, tag, parentId} = params
      let type = 'init'
      tag = tag || 0
      Request.PullDepartment({
        depId, tag
      }, this).then(ret => {
        if (ret) {
          if (tag) type = 'update'
          this.$store.commit('updateGroupObj', {
            type,
            set: this.$set,
            currentId: depId,
            parentId: parentId,
            orgnizelist: ret.orgList,
            userlist: ret.userList,
            tag: ret.tag,
            pullTag: ret.pullTag
          })
        }
      }).catch(() => {
      })
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
  .t-orgname .mydept {
    font-size: 14px;
    color: #333
  }
  .t-orgname {
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
  .t-center {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .t-list {
    box-sizing: border-box;
    width: 100%;
    padding: 0 12px;
    transition: all .3s linear;
  }
  .t-list:hover {
    background-color: rgba(242,242,242,1);
  }

  .t-title {
    box-sizing: border-box;
    justify-content: flex-start;
    width: 100%;
    height: 38px;
    font-size: 14px;
    color: rgba(11,13,12,1);
    border-bottom: 1px solid rgba(216,216,216,1);
  }
  
  .t-title .t-orgn,
  .t-title .t-team {
    width: 18px;
    height: 18px;
    background: url('../../../../static/img/orgnize/t-orgn.png') no-repeat center center;
    background-size: 100% 100%;
    margin-right: 2px;
  }
  .t-title .t-team {
    background: url('../../../../static/img/orgnize/t-team.png') no-repeat center center;
    background-size: 100% 100%;
  }

  .t-list .t-down,
  .t-list .t-up {
    width: 10px;
    height: 7px;
    background: url('../../../../static/img/orgnize/down.png') no-repeat center center;
    background-size: 100% 100%;
    margin-right: 8px;
  }
  .t-list .t-up {
    background: url('../../../../static/img/orgnize/up.png') no-repeat center center;
    background-size: 100% 100%;
  }

  .t-body {
    overflow: hidden;
    height: 0;
  }
  .t-body.active {
    height: auto;
  }

  .t-u-list-item {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 36px;
    padding-left: 32px;
    /* background-color: #fff; */
    transition: all .3s linear;
    cursor: default;
  }
  .t-u-list-item:hover {
    background-color: rgba(242,242,242,1);
  }
  .t-u-list-item.active {
    background: #F7F7F7;
    transition: all .2s;
  }

  .t-u-list-item > img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 6px;
  }

  .t-u-list-item .teamname {
    display: inline-block;
    width: 80%;
    font-size: 14px;
    color: #333;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  .t-orgname {
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    min-height: 36px;
    padding-left: 11px;
    padding-right: 11px;
    font-size: 14px;
    line-height: 14px;
    color: #999;
    transition: all .3s linear;
    cursor: default;
  }
  .t-orgname:hover {
    background-color: rgba(242,242,242,1);
  }

  .t-orgname .t-takeup {
    width: 15px;
    height: 15px;
    background: url('../../../../static/img/orgnize/takeup.png') no-repeat center center;
    background-size: 8px 7px;
    margin-right: 3.5px;
    margin-left: 5px;
  }

  .t-orgname .t-open {
    width: 15px;
    height: 15px;
    margin-right: 3.5px;
    margin-left: 5px;
    background: url('../../../../static/img/orgnize/open.png') no-repeat center center;
    background-size: 8px 7px;
  }

  .t-orgname .common {
    display: inline-block;
    width: 15px;
    height: 15px;
    margin-right: 6px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
  }

  .t-orgname .check {
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 100% 100%;
  }
  .t-orgname .check:hover, .check:focus {
    background-image: url('../../../../static/img/setting/checkboxborder-p.png');
  }

  .t-orgname .checked {
    background-image: url('../../../../static/img/setting/checkbox-c.png');
    background-size: 100% 100%;
  }

  .t-orgname .orgname {
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  .empty {
    box-sizing: border-box;
    height: 32px;
    line-height: 32px;
    padding-left: 26px;
    padding-right: 12px;
    font-size: 14px;
    color: #999;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
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
  .t-u-list .t-u-list-item .checked {
    background-image: url('../../../../static/img/setting/checkbox-c.png');
    background-size: 100% 100%;
  }
  .t-u-list .t-u-list-item .disabled {
    background-image: url('../../../../static/img/setting/checkbox-d.png');
    background-size: 100% 100%;
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


