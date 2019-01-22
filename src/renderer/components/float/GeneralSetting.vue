<template>
<!-- 设置浮层 -->
<transition name="fade">
  <div class="m-gen-set-con" v-if="showGeneralSetting">
    <div class="m-gen-set-cover"></div>
    <div class="m-gen-set">
      <div class="title"><span>设置</span><div class="u-sysbtn close"><a class="btn-close" @click="closeModal()"/></div></div>
      <div class="set-act">
        <div class="set-act-lf">
          <div
            :class="`set-act-task${curPanelKey === item.key ? ' active' : ''}`"
            v-for="item in menuList"
            :key="item.key"
            @click="changeCurKey('curPanelKey' ,item.key)"
          >
            <span>{{item.title}}</span>
            <span :style="curPanelKey !== item.key ? {background: '#fff'} : {}" class="set-active"></span>
          </div>
        </div>
        <div class="set-act-rt">
          <div v-if="curPanelKey === 1">
            <div class="set-block">
              <div class="title">手机号</div>
              <div class="set-block-show"><span :title="personInfos.phone">{{personInfos.phone}}</span></div>
            </div>
            <div class="set-block">
              <div class="title">邮箱地址</div>
              <div class="set-block-show"><span :title="personInfos.email">{{personInfos.email}}</span></div>
            </div>
            <div class="set-block">
              <div class="title">密码</div>
              <div class="set-block-show"><span>已设置</span><a v-if="personInfos.accountType !== 1" @click="showDetail($event, 4)" class="toggle">修改密码</a></div>
            </div>
            <div class="set-block logout">
              <a @click="eventBus.$emit('logout')">退出登录</a>
            </div>
          </div>
          <div
            v-if="curPanelKey === 2"
            class="set-sys"
          >
            <div>
              <div style="font-size: 14px;color: #999;">
                关闭主面板时
              </div>
              <div>
                <div
                  v-for="item in sysList"
                  :key="item.key"
                  @click="changeCurKey('curSysKey', item.key)"
                  class="sys-item"
                >
                  <span
                    :class="`radio${curSysKey === item.key ? ' active' : ''}`"
                  />
                  <span style="fontSize: 13px;">{{item.title}}</span>
                </div>
              </div>
            </div>
            <!-- <div
              style="display: flex;justify-content: center;width: 100%;"
            >
              <div
                class="set-block logout"
                style="height: 29px;margin: 0 36px 0 0;"
              >
                <a>确定</a>
              </div>
              <div class="set-block" style="margin-bottom: 0;">
                <a class="toggle" style="width: 77px;height: 29px;color: #999;">取消</a>
              </div>
            </div> -->
          </div>
          <div
            class="set-update"
            v-if="curPanelKey === 3"
          >
            <div
              class="update-img"
            >
              <img style="width: 100%;height: 100%;" :src="logo">
            </div>
            <div style="margin-top: 15px;fontsize: 14px;color: #333;">
              当前优信版本 {{ 'V' + version}}
            </div>
            <div
              class="update-btn"
              @click="checkUpdate"
            >
              检查更新
            </div>
          </div>
          <div
            v-if="curPanelKey === 4"
            style="display: flex;flex-direction: column;justify-content: space-between;width: 100%;height: 100%;"
          >
            <div class="session-list" v-if="sessionlist.length > 0">
              <div
                v-for="(item, index) in sessionlist"
                :key="index"
                style="display: flex;align-items: center;margin-bottom: 10px;width: 100%;height: 40px;"
              >
                <i
                  :class="choseSessionList.indexOf(item.id) > -1 ? 'check z-sel' : 'check'"
                  @click="choseSession(item.id)"
                />
                <div style="display: flex;align-items: center;margin-left: 10px;height: 100%;">
                  <img alt="" :src="item.avatar" class="icon" style="width: 32px;height: 32px;border-radius: 50%;">
                  <div style="display: flex;flex-direction: column;justify-content: space-between;margin-left: 10px;">
                    <span style="color: #333;font-size: 13px;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;max-width: 215px;">{{item.name}}</span>
                    <span v-if="item.lastMsgShow" style="color: #999;font-size: 12px;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;max-width: 215px;">{{item.lastMsgShow}}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else style="color: #999;font-size: 14px;">
              暂无会话可清理~
            </div>
            <div
              style="display: flex;align-items: center;justify-content: space-between;width: 100%;"
            >
              <i
                :class="choseSessionList.length === sessionlist.length ? 'check z-sel' : 'check'"
                @click="choseAllSession"
              />
              <span style="margin-left: -22px;">全选</span>
              <div
                class="set-block logout"
                style="height: 29px;margin-left: 38px;"
                @click="deleteLocalMsgs"
              >
                <a>删除</a>
              </div>
              <div class="set-block" style="margin-bottom: 0;" @click="closeModal">
                <a class="toggle" style="width: 77px;height: 29px;color: #999;">取消</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import util from '../../utils'
