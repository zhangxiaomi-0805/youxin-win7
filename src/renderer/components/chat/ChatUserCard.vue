<template>
  <!-- 个人名片 -->
  <div class="m-chat-user-card" v-if="scene === 'p2p'">
    <textarea style="width: 1px;height: 1px;position: absolute;right: -3px;overflow:hidden" id="clipboard">aaa</textarea>
    <div class="m-modify">
      <div><img :src="userInfos.avatar || defaultUserIcon"></div>
      <div class="nick" :title="userInfos.name"
        ref="copy_0"
        @keydown.stop="shearBoard($event)"
        tabindex="1"
        @mouseup.stop="userInfos.account ? showListOptions($event, userInfos.account, 'copy_0') : null"
      >{{userInfos.name}}</div>
    </div>
    <div class="user-tel">
      <span>账号</span>
      <span class="line"
        :style="{color: userInfos.account ? '#333' : '#999'}"
        :title="userInfos.account"
        @mouseup.stop="userInfos.account ? showListOptions($event, userInfos.account, 'copy_2') : null"
        ref="copy_2"
        @keydown.stop="shearBoard($event)"
        tabindex="1"
      >{{userInfos.account || '未设置'}}</span>
    </div>
    <div class="user-tel"><span>手机</span>
      <span
        class="line" :title="userInfos.phone"
        @mouseup.stop="userInfos.phone ? showListOptions($event, userInfos.phone, 'copy_3') : null"
        ref="copy_3"
        @keydown.stop="shearBoard($event)"
        tabindex="1"
      >{{userInfos.phone}}</span>
    </div>
    <div class="user-tel"><span>电话</span>
      <span class="line" :title="userInfos.telephone"
        @mouseup.stop="userInfos.tel ? showListOptions($event, userInfos.telephone, 'copy_4') : null"
        ref="copy_4"
        @keydown.stop="shearBoard($event)"
        tabindex="1"
      >{{userInfos.telephone}}</span>
    </div>
    <div class="user-tel"><span>邮箱</span>
      <span class="line" :title="userInfos.email"
        @mouseup.stop="userInfos.email ? showListOptions($event, userInfos.email, 'copy_5') : null"
        ref="copy_5"
        @keydown.stop="shearBoard($event)"
        tabindex="1"
      >{{userInfos.email}}</span>
    </div>

    <div class="user-tel"><span>性别</span>
      <span class="line"
        @mouseup.stop="userInfos.sex ? showListOptions($event, userInfos.sex === 1 ? '男' : userInfos.sex === 2 ? '女' : '保密', 'copy_6') : null"
        ref="copy_6"
        @keydown.stop="shearBoard($event)"
        tabindex="1"
      >{{userInfos.sex === 1 ? '男' : userInfos.sex === 2 ? '女' : '保密' }}</span>
    </div>
    <div class="user-tel"><span>职务</span>
      <span class="line" :title="userInfos.position"
        @mouseup.stop="userInfos.position ? showListOptions($event, userInfos.position, 'copy_7') : null"
        ref="copy_7"
        @keydown.stop="shearBoard($event)"
        tabindex="1"
      >{{userInfos.position || "-"}}</span>
    </div>
    <div class="user-tel"><span>部门</span>
      <span class="line" :title="userInfos.companyName"
        @mouseup.stop="userInfos.companyName ? showListOptions($event, userInfos.companyName, 'copy_8') : null"
        ref="copy_8"
        @keydown.stop="shearBoard($event)"
        tabindex="1"
      >{{userInfos.companyName || "-"}}</span>
    </div>
    <div class="user-tel"><span>签名</span>
      <span class="line" :title="userInfos.signature"
        @mouseup.stop="userInfos.signature ? showListOptions($event, userInfos.signature, 'copy_9') : null"
        ref="copy_9"
        @keydown.stop="shearBoard($event)"
        tabindex="1"
      >{{userInfos.signature || "-"}}</span>
    </div>
  </div>
</template>

