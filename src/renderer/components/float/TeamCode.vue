<template>
<!-- 群二维码 -->
<transition name="fade">
  <div class="m-checkuser-con b-more" ref="teamCode" v-if="showTeamCode" :style="{left, top}" v-clickoutside="closeModal">
    <div class="m-modify b-more">
      <div class="user-info b-more"><img class="b-more" :src="teamInfo.avatar || defaultUserIcon"></div>
      <div class="nick b-more" :title="teamInfo.nick || teamInfo.name">{{teamInfo.nick || teamInfo.name}}</div>
    </div>
    <div class="t-code b-more" v-if="teamQrUrl">
      <img class="b-more" @mousedown.stop="showBtn($event)" :src="teamQrUrl"><div class="b-more">优信用户扫描二维码，即可加入群</div>
      <div class="u-editor-paste-btn b-more" v-if="showPasteBtn" :style="{left: pasteLeft + 'px', top: pasteTop + 'px'}" @click="saveAs">另存为</div>
    </div>
  </div>
</transition>
</template>

<script>
import clickoutside from '../../utils/clickoutside.js'
import Request from '../../utils/request.js'
export default {
  name: 'team-code',
  directives: {clickoutside},
  mounted () {
    this.eventBus.$on('teamCode', (data) => {
      let {teamId, event} = data
      this.teamId = teamId
      this.left = event.clientX - 320 + 'px'
      this.top = event.clientY + 'px'
      this.showTeamCode = true
    })
  },
  updated () {
    window.document.body.addEventListener('click', () => {
      this.showPasteBtn = false
    })
  },
  data () {
    return {
      showTeamCode: false,
      teamId: '',
      left: '38%',
      top: '20%',
      showPasteBtn: false,
      pasteLeft: '',
      pasteTop: ''
    }
  },
  computed: {
    teamInfo () {
      let teamInfo = this.$store.state.teamlist.find(item => {
        return item.teamId === this.teamId
      })
      return teamInfo || {}
    },
    teamQrUrl () {
      if (this.teamInfo) {
        let custom = this.teamInfo.custom
        if (custom) return JSON.parse(custom).teamQrUrl
      }
      this.generateQrCode(this.teamId)
      return ''
    }
  },
  methods: {
    closeModal (el, e) {
      let className = e.target.className
      if (className.indexOf('noevent') > -1) return
      this.showTeamCode = false
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
    },
    showBtn (e) {
      if (e.button === 2) {
        this.showPasteBtn = true
        this.pasteLeft = e.offsetX
        this.pasteTop = e.offsetY
      }
    },
    saveAs () {
      this.$store.dispatch('downloadImg', {url: this.teamQrUrl, name: this.teamQrUrl + '.jpg'})
    }
  }
}
</script>

<style scoped>
	.m-checkuser-con {
    box-sizing: border-box;
    position: absolute;
    left: 30%;
    top: 20%;
    width: 320px;
    height: 409px;
    opacity: 1;
    background-color: #fff;
    padding: 40px 40px 20px;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    border-radius: 4px;
    z-index: 1001;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .3s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  .m-checkuser-con .m-modify {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid rgba(214,214,214,1);
    padding-bottom: 20px;
    margin-bottom: 10px;
  }

  .m-checkuser-con .m-modify .user-info img {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    vertical-align: middle;
  }

  .m-checkuser-con .m-modify .nick {
    width: 100%;
    font-size: 18px;
    color: #000;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    cursor: default;
  }

  .t-code {
    position: relative;
    text-align: center;
    font-size:12px;
    color:rgba(153,153,153,1);
  }

  .t-code img {
    width: 220px;
    height: 220px;
  }

  .t-code .u-editor-paste-btn {
    position: absolute;
    z-index: 70;
    width: 88px;
    height: 30px;
    background: rgba(255,255,255,1);
    border: 1px solid #BEBEBE;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.16);
    border-radius: 10px;
    text-align: center;
    line-height: 30px;
    cursor: pointer;
    color: #049AFF;
    font-size: 14px;
  }
</style>


