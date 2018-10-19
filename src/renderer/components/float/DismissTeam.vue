<template>
<!-- 解散群 -->
<transition name="fade">
  <div class="m-selectcontact-contain" v-if="showDismissTeam">
    <div class="m-selectcontact-cover"></div>
    <div class="m-clear-body m-dismiss-body" style="width: 380px;height: 197px;">
      <div class="drag" id="dismissTeamDrag">
        <span class="title">操作确认</span>
        <div class="u-sysbtn close"><a class="btn-close" @click="closeModal"/></div>
      </div>
      <div class="content"><span class="warning"></span><span style="width: 88%">{{config.content}}</span></div>
      <div style="display:none;">{{networkStatus}}</div>
      <div v-if="platform" class="footer">
        <a class="b-confirm" @click="confirmManage"><span v-if="!loading">{{config.btn}}</span><span v-else-if="loading" class="loading"></span></a>
        <a class="b-cancel" @click="closeModal">取消</a>
      </div>
      <div v-else class="footer">
        <a class="b-cancel" @click="closeModal" style="margin-right:20px;">取消</a>
        <a class="b-confirm" @click="confirmManage" style="margin-right:0;"><span v-if="!loading">{{config.btn}}</span><span v-else-if="loading" class="loading"></span></a>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import platform from '../../utils/platform'
import drag from '../../utils/drag.js'
export default {
  name: 'dismiss-team',
  mounted () {
    this.eventBus.$on('dismissTeam', (data) => {
      let Config = {
        dismiss: {
          content: '警告：解散群组后，所有成员将被强制退出群聊，所有群消息记录将被永久删除！',
          btn: '仍然解散'
        },
        leave: {
          content: '退出群聊后，所有群聊消息记录将被永久删除，群成员可以看到您退出群聊的状态变更消息。',
          btn: '仍然退出'
        }
      }
      this.type = data.type
      if (this.type === 1) {
        this.config = Config.dismiss
      } else {
        this.config = Config.leave
      }
      this.showDismissTeam = true
      this.teamId = data.teamId
      if (data.teamInfo) {
        this.teamName = data.teamInfo.name
      }
    })
  },
  data () {
    return {
      showDismissTeam: false,
      loading: false,
      teamId: null,
      config: {},
      type: 1,
      teamName: ''
    }
  },
  computed: {
    platform () {
      return platform.getOsInfo() === 'Windows'
    },
    networkStatus () {
      let networkStatus = this.$store.state.networkStatus
      if (networkStatus !== 200) {
        // 断网超时
        this.loading = false
      }
      return networkStatus
    }
  },
  updated () {
    drag.dragPosition('dismissTeamDrag')
  },
  methods: {
    closeModal () {
      this.showDismissTeam = false
      this.loading = false
    },
    confirmManage () {
      if (this.loading) return
      this.loading = true
      if (this.type === 1) {
        // 解散群
        this.$store.dispatch('dismissTeam', {
          teamId: this.teamId,
          name: this.teamName,
          callback: () => {
            this.showDismissTeam = false
            setTimeout(() => {
              this.loading = false
            }, 100)
          }
        })
      } else {
        // 退出群
        this.$store.dispatch('leaveTeam', {
          teamId: this.teamId,
          teamName: this.teamName,
          that: this,
          callback: () => {
            this.showDismissTeam = false
            setTimeout(() => {
              this.loading = false
            }, 100)
          }
        })
      }
    }
  }
}
</script>

<style scoped>
  .m-clear-body {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 90;
    width: 380px;
    height: 197px;
    transform: translate(-50%, -50%);
    background: #fff;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    border-radius: 4px;
    box-sizing: border-box;
  }

  .m-clear-body .title {
    display: inline-block;
    font-size: 14px;
    color: #999;
    letter-spacing: 0;
    text-align: left;
    line-height: 14px;
    padding: 11px 10px;
  }

  .m-clear-body .drag {
    -webkit-app-region: no-drag;
  }

  .m-clear-body .content {
    font-size: 14px;
    color: #333;
    letter-spacing: 0;
    text-align: left;
    line-height: 18px;
    padding: 35px 20px;
  }

  .m-dismiss-body .content {
    display: flex;
    align-items: center;
    padding: 25px 20px;
  }
  .m-dismiss-body .content .warning {
    width: 34px;
    height: 34px;
    background: url('../../../../static/img/setting/prompt-big.png') no-repeat center center;
    background-size: 100% 100%;
    margin-right: 10px;
  }

  .m-clear-body .footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding: 20px 20px;
  }

  .m-clear-body .loading {
    display: inline-block;
    width: 15px;
    height: 15px;
    background: url('../../../../static/img/setting/loading-r.gif') no-repeat center center;
    background-size: 100% 100%;
  }

  .m-clear-body .footer .b-confirm,
  .m-clear-body .footer .b-cancel {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 55px;
    height: 28px;
    border-radius: 4px;
    font-size: 12px;
    transition: all .3s linear;
  }

  .m-clear-body .footer .b-confirm {
    background-color: rgba(245,99,97,1);
    color: #fff;
    margin-right: 20px;
  }
  .m-clear-body .footer .b-confirm:hover {
    background-color: rgba(221, 85, 82, 1);
  }

  .m-clear-body .footer .b-cancel {
    background-color: rgba(242,242,242,1);
    color: #333;
  }
  .m-clear-body .footer .b-cancel:hover {
    background-color: rgba(223, 219, 219, 1);
  }

  .m-dismiss-body .footer .b-confirm {
    width: 76.2px;
  }
</style>
