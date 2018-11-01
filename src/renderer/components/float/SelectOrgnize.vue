<template>
<!-- 组织架构 - 创建群聊 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="showSelectOrgnize">
    <div class="m-selectcontact-cover"></div>
    <div class="m-selectcontact" style="width:680px;height:502px;">
      <div class="drag" id="selectOrgnizeDrag">
        <span>{{type === 1 ? '创建群' : '添加成员'}}</span>
        <div class="u-sysbtn close">
          <a class="btn-close" @click="closeModal()"/>
        </div>
      </div>
      <div class="side-list-contain">
        <div class="side-list left" style="width: 55%;">
          <!-- 搜索 -->
          <div v-if="sessionlist.length > 0" class="u-search">
            <div class="u-cont">
              <input type="text" v-model="searchValue" placeholder="搜索" />
              <span v-if="searchValue" class="clear" @click="searchValue = ''"/>
            </div>
          </div>
          <div class="title" style="paddingTop: 0;paddingBottom: 0;">联系人</div>
          <div class="contact">
            <tree showCheck showTitle showTeam/>
          </div>
        </div>
        <div class="side-list" style="float: right;width: 45%">
          <div class="title">{{chooselist.length > 0 ? '已选择' + ' (' + chooselist.length + '人)' : '已选择'}}</div>
          <ul class="u-list" v-show="chooselist.length > 0">
            <li class="u-list-item" v-for="item in chooselist" :key="item.id" :id="item.id">
              <div style="display: flex; flex-direction: row; align-items: center">
                <img class="msg-img" :src="item.avatar || defaultUserIcon">
                <span class="inline">{{item.name || item.nick}}</span>
              </div>
              <span class="delete" @click="deleted(item)"></span>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="platform" class="footer">
        <a :class="chooselist.length > 0 ? 'confirm' : 'confirm disabled'" @click="confirmBtn">
          <span v-if="!loading">确定</span>
          <span v-else-if="loading" class="loading"></span>
        </a>
        <a class="cancel" @click="closeModal()">取消</a>
      </div>
      <div v-else class="footer">
        <a class="cancel" @click="closeModal()" style="margin-right:20px;">取消</a>
        <a :class="chooselist.length > 0 ? 'confirm' : 'confirm disabled'" style="margin-right:0;" @click="confirmBtn">
          <span v-if="!loading">确定</span>
          <span v-else-if="loading" class="loading"></span>
        </a>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import platform from '../../utils/platform'
