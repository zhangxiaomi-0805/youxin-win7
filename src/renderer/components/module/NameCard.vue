<template>
  <div class="g-hbf-container">
    <div class="g-hbf-header m-header"></div>
    <div class="nc-body">
      <div class="nc-p2p"
        v-if="pageType === 'p2p'"
      >
        <!-- 签名鼠标悬停时，显示的提示框 -->
        <transition name="fade">
          <div v-if="userInfos.signature && showPrompt"
            class="prompt">{{userInfos.signature}}</div>
        </transition>
        <textarea style="width: 1px;height: 1px;position: absolute;left: 0px" id="clipboard"></textarea>
        <div class="m-modify">
          <div class="user-info"><img :src="userInfos.avatar || defaultUserIcon"></div>
          <div>
            <div class="nick" :title="userInfos.name" 
              @mouseup.stop="userInfos.nick || userInfos.name ? showListOptions($event, userInfos.nick || userInfos.name, 'copy_0') : null"
              ref="copy_0"
              @keydown.stop="shearBoard($event)"
              tabindex="1"
            >
              {{userInfos.name}}
            </div>
            <div class="line" style="margin: 10px 0 0 0; width: 200px; color: #999; font-size: 13px" 
              @mouseover="showPrompt = true"
              @mouseout="showPrompt = false"
              @mouseup.stop="userInfos.signature ? showListOptions($event, userInfos.signature, 'copy_1') : null"
              ref="copy_1"
              @keydown.stop="shearBoard($event)"
              tabindex="1"
            >
              {{userInfos.signature || '-'}}
            </div>
          </div>
        </div>
        <div class="user-tel"><span>账号</span>
          <span class="line" :style="{color: userInfos.account ? '#333' : '#999'}" :title="userInfos.account"
            ref="copy_2"
            @keydown.stop="shearBoard($event)"
            tabindex="1"
            @mouseup.stop="userInfos.account ? showListOptions($event, userInfos.account, 'copy_2') : null"
            >{{userInfos.account || '未设置'}}</span>
          </div>
        <div class="user-tel"><span>手机</span>
          <span class="line" :title="userInfos.phone"
            ref="copy_3"
            @keydown.stop="shearBoard($event)"
            tabindex="1"
            @mouseup.stop="userInfos.phone ? showListOptions($event, userInfos.phone, 'copy_3') : null"
          >{{userInfos.phone}}</span>
        </div>
        <div class="user-tel"><span>电话</span>
          <span class="line" :title="userInfos.telephone"
            ref="copy_4"
            @keydown.stop="shearBoard($event)"
            tabindex="1"
            @mouseup.stop="userInfos.telephone ? showListOptions($event, userInfos.telephone, 'copy_4') : null"
          >{{userInfos.telephone}}</span>
          </div>
        <div class="user-tel"><span>邮箱</span>
          <span class="line" :title="userInfos.email"
            ref="copy_5"
            @keydown.stop="shearBoard($event)"
            tabindex="1"
            @mouseup.stop="userInfos.email ? showListOptions($event, userInfos.email, 'copy_5') : null"
          >{{userInfos.email}}</span>
        </div>
        <div class="user-tel" style="margin-top: 24px"><span>性别</span>
          <span class="line" 
            @mouseup.stop="userInfos.sex ? showListOptions($event, userInfos.sex === 1 ? '男' : userInfos.sex === 2 ? '女' : '保密', 'copy_6') : null"
            ref="copy_6"
            @keydown.stop="shearBoard($event)"
            tabindex="1"
          >{{userInfos.sex === 1 ? '男' : '女'}}</span>
        </div>
        <div class="user-tel"><span>职务</span>
          <span class="line" :title="userInfos.position"
            @mouseup.stop="userInfos.position ? showListOptions($event, userInfos.position, 'copy_7') : null"
            ref="copy_7"
            @keydown.stop="shearBoard($event)"
            tabindex="1"
            >{{userInfos.position || '-'}}</span>
        </div>
        <div class="user-tel"><span>部门</span>
          <span class="line" :title="userInfos.companyName"
          @mouseup.stop="userInfos.companyName ? showListOptions($event, userInfos.companyName, 'copy_8') : null"
          ref="copy_8"
          @keydown.stop="shearBoard($event)"
          tabindex="1"
          >{{userInfos.companyName || '-'}}</span>
        </div>
        
        <a class="sendmsg" @click="sendMsg(userInfos.accid)">发消息</a>
        <a :class="isInContactslist ? 'delete-contact' : 'add-contact'" @click.stop="isInContactslist ? contactsTopManage(userInfos.accid, 2) : contactsTopManage(userInfos.accid, 1)">
          {{isInContactslist ? '删除常用联系人' : '添加为常用联系人'}}
        </a>
        <!-- <a v-if="type === 'contactsTop'" class="delete-contact" @click="contactsTopManage(userInfos.accid, 2)">删除常用联系人</a>
        <a v-else class="add-contact" @click="contactsTopManage(userInfos.accid, 1)">添加为常用联系人</a> -->
      </div>
      <div class="nc-team" v-else-if="pageType === 'team'">
        <img :src="cardInfo.avatar ? cardInfo.avatar : defaultIcon">
        <div>{{cardInfo.name}}</div>
        <div class="num">
          {{cardInfo.memberNum || memberCount + '人'}}
        </div>
        <a class="button" @click="sendMsg(cardInfo.teamId)">{{isDiscussGroup ? '进入讨论组' : '进入群聊'}}</a>
      </div>
    </div>
  </div>
