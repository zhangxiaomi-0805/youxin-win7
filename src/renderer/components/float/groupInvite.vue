<template>
  <!-- 群邀请弹框 -->
  <transition name="fade">
    <div class="m-modal-contain" v-if="showModal">
      <div class="m-modal-cover" @click="closeCover"></div>
      <div class="m-modal-box">
        <!-- 关闭标签 -->
        <div class="drag" id="modal">
          <div class="u-sysbtn close">
            <a class="btn-close" @click="closeModal"/>
          </div>
        </div>

        <div style="padding:15px 30px">
          <div class="m-modal-header">
            <div class="user-info"><img :src="teamInfo.avatar || myGroupIcon"></div>
            <div style="padding-left: 20px">
              <div class="nick">{{teamInfo.name}}</div>
              <div class="line" style="margin: 10px 0 0 0; width: 180px; color: #999; font-size: 13px" >{{teamInfo.memberNum + '人'}}</div>
            </div>
          </div>

          <!-- 内容 -->
          <div style="width: 100%; height:90px;display: flex;flex-direction: column; align-items:center;padding: 30px 0;justify-content: space-between">
            <div style="color: #666; font-size: 14px;text-overflow:ellipsis;white-space:nowrap;">{{description.split('聊')[0] + '聊'}}</div>
            <a class="button" @mouseup.stop="isJoined ? sendMsg(teamId) : applyJoinTeam()">{{isJoined ? '进入群聊' : '加入群聊'}}</a>
          </div>
        </div>
      </div>

    </div>
  </transition>
</template>

<script>
  import drag from '../../utils/drag.js'
  import clickoutside from '../../utils/clickoutside.js'
  import config from '../../configs/index'
  import util from '../../utils'
  export default {
    name: 'group-invite',
    directives: {clickoutside},
    data () {
      return {
        showModal: false,
        teamId: '',
        description: '',
        teamInfo: {},
        myGroupIcon: config.defaultGroupIcon,
        isJoined: false
      }
    },
    mounted () {
      // 群邀请弹框
      this.eventBus.$on('showGroupInvite', (data) => {
        this.showModal = true
        this.teamId = data.teamInfo.teamId
        this.description = data.teamInfo.description
        this.getTeamInfoFn(this.teamId)
        let teamlist = this.$store.state.teamlist.filter(item => {
          return item.valid && item.validToCurrentUser && !util.isDiscussGroup(item)
        })
        teamlist.map(item => {
          if (item.teamId === this.teamId) {
            this.isJoined = true
          } else {
            this.isJoined = false
          }
        })
      })
    },
    beforeDestroy () {
      this.eventBus.$off('showGroupInvite')
    },
    updated () {
      drag.dragPosition('historyMsgDrag', 1)
    },
    computed: {
      sessionlist () {
        return this.$store.state.sessionlist
      }
    },
    methods: {
      closeCover () {
        // this.showModal = false
      },
      closeModal () {
        this.showModal = false
      },
      async getTeamInfoFn (teamId) {
        this.teamInfo = await this.getTeamInfo(teamId)
      },
      getTeamInfo (teamId) {
        // 获取群信息
        return new Promise((resolve, reject) => {
          this.$store.state.nim.getTeam({
            teamId,
            done: (error, teams) => {
              if (!error) resolve(teams)
              else reject(error)
            }
          })
        })
      },
      applyJoinTeam () {
        this.$store.dispatch('delegateTeamFunction', {
          functionName: 'applyTeam',
          options: {
            teamId: this.teamInfo.teamId,
            ps: 'ps',
            done: (error, obj) => {
              if (error) {
                this.$store.commit('toastConfig', {
                  show: true,
                  type: 'success',
                  toastText: error.message
                })
                return
              }
              this.$store.commit('toastConfig', {
                show: true,
                type: 'success',
                toastText: '申请成功'
              })
              setTimeout(() => {
                this.closeModal()
              }, 1000)
            }
          }
        })
      },
      sendMsg (account) {
        // 加入群聊
        let sessionId = ''
        for (let i in this.sessionlist) {
          if (this.sessionlist[i].to === account) {
            sessionId = this.sessionlist[i].id
            break
          }
        }
        if (sessionId) {
          this.eventBus.$emit('updateNavBar', {navTo: 'session'})
          this.eventBus.$emit('toggleSelect', {sessionId})
          this.$router.push({name: 'chat', query: {sessionId, firstFlag: true}})
        } else {
          this.$store.dispatch('insertLocalSession', {
            scene: this.pageType,
            account: account,
            callback: (sessionId) => {
              this.eventBus.$emit('updateNavBar', {navTo: 'session'})
              this.eventBus.$emit('toggleSelect', {sessionId})
              this.$router.push({name: 'chat', query: {sessionId, firstFlag: true}})
            }
          })
        }
        this.closeModal()
      }
    }
  }
</script>

<style scoped>
  .m-modal-contain {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1001;
  }
  .m-modal-contain .m-modal-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }
  .m-modal-contain .m-modal-box {
    box-sizing: border-box;
    position: absolute;
    top: 100px;
    right: 20px;
    width: 320px;
    height: 341px;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.2);
    background-color: #fff;
    border-radius: 6px;
    z-index: 100;
    padding: 0;
  }
  .m-modal-contain .m-modal-box .drag {
    -webkit-app-region: no-drag;
    box-sizing: border-box;
    position: relative;
    width: 100%;
    padding: 15px 0 8px 0;
    font-size: 14px;
    color: #999;
  }

  .m-info-box .close {
    position: absolute;
    right: 0;
    top: 0;
  }
  .m-modal-header {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid rgba(214,214,214,1);
    padding: 10px 0 20px 0;
    margin-bottom: 15px;
  }
  .m-modal-header .user-info img {
    vertical-align: middle;
    width: 50px;
    height: 50px
  }
  .nick {
    width: 100%;
    font-size: 18px;
    color: #000;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    cursor: default;
  }
  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    width: 160px;
    height: 36px;
    background: rgba(4,154,255,1);
    border-radius: 4px;
    font-size: 14px;
    color: #fff;
    transition: background .2s linear;
  }

</style>