import drag from '../../utils/drag.js'
import Tree from '../tree/Tree.vue'
import configs from '../../configs/index.js'
export default {
  name: 'select-orgnize',
  components: {Tree},
  mounted () {
    let $this = this
    this.eventBus.$on('selectOrgnize', (data) => {
      $this.showSelectOrgnize = true
      $this.type = data.type
      $this.teamId = data.teamId || -1
    })
  },
  data () {
    return {
      defaultUserIcon: configs.defaultUserIcon,
      showSelectOrgnize: false,
      loading: false,
      teamId: -1,
      type: 1, // 1-创建群，2-添加成员（创建群聊），3-添加群成员
      searchValue: ''
    }
  },
  computed: {
    platform () {
      return platform.getOsInfo() === 'Windows'
    },
    chooselist () {
      return this.$store.state.createTeamSelect
    },
    sessionlist () {
      return this.$store.state.sessionlist
    },
    orgDisabledlist () {
      return this.$store.state.orgDisabledlist
    }
  },
  updated () {
    drag.dragPosition('selectOrgnizeDrag', 1)
  },
  methods: {
    closeModal () {
      this.showSelectOrgnize = false
      this.loading = false
      this.$store.commit('upadteCreateTeamSelect', {type: 'reset'})
      this.$store.commit('updateOrgDisabledlist', {type: 'destory'})
    },
    deleted (user) {
      this.$store.commit('upadteCreateTeamSelect', {type: 'update', data: user})
    },
    confirmBtn () {
      if (this.loading) return
      if (this.chooselist.length <= 0) return
      switch (this.type) {
        case 1:
          this.createTeam()
          break
        case 2:
          this.createTeam()
          break
        case 3:
          this.addTeamMember()
          break
      }
    },
    createTeam () {
      if (this.chooselist.length === 1 && (this.type === 1)) {
        this.sendMsg(this.chooselist[0].accid)
        return
      }
      // 创建群
      this.loading = true
      var accounts = []
      if (this.type === 2) {
        this.orgDisabledlist.map(item => {
          accounts.push(item)
        })
      }
      this.chooselist.map(item => {
        item.accid && accounts.push(item.accid)
      })
      if (accounts.length <= 0) {
        this.errToast()
        return
      }
      var _name = []
      _name.push(this.$store.state.myInfo.nick)
      for (var i = 0; i < this.chooselist.length; i++) {
        _name.push(this.chooselist[i].alias || this.chooselist[i].nick || this.chooselist[i].name)
      }
      // 长度处理
      var name = _name.join('、')
      if (name.length >= 16) {
        name = name.substring(0, 16) + '...'
      }
      this.$store.dispatch('delegateTeamFunction', {
        functionName: 'createTeam',
        options: {
          type: 'advanced',
          name,
          accounts: accounts,
          joinMode: 'noVerify',
          beInviteMode: 'noVerify',
          inviteMode: 'manager',
          done: (error, obj) => {
            if (!error) {
              this.showSelectOrgnize = false
              this.$store.commit('upadteCreateTeamSelect', {type: 'reset'})
              this.$store.commit('updateOrgDisabledlist', {type: 'destory'})
              setTimeout(() => {
                this.loading = false
                this.jumpToTeam(obj.team.teamId)
              }, 350)
            } else {
              this.closeModal()
              if (error.code === 801) {
                // 群人数达到上限
                this.$store.commit('toastConfig', {
                  show: true,
                  type: 'fail',
                  toastText: '无法操作，群人数已达上限200人，最多可提高至500人'
                })
              } else if (error.code === 806) {
                // 创建群数量达到限制
                this.eventBus.$emit('forwordFail', {type: 2})
              } else if (error.message) {
                this.$store.commit('toastConfig', {
                  show: true,
                  type: 'fail',
                  toastText: error.message
                })
              }
            }
          }
        }
      })
    },
    sendMsg (account) {
      this.loading = true
      // 选择人数一人时发起单聊
      let sessionId = ''
      for (let i in this.sessionlist) {
        if (this.sessionlist[i].to === account) {
          sessionId = this.sessionlist[i].id
          break
        }
      }
      if (sessionId) {
        this.hasSessionHandle(sessionId)
      } else {
        this.$store.dispatch('insertLocalSession', {
          scene: 'p2p',
          account: account,
          callback: (sessionId) => {
            sessionId && this.hasSessionHandle(sessionId)
          }
        })
      }
    },
    jumpToTeam (account) {
      let sessionId = ''
      for (let i in this.sessionlist) {
        if (this.sessionlist[i].to === account) {
          sessionId = this.sessionlist[i].id
          break
        }
      }
      if (sessionId) {
        this.hasSessionHandle(sessionId)
      }
    },
    hasSessionHandle (sessionId) {
      this.closeModal()
      this.eventBus.$emit('updateNavBar', {navTo: 'session'})
      this.eventBus.$emit('toggleSelect', {sessionId})
      this.$router.push({name: 'chat', query: {sessionId, firstFlag: true}})
    },
    addTeamMember () {
      this.loading = true
      // 拉人入群
      let accounts = []
      this.chooselist.map(item => {
        item.accid && accounts.push(item.accid)
      })
      if (accounts.length > 0) {
        this.$store.dispatch('addTeamMembers', {
          accounts,
          teamId: this.teamId,
          callback: (error) => {
            this.closeModal()
            if (error && error.code === 801) {
              // 群人数达到上限
              this.$store.commit('toastConfig', {
                show: true,
                type: 'fail',
                toastText: '无法操作，群人数已达上限200人，最多可提高至500人'
              })
            }
          }
        })
      } else {
        this.errToast()
      }
    },
    errToast () {
      this.loading = false
      this.$store.commit('toastConfig', {
        show: true,
        type: 'fail',
        toastText: '选中成员数据异常'
      })
    }
  }
}
</script>

<style scoped>
  .contact {
    position: absolute;
    width: 100%;
    top: 80px;
    bottom: 0;
    box-sizing: border-box;
    overflow-y: auto;
    background-color: rgba(250,250,250,1);
    padding: 0 8px;
  }
</style>

