<template>
<!-- 组织架构 - 创建群聊 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="showSelectOrgnize">
    <div class="m-selectcontact-cover"></div>
    <div class="m-selectcontact" style="width:680px;height:502px;">
      <div class="drag" id="selectOrgnizeDrag">
        <span>{{type === 1 ? '创建群' : type === 4 ? '创建讨论组' : type === 5 ? '转发到新聊天' : '添加成员'}}</span>
        <div class="u-sysbtn close"><a class="btn-close" @click="closeModal()"/></div>
      </div>
      <div class="side-list-contain">
        <div class="side-list left" style="width: 55%;">
          <!-- 搜索 -->
          <div class="u-search searchevent">
            <div class="u-cont">
              <input :class="showBorder ? 'active' : ''" type="text" v-model="searchValue" placeholder="搜索" @focus="showBorder = true" @blur="showBorder = false"/>
              <span v-if="searchValue" class="clear" @click="clearStatus"/>
            </div>
          </div>
          <div v-show="!searchValue" class="title" style="paddingTop: 0;paddingBottom: 0;">联系人</div>
          <div v-show="!searchValue" class="contact">
            <tree showCheck showTitle showTeam :noAdd="type === 5"/>
          </div>
          <search-contact 
            v-if="searchValue"
            :value="searchValue"
            :clearStatus="clearStatus"
            :showTeam="type === 5"/>
        </div>
        <div class="side-list" style="float: right;width: 45%">
          <div class="title">{{chooselist.length > 0 ? '已选择' + ' (' + chooselist.length + '人)' : '已选择'}}</div>
          <ul class="u-list" v-show="chooselist.length > 0" style="top: 44px;">
            <li class="u-list-item" v-for="item in chooselist" :key="item.id" :id="item.id">
              <div class="alignCenter"><img class="msg-img" :src="item.avatar || defaultUserIcon"><span class="inline">{{item.name || item.nick}}</span></div>
              <span class="delete" @click="deleted(item)"></span>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="platform" class="footer">
        <a :class="!isDisabled() ? 'confirm' : 'confirm disabled'" @click="confirmBtn"><span v-if="!loading">确定</span><span v-else-if="loading" class="loading"></span></a>
        <a class="cancel" @click="closeModal()">取消</a>
      </div>
      <div v-else class="footer">
        <a class="cancel" @click="closeModal()" style="margin-right:20px;">取消</a>
        <a :class="!isDisabled() ? 'confirm' : 'confirm disabled'" style="margin-right:0;" @click="confirmBtn">
          <span v-if="!loading">确定</span><span v-else-if="loading" class="loading"></span>
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
import SearchContact from '../search/SearchContact'
import configs from '../../configs/index.js'
import Request from '../../utils/request.js'
export default {
  name: 'select-orgnize',
  components: {Tree, SearchContact},
  mounted () {
    this.eventBus.$on('selectOrgnize', (data) => {
      this.showSelectOrgnize = true
      this.type = data.type
      this.teamId = data.teamId || -1
      this.msg = data.msg || ''
    })
  },
  data () {
    return {
      defaultUserIcon: configs.defaultUserIcon,
      showSelectOrgnize: false,
      loading: false,
      showBorder: false,
      teamId: -1,
      type: 1, // 1-创建群，2-添加成员（创建群聊），3-添加群成员，4-创建讨论组，5-转发到新聊天
      searchValue: '',
      msg: ''
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
      this.searchValue = ''
      this.showSelectOrgnize = false
      this.loading = false
      this.$store.commit('upadteCreateTeamSelect', {type: 'reset'})
      this.$store.commit('updateOrgDisabledlist', {type: 'destory'})
    },
    deleted (user) {
      user.type && delete user.type
      this.$store.commit('upadteCreateTeamSelect', {type: 'update', data: user})
    },
    isDisabled () {
      let length = 0
      if (this.type === 1 || this.type === 4) {
        length = 1
      }
      if (this.chooselist.length <= length) return true
      return false
    },
    confirmBtn () {
      if (this.loading) return
      if (this.isDisabled()) return
      switch (this.type) {
        case 1:
          this.eventBus.$emit('settingName', {type: 1, callBack: this.createTeam})
          break
        case 2:
          this.eventBus.$emit('settingName', {type: 1, callBack: this.createTeam})
          break
        case 3:
          this.addTeamMember()
          break
        case 4:
          this.eventBus.$emit('settingName', {type: 2, callBack: this.createTeam})
          break
        case 5:
          this.forwordNewChat()
          break
      }
    },
    createTeam (name) {
      // 创建群、讨论组
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
      if (this.type === 4) {
        if (this.chooselist.length > 199) {
          this.$store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: '无法操作，讨论组人数已达上限200人'
          })
          return
        }
      }
      let options = {
        type: 'advanced',
        name,
        accounts: accounts,
        joinMode: 'noVerify',
        beInviteMode: 'noVerify',
        inviteMode: 'manager',
        done: (error, obj) => {
          if (!error) {
            this.generateQrCode(obj.team.teamId)
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
      if (this.type === 4) {
        options.custom = JSON.stringify({isDiscussGroup: true})
        options.updateTeamMode = 'all'
      }
      this.$store.dispatch('delegateTeamFunction', {
        functionName: 'createTeam', options
      })
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
    async forwordNewChat () {
      // 转发到新聊天
      this.loading = true
      let failAccount = []
      for (let i = 0; i < this.chooselist.length; i++) {
        try {
          await this.forwordMsg(this.chooselist[i])
        } catch (err) {
          failAccount.push(this.chooselist[i].name)
        }
      }
      if (failAccount.length === 0) {
        this.$store.commit('toastConfig', {
          show: true,
          type: 'success',
          toastText: `成功转发到${this.chooselist.length}个聊天`
        })
      } else if (failAccount.length === this.chooselist.length) {
        this.$store.commit('toastConfig', {
          show: true,
          type: 'fail',
          toastText: `转发失败`
        })
      } else {
        this.eventBus.$emit('forwordFail', {
          successNum: this.chooselist.length - failAccount.length,
          failAccount,
          type: 1
        })
      }
      this.closeModal()
    },
    forwordMsg (item) {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('onForwordMsg', {
          msg: this.msg,
          scene: item.scene,
          to: item.to
        }).then(() => {
          resolve()
        }).catch((err) => {
          reject(err)
        })
      })
    },
    errToast () {
      this.loading = false
      this.$store.commit('toastConfig', {
        show: true,
        type: 'fail',
        toastText: '选中成员数据异常'
      })
    },
    clearStatus (el, e) {
      if (e) {
        let className = e.target.className
        if (className.indexOf('searchevent') > -1) return
      }
      this.searchValue = ''
    },
    generateQrCode (teamId) {
      // 获取群二维码
      Request.GenerateQrCode({qrType: 1, teamId}).then(res => {
        if (res) {
          this.$store.dispatch('updateTeam', {
            teamInfo: {
              teamId,
              custom: JSON.stringify({ teamQrUrl: res.url })
            }
          })
        }
      }).catch(() => {})
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

  .alignCenter {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
</style>

