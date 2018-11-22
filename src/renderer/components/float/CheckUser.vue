<template>
<!-- 个人资料Modal -->
<transition name="fade">
  <div class="m-checkuser-con" ref="checkUser" v-if="showCheckUser" :style="{left, top, height}" v-clickoutside="closeModal">
    <div class="m-modify">
      <div class="user-info"><img :src="userInfos.avatar || defaultUserIcon"></div>
      <div class="nick" :title="userInfos.nick || userInfos.name">{{userInfos.nick || userInfos.name}}</div>
    </div>
    <div class="user-tel"><span>账号</span><span class="line" :style="{color: userInfos.name ? '#333' : '#999'}" :title="userInfos.name">{{userInfos.name || '未设置'}}</span></div>
    <div class="user-tel"><span>手机</span><span class="line" :title="userInfos.phone">{{userInfos.phone}}</span></div>
    <div class="user-tel"><span>电话</span><span class="line" :title="userInfos.tel">{{userInfos.tel}}</span></div>
    <div class="user-tel"><span>邮箱</span><span class="line" :title="userInfos.email">{{userInfos.email}}</span></div>
   
    <div class="user-tel" style="margin-top: 24px"><span>性别</span><span class="line">{{userInfos.sex === 1 ? '男' : userInfos.sex === 2 ? '女' : '保密' }}</span></div>
    <div class="user-tel"><span>职务</span><span class="line" :title="userInfos.position">{{userInfos.position || "-"}}</span></div>
    <div class="user-tel"><span>部门</span><span class="line" :title="userInfos.companyName">{{userInfos.companyName || "-"}}</span></div>
    <div class="user-tel"><span>签名</span><span class="line" :title="userInfos.signature">{{userInfos.signature || "-"}}</span></div>

    <div v-if="callBack" style="marginTop: 15px;">
      <a class="user-btn user-confirm" @click="userBtnFn(1)">通过验证</a><a class="user-btn" @click="userBtnFn(2)">拒绝</a>
    </div>
  </div>
</transition>
</template>

<script>
import clickoutside from '../../utils/clickoutside.js'
import Request from '../../utils/request'
import config from '../../configs'
export default {
  name: 'check-user',
  directives: {clickoutside},
  mounted () {
    this.eventBus.$on('checkUser', (data) => {
      if (data.userInfos === 1) {
        // 打开本人名片
        Request.GetUserInfo({}, this)
          .then(ret => {
            if (ret) {
              this.height = '419px'
              this.userInfos = ret
              this.isSelf = true
              this.showCheckUser = true
              this.managePosition(data.event)
            }
          }).catch(() => {
          })
      } else if (data.userInfos) {
        this.userInfos = data.userInfos || {}
        // 打开他人名片
        let params = [
          {
            tag: data.userInfos.tag || 0,
            accid: data.userInfos.account
          }
        ]
        Request.PullUserInfo(params, this)
          .then(ret => {
            if (ret) {
              this.$store.commit('updateContactslist', {data: ret, type: 'update'})
              this.userInfos = Object.assign(data.userInfos, ret.userList[0])
              if (!this.userInfos.avatar) {
                this.userInfos.avatar = config.defaultUserIcon
              }
              if (data.callBack) {
                this.callBack = data.callBack
                this.height = '500px'
              } else {
                this.callBack = ''
                this.height = '419px'
              }
              this.aliasCopy = data.userInfos.alias
              this.isSelf = false
              this.showCheckUser = true
              this.managePosition(data.event)
            }
          }).catch(() => {
          })
      } else {
        this.height = '419px'
        this.showCheckUser = false
      }
    })
  },
  data () {
    return {
      defaultUserIcon: config.defaultUserIcon,
      showCheckUser: false,
      left: '38%',
      top: '20%',
      height: '419px',
      aliasCopy: '',
      userInfos: {},
      isSelf: false,
      isActive: false,
      callBack: ''
    }
  },
  computed: {
    myInfo () {
      return this.$store.state.myInfo
    },
    sessionlist () {
      return this.$store.state.sessionlist
    },
    personInfos () {
      return this.$store.state.personInfos
    }
  },
  methods: {
    keyToUpdate (event) {
      event.keyCode === 13 && this.updateFriend()
    },
    managePosition (event) {
      let left = event.clientX
      let top = event.clientY
      let clientWidth = document.body.clientWidth
      let clientHeight = document.body.clientHeight
      // 超出底部
      let height = Number(this.height.split('px')[0])
      if (clientHeight - top < height) {
        if (top - height < 0) {
          top = top - height - (top - height - 10)
        } else {
          top = top - height
        }
      }
      // 超出右侧
      if (clientWidth - left < 336) {
        left = left - 336
      }
      this.left = left + 2 + 'px'
      this.top = top + 2 + 'px'
    },
    closeModal (el, e) {
      let className = e.target.className
      if (className.indexOf('noevent') > -1) return
      this.showCheckUser = false
    },
    sendMsg () {
      if (this.isSelf) {
        this.eventBus.$emit('updateNavBar', {navTo: 'session'})
      }
      this.showCheckUser = false
      let sessionId = ''
      for (let i in this.sessionlist) {
        if (this.sessionlist[i].to === this.userInfos.account) {
          sessionId = this.sessionlist[i].id
          break
        }
      }
      if (sessionId) {
        this.eventBus.$emit('toggleSelect', {sessionId})
        this.$router.push({name: 'chat', query: {sessionId, firstFlag: true}})
      } else {
        this.$store.dispatch('insertLocalSession', {
          scene: 'p2p',
          account: this.userInfos.account,
          callback: (sessionId) => {
            this.eventBus.$emit('toggleSelect', {sessionId})
            this.$router.push({name: 'chat', query: {sessionId, firstFlag: true}})
          }
        })
      }
    },
    updateFriend () {
      this.isActive = false
      if (this.userInfos.alias === this.aliasCopy) {
        return
      }
      if (!this.userInfos.alias) {
        this.userInfos.alias = this.aliasCopy
      }
      this.aliasCopy = this.userInfos.alias
      // 修改昵称
      this.$store.dispatch('updateFriend', {
        account: this.userInfos.account,
        alias: this.userInfos.alias
      })
    },
    showInput () {
      this.isActive = true
      setTimeout(() => this.$refs.input.focus(), 0)
    },
    userBtnFn (type) {
      this.showCheckUser = false
      this.callBack(type)
    }
  }
}
</script>

