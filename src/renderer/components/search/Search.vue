<template>
  <!-- 消息列表、通讯录搜索 -->
  <div class="s-cont">
    <div v-if="!isEmpty" class="s-empty searchevent">暂无搜索结果~</div>
    <!-- 联系人 -->
    <div v-if="contactlist.length > 0">
      <div class="s-title searchevent">联系人</div>
      <ul class="u-list">
        <li
          class="u-list-item s-list-item searchevent"
          v-for="item in contactlist"
          :key="item.id"
          :id="item.id"
          :title="item.company"
        >
          <img :src="item.avatar || myGroupIcon" class="s-img searchevent">
          <div style="paddingLeft: 10px;">
            <div><span :class="nameClass(text)" v-for="text in item.name" :key="text.id" :id="text.id">{{text}}</span></div>
            <div class="s-name default searchevent">{{item.company}}</div>
          </div>
        </li>
      </ul>
      <a v-if="contactShowMore" class="s-cheak-more searchevent" @click="checkMore('contact')">{{contactShowMore === 2 ? '收起' : '显示更多'}}</a>
    </div>
    <!-- 群组 -->
    <div v-if="teamlist.length > 0" :style="{height: teamHeight}">
      <div class="s-title searchevent">群组</div>
      <ul class="u-list">
        <li
          class="u-list-item s-list-item searchevent"
          v-for="item in teamlist"
          :key="item.id"
          :id="item.id"
          @click="toggleSessin(item.teamId)"
        >
          <img :src="item.avatar || myGroupIcon" class="s-img searchevent">
          <div style="paddingLeft: 10px;">
            <div><span :class="nameClass(text)" v-for="text in item.name" :key="text.id" :id="text.id">{{text}}</span></div>
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
    <div v-if="type === 'session' && recordlist.length > 0" :style="{height: recordHeight}">
      <div class="s-title searchevent">聊天记录</div>
      <ul class="u-list">
        <li
          class="u-list-item s-list-item searchevent"
          v-for="record in recordlist"
          :key="record.id"
          :id="record.id"
          @click="toggleSessin(record.to, record.name)"
        >
          <img :src="record.avatar || myGroupIcon" class="s-img searchevent">
          <div style="paddingLeft: 10px;">
            <div class="s-name searchevent">{{record.name}}</div>
            <div class="s-name default searchevent">{{record.recordNum > 99 ? '99+条相关聊天记录' : (record.recordNum + '条相关聊天记录')}}</div>
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
        }
      }
    },
    computed: {
      grouplist () {
        let grouplist = this.$store.state.teamlist.filter(item => {
          return item.valid && item.validToCurrentUser
        })
        return grouplist
      },
      isEmpty () {
        if (this.type === 'session') {
          return this.contactlist.length > 0 || this.teamlist.length > 0 || this.recordlist.length > 0
        } else if (this.type === 'contact') {
          return this.contactlist.length > 0 || this.teamlist.length > 0 || this.branchlist.length > 0
        }
      },
      sessionlist () {
        return this.$store.state.sessionlist
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
      }
    },
    methods: {
      renderItem (value) {
        if (!value) {
          this.reset()
          return
        }
        this.searchInContact(value, 1)
        this.searchInTeam(value)
        this.type === 'session' && this.searchInRecord(value)
      },
      async searchInContact (value, page) {
        // 搜索联系人
        let result = [
          {name: '小明' + parseInt(100 * Math.random()), company: '云信交互组、云信产品组'},
          {name: '小明' + parseInt(100 * Math.random()), company: '云信交互组、云信产品组'},
          {name: '小明' + parseInt(100 * Math.random()), company: '云信交互组、云信产品组'},
          {name: '小明' + parseInt(100 * Math.random()), company: '云信交互组、云信产品组'},
          {name: '小明' + parseInt(100 * Math.random()), company: '云信交互组、云信产品组'},
          {name: '小明' + parseInt(100 * Math.random()), company: '云信交互组、云信产品组'}
        ]
        // let userId = this.contactlist[this.contactlist.length - 1] ? this.contactlist[this.contactlist.length - 1].id : 0
        // let result = await SearchData.getContactlists(value, page > 1 ? 10 : 5, userId)
        let contactlistTemp = []
        for (let i in result) {
          if (contactlistTemp.length === (page > 1 ? 10 : 5)) this.contactShowMore = 1
          else {
            if (result[i].name.indexOf(value) > -1) {
              contactlistTemp.push(result[i])
            }
          }
        }
        if (page > 1 && contactlistTemp.length < 10) this.contactShowMore = 2
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
      toggleSessin (teamId, titleName) {
        // 切换会话
        let sessionId = ''
        for (let i in this.sessionlist) {
          if (this.sessionlist[i].to === teamId) {
            sessionId = this.sessionlist[i].id
            break
          }
        }
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
            scene: 'team',
            account: teamId,
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
      }
    }
  }
</script>

<style scoped>
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
    justify-content: center;
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    font-size: 14px;
    color: #C4C4C4;
  }

  .s-title {
    display: flex;
    align-items: center;
    width: 100%;
    height: 30px;
    box-sizing: border-box;
    padding: 0 16px;
    background-color: #fff;
    color: #333;
    font-size: 14px;
  }

  .s-list-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 56px;
    box-sizing: border-box;
    padding: 10px 16px;
    cursor: default;
  }

  .s-img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
  }

  .s-list-item .s-name {
    font-size: 13px;
  }
  .s-list-item .s-name.default {
    color: #999;
    font-size: 12px;
  }
  .s-list-item .s-name.active {
    color: rgb(0, 162, 255);
  }

  .s-cheak-more {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    color: rgb(103, 168, 221);
    font-size: 13px;
    padding: 6px 0;
  }
</style>
