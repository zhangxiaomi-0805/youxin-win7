<template>
  <!-- 个人名片 -->
  <div class="m-chat-user-card" v-if="scene === 'p2p'">
    <textarea style="width: 1px;height: 1px;position: absolute;left: -1px;overflow:hidden" id="clipboard">aaa</textarea>
    <div class="m-modify">
      <div><img :src="userInfos.avatar || defaultUserIcon"></div>
      <div class="nick" :title="userInfos.name"
        ref="copy_0"
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
      >{{userInfos.account || '未设置'}}</span>
    </div>
    <div class="user-tel"><span>手机</span>
      <span
        class="line" :title="userInfos.phone"
        @mouseup.stop="userInfos.phone ? showListOptions($event, userInfos.phone, 'copy_3') : null"
        ref="copy_3"
      >{{userInfos.phone}}</span>
    </div>
    <div class="user-tel"><span>电话</span>
      <span class="line" :title="userInfos.telephone"
        @mouseup.stop="userInfos.tel ? showListOptions($event, userInfos.telephone, 'copy_4') : null"
        ref="copy_4"
      >{{userInfos.telephone}}</span>
    </div>
    <div class="user-tel"><span>邮箱</span>
      <span class="line" :title="userInfos.email"
        @mouseup.stop="userInfos.email ? showListOptions($event, userInfos.email, 'copy_5') : null"
        ref="copy_5"
      >{{userInfos.email}}</span>
    </div>

    <div class="user-tel"><span>性别</span>
      <span class="line"
        @mouseup.stop="userInfos.sex ? showListOptions($event, userInfos.sex === 1 ? '男' : userInfos.sex === 2 ? '女' : '保密', 'copy_6') : null"
        ref="copy_6"
      >{{userInfos.sex === 1 ? '男' : userInfos.sex === 2 ? '女' : '保密' }}</span>
    </div>
    <div class="user-tel"><span>职务</span>
      <span class="line" :title="userInfos.position"
        @mouseup.stop="userInfos.position ? showListOptions($event, userInfos.position, 'copy_7') : null"
        ref="copy_7"
      >{{userInfos.position || "-"}}</span>
    </div>
    <div class="user-tel"><span>部门</span>
      <span class="line" :title="userInfos.companyName"
        @mouseup.stop="userInfos.companyName ? showListOptions($event, userInfos.companyName, 'copy_8') : null"
        ref="copy_8"
      >{{userInfos.companyName || "-"}}</span>
    </div>
    <div class="user-tel"><span>签名</span>
      <span class="line" :title="userInfos.signature"
        @mouseup.stop="userInfos.signature ? showListOptions($event, userInfos.signature, 'copy_9') : null"
        ref="copy_9"
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
      scene: String
    },
    data () {
      return {
        userInfos: {},
        defaultUserIcon: config.defaultUserIcon
      }
    },
    mounted () {
      this.eventBus.$on('updateUserInfos', (data) => {
        this.getUserInfo(data.to)
      })
    },
    methods: {
      getUserInfo (to) {
        let Info = this.otherUserInfos[to]
        let params = [
          {
            tag: Info.tag || 0,
            accid: Info.accid || Info.account
          }
        ]
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
                  let resTarget = document.getElementById('clipboard')
                  resTarget.innerText = MsgRecordFn.getCopyText(e)
                  resTarget.select()
                  document.execCommand('Copy')
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