<style>
	.m-checkuser-con {
    box-sizing: border-box;
    position: absolute;
    left: 30%;
    top: 20%;
		width: 336px;
    height: 419px;
    opacity: 1;
    background-color: #fff;
    padding: 40px 40px 20px;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    border-radius: 4px;
    z-index: 10001;
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
    padding-bottom: 30px;
    margin-bottom: 15px;
  }

  .m-checkuser-con .m-modify .user-info img {
    vertical-align: middle
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

  .m-checkuser-con .m-modify .remarks {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 14px;
    color: #999;
    margin-top: 8px;
  }

  .m-checkuser-con .m-modify img {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    margin-right: 10px;
  } 

  .m-checkuser-con .user-tel, .m-checkuser-con .user-email {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #999;
    margin-bottom: 15px;
  }

  .m-checkuser-con .user-email {
    margin-bottom: 31px;
  }

  .m-checkuser-con .sendmsg {
    width: 100%;
    height: 36px;
    line-height: 36px;
    margin-bottom: 10px;
    text-align: center;
    color: #fff;
    font-size: 14px;
    background-color: rgba(4,154,255,1);
    border-radius: 4px;
    cursor: pointer;
  }

  .m-checkuser-con .call {
    box-sizing: border-box;
    width: 100%;
    height: 36px;
    line-height: 36px;
    font-size: 14px;
    text-align: center;
    background-color: rgba(242,242,242,1);
    border-radius: 4px;
    cursor: pointer;
  }

  .m-checkuser-con .line {
    display: inline-block;
    width: 75%;
    font-size: 14px;
    color: #000;
    margin-left: 28px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    cursor: default;
  }

  .m-checkuser-con .memo-input {
    padding: 0;
    margin: 0;
    border: none;
    border-color: transparent;
    background-color: #fff;
    font-size: 14px;
    color: #000;
    width: 50%;
    font-family: "PingFangSC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
    overflow:hidden;
    text-overflow:ellipsis; 
    text-align:left;
    white-space:nowrap
  }
  .m-checkuser-con .memo-input::-webkit-input-placeholder {
    color: #ccc;
  }
  .m-checkuser-con .memo-input.active {
    border: 1px solid rgba(4,154,255,1);
    border-radius: 4px;
  }

  .m-checkuser-con .edit {
    display: inline-block;
    width: 13px;
    height: 13px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
    background-image: url('../../../../static/img/setting/edit.png');
    background-size: 100% 100%;
  }
  .m-checkuser-con .edit:hover, .edit:focus {
    background-image: url('../../../../static/img/setting/edit-h.png');
  }

  .m-checkuser-con .user-btn {
    width: 100%;
    height: 36px;
    line-height: 36px;
    margin-bottom: 10px;
    text-align: center;
    background-color: #F2F2F2;
    border-radius: 4px;
    cursor: pointer;
    transition: background .2s linear;
    color: #F43530;
    font-size: 14px;
  }

  .m-checkuser-con .user-btn:hover {
    background-color: #e0e0e0;
  }

  .m-checkuser-con .user-confirm {
    background:rgba(4,154,255,1);
    color: #fff;
  }
  .m-checkuser-con .user-confirm:hover {
    background:rgba(1, 138, 230,1);
  }
</style>


