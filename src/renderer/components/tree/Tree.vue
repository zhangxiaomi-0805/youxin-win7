<template>
<!-- 组织树 -->
<div>
  <div style="marginBottom: 5px;">
    <a v-if="showTitle" class="t-list" @click="toggleOrg">
      <div class="t-center t-title">
        <div class="t-center"><span style="line-height: 14px;">组织架构</span></div>
        <span :class="orginzeopen ? 't-up' : 't-down'"/>
      </div>
    </a>
    <div :class="orginzeopen ? 't-body active' : 't-body'">
      <div class="t-orgname" style="paddingLeft: 12px;" @click="toggleCheck">
        <span :class="companyopen ? 't-open' : 't-takeup'"/>
        <span class="orgname" :title="companyInfo.name || '公司名称'">{{companyInfo.name || '公司名称'}}</span>
      </div>
      <div v-if="orgnizeObj[0]" :class="companyopen ? 't-body active' : 't-body'" style="padding: 0;">
        <tree-item
          :showCheck="showCheck"
          :orgnizeObj="orgnizeObj"
          :orgnizeLevelObj="orgnizeObj[0]"
          :orgLevel="1"
          :orgSelectId="orgSelectId"
          :orgSelectLevel="orgSelectLevel"
          :orgSelectHandle="orgSelectHandle"
          :renderOrgData="renderOrgData"/>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import configs from '../../configs/index.js'
import TreeItem from './TreeItem.vue'
import Fetch from '../../utils/fetch.js'
export default {
  name: 'tree',
  props: {
    showTitle: Boolean,
    showTeam: Boolean,
    showCheck: Boolean,
    callBack: Function
  },
  components: {TreeItem},
  data () {
    return {
      defaultIcon: './static/img/orgnize/team-head.png',
      defaultUserIcon: configs.defaultUserIcon,
      orginzeopen: !this.showTitle, // 组织机构展开状态
      companyopen: false, // 公司展开状态
      companyInfo: {}, // 公司信息
      orgSelectId: -1, // 选中组织成员id
      orgSelectLevel: -1 // 选中组织成员所属组织
    }
  },
  mounted () {
    this.getCompanyInfo()
  },
  computed: {
    orgnizeObj () {
      return this.$store.state.orgnizeObj
    },
    createTeamSelect () {
      return this.$store.state.createTeamSelect
    }
  },
  methods: {
    className (contact) {
      for (let i in this.createTeamSelect) {
        let item = this.createTeamSelect[i]
        if (item.id === contact.to || item.accid === contact.to) {
          return 'checked common'
        }
      }
      return 'check common'
    },
    toggleOrg () {
      // 组织架构展开、收起
      this.orginzeopen = !this.orginzeopen
      this.orginzeopen && this.getCompanyInfo()
    },
    orgSelectHandle (user) {
      if (this.showCheck) {
        this.$store.commit('upadteCreateTeamSelect', {type: 'update', user})
        return false
      }
      if ((user.id === this.orgSelectId) && (user.level === this.orgSelectLevel)) {
        return false
      }
      this.orgSelectId = user.id
      this.orgSelectLevel = user.level
      this.$store.commit('upadteContactSelectObj', {type: 'p2p', id: user.id, accid: user.accid})
      this.callBack({id: user.id, accid: user.accid})
    },
    toggleCheck () {
      // 切换公司展开状态
      if (!this.companyopen) {
        let tag = 0
        if (this.orgnizeObj[0] && this.orgnizeObj[0].tag) {
          tag = this.orgnizeObj[0].tag
        }
        let params = {depId: 0, tag}
        this.renderOrgData(params)
      }
      this.companyopen = !this.companyopen
    },
    renderOrgData (params) {
      /*
       * 拉取组织框架
       * @params  depId: 节点id
       * @params  tag: 时间戳,拉取截止的时间戳, 拉取所有,传0
       */
      let {depId, tag, parentId} = params
      let type = 'init'
      tag = tag || 0
      Fetch.post('api/appPc/pullDepartment', {
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
    getCompanyInfo () {
      /*
       * 获取公司信息
       */
      Fetch.post('api/appPc/companyInfo', {
      }, this).then(ret => {
        if (ret) this.companyInfo = ret
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
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
    justify-content: space-between;
    width: 100%;
    height: 34px;
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
    box-sizing: border-box;
    width: 100%;
    height: 32px;
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
</style>


