<template>
  <div class="m-main-list" id="resize-side-lf" style="width:270px;">

    <div class="u-search searchevent" v-clickoutside="clearStatus">
      <div class="u-cont">
        <input :class="showSearch ? 'active' : ''" type="text" v-model="searchValue" placeholder="搜索" @focus="showSearch = true"/>
        <span v-if="showSearch" class="clear" @click="clearStatus"/>
      </div>
    </div>
    <search v-if="showSearch" type="all" :value="searchValue" :clearStatus="clearStatus"/>

    <div class="u-neterr" v-if="networkStatus !== 200"><i></i><span>当前网络不可用，请检查你的网络设置</span></div>
    <div class="u-nomsg" v-if="contactslist.length <= 0">暂无常用联系人~~</div>

    <div v-if="contactslist.length > 0" class="contacts-title">
      <span style="color: #333">常用联系人</span>
      <span >{{contactslist.length + '人'}}</span>
      <!-- <span>{{onLineNum + '/' + contactslist.length}}</span> -->
    </div>

    <ul class="u-list" id="contacts-list" :style="{top: networkStatus !== 200 ? '132px' : '96px'}">
      <li
        v-for="contacts in contactslist"
        :key="contacts.accid"
        :id="contacts.accid"
        class="u-list-item"
        :class="contacts.accid === activeId ? 'u-list-item-active' : ''"
        @click="toggleNameCard(contacts)"
        @dblclick="toggleSession(contacts.accid)"
      >
        <div class="u-list-item-container" :class="contacts.localCustom && contacts.localCustom.topTime ? 'contacts-box-item-isTop' : ''">
          <div style="display: flex; align-items: center; width:100%;">
            <div
              class="icon"
              style="position: relative;"
            >
              <img
                :src="contacts.avatar"
                style="width: 100%;height: 100%;border-radius: 50%;"
              />
              <!-- 去掉蒙层 -->
              <!-- <div
                v-if="contacts.status !== 0 && contacts.status !== 1"
                class="u-status-cover"
              /> -->
            </div>
            <div class="multi-content">
              <div class="title" style="width: 95%;">{{contacts.name}}</div>
              <div class="content">
                <span>{{contacts.signature ? contacts.signature : ''}}</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
    <div class="border" id="resize-we"></div>
  </div>
</template>

<script>
  import config from '../../configs'
  import Request from '../../utils/request'
  import Search from '../search/Search.vue'
  import clickoutside from '../../utils/clickoutside.js'
  import NativeLogic from '../../utils/nativeLogic.js'
  export default {
    name: 'contacts-list',
    directives: {clickoutside},
    components: {Search},
    props: {
      callBack: Function
    },
    mounted () {
      this.setDragArea() // 设置可拖拽高度
      this.getData()
    },
    data () {
      return {
        activeId: '',
        showSearch: false,
        searchValue: '',
        noticeIcon: config.noticeIcon,
        defaultUserIcon: config.defaultUserIcon
      }
    },
    computed: {
      sessionlist () {
        return this.$store.state.sessionlist
      },
      contactslist () {
        return this.$store.state.contactsToplist
      },
      onLineNum () {
        let num = 0
        for (let i in this.contactslist) {
          if (this.contactslist[i].status === 0) {
            ++num
          }
        }
        return num
      },
      networkStatus () {
        return this.$store.state.networkStatus
      },
      hasBorder () {
        if (this.$store.state.showListOptions) {
          return true
        }
        return false
      }
    },
    methods: {
      setDragArea () {
        let leftDom = document.getElementById('resize-side-lf')
        let leftWidth = (leftDom.style.width).split('px')[0]
        let percent = ((Number(leftWidth) + 70) / Number(config.mainWinWidth)).toFixed(2) // 70----最左边导航宽，为固定宽
        /**
        * @params:  percent, // 左边占整个应用的百分比：如：0.3
        * * */
        if (config.environment === 'web') {
          NativeLogic.native.setDraggableArea(percent, 20, 30, 80)
        }
      },
      getData () {
        // 获取常用联系人列表
        Request.getContactUserList({tag: 0}, this).then(ret => {
          this.$store.commit('updateContactsToplist', {type: 'update', data: ret})
        }).catch(() => {})
      },
      toggleNameCard (contacts) {
        if (this.activeId === contacts.accid) return
        this.activeId = contacts.accid
        this.callBack({contactId: contacts.accid})
      },
      toggleSession (account) {
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
      clearStatus (el, e) {
        if (e) {
          let className = e.target.className
          if (className.indexOf('searchevent') > -1) return
        }
        this.showSearch = false
        this.searchValue = ''
      }
    }
  }
</script>

<style>
  .contacts-title {
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    padding: 12px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    z-index: 100000;
  }
  .contacts-title>span {
    color: #999;
    font-size: 14px;
  }
  .g-window .u-unread.nomsg {
    width: 10px;
    height: 10px;
    padding: 0;
    margin: 0;
    margin-left: 5px;
  }

  .g-window .mute-contain {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-top: 5px;
  }
  .g-window .mute-contain .mute {
    display: inline-block;
    width: 12.5px;
    height: 12.5px;
    background: url('../../../../static/img/setting/mute.png') no-repeat center center;
    background-size: 100% 100%;
  }

  .m-main-list .contacts-box {
    position: absolute;
    top: 56px;
    bottom: 0;
  }

  .m-main-list .border {
    position: absolute;
    right: 0;
    top: 0;
    width: 2px;
    height: 100%;
    cursor: w-resize;
  }
  .contacts-box-item-container {
    height: 68px;
    width: 100%;
    /* margin: auto; */
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .contacts-box-item-isTop {
    position: relative;
  }
  .contacts-box-item-isTop:after {
    position: absolute;
    content: '';
    left: -8px;
    top: -8px;
    width: 16px;
    height: 16px;
    background: #4F8DFF;
    transform: rotate(45deg);
  }
  .u-search{
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 56px;
  }
  .u-status-cover {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
  }
  .u-search .u-cont {
    position: relative;
    width: 90%;
    height: 28px;
  }
  .u-search input{
    width: 100%;
    height: 100%;
    background: #F0F0F0 url(../../../../static/img/nav/main-tab-search.png) 8px center no-repeat;
    background-size: 12px 12px;
    border-radius: 2px;
    border: none;
    font-size: 12px;
    color: #333;
    border: 1px solid transparent;
    transition: border .1s linear;
  }
  .u-search .clear {
    position: absolute;
    right: 8px;
    top: 6.5px;
    display: block;
    width: 14px;
    height: 14px;
    background-image: url('../../../../static/img/setting/delete.png');
    background-size: 100% 100%;
    cursor: pointer;
  }
  input::-webkit-input-placeholder {
    color: #7D807E;
  }
  .u-neterr {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 36px;
    background: #FFDFE0;
  }
  .u-neterr i{
    margin-right: 5px;
    width: 16px;
    height: 16px;
    background-image: url(../../../../static/img/nav/main-tab-neterr.png);
    background-size: 100%;
  }
  .u-neterr span{
    font-size: 11px;
    color: #626369;
  }

  .u-nomsg {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 56px;
    bottom: 0;
    width: 100%;
    font-size: 14px;
    color: #C4C4C4;
  }
  .u-list-item-active {
    background: #F7F7F7
  }
</style>