<script>
  import Request from '../../utils/request.js'
  import config from '../../configs'
  import MsgRecordFn from '../msgRecord/msgRecord.js'
  export default {
    name: 'chat-user-card',
    props: {
      otherUserInfos: {
        type: Object,
        default () {
          return {}
        }
      },
      scene: String,
      to: String
    },
    data () {
      return {
        userInfos: {},
        defaultUserIcon: config.defaultUserIcon
      }
    },
    watch: {
      to (newValue, oldValue) {
        if (newValue !== oldValue) {
          this.getUserInfo(newValue)
        }
      }
    },
    mounted () {
      this.getUserInfo(this.to)
    },
    // 离开该页面，此时清空当前用户信息，避免网络慢的情况下，切换到下个会话显示的还是上个联系人的名片
    destroyed () {
      this.userInfos = {}
    },
    computed: {
      myInfo () {
        return this.$store.state.myInfo
      }
    },
    methods: {
      // 获取用户基本信息
      getUserInfo (to) {
        if (!to) {
          return false
        }
        if (to === (this.myInfo.accid || this.myInfo.account)) {
          this.getMyInfo()
        } else {
          this.getOtherInfo(to)
        }
      },
      // 获取自己的个人信息
      getMyInfo () {
        Request.GetUserInfo({}, this)
          .then(ret => {
            if (ret) {
              if (!ret.avatar) {
                ret.avatar = config.defaultUserIcon
              }
              this.userInfos = Object.assign({}, ret)
            }
          }).catch(() => {
          })
      },
      // 获取他人的信息
      getOtherInfo (to) {
        if (!to) {
          return false
        }
        let Info = this.otherUserInfos[to]
        let params = null
        if (Info) {
          params = [
            {
              tag: Info.tag || 0,
              accid: Info.accid || Info.account
            }
          ]
        } else {
          params = [
            {
              tag: 0,
              accid: to
            }
          ]
        }
        Request.PullUserInfo(params, this)
          .then(ret => {
            if (ret) {
              if (!ret.userList[0].avatar) {
                ret.userList[0].avatar = config.defaultUserIcon
              }
              this.userInfos = Object.assign({}, ret.userList[0])
            }
          }).catch(() => {
          })
      },
      shearBoard (e) {
        // Ctrl + C写入剪切版
        let copyText = MsgRecordFn.getCopyText(e)
        document.addEventListener('copy', function copy (e) {
          e.clipboardData.setData('text/plain', copyText)
          e.preventDefault()
        })
        document.execCommand('copy')
      },
      showListOptions (e, msg, ref) {
        let target = this.$refs[ref]
        MsgRecordFn.copyAll(target)
        if (e.button === 2) {
          e.preventDefault()
          let key = 'check-user'
          this.$store.dispatch('showListOptions', {
            key,
            show: true,
            id: msg,
            pos: {
              x: e.clientX,
              y: e.clientY
            },
            that: this,
            msg,
            callBack: (type) => {
              switch (type) {
                case 3: // 复制
                  this.shearBoard(e)
                  break
              }
            }
          })
        } else {
          this.$store.dispatch('showListOptions', {
            show: false
          })
        }
        // 处理拖拽窗口事件移除
        document.onmousemove = null
        document.onmouseup = null
        document.body.style.cursor = 'default'
      }
    }
  }
</script>

<style>
  .m-chat-user-card {
    position: absolute;
    top: 31px;
    right: 0;
    width: 152px;
    height: 100%;
    border-left: 1px solid rgb(220, 222, 224);
    background-color: #fff;
    box-sizing: border-box;
    z-index: 30;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .3s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  .m-chat-user-card .m-modify {
    width: 150;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 20px auto;
  }

  .m-chat-user-card .m-modify img {
    vertical-align: middle;
    width: 44px;
    height: 44px;
    border-radius: 50%;
  }

  .m-chat-user-card .m-modify .nick {
    outline: 0;
    width: 100%;
    text-align: center;
    font-size: 14px;
    margin-top: 3px;
    color: #333;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    cursor: default;
    -webkit-user-select: text;
  }

  .m-chat-user-card .m-modify .remarks {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 12px;
    color: #999;
    margin-top: 8px;
  }
  .m-chat-user-card .user-tel, .m-chat-user-card .user-email {
    display: flex;
    padding: 0 10px;
    align-items: flex-start;
    font-size: 12px;
    color: #999;
    margin-bottom: 15px;
  }

  .m-chat-user-card .user-email {
    margin-bottom: 31px;
  }

  .m-chat-user-card .sendmsg {
    width: 100%;
    height: 36px;
    line-height: 36px;
    margin-bottom: 10px;
    text-align: center;
    color: #fff;
    font-size: 12px;
    background-color: rgba(4,154,255,1);
    border-radius: 4px;
    cursor: pointer;
  }

  .m-chat-user-card .call {
    box-sizing: border-box;
    width: 100%;
    height: 36px;
    line-height: 36px;
    font-size: 12px;
    text-align: center;
    background-color: rgba(242,242,242,1);
    border-radius: 4px;
    cursor: pointer;
  }

  .m-chat-user-card .line {
    outline: 0;
    display: inline-block;
    width: 75%;
    font-size: 12px;
    color: #000;
    margin-left: 8px;
    white-space:normal;
    word-wrap:break-word; 
    cursor: default;
    -webkit-user-select: text;
  }
</style>

