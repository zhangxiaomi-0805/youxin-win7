<template>
<div class="m-main-list" id="resize-side-lf" style="width:270px;">

  <div v-if="contactslist.length > 0" class="u-search">
    <div class="u-cont">
      <input type="text" v-model="searchValue" placeholder="搜索" @keyup="searchContact($event)"/>
      <span v-if="searchValue.length > 0" class="clear" @click="searchValue = ''"/>
    </div>
  </div>
 
  <div class="u-neterr" v-if="networkStatus !== 200"><i></i><span>当前网络不可用，请检查你的网络设置</span></div>
  <div class="u-nomsg" v-if="contactslist.length <= 0">暂无常用联系人~~</div>
  <search v-if="searchValue" type="contacts" :value="searchValue" />

   <div v-if="contactslist.length > 0" class="contacts-title">
    <span>常用联系人</span>
    <span>8/12</span>
  </div>

  <ul class="u-list" id="contacts-list" :style="{top: networkStatus !== 200 ? '132px' : '96px'}" ref="contactsList" @scroll="scrollTop = $event.target.scrollTop">
    <li 
      v-for="contacts in contactslist" 
      :key="contacts.id" 
      :id="contacts.id"
      class="u-list-item" 
      :class="contacts.id === activeId ? 'u-list-item-active' : ''" 
      @click="toggleNameCard(contacts)" 
    >
      <div class="u-list-item-container" :class="contacts.localCustom && contacts.localCustom.topTime ? 'contacts-box-item-isTop' : ''">
        <div style="display: flex; align-items: center; width:100%;">
          <img class="icon" :src="contacts.avatar"/>
          <div class="multi-content">
            <div class="title" style="width: 95%;">{{contacts.name}}</div>
            <div class="content">
              <span>{{'[' + contacts.status + ']'}}</span>
              <span>{{contacts.signName ? contacts.signName : ''}}</span>
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
// import util from '../../utils'
import config from '../../configs'
import pageUtil from '../../utils/page'
import Search from '../search/index'
import Fetch from '../../utils/fetch'
export default {
  name: 'contacts-list',
  props: {
    callBack: Function
  },
  components: {Search},
  mounted () {
    var _this = this
    this.eventBus.$on('locationMainListItem', function (data) {
      if (data.listType === 'contacts') {
        setTimeout(() => {
          pageUtil.scrollMainList('contacts-list', data.activeId)
          _this.activeId = data.activeId
        }, 500)
      }
    })
    this.eventBus.$on('toggleSelect', function (data) {
      _this.activeId = data.contactsId
    })
    // 获取请求数据
    this.getData()
  },
  activated () {
    // 重新加载聊天页
    let activeId = this.activeId
    let dom = this.$refs[activeId]
    this.$nextTick(() => {
      if (dom && dom[0] && dom[0].click) {
        dom[0].click()
      } else {
        this.$router.push({name: 'contacts-default'})
      }
    })
    // 处理滚动条位置
    this.$refs.contactsList.scrollTop = this.scrollTop
  },
  data () {
    return {
      tag: 0,
      timer: null,
      activeId: '',
      scrollTop: 0,
      searchValue: '',
      noticeIcon: config.noticeIcon,
      myAdvancedIcon: config.defaultAdvancedIcon,
      contactslist: [{scene: 'p2p', id: 1, avatar: config.defaultUserIcon, name: '产品-叶晓晓', status: '在线', signName: '做一个有志气的胖纸,哈哈哈哈哈'}, {scene: 'p2p', id: 2, avatar: config.defaultUserIcon, name: '测试-黄灿灿', status: '在线', signName: '做一个有志气的胖纸'}]
    }
  },
  computed: {
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
    getData () {
      // 获取常用联系人列表
      Fetch.post('api/appPc/contactUserList', {tag: this.tag}, this).then(ret => {
        console.log(ret)
        this.tag = ret.tag
        // this.contactslist = ret.userContactList
      }).catch(err => {
        console.log(err)
      })
    },
    searchContact (e) {
      // 查找联系人
      if (e.keyCode === 13) {
        e.target.blur()
        Fetch.post('api/appPc/queryUserList', {tag: this.tag}, this).then(ret => {
          console.log(ret)
          this.tag = ret.tag
          // this.contactslist = ret.userContactList
        }).catch(err => {
          console.log(err)
        })
      }
    },
    toggleNameCard (contacts) {
      if (this.activeId === contacts.id) return
      this.activeId = contacts.id
      this.callBack({contactId: contacts.id})
    }
    // toggleSession (contacts) {
    //   clearTimeout(this.timer) // 清除
    //   // 双击切换聊天
    //   let contactId = contacts.id
    //   let pageType = contacts.type === 1 ? 'p2p' : 'team'
    //   this.$router.push({name: 'chat', query: {pageType, id: contactId, firstFlag: true}})
    //   // this.eventBus.$emit('checkUser', {})
    // }
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
.u-search .u-cont {
  position: relative;
  width: 90%;
  height: 28px;
}
.u-search input{
  width: 100%;
  height: 100%;
  background: #F0F0F0 url(../../../../static/img/nav/main-tab-search.png) 8px center no-repeat;
  background-size: 14px 14px;
  border-radius: 2px;
  border: none;
  text-indent: 24px;
  font-size: 12px;
  color: #333;
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
  top: 0;
  width: 100%;
  height: 100%;
  font-size: 14px;
  color: #C4C4C4;
}
.u-list-item-active {
  background: #F7F7F7
}
</style>
