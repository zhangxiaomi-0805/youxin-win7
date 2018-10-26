<template>
<!-- 个人资料Modal -->
<transition name="fade">
  <div class="m-checkuser-con" ref="checkUser" v-if="showCheckUser" :style="{left, top, height}" v-clickoutside="closeModal">
    <div class="user-info-box">
      <div class="user-info"><img :src="userInfos.avatar || defaultUserIcon"></div>
      <div>
        <transition name="fade">
          <div v-if="showPrompt"
            class="prompt"
          >
            {{userInfos.alias}}
          </div>
        </transition>
        <div class="nick" >
          {{userInfos.nick}}
        </div>
        <div class="remarks" v-if="!hasSignMame" @click="hasSignMame = true">
          <span style="margin-right: 8px;">签名</span>
          <a class="edit" @click="showInput" style="margin-right: 5px;"></a>
        </div>
        <div class="remarks" v-else
          @mouseover="showPrompt = true"
          @mouseout="showPrompt = false">
          <input
            ref="input"
            @blur="updateFriend"
            @keyup="keyToUpdate($event)"
            :class="isActive ? 'memo-input active' : 'memo-input'"
            type="text"
            style="width: 200px; border-bottom: 1px solid #049AFF"
            v-model="userInfos.alias"
            maxlength="128"
            placeholder="添加签名">
        </div>
      </div>
    </div>
    <div class="user-tel"><span>账号</span><span class="line" :style="{color: userInfos.account ? '#333' : '#999'}" :title="userInfos.account">{{userInfos.account ? userInfos.account : '未设置'}}</span></div>
    <div class="user-tel"><span>手机</span><span class="line" :title="userInfos.phone">{{userInfos.phone}}</span></div>
    <div class="user-tel"><span>电话</span><span class="line" :title="userInfos.phone">{{userInfos.phone}}</span></div>
    <div class="user-tel"><span>邮箱</span><span class="line" :title="userInfos.email">{{userInfos.email}}</span></div>
   
    <div class="user-sex">
        <span style="margin-right: 28px;">性别</span>
        <div class="select-sex-box" @click="showSexModal =! showSexModal">
            <span>{{userInfos.sex === 1 ? '男' : userInfos.sex === 2 ? '女' : '保密' }}</span>
            <div class="select-sex"></div>
        </div>
        <div v-if="showSexModal" class="sexModal-box">
            <ul class='sex-content'>
              <li :class="selectedIndex == index? 'sex-item sex-item-select' : 'sex-item'" v-for="(item, index) in sexList" :key="index"
                @click.stop="selectSex(index)"
                >
                  <div>{{item.name}}</div>
              </li>
            </ul>
        </div>
    </div>
    <div class="user-tel"><span>职务</span><span class="line" :title="userInfos.position">{{userInfos.position ? userInfos.position : '-'}}</span></div>
    <div class="user-tel"><span>部门</span><span class="line" :title="userInfos.email">{{userInfos.position ? userInfos.position : '-'}}</span></div>
 
  </div>
</transition>
</template>

<script>
import clickoutside from '../../utils/clickoutside.js'
// import Fetch from '../../utils/fetch'
import config from '../../configs'
export default {
  name: 'my-info',
  directives: {clickoutside},
  mounted () {
    this.eventBus.$on('showMyInfo', (data) => {
      if (data.userInfos === 1) {
        console.log('111')
        // 打开本人名片
        this.userInfos = Object.assign(this.myInfo, this.personInfos)
        this.isSelf = true
        this.showCheckUser = true
        this.managePosition(data.event)
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
      hasSignMame: false,
      isActive: false,
      sexList: [{name: '男'}, {name: '女'}, {name: '保密'}],
      showSexModal: false,
      selectedIndex: 0,
      showPrompt: false
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
    // 键盘输入
    changeMsg (e) {
      console.log(e.data)
      if (e.data && e.data.length > 64) {
        e.data = e.data.substring(0, 65)
      }
    },
    selectSex (index) {
      this.selectedIndex = index
      this.userInfos.sex = index + 1
      this.showSexModal = false
    },
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

  .m-checkuser-con .user-info-box {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid rgba(214,214,214,1);
    padding-bottom: 27px;
    margin-bottom: 15px;
  }

  .m-checkuser-con .user-info-box .user-info img {
    vertical-align: middle
  }

  .m-checkuser-con .user-info-box .nick {
    width: 100%;
    font-size: 18px;
    color: #000;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    cursor: default;
  }
  /* 签名 */

  .m-checkuser-con .user-info-box .remarks {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 14px;
    color: #999;
    margin-top: 8px;
    width: 200px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
  .m-checkuser-con .user-info-box img {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    margin-right: 10px;
  } 
  .m-checkuser-con .user-info-box .prompt {
    position: absolute;
    top: 100px; 
    left: 90px;
    z-index: 1002;
    background-color: #fff;
    padding: 5px;
    font-size: 12px;
    line-height: 16px;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.30);
    width: 200px;
    word-break:break-all;
    cursor: default;
  }

  .m-checkuser-con .user-tel, .m-checkuser-con .user-sex {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #999;
    margin-bottom: 10px;
  }

  .m-checkuser-con .user-sex {
    margin-top: 24px;
  }

  .m-checkuser-con .sendmsg {
    width: 100%;
    height: 36px;
    line-height: 36px;
    margin-bottom: 10px;
    text-align: center;
    color: #fff;
    font-size: 14px;
    background-color: rgba(79,141,255,1);
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

  .m-checkuser-con .edit {
    display: inline-block;
    width: 13px;
    height: 13px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
    background-image: url('../../../../static/img/setting/edit-nick-name.png');
    background-size: 100% 100%;
  }
  .select-sex-box {
    width: 44px;
    height: 25px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 5px;
    color: #333;
    font-size: 14px;
    background: #EFEFEF;
    position: relative;
  }
  .select-sex {
    width: 13px;
    height: 25px;
    background: url('../../../../static/img/click-down.png') no-repeat right center #EFEFEF;
    background-size: 13px 7px;
  }
  /* 性别选择弹框 */
  .sexModal-box {
    height: 60px;
    width: 52px;
    position: absolute;
    bottom: 68px;
    left: 96px;
    z-index: 100;
    border: 1px solid #ccc
  }
  .sex-content {
    height: 100%;
    width: 100%;
  }
  .sex-content .sex-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    height: 20px;
    line-height: 20px;
    color: #333;
    font-size: 14px;
    transition: all .2s;
    padding: 0 8px;
    box-sizing: border-box;
  }
  .sex-content .sex-item-select {
    background-color: #C0C0C0
  }
</style>