</template>

<script>
import configs from '../../configs/index.js'
import Request from '../../utils/request.js'
import util from '../../utils'
import MsgRecordFn from '../msgRecord/msgRecord.js'
export default {
  name: 'namecard',
  props: {
    pageType: String,
    type: String,
    accid: String,
    teamId: String,
    contactId: String,
    callBack: Function
  },
  data () {
    return {
      userInfos: {},
      defaultIcon: './static/img/orgnize/team-head.png',
      defaultUserIcon: configs.defaultUserIcon,
      isActive: false,
      showPrompt: false
    }
  },
  mounted () {
    this.getUserInfos()
  },
  watch: {
    accid () {
      this.getUserInfos()
    }
  },
  computed: {
    contactslist () {
      return this.$store.state.contactsToplist // 常用联系人列表
    },
    isInContactslist () {
      const index = this.contactslist.findIndex(item => {
        return item.accid === this.accid
      })
      if (index === -1) {
        return false
      } else {
        return true
      }
    },
    sessionlist () {
      return this.$store.state.sessionlist
    },
    cardInfo () {
      let teamlist = this.$store.state.teamlist
      let cardInfo = teamlist.find(item => {
        return item.teamId === this.teamId
      })
      return cardInfo || {}
    },
    isDiscussGroup () {
      return util.isDiscussGroup(this.cardInfo)
    },
    memberCount () {
      let members = this.$store.state.teamMembers && this.$store.state.teamMembers[this.cardInfo.teamId]
      let memberCount = members && members.length
      return memberCount || 0
    }
  },
  methods: {
    sendMsg (account) {
      // 发送消息、创建群聊
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
    },
    getUserInfos () {
      if (this.pageType === 'p2p') {
        // 获取用户信息
        let params = [
          {
            tag: this.userInfos.tag || 0,
            accid: this.accid
          }
        ]
        Request.PullUserInfo(params, this).then(ret => {
          if (ret) {
            this.userInfos = ret.userList[0]
          }
        }).catch(() => {
        })
      }
    },
    contactsTopManage (accid, userType) {
      // 常用联系人管理
      let params = {
        accid,
        userType
      }
      if (userType === 2) { // 删除
        if (this.callBack) {
          this.callBack()
        }
        this.$store.commit('updateContactsToplist', {type: 'delete', accid})
      } else { // 添加
        let addList = {
          accid: this.userInfos.accid,
          key: this.userInfos.accid,
          tag: new Date().getTime(),
          avatar: this.userInfos.avatar,
          dataStatus: this.userInfos.dataStatus,
          name: this.userInfos.name,
          signature: this.userInfos.signature,
          phone: this.userInfos.phone,
          telephone: this.userInfos.telephone,
          userStatus: this.userInfos.userStatus
        }
        let userContactList = this.$store.state.contactsToplist.concat([addList])
        this.$store.commit('updateContactsToplist', {type: 'update', data: {tag: new Date().getTime(), userContactList}})
      }
      Request.AddOrDelContactUser(params, this)
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

<style scoped>
  .g-hbf-container .g-hbf-header.m-header {
    height: 31px;
  }

  .nc-body {
    position: absolute;
    top: 0;
    background-color: #fff;
    bottom: 0;
    padding-bottom: 55px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nc-body .nc-team {
    text-align: center;
    font-size: 16px;
    color: rgba(51,51,51,1);
  }

  .nc-team > img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-bottom: 3px;
  }

  .nc-team .num {
    color: rgba(180,180,187,1);
    margin: 5px 0 30px;
    font-size: 12px;
  }

  .nc-team .button {
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
  .nc-team .button:hover {
    background: rgb(70, 124, 223);
  }

  .nc-p2p {
    width: 276px;
    position: relative;
  }

  .nc-p2p .prompt {
    position: absolute;
    top: 60px; 
    left: 70px;
    z-index: 1002;
    background-color: #fff;
    padding: 10px;
    box-sizing: border-box;
    font-size: 12px;
    color: #999;
    line-height: 17px;
    border: 1px solid rgba(4,154,155,0.2);
    -webkit-box-shadow: 0 4px 12px rgba(0,101,170,0.1);
    -moz-box-shadow: 0 4px 12px rgba(0,101,170,0.1);
    box-shadow: 0 4px 12px rgba(0,101,170,0.1);
    border-radius: 2px;
    width: 200px;
    word-break:break-all;
    cursor: default;
  }
  .nc-p2p .m-modify {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid rgba(214,214,214,1);
    padding-bottom: 20px;
    margin-bottom: 15px;
  }

  .nc-p2p .m-modify .user-info img {
    vertical-align: middle
  }

  .nc-p2p .m-modify .nick {
    outline: 0;
    width: 100%;
    font-size: 18px;
    color: #333;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    cursor: default;
    -webkit-user-select: text;
  }

  .nc-p2p .m-modify .remarks {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 14px;
    color: #999;
    margin-top: 8px;
  }

  .nc-p2p .m-modify img {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    margin-right: 10px;
  } 

  .nc-p2p .user-tel, .nc-p2p .user-email {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #999;
    margin-bottom: 10px;
  }

  .nc-p2p .user-email {
    margin-bottom: 31px;
  }

  .nc-p2p .sendmsg,
  .nc-p2p .notActive {
    width: 100%;
    height: 36px;
    line-height: 36px;
    margin-top: 40px;
    margin-bottom: 15px;
    text-align: center;
    color: #fff;
    font-size: 14px;
    background-color: rgba(4,154,255,1);
    border-radius: 4px;
    cursor: pointer;
    transition: background .2s linear;
  }
  .nc-p2p .sendmsg:hover {
    background: rgb(1, 138, 230);
  }

  .nc-p2p .notActive {
    background-color: rgba(242,242,242,1);
    color: rgba(179,179,186,1);
    cursor: default;
  }

  .nc-p2p .call {
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

  .nc-p2p .line {
    outline: 0;
    display: inline-block;
    width: 75%;
    font-size: 14px;
    color: #000;
    margin-left: 28px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    cursor: default;
    -webkit-user-select: text;
  }

  .nc-p2p .memo-input {
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
  .nc-p2p .memo-input::-webkit-input-placeholder {
    color: #ccc;
  }
  .nc-p2p .memo-input.active {
    border: 1px solid rgba(4,154,255,1);
    border-radius: 4px;
  }

  .nc-p2p .edit {
    display: inline-block;
    width: 13px;
    height: 13px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
    background-image: url('../../../../static/img/setting/edit.png');
    background-size: 100% 100%;
  }
  .nc-p2p .edit:hover, .edit:focus {
    background-image: url('../../../../static/img/setting/edit-h.png');
  }
  .add-contact,
  .delete-contact {
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
  .add-contact:hover,
  .delete-contact:hover {
    background-color: #e0e0e0;
  }

  .add-contact {
    color: #333;
  }
</style>
