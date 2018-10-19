<template>
<!-- 公告编辑 -->
<transition name="fade">
  <div class="m-editnotice-contain" v-if="showEditNotice">
    <div class="m-editnotice-cover" @click="closeCover"></div>
    <div class="m-editnotice" style="width:600px;height:502px;">
      <div class="drag" id="editNoticeDrag">
        <span>{{type === 'check' ? '公告' : '编辑公告'}}</span>
        <div class="u-sysbtn close">
          <a class="btn-close" @click="closeModal"/>
        </div>
      </div>
      <div class="m-body">
        <span v-if="type === 'check' && !announcement">暂无公告</span>
        <textarea v-else maxlength="1000" :disabled="disabled || (type === 'check')" v-model="announcement" placeholder="请输入公告">
        </textarea>
      </div>
      <div style="display:none;">{{networkStatus}}</div>
      <div class="footer" v-if="!disabled">
        <a v-if="type === 'check'" class="cancel" @click="startEdit">编辑</a>
        <div v-if="type === 'edit'" style="width: 15px;height: 15px;"></div>
        <div v-if="type === 'edit' && platform" class="f-right">
          <a :class="announcement && announcement.length > 0 && (announcement !== announcementCopy) ? 'confirm' : 'confirm disabled'" @click="showCover">
            <span v-if="!loading">发布</span>
            <span v-else-if="loading" class="loading"></span>
          </a>
          <a class="cancel" @click="closeModal">取消</a>
        </div>
        <div v-if="type === 'edit' && !platform" class="f-right">
          <a class="cancel" @click="closeModal" style="margin-right:20px;">取消</a>
          <a :class="announcement && announcement.length > 0 && (announcement !== announcementCopy) ? 'confirm' : 'confirm disabled'" @click="showCover" style="margin-right:0;">
            <span v-if="!loading">发布</span>
            <span v-else-if="loading" class="loading"></span>
          </a>
        </div>
      </div>
      <transition name="fade">
        <div class="m-confirm-contain" v-if="showConfirmCover">
          <div class="m-confirm-cover" @click="closeCover"></div>
          <div class="m-confirm-body">
            <div>
              <div>群公告发布后，会通知群内所有人。是否确认发布？</div>
              <div v-if="platform" class="b-control">
                <a class="b-release" @click="releaseNotice">确认发布</a>
                <a @click="closeCover">再想想</a>
              </div>
              <div v-else class="b-control">
                <a @click="closeCover" style="margin-right:20px;">再想想</a>
                <a class="b-release" @click="releaseNotice" style="margin-right:0;">确认发布</a>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</transition>
</template>