import config from '../../configs'
import Request from '../../utils/request.js'
import NativeLogic from '../../utils/nativeLogic'
export default {
  name: 'general-setting',
  data () {
    return {
      showGeneralSetting: false,
      phone: '',
      email: '',
      version: '',
      logo: './static/img/logo.png',
      menuList: [
        {
          title: '账号与安全',
          key: 1
        },
        {
          title: '系统设置',
          key: 2
        },
        {
          title: '软件升级',
          key: 3
        },
        {
          title: '会话清理',
          key: 4
        }
      ],
      // 当前界面
      curPanelKey: 1,
      // 系统设置列表
      sysList: [
        {
          title: '隐藏到任务栏通知区域',
          key: 1
        },
        {
          title: '退出程序',
          key: 2
        }
      ],
      curSysKey: localStorage.CLOSEMETHOD ? JSON.parse(localStorage.CLOSEMETHOD) : 1,
      curCleanKey: 1,
      // 软件升级
      needUpdate: true,
      myGroupIcon: config.defaultGroupIcon,
      choseSessionList: []
    }
  },
  mounted () {
    this.eventBus.$on('generalSetting', (data) => {
      this.showGeneralSetting = data.show
      if (config.environment === 'web') {
        NativeLogic.native.getAppVersion().then(result => {
          if (result) {
            this.version = result.appVersion
          }
        })
      } else {
        let { remote } = require('electron')
        this.version = remote.getGlobal('APPVERSION')
      }
    })
  },
  computed: {
    personInfos () {
      return this.$store.state.personInfos
    },
    myInfo () {
      return this.$store.state.myInfo
    },
    myPhoneId () {
      return `${this.$store.state.userUID}`
    },
    userInfos () {
      return this.$store.state.userInfos
    },
    sessionlist () {
      let sessionlist = this.$store.state.sessionlist.filter(item => {
        item.name = ''
        item.avatar = ''
        if (item.scene === 'p2p') {
          let userInfo = null
          if (item.to !== this.myPhoneId) {
            userInfo = this.userInfos[item.to]
          } else {
            userInfo = Object.assign({}, this.myInfo)
            // userInfo.alias = '我的手机'
            // userInfo.avatar = `${config.myPhoneIcon}`
          }
          if (userInfo) {
            item.name = util.getFriendAlias(userInfo)
            item.avatar = userInfo.avatar
          }
        } else if (item.scene === 'team') {
          let teamInfo = this.$store.state.teamlist.find(team => {
            return team.teamId === item.to
          })
          if (teamInfo) {
            item.name = teamInfo.name
            item.avatar = teamInfo.avatar || this.myGroupIcon
          } else if (item.lastMsg && item.lastMsg.attach && item.lastMsg.attach.team) {
            item.name = item.lastMsg.attach.team.name
            item.avatar = item.avatar || this.myGroupIcon
          } else {
            item.name = item.to
            item.avatar = item.avatar || this.myGroupIcon
          }
        }
        let lastMsg = item.lastMsg || {}
        if (lastMsg.type === 'text') {
          item.lastMsgShow = lastMsg.text || ''
        } else if (lastMsg.type === 'custom') {
          item.lastMsgShow = util.parseCustomMsg(lastMsg)
        } else if (lastMsg.scene === 'team' && lastMsg.type === 'notification') {
          item.lastMsgShow = util.generateTeamSysmMsg(lastMsg)
        } else if (!lastMsg.type) {
          item.lastMsgShow = ''
        } else if (lastMsg.tip) {
          item.lastMsgShow = lastMsg.tip
        } else if (util.mapMsgType(lastMsg)) {
          item.lastMsgShow = `[${util.mapMsgType(lastMsg)}]`
        }
        if (item.updateTime) {
          item.updateTimeShow = util.formatDate(item.updateTime, true)
        }
        return item
      })
      let sessionlistTop = sessionlist.filter((item) => {
        if (item.localCustom && item.localCustom.topTime) {
          let time = item.lastMsg ? item.lastMsg.time : 0
          if (item.localCustom.topTime - time > 0) {
            item.compareTime = item.localCustom.topTime
          } else {
            item.compareTime = time
          }
          return item
        }
      })
      let newSessionlistTop = sessionlistTop.sort((a, b) => {
        return b.compareTime - a.compareTime
      })
      let sessionlistBot = sessionlist.filter((item) => {
        if (!item.localCustom || !item.localCustom.topTime) {
          return item
        }
      })
      return [...newSessionlistTop, ...sessionlistBot]
    }
  },
  methods: {
    closeModal () {
      this.choseSessionList = []
      this.showGeneralSetting = false
    },
    showDetail (event, setType) {
      this.eventBus.$emit('settingDetail', {event, setType})
    },
    changeCurKey (type, key) {
      if (type === 'curSysKey') {
        localStorage.setItem('CLOSEMETHOD', key)
      }
      this[type] = key
    },
    // 清理选中会话
    deleteLocalMsgs () {
      if (this.choseSessionList.length === 0) {
        this.$store.commit('toastConfig', {
          show: true,
          type: 'fail',
          toastText: '未选择会话'
        })
        return
      }
      this.eventBus.$emit('dismissTeam', {
        type: 4,
        callBack: () => {
          this.$store.dispatch('deleteLocalMsgs', {that: this, idList: this.choseSessionList, type: this.choseSessionList.length === this.sessionlist.length ? 1 : 0})
          this.closeModal()
          this.choseSessionList = []
        }
      })
    },
    // 选择单项会话
    choseSession (id) {
      const index = this.choseSessionList.length > 0 ? this.choseSessionList.findIndex(item => item === id) : -1
      if (index === -1) {
        this.choseSessionList.push(id)
      } else {
        this.choseSessionList.splice(index, 1)
      }
    },
    // 选择所有会话
    choseAllSession () {
      if (this.choseSessionList.length === this.sessionlist.length) {
        this.choseSessionList = []
      } else {
        this.sessionlist.forEach(item => {
          if (!this.choseSessionList.includes(item.id)) {
            this.choseSessionList.push(item.id)
          }
        })
      }
    },
    checkUpdate () {
      // 检查更新
      Request.AppVersions().then(res => {
        console.log('检查更新=====')
        console.log(res)
        if (res) {
          this.eventBus.$emit('updateApp', res)
        } else {
          this.$store.commit('toastConfig', {
            show: true,
            type: 'success',
            toastText: '当前已是最新版本！'
          })
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
  .m-gen-set-con {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 888;
  }

  .m-gen-set-con .m-gen-set-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }

  .m-gen-set-con .m-gen-set {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 500px;
    height: 339px;
    transform: translate(-50%, -50%);
    background: #fff;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    border-radius: 0 0 4px 4px;
    z-index: 100;
  }

  .m-gen-set-con .title {
    font-size: 14px;
    color: #999;
  }
  .m-gen-set-con .title > span {
    display: inline-block;
    padding: 4px 0 0 10px;
  }

  .m-gen-set-con .set-act {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    position: absolute;
    top: 25px;
    bottom: 0;
    width: 100%;
    padding: 38px 40px 30px;
  }

  .m-gen-set-con .set-act .set-act-lf {
    width: 90px;
    height: 100%;
    border-right: 1px solid rgba(216,220,222,1);
  }
  .m-gen-set-con .set-act .set-act-rt {
    width: 330px;
    height: 100%;
    box-sizing: border-box;
    padding-left: 20px;
  }

  .m-gen-set-con .set-act-task {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 20px;
    height: 20px;
    cursor: pointer;
    font-size: 14px;
    color: #999;
  }

  .m-gen-set-con .set-act-task span:first-child {
    margin-right: 13px;
    transition: all .3s;
  }

  .m-gen-set-con .set-act-task span:first-child:hover {
    color: rgba(4,154,255,1);
  }

  .m-gen-set-con .set-act-task.active {
    color: rgba(4,154,255,1);
  }
  .m-gen-set-con .set-active {
    display: inline-block;
    width: 2px;
    height: 20px;
    background: rgba(4,154,255,1);
  }

  .m-gen-set-con .set-block {
    margin-bottom: 20px;
  }

  .m-gen-set-con .logout {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 0;
    height: 44px;
  }

  .m-gen-set-con .logout > a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 76px;
    height: 28px;
    background-color: rgba(242,242,242,1);
    border-radius: 2px;
    font-size: 12px;
    color: rgba(245,99,97,1);
    transition: all .3s linear;
  }
  .m-gen-set-con .logout > a:hover {
    background-color: rgb(235, 228, 228);
  }

  .m-gen-set-con .set-block .set-block-show {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: #000;
    line-height: 26px;
  }

  .m-gen-set-con .set-block .set-block-show > span {
    display: inline-block;
    height: 26px;
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: default;
  }

  .m-gen-set-con .set-block .toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 26px;
    background: rgba(242,242,242,1);
    border-radius: 2px;
    font-size: 12px;
    color: #333;
    transition: all .3s linear;
  }
  .m-gen-set-con .set-block .toggle:hover {
    background: rgb(235, 228, 228);
  }
  /* 系统设置 */
  .m-gen-set-con .set-sys {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
  }
  .m-gen-set-con .sys-item {
    display: flex;
    align-items: center;
    margin-top: 10px;
    cursor: pointer;
  }
  .m-gen-set-con .radio {
    position: relative;
    display: block;
    margin-right: 10px;
    width: 14px;
    height: 14px;
    transition: all .3s;
    border-radius: 50%;
    border: 1px solid #999;
  }
  .m-gen-set-con .radio::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    transition: all .3s;
    opacity: 0;
    border-radius: 50%;
    background: #049AFF;
  }
  .m-gen-set-con .radio.active {
    border: 1px solid #049AFF;
  }
  .m-gen-set-con .radio.active::after {
    opacity: 1;
  }

  /* 软件升级 */
  .m-gen-set-con .set-update {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .m-gen-set-con .update-img {
    width: 80px;
    height: 80px;
  }
  .m-gen-set-con .update-btn {
    margin-top: 26px;
    width: 77px;
    height: 29px;
    font-size: 12px;
    cursor: pointer;
    border-radius: 2px;
    color: #049AFF;
    text-align: center;
    line-height: 29px;
    background: #f2f2f2;
    transition: all .2s linear;
  }
  .m-gen-set-con .update-btn:hover {
    background-color: rgb(235, 228, 228);
  }

  .m-gen-set-con .clean-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    cursor: pointer;
  }

  .m-gen-set-con .clean-item span {
    font-size: 14px;
    color: #999;
  }

  .m-gen-set-con .clean-item.active span {
    color: #333;
  }

  .m-gen-set-con .session-list {
    width: 100%;height: 202px;border-bottom: 1px solid #d8d8d8;overflow-y: scroll;
  }

  .m-gen-set-con .check {
    display: block;
    width: 15px;
    height: 15px;
    transition: all .2s;
    cursor: pointer;
    background-size: 100%;
    background-image: url(../../../../static/img/setting/checkboxborder.png);
  }

  .m-gen-set-con .check:hover {
    background-image: url(../../../../static/img/setting/checkboxborder-p.png);
  }

  .m-gen-set-con .check.z-sel {
    background-image: url(../../../../static/img/setting/checkbox-c.png);
  }


</style>

