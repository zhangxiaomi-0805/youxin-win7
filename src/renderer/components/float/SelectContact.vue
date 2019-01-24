<template>
<!-- 选择联系人 -->
<transition name="fade">
  <div id="modal-box" class="m-selectcontact-contain" style="top: 0" v-if="showSelectContact">
    <div class="m-selectcontact-cover" @click="closeCover"></div>
    <div class="m-selectcontact" style="width:600px;height:502px;">
      <div class="drag" id="selectContactDrag">
        <span>{{title}}</span>
        <div class="u-sysbtn close"><a class="btn-close" @click="closeModal()"/></div>
      </div>
      <div class="side-list-contain">
        <div class="side-list left">
          <div class="new-chat" @click="forwardNewChat" v-if="type === 7 || type === 8">+ 转发到新聊天</div>
          <!-- 搜索 -->
          <div class="u-search searchevent">
            <div class="u-cont">
              <input :class="showBorder ? 'active' : ''" type="text" v-model="searchValue" placeholder="搜索" @focus="showBorder = true" @blur="showBorder = false"/>
              <span v-if="searchValue" class="clear" @click="clearStatus"/>
            </div>
          </div>
          <div class="title" style="paddingTop: 0;paddingBottom: 0;">{{tipTitle}}</div>
          <ul
            class="u-list"
            :style="type === 7 || type === 8 ? {top: '100px'} : {}"
            v-if="sidelist.length > 0"
          >
            <li class="u-list-item" v-for="(friend, $index) in sidelist" :key="$index" :id="friend.id" @click="add($index)">
              <span v-if="type === 4" :class="friend.checked ? 'radio-active common' : 'radio common'"></span>
              <span v-else :class="friend.disabled ? 'disabled common' : friend.checked ? 'checked common' : 'check common'"></span>
              <img class="msg-img" :src="friend.avatar">
              <span class="inline">{{friend.alias || friend.nick || friend.name || friend.account}}</span>
              <span v-if="friend.memberNum" style="margin-left: 5px;">({{friend.memberNum}}人)</span>
              <span :class="friend.type" v-show="(type === 4 || type === 6) && friend.type !== 'normal'"/>
            </li>
          </ul>
          <div style="fontSize: 13px;color: #C4C4C4;padding: 20px;textAlign: center;" v-if="sidelist.length <= 0">暂无搜索结果~</div>
        </div>
        <div class="side-list" style="float:right;">
          <div class="title">{{chooselist.length > 0 ? '已选择' + ' (' + chooselist.length + '人)' : '已选择'}}</div>
          <ul class="u-list" v-show="chooselist.length > 0" style="top: 44px;">
            <li class="u-list-item" v-for="(item, $index) in chooselist" :key="$index" :id="item.id">
              <img class="msg-img" :src="item.avatar">
              <span class="inline">{{item.alias || item.nick || item.name || item.account}}</span>
              <span v-if="item.memberNum" style="margin-left: 5px;">({{item.memberNum}}人)</span>
              <span class="delete" @click="deleted($index)"></span>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="platform" class="footer">
        <a :class="chooselist.length > 0 ? 'confirm' : 'confirm disabled'" @click="confrimFn">
          <span v-if="!loading">确定</span><span v-else-if="loading" class="loading"></span>
        </a>
        <a class="cancel" @click="closeModal()">取消</a>
      </div>
      <div v-else class="footer">
        <a class="cancel" @click="closeModal()" style="margin-right:20px;">取消</a>
        <a :class="chooselist.length > 0 ? 'confirm' : 'confirm disabled'" @click="confrimFn" style="margin-right:0;">
          <span v-if="!loading">确定</span><span v-else-if="loading" class="loading"></span>
        </a>
      </div>
      <transition name="fade">
        <div class="m-confirm-contain" v-if="showConfirmCover">
          <div class="m-confirm-cover" @click="closeCover"></div>
          <div class="m-confirm-body">
            <div>
              <div>{{`确认要将选中${chooselist.length}人移出群聊么？移出后，对方将收到被移出通知。`}}</div>
              <div v-if="platform" class="b-control">
                <a class="b-release" @click="removeTeamMember(2)">确认移出</a><a @click="closeCover">再想想</a>
              </div>
              <div v-else class="b-control">
                <a @click="closeCover" style="margin-right:20px;">再想想</a>
                <a class="b-release" @click="removeTeamMember(2)" style="margin-right:0;">确认移出</a>
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
import util from '../../utils'
import drag from '../../utils/drag.js'
// import listSort from '../../utils/listSort.js'
import config from '../../configs'
export default {
  name: 'select-contact',
  mounted () {
    this.eventBus.$on('selectContact', (data) => {
      this.showSelectContact = true
      this.type = data.type
      this.sidelist = Object.assign([], data.sidelist)
      this.sidelistCopy = Object.assign([], data.sidelist)
      this.chooselist = []
      if (data.teamId) {
        this.teamId = data.teamId
      }
      if (data.msg) {
        this.msg = data.msg
      }
      this.managelist()
      setTimeout(() => {
        this.setHeaderTop()
      }, 0)
    })
  },
  data () {
    return {
      showBorder: false,
      showSelectContact: false,
      showConfirmCover: false,
      loading: false,
      sidelist: [],
      sidelistCopy: [],
      chooselist: [],
      teamId: null,
      type: 1, // 类型:  1-选择联系人创建群组, 2-添加管理员, 3-移除管理员, 4-转让群, 5-添加群成员，6-移出群成员, 7-转发消息
      msg: null, // 转发消息
      searchValue: '',
      beforeValue: '',
      managerNum: 0 // 群管理员数量
    }
  },
  computed: {
    platform () {
      return platform.getOsInfo() === 'Windows'
    },
    sessionId () {
      return this.$store.state.currSessionId
    },
    to () {
      return util.parseSession(this.sessionId).to
    },
    userInfos () {
      return this.$store.state.userInfos
    },
    title () {
      let title = ''
      switch (this.type) {
        case 1 :
          title = '添加成员'
          break
        case 2 :
          title = '添加管理员'
          break
        case 3 :
          title = '移除管理员'
          break
        case 4 :
          title = '转让群'
          break
        case 5 :
          title = '添加群成员'
          break
        case 6 :
          title = '移出群成员'
          break
        case 7 :
          title = '选择聊天'
          break
        case 8 :
          title = '选择聊天'
          break
      }
      return title
    },
    tipTitle () {
      let title = ''
      switch (this.type) {
        case 1 :
          title = '我的联系人'
          break
        case 2 :
          title = '群成员'
          break
        case 3 :
          title = '管理员'
          break
        case 4 :
          title = '群成员'
          break
        case 5 :
          title = '我的联系人'
          break
        case 6 :
          title = '群成员'
          break
        case 7 :
          title = '最近聊天'
          break
        case 8 :
          title = '最近聊天'
          break
      }
      return title
    }
  },
  watch: {
    searchValue (newValue, oldValue) {
      this.beforeValue = newValue
      setTimeout(() => {
        if (newValue !== this.beforeValue) return
        this.renderItem(newValue)
      }, 500)
    }
  },
  updated () {
    drag.dragPosition('selectContactDrag', 1)
  },
  methods: {
    setHeaderTop () {
      if (config.environment === 'web' && this.showSelectContact) { // 头部预留30px
        let modalBox = document.getElementById('modal-box')
        modalBox.style.top = 30 + 'px'
      }
    },
    managelist () {
      this.managerNum = 0
      this.sidelist.map((item, index) => {
        item.checked = false
        item.disabled = false
        switch (this.type) {
          case 1 :
            if (item.account === this.to) {
              item.disabled = true
            }
            break
          case 2 :
            if (item.type !== 'normal') {
              item.disabled = true
            }
            if (item.type === 'manager') {
              this.managerNum++
            }
            break
          case 3 :
            break
          case 4 :
            break
          case 5 :
            if (item.hasExit) {
              item.disabled = true
            }
            break
          case 6 :
            if (item.hasExit) {
              item.disabled = true
            }
            break
        }
      })
    },
    closeModal () {
      this.showSelectContact = false
      this.loading = false
      this.searchValue = ''
      this.beforeValue = ''
      this.managerNum = 0
    },
    closeCover () {
      this.showConfirmCover = false
    },
    add (key) {
      let list = this.sidelist[key]
      let SpliceFn = (account) => {
        for (let i in this.chooselist) {
          let identKey = this.chooselist[i].account || this.chooselist[i].id
          if (identKey === account) {
            this.chooselist.splice(i, 1)
            break
          }
        }
      }
      if (list.disabled) return
      if (list.checked) {
        list.checked = false
        SpliceFn(list.account || list.id)
      } else {
        if (this.type === 4) {
          let beflist = {}
          for (let i in this.sidelist) {
            if (this.sidelist[i].checked) {
              this.sidelist[i].checked = false
              beflist = this.sidelist[i]
              break
            }
          }
          SpliceFn(beflist.account)
        }
        list.checked = true
        this.chooselist.push(list)
      }
    },
    deleted (key) {
      for (let i in this.sidelist) {
        let leftKey = this.sidelist[i].account || this.sidelist[i].id
        let rightKey = this.chooselist[key].account || this.chooselist[key].id
        if (leftKey === rightKey) {
          this.sidelist[i].checked = false
          break
        }
      }
      this.chooselist.splice(key, 1)
    },
    confrimFn () {
      if (this.loading) return
      if (this.chooselist.length <= 0) return
      let canAdd = () => {
        let teamMembers = this.$store.state.teamMembers
        let members = teamMembers && teamMembers[this.teamId]
        if (members && members.length + this.chooselist.length >= 200) {
          this.$store.commit('toastConfig', {
            show: true,
            type: 'fail',
            toastText: '人数已达上限'
          })
          return false
        }
        return true
      }
      switch (this.type) {
        case 1 :
          canAdd() && this.createTeam()
          break
        case 2 :
          this.addManager()
          break
        case 3 :
          this.removeManager()
          break
        case 4 :
          this.transferTeam()
          break
        case 5 :
          canAdd() && this.addTeamMember()
          break
        case 6 :
          this.removeTeamMember(1)
          break
        case 7 :
          this.forwordMsgList(this.type)
          break
        case 8 :
          this.forwordMsgList(this.type)
          break
      }
    },
    createTeam () {
      // 创建群
      this.loading = true
      let selectedlist = []
      for (let i in this.sidelist) {
        if (this.sidelist[i].disabled) {
          selectedlist.push(this.sidelist[i])
          break
        }
      }
      selectedlist = selectedlist.concat(this.chooselist)
      var accounts = selectedlist.map((friend) => {
        return friend.account
      })
      var _name = []
      _name.push(this.$store.state.myInfo.nick)
      for (var i = 0; i < selectedlist.length; i++) {
        _name.push(selectedlist[i].alias || selectedlist[i].nick)
      }
      if (_name.length >= 200) {
        return
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
              this.$store.commit('toastConfig', {
                show: true,
                type: 'success',
                toastText: '创建群成功'
              })
              this.showSelectContact = false
              setTimeout(() => {
                this.loading = false
              }, 350)
            } else {
              this.loading = false
            }
          }
        }
      })
    },
    addManager () {
      if ((this.managerNum + this.chooselist.length) > 5) {
        this.$store.commit('toastConfig', {
          show: true,
          type: 'fail',
          toastText: '当前最多可添加5名管理员'
        })
        return false
      }
      this.loading = true
      // 添加管理员
      let accounts = []
      this.chooselist.map(item => {
        accounts.push(item.account)
      })
      this.showSelectContact = false
      this.$store.dispatch('addTeamManagers', {
        accounts,
        teamId: this.teamId,
        callback: () => {
          this.loading = false
        }
      })
    },
    removeManager () {
      this.loading = true
      // 移除管理员
      let accounts = []
      this.chooselist.map(item => {
        accounts.push(item.account)
      })
      this.showSelectContact = false
      this.$store.dispatch('removeTeamManagers', {
        accounts,
        teamId: this.teamId,
        callback: () => {
          this.loading = false
        }
      })
    },
    transferTeam () {
      this.loading = true
      // 转让群
      let account = ''
      this.chooselist.map(item => {
        account = item.account
      })
      this.showSelectContact = false
      this.$store.dispatch('transferTeam', {
        account,
        teamId: this.teamId,
        callback: () => {
          this.loading = false
        }
      })
    },
    addTeamMember () {
      this.loading = true
      // 拉人入群
      let accounts = []
      this.chooselist.map(item => {
        accounts.push(item.account)
      })
      this.showSelectContact = false
      this.$store.dispatch('addTeamMembers', {
        accounts,
        teamId: this.teamId,
        callback: (error) => {
          this.loading = false
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
    },
    removeTeamMember (type) {
      // 踢人出群
      if (type === 1) {
        this.showConfirmCover = true
        return
      }
      this.loading = true
      let accounts = []
      this.chooselist.map(item => {
        accounts.push(item.account)
      })
      this.showConfirmCover = false
      this.showSelectContact = false
      this.$store.dispatch('removeTeamMembers', {
        accounts,
        teamId: this.teamId,
        callback: () => {
          this.loading = false
        }
      })
    },
    // 转发消息
    async forwordMsgList (type) {
      this.loading = true
      let failAccount = []
      for (let i = 0; i < this.chooselist.length; i++) {
        try {
          if (type === 7) { // 单条消息转发
            await this.forwordMsg(this.chooselist[i], this.msg)
          } else if (type === 8) { // 多条消息逐条转发
            for (let j = 0; j < this.msg.length; j++) {
              if (typeof this.msg[j] !== 'string') {
                await this.forwordMsg(this.chooselist[i], this.msg[j])
              }
            }
          }
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
    forwordMsg (item, msg) {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('onForwordMsg', {
          msg: msg,
          scene: item.scene,
          to: item.to
        }).then(() => {
          resolve()
        }).catch((err) => {
          reject(err)
        })
      })
    },
    renderItem (value) {
      // 搜索成员
      if (!value) {
        this.sidelist = Object.assign([], this.sidelistCopy)
        return
      }
      let sidelist = []
      for (let i in this.sidelist) {
        let name = this.sidelist[i].alias || this.sidelist[i].nick || this.sidelist[i].name || this.sidelist[i].account
        if (name.indexOf(value) > -1) {
          sidelist.push(this.sidelist[i])
        }
      }
      this.sidelist = sidelist
    },
    clearStatus (el, e) {
      if (e) {
        let className = e.target.className
        if (className.indexOf('searchevent') > -1) return
      }
      this.searchValue = ''
    },
    forwardNewChat () {
      // 转发到新聊天
      this.closeModal()
      this.eventBus.$emit('selectOrgnize', {type: 5, msg: this.msg})
    }
  }
}
</script>

<style>
  .m-selectcontact-contain {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1002;
  }

  .m-selectcontact-contain .m-selectcontact-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }

  .m-selectcontact-contain .m-selectcontact {
    box-sizing: border-box;
    position: absolute;
    top: 1px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 502px;
    background: #fff;
    border: 0.5px solid #CCCCCC;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    z-index: 1002;
  }

  .m-selectcontact-contain .m-selectcontact .drag {
    -webkit-app-region: no-drag;
    box-sizing: border-box;
    position: relative;
    width: 100%;
    padding: 9px 10px;
    font-size: 14px;
    color: #999;
  }

  .m-selectcontact .side-list-contain {
    position: absolute;
    top: 39px;
    left: 10px;
    right: 10px;
    bottom: 4rem;
    background-color: rgba(250,250,250,1);
    border-radius: 4px;
  }

  .m-selectcontact .footer {
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    height: 4rem;
    line-height: 4rem;
    text-align: right;
    font-size: 14px;
  }

  .m-selectcontact .close {
    position: absolute;
    right: 0;
    top: 0;
  }

  .m-selectcontact .delete {
    position: absolute;
    right: 10px;
    top: 14px;
    display: block;
    width: 14px;
    height: 14px;
    background-image: url('../../../../static/img/setting/delete.png');
    background-size: 100% 100%;
    cursor: pointer;
  }

  .m-selectcontact .side-list {
    position: relative;
    float: left;
    width: 50%;
    height: 100%;
    box-sizing: border-box;
  }

  .m-selectcontact .side-list.left {
    border-right: 1px solid rgba(234,234,234,1);
  }

  .m-selectcontact .side-list .title {
    font-size: 14px;
    color: #999;
    letter-spacing: 0;
    text-align: left;
    line-height: 14px;
    padding: 20px 20px 10px;
  }

  .m-selectcontact .u-list {
    position: absolute;
    top: 70px;
    left: 0;
    bottom: 0;
    height: auto;
    box-sizing: border-box;
    overflow-y: auto;
    padding: 10px;
  }

  .m-selectcontact .u-list .u-list-item {
    position: relative;
    display:flex;
    align-items:center;
    flex-direction:row;
    height: 42px;
    box-sizing: border-box;
    font-size: 14px;
    color: #333;
    padding-left: 10px;
    padding-right: 10px;
    cursor: pointer;
  }

  .m-selectcontact .u-list .u-list-item .msg-img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #eee;
    margin-left: 10px;
    margin-right: 10px;
  }

  .m-selectcontact .u-list .u-list-item .common {
    display: inline-block;
    width: 15px;
    height: 15px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
  }

  .m-selectcontact .u-list .u-list-item .check {
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 100% 100%;
  }
  .m-selectcontact .u-list .u-list-item .check:hover, .check:focus {
    background-image: url('../../../../static/img/setting/checkboxborder-p.png');
  }

  .m-selectcontact .u-list .u-list-item .disabled {
    background-image: url('../../../../static/img/setting/checkbox-d.png');
    background-size: 100% 100%;
  }

  .m-selectcontact .u-list .u-list-item .checked {
    background-image: url('../../../../static/img/setting/checkbox-c.png');
    background-size: 100% 100%;
  }

  .m-selectcontact .u-list .u-list-item .radio {
    background-image: url('../../../../static/img/setting/radio.png');
    background-size: 100% 100%;
  }
  .m-selectcontact .u-list .u-list-item .radio:hover, .radio:focus {
    background-image: url('../../../../static/img/setting/radio-p.png');
  }

  .m-selectcontact .u-list .u-list-item .radio-active {
    background-image: url('../../../../static/img/setting/radio-c.png');
    background-size: 100% 100%;
  }

  .m-selectcontact .confirm {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 55px;
    height: 28px;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
    background-color: rgba(4,154,255,1);
    margin-right: 20px;
    transition: all .3s linear;
  }
  .m-selectcontact .confirm:hover {
    background-color: rgb(1, 138, 230);
  }

  .m-selectcontact .disabled {
    background-color: rgba(4,154,255,.5);
  }
  .m-selectcontact .disabled:hover {
    background-color: rgba(1, 138, 230,.5);
    cursor: default;
  }

  .m-selectcontact .cancel {
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
  .m-selectcontact .cancel:hover {
    background-color: rgb(223, 219, 219);
  }

  .m-selectcontact .owner {
    width: 13px;
    height: 13px;
    background: url('../../../../static/img/team/owner.png') no-repeat center center;
    background-size: 100% 100%;
    margin-left: 5px;
  }
  .m-selectcontact .manager {
    width: 13px;
    height: 13px;
    background: url('../../../../static/img/team/manager.png') no-repeat center center;
    background-size: 100% 100%;
    margin-left: 5px;
  }

  /* 二次确认 */
  .m-selectcontact .m-confirm-contain {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
  }

  .m-selectcontact .m-confirm-cover {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }

  .m-selectcontact .m-confirm-body {
    position: absolute;
    right: 7px;
    bottom: 54px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 220px;
    height: 139px;
    background: #fff;
    border: 1px solid rgba(219,219,219,1);
    border-radius: 4px;
    padding: 0 20px;
    z-index: 100;
    font-size: 14px;
    color: #333;
    line-height: 1.6;
  }

  .m-selectcontact .m-confirm-body .b-control {
    text-align: right;
    margin-top: 15px;
  }

  .m-selectcontact .m-confirm-body .b-release {
    color: rgba(79,141,255,1);
    margin-right: 20px;
  }

  .m-selectcontact .loading {
    display: inline-block;
    width: 15px;
    height: 15px;
    background: url('../../../../static/img/setting/loading-blur.gif') no-repeat center center;
    background-size: 100% 100%;
  }

  .m-selectcontact .inline {
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    width: fit-content;
    max-width: 50%;
  }

  .side-list-contain .side-list .new-chat {
    display: flex;
    align-items: center;
    padding: 10px 16px 0;
    font-size: 14px;
    color: #999;
  }
</style>