<script>
import platform from '../../utils/platform'
import drag from '../../utils/drag.js'
export default {
  name: 'edit-notice',
  mounted () {
    this.eventBus.$on('editNotice', (data) => {
      this.showEditNotice = true
      this.teamInfo = data.teamInfo
      this.announcement = data.teamInfo.announcement
      this.announcementCopy = data.teamInfo.announcement
      this.disabled = data.disabled
      this.type = data.type
      this.scene = data.scene
      this.to = data.to
      this.jurisdiction = true
    })
    this.eventBus.$on('editNoticePromiss', (data) => {
      this.jurisdiction = data.jurisdiction
    })
  },
  data () {
    return {
      showEditNotice: false,
      showConfirmCover: false,
      loading: false,
      disabled: true,
      jurisdiction: true,
      teamInfo: {},
      announcement: '',
      announcementCopy: '',
      type: '',
      scene: '',
      to: ''
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
    drag.dragPosition('editNoticeDrag', 1)
  },
  methods: {
    closeModal () {
      this.showEditNotice = false
      this.loading = false
    },
    startEdit () {
      this.type = 'edit'
    },
    showCover () {
      // 当权限发生改变时处理
      if (!this.jurisdiction) {
        this.$store.commit('toastConfig', {
          show: true,
          type: 'fail',
          toastText: '您还没有修改权限'
        })
        return
      }
      if (this.loading) return
      if (!(this.announcement && this.announcement.length > 0 && (this.announcement !== this.announcementCopy))) return
      this.showConfirmCover = true
    },
    closeCover () {
      this.showConfirmCover = false
    },
    releaseNotice () {
      // 当权限发生改变时处理
      if (!this.jurisdiction) {
        this.$store.commit('toastConfig', {
          show: true,
          type: 'fail',
          toastText: '您还没有修改权限'
        })
        return
      }
      if (this.loading) return
      // 发布公告
      this.showConfirmCover = false
      this.loading = true
      this.teamInfo.announcement = this.announcement
      this.$store.dispatch('updateTeam', {
        teamInfo: {
          teamId: this.teamInfo.teamId,
          announcement: this.announcement
        },
        callback: () => {
          this.closeModal()
        }
      })
      let text = `群公告\r\n\r\n${this.announcement}\r\n\r\n@所有人`
      setTimeout(() => {
        this.$store.dispatch('sendMsg', {
          scene: this.scene,
          to: this.to,
          text,
          type: 'text',
          dataAt: '@'
        })
      }, 500)
    }
  }
}
</script>

<style>
.m-editnotice-contain {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1001;
  }

  .m-editnotice-contain .m-editnotice-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }

	.m-editnotice-contain .m-editnotice {
    box-sizing: border-box;
		position: absolute;
		top: 1px;
    left: 50%;
    transform: translateX(-50%);
		width: 600px;
		height: 502px;
    background: #fff;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    z-index: 100;
  }

  .m-editnotice-contain .m-editnotice .drag {
    -webkit-app-region: no-drag;
    box-sizing: border-box;
    position: relative;
    width: 100%;
    padding: 9px 10px;
    font-size: 14px;
    color: #999;
  }
  
  .m-editnotice .close {
    position: absolute;
    right: 0;
    top: 0;
  }
  
  .m-editnotice .loading {
    display: inline-block;
    width: 15px;
    height: 15px;
    background: url('../../../../static/img/setting/loading-blur.gif') no-repeat center center;
    background-size: 100% 100%;
    margin-top: 6px;
  }

  .m-editnotice .m-body {
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    top: 30px;
    bottom: 68px;
    padding: 10px;
  }

  .m-editnotice .m-body textarea,
  .m-editnotice .m-body > span {
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;
    padding: 10px;
    border: none;
    resize: none;
    background-color: rgba(250,250,250,1);
    border-radius: 4px;
    font-size: 14px;
    font-family: "PingFangSC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
    line-height: 20px;
    color: #333;
  }
  .m-editnotice .m-body > span {
    color: #7D807E;
  }
  .m-editnotice .m-body textarea::-webkit-input-placeholder {
    color: #7D807E;
  }

  .m-editnotice .footer {
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 68px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
  }

  .m-editnotice .footer .f-right {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }

  .m-editnotice .footer .confirm {
    display: inline-block;
    width: 55px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
    background-color: rgba(79,141,255,1);
    margin-right: 20px;
    transition: all .3s linear;
  }
  .m-editnotice .footer .confirm:hover {
    background-color: rgb(72, 119, 207);
  }

  .m-editnotice .footer .disabled {
    background-color: rgba(79,141,255,.5);
  }
  .m-editnotice .footer .disabled:hover {
    background-color: rgba(79,141,255,.5);
    cursor: default;
  }

  .m-editnotice .footer .cancel {
    display: inline-block;
    width: 55px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    background-color: rgba(242,242,242,1);
    border-radius: 4px;
    font-size: 12px;
    color: #333;
    transition: all .3s linear;
  }
  .m-editnotice .footer .cancel:hover {
    background-color: rgb(223, 219, 219);
  }

  .m-editnotice .m-confirm-contain {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
  }

  .m-editnotice .m-confirm-cover {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }

  .m-editnotice .m-confirm-body {
    position: absolute;
    right: 7px;
    bottom: 54px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 220px;
    height: 115px;
    background: #fff;
    border: 1px solid rgba(219,219,219,1);
    border-radius: 4px;
    padding: 0 20px;
    z-index: 100;
    font-size: 14px;
    color: #333;
    line-height: 1.6;
  }

  .m-editnotice .m-confirm-body .b-control {
    text-align: right;
    margin-top: 15px;
  }

  .m-editnotice .m-confirm-body .b-release {
    color: rgba(79,141,255,1);
    margin-right: 20px;
  }
</style>
