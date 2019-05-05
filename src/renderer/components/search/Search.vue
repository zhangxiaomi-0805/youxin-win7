<template>
  <!-- 消息列表、通讯录搜索 -->
  <div class="s-cont searchevent" :style="{top: '56px'}">
    <div v-if="!isNotEmpty && !value" class="s-empty searchevent">
      <p>温馨提示：</p>
      <p>1、目前支持帐号、姓名、姓名拼音、手机号、邮箱查找；</p>
      <p>2、为了能精准定位，通过姓名查找时请带上地市前缀，例如：搜索"张三"时输入"南京张三"</p>
      <p>3、搜索结果排序规则：联系人、群/讨论组、聊天记录</p>
    </div>
    <div v-else-if="!isNotEmpty && value && !isSearchInLocal && contactlist.length < 1 && teamlist.length < 1 && recordlist.length < 1" class="s-empty searchevent">暂无搜索结果~</div>
    <!-- 联系人 -->
    <div v-else-if="(type === 'all' || type === 'orgnize')">
      <div v-if="!isSearchInLocal">
        <span  class="s-title searchevent">联系人</span>
        <div v-if="contactlist.length < 1" style="display:flex;width:100%;alignItems:center;height:40px;justifyContent:center;">
          <span style="fontSize: 14px;color:#999">暂无搜索结果~</span>
        </div>
      </div>
      <div v-if="isSearchInLocal">
        <div v-if="contactlist.length < 1">
          <span class="s-title searchevent">联系人</span>
          <div class="s-empty-searchInLocal searchevent">
            <span>无搜索结果</span>
            <a class="search-online searchevent"  @click="toggleSearchType()">在线查找 >></a>
          </div>
        </div>
        <div v-else class="s-title searchevent">
          <span>联系人</span>
          <a v-if="isSearchInLocal && contactlist.length > 0" @click="toggleSearchType()">
            <span class="search-online searchevent">在线查找 >></span>
          </a>
        </div>
      </div>
      <ul class="u-list searchevent">
        <li
          class="u-list-item s-list-item searchevent"
          v-for="item in contactlist"
          :key="item.id"
          :id="item.id"
          :title="item.company"
          @dblclick.stop="toggleSessin('p2p', item.accid)"
        >
          <img :src="item.avatar || myGroupIcon" class="s-img searchevent">
          <div style="paddingLeft: 10px;width: 80%">
            <div class="searchevent s-one-line"><span :class="nameClass(text)" v-for="text in item.name" :key="text.id" :id="text.id">{{text}}</span></div>
            <div class="s-name default searchevent">{{item.companyName}}</div>
          </div>
        </li>
      </ul>
      <a v-if="contactShowMore" class="s-cheak-more searchevent" @click="checkMore('contact')">{{contactShowMore === 2 ? '收起' : '显示更多'}}</a>
    </div>
    <!-- 群组 -->
    <div v-if="(type === 'all' || type === 'team') && value && teamlist.length > 0" :style="{height: teamHeight}">
      <div class="s-title searchevent">群组</div>
      <ul class="u-list searchevent">
        <li
          class="u-list-item s-list-item searchevent"
          v-for="item in teamlist"
          :key="item.id"
          :id="item.id"
          @dblclick.stop="toggleSessin('team', item.teamId)"
        >
          <img :src="item.avatar || myGroupIcon" class="s-img searchevent">
          <div style="paddingLeft: 10px;width: 80%">
            <div class="searchevent s-one-line"><span :class="nameClass(text)" v-for="text in item.name" :key="text.id" :id="text.id">{{text}}</span></div>
            <div v-if="item.contain">
              <span class="s-name default searchevent">包含:</span>
              <span :class="nameClass(val, 'default')" v-for="val in item.contain" :key="val.id" :id="val.id">{{val}}</span>
            </div>
          </div>
        </li>
      </ul>
      <a v-if="teamShowMore" class="s-cheak-more searchevent" @click="checkMore('team')">{{teamShowMore === 2 ? '收起' : '显示全部'}}</a>
    </div>
    <!-- 聊天记录 -->
    <div v-if="value && type === 'all' && recordlist.length > 0" :style="{height: recordHeight}">
      <div class="s-title searchevent">聊天记录</div>
      <ul class="u-list searchevent">
        <li
          class="u-list-item s-list-item searchevent"
          v-for="record in recordlist"
          :key="record.id"
          :id="record.id"
          @dblclick.stop="toggleSessin(record.scene, record.to, record.name)"
        >
          <img :src="record.avatar || myGroupIcon" class="s-img searchevent">
          <div style="paddingLeft: 10px;width: 80%;">
            <div class="s-name searchevent s-one-line">{{record.name}}</div>
            <div class="searchevent s-one-line" v-if="record.recordNum === 1"><span class="s-name default searchevent s-text" v-html="record.text"></span></div>
            <div v-else class="s-name default searchevent">{{record.recordNum > 99 ? '99+条相关聊天记录' : (record.recordNum + '条相关聊天记录')}}</div>
          </div>
        </li>
      </ul>
      <a v-if="recordShowMore" class="s-cheak-more searchevent" @click="checkMore('record')">{{recordShowMore === 2 ? '收起' : '显示全部'}}</a>
    </div>
  </div>
