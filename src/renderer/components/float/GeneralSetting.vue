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
              <div class="set-block-show"><span>已设置</span><a @click="showDetail($event, 4)" class="toggle">修改密码</a></div>
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
                  <span>{{item.title}}</span>
                </div>
              </div>
            </div>
            <div
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
            </div>
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
              当前优信版本 V1.0
            </div>
            <div style="margin-top: 15px;font-size: 12px;color: #999;">
              1.部分细节优化；<br />
              2.新增生成图片分享功能，分享更多样；<br />
              3.修复已知Bug
            </div>
            <div
              class="update-btn"
            >
              去升级
            </div>
          </div>
          <div
            v-if="curPanelKey === 4"
            style="display: flex;flex-direction: column;justify-content: space-between;width: 100%;height: 100%;"
          >
            <div>
              <div
                v-for="item in cleanList"
                :key="item.key"
                @click="changeCurKey('curCleanKey', item.key)"
                :class="`clean-item${curCleanKey === item.key ? ' active' : ''}`"
              >
                <span
                  :class="`radio${curCleanKey === item.key ? ' active' : ''}`"
                />
                <span>{{item.title}}</span>
              </div>
            </div>
            <div
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
export default {
  name: 'general-setting',
  data () {
    return {
      showGeneralSetting: false,
      phone: '',
      email: '',
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
          title: '缓存清理',
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
      curSysKey: 1,
      // 缓存清理列表
      cleanList: [
        {
          title: '清理全部消息记录',
          key: 1
        },
        {
          title: '清理一个月前消息记录',
          key: 2
        },
        {
          title: '清理三个月前消息记录',
          key: 3
        },
        {
          title: '清理半年前消息记录',
          key: 4
        },
        {
          title: '清理一年前消息记录',
          key: 5
        }
      ],
      curCleanKey: 1,
      // 软件升级
      needUpdate: true
    }
  },
  mounted () {
    this.eventBus.$on('generalSetting', (data) => {
      this.showGeneralSetting = data.show
    })
  },
  methods: {
    closeModal () {
      this.showGeneralSetting = false
    },
    showDetail (event, setType) {
      this.eventBus.$emit('settingDetail', {event, setType})
    },
    changeCurKey (type, key) {
      this[type] = key
    }
  },
  computed: {
    personInfos () {
      return this.$store.state.personInfos
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
    z-index: 1001;
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
    color: rgba(79,141,255,1);
  }

  .m-gen-set-con .set-act-task.active {
    color: rgba(79,141,255,1);
  }
  .m-gen-set-con .set-active {
    display: inline-block;
    width: 2px;
    height: 20px;
    background: rgba(79,141,255,1);
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

</style>