</template>

<script>
  import config from '../../configs'
  import SearchData from './search.js'
  import util from '../../utils'
  export default {
    name: 'search',
    props: {
      type: String,
      value: String,
      clearStatus: Function
    },
    data () {
      return {
        beforeValue: '', // 上一次输入的值，做延时搜索
        contactlist: [], // 联系人集合
        contactHeight: 'auto', // 联系人列表高度
        contactShowMore: 0, // 联系人显示更多 0-不显示，1-显示更多，2-收起
        teamlist: [], // 群组集合
        teamHeight: 'auto', // 群组列表高度
        teamShowMore: 0, // 群组显示全部 0-不显示，1-显示全部，2-收起
        recordlist: [], // 聊天记录集合
        recordHeight: 'auto', // 聊天记录列表高度
        recordShowMore: 0, // 聊天记录显示全部 0-不显示，1-显示全部，2-收起
        branchlist: [], // 部门集合
        myGroupIcon: config.defaultUserIcon,
        configs: {
          listHeight: 56,
          titleHeight: 30,
          spareHeight: 61,
          teamlimitNum: 5,
          recordlimitNum: 5
        },
        isSearchInLocal: true // 默认先从本地联系人搜索
      }
    },
    mounted () {
      if (this.value) {
        this.renderItem(this.value)
      }
    },
    computed: {
      grouplist () {
        let grouplist = this.$store.state.teamlist.filter(item => {
          return item.valid && item.validToCurrentUser
        })
        return grouplist
      },
      isNotEmpty () {
        if (this.type === 'all') {
          return this.contactlist.length > 0 && this.teamlist.length > 0 && this.recordlist.length > 0
        } else if (this.type === 'orgnize') {
          return this.contactlist.length > 0
        } else if (this.type === 'team') {
          return this.teamlist.length > 0
        }
      },
      sessionlist () {
        const pinyin = require('tiny-pinyin')
        let sessionlist = this.$store.state.sessionlist.filter(item => {
          item.name = ''
          item.avatar = ''
          if (item.scene === 'p2p') {
            let userInfo = null
            if (item.to !== this.myPhoneId) {
              userInfo = this.userInfos[item.to]
            } else {
              userInfo = Object.assign({}, this.myInfo)
            }
            if (userInfo) {
              item.name = util.getFriendAlias(userInfo)
              item.avatar = userInfo.avatar
            }
          } else if (item.scene === 'team') {
            let teamInfo = this.$store.state.teamlist.find(team => {
              if (!item.localCustom) {
                return team.teamId === item.to
              }
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
          if (pinyin.isSupported()) {
            item.pinyinStr = pinyin.convertToPinyin(item.name, '', true)
          }
          if (item.name && item.avatar && !item.localCustom) { // 避免显示空的现象 和 已解散的群组
            return item
          }
        })
        console.log(sessionlist)
        return sessionlist
      },
      myInfo () {
        return this.$store.state.myInfo
      },
      myPhoneId () {
        return `${this.$store.state.userUID}`
      },
      userInfos () {
        return this.$store.state.userInfos
      }
    },
    watch: {
      value (newValue, oldValue) {
        this.beforeValue = newValue
        setTimeout(() => {
          if (newValue !== this.beforeValue) return
          this.renderItem(newValue)
        }, 500)
      },
      isSearchInLocal (newValue, oldValue) {
        if (!newValue) {
          this.renderItem(this.value)
        }
      }
    },
    methods: {
      toggleSearchType () {
        this.isSearchInLocal = false
      },
      renderItem (value) {
        if (!value) {
          this.reset()
          return
        }
        if ((this.type === 'all' || this.type === 'orgnize')) this.searchInContact(value, 1)
        if ((this.type === 'all' || this.type === 'team')) this.searchInTeam(value)
        if (this.type === 'all') this.searchInRecord(value)
      },
      async searchInContact (value, page) {
        // 搜索联系人
        let userId = 0
        if (page > 1 && this.contactlist[this.contactlist.length - 1]) {
          userId = this.contactlist[this.contactlist.length - 1].accid
        }
        let result = []
        try {
          if (this.isSearchInLocal) { // 本地查找
            for (let i in this.sessionlist) {
              if ((this.sessionlist[i].name.indexOf(value) > -1 || this.sessionlist[i].pinyinStr.indexOf(value) > -1 || this.sessionlist[i].id.indexOf(value) > -1)) {
                this.sessionlist[i].accid = this.sessionlist[i].id && this.sessionlist[i].id.split('-')[1]
                result.push(this.sessionlist[i])
              }
            }
          } else { // 在线查找
            result = await SearchData.getContactlists(value, page > 1 ? 10 : 6, userId)
          }
        } catch (error) {}
        let contactlistTemp = []
        for (let i in result) {
          if (contactlistTemp.length === (page > 1 ? 10 : 5)) this.contactShowMore = 1
          else contactlistTemp.push(result[i])
        }
        if (page > 1) {
          if (contactlistTemp.length < 10) this.contactShowMore = 2
        } else {
          if (contactlistTemp.length < 5) this.contactShowMore = 0
        }
        // 数据update
        let spareHeight = this.teamShowMore > 0 ? this.configs.spareHeight : this.configs.titleHeight
        this.contactHeight = contactlistTemp.length * this.configs.listHeight + spareHeight + 'px'
        if (page > 1) this.contactlist = this.contactlist.concat(contactlistTemp)
        else this.contactlist = Object.assign([], contactlistTemp)
      },
      async searchInTeam (value, isCheckMore) {
        if (!isCheckMore) {
          this.teamShowMore = 0
          this.configs.teamlimitNum = 5
        }
        let teamlistTemp = []
        try {
          teamlistTemp = await SearchData.getTeamMembersList(this.configs.teamlimitNum, value, () => { this.teamShowMore = 1 })
        } catch (error) { console.log(error) }
        // 数据update
        let spareHeight = this.teamShowMore > 0 ? this.configs.spareHeight : this.configs.titleHeight
        this.teamHeight = teamlistTemp.length * this.configs.listHeight + spareHeight + 'px'
        this.teamlist = Object.assign([], teamlistTemp)
      },
      async searchInRecord (value, isCheckMore) {
        if (!isCheckMore) {
          this.recordShowMore = 0
          this.configs.recordlimitNum = 5
        }
        let recordlistTemp = []
        try {
          recordlistTemp = await SearchData.getRecordsData(this.configs.recordlimitNum, value, () => { this.recordShowMore = 1 })
        } catch (error) {}
        let spareHeight = this.recordShowMore > 0 ? this.configs.spareHeight : this.configs.titleHeight
        this.recordHeight = recordlistTemp.length * this.configs.listHeight + spareHeight + 'px'
        this.recordlist = Object.assign([], recordlistTemp)
      },
      nameClass (text, classname) {
        classname = classname || ''
        for (let i in this.value) {
          if (this.value[i] === text) {
            return 's-name active searchevent ' + classname
          }
        }
        return 's-name searchevent ' + classname
      },
      checkMore (type) {
        switch (type) {
          case 'contact':
            let page = this.contactShowMore === 2 ? 1 : 2
            this.searchInContact(this.value, page)
            break
          case 'team':
            this.teamShowMore = this.teamShowMore === 1 ? 2 : 1
            this.configs.teamlimitNum = this.configs.teamlimitNum === 5 ? 1000000 : 5
            this.searchInTeam(this.value, true)
            break
          case 'record':
            this.recordShowMore = this.recordShowMore === 1 ? 2 : 1
            this.configs.recordlimitNum = this.configs.recordlimitNum === 5 ? 1000000 : 5
            this.searchInRecord(this.value, true)
            break
        }
      },
      reset () {
        this.beforeValue = ''
        this.contactlist = []
        this.teamlist = []
        this.teamShowMore = 0
        this.recordlist = []
        this.recordShowMore = 0
        this.branchlist = []
        this.configs = {
          listHeight: 56,
          titleHeight: 30,
          spareHeight: 61,
          teamlimitNum: 5,
          recordlimitNum: 5
        }
      },
      toggleSessin (scene, account, titleName) {
        // 切换会话
        let sessionId = this.getSessionId(account)
        let BaseFn = (sessionId) => {
          this.reset()
          this.clearStatus()
          this.eventBus.$emit('updateNavBar', {navTo: 'session'})
          this.eventBus.$emit('toggleSelect', {sessionId})
        }
        if (sessionId) {
          BaseFn(sessionId)
          if (titleName) {
            this.$router.push({name: 'search-record', query: {sessionId, searchValue: this.value, titleName}})
          } else {
            this.$router.push({name: 'chat', query: {sessionId, firstFlag: true}})
          }
        } else {
          this.$store.dispatch('insertLocalSession', {
            scene,
            account,
            callback: (sessionId) => {
              BaseFn(sessionId)
              if (titleName) {
                this.$router.push({name: 'search-record', query: {sessionId, searchValue: this.value, titleName}})
              } else {
                this.$router.push({name: 'chat', query: {sessionId, firstFlag: true}})
              }
            }
          })
        }
      },
      contactExit (accid) {
        let contactHistoryAccount = this.$store.state.contactHistoryAccount
        for (let i in contactHistoryAccount) {
          if (contactHistoryAccount[i].account === accid) {
            return true
          }
        }
        return false
      },
      getSessionId (account) {
        let sessionId = ''
        for (let i in this.sessionlist) {
          if (this.sessionlist[i].to === account) {
            sessionId = this.sessionlist[i].id
            break
          }
        }
        return sessionId
      }
    }
  }
</script>

<style scoped>
  .search-online {
    font-size:14px;
    color: #049AFF
  }
  .s-empty-searchInLocal {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 58px;
    background-color: rgba(0,0,0,0.06)
  }
  .s-empty-searchInLocal>span:first-child{
    font-size: 14px;
    color: #999999;
  }
  .s-cont {
    box-sizing: border-box;
    position: absolute;
    top: 56px;
    bottom: 0;
    width: 100%;
    z-index: 100;
    background-color: #fff;
    overflow-y: auto;
  }

  .s-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    padding: 20px 15px;
    box-sizing: border-box;
    font-size: 14px;
    color: #C4C4C4;

  }
  .s-empty>p{
    font-size: 14px;
    color: #999;
    margin-bottom: 5px
  }
  .s-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    box-sizing: border-box;
    margin: 0 13px;
    background-color: #fff;
    border-bottom: 1px solid rgba(247,247,247,1);
    font-size: 14px;
    color: #999;
  }

  .s-list-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 56px;
    box-sizing: border-box;
    padding: 10px 13px;
    cursor: default;
  }

  .s-img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
  }

  .s-list-item .s-name {
    font-size: 14px;
    color: #0B0D0C;
  }
  .s-list-item .s-name.default {
    font-size: 12px;
    color: #7E807F;
  }
  .s-list-item .s-name.active {
    color: rgba(79,141,255,1);
  }

  .s-cheak-more {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 6px 13px;
    font-size: 12px;
    color: #4F8DFF;
  }

  .s-one-line {
    width: 100%;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap
  }
</style>
