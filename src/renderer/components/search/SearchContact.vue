<template>
  <div class="s-cont" :style="{overflowY: showTeam ? 'auto' : 'inherit'}" >
    <div style="fontSize: 13px;color: #C4C4C4;padding: 20px;textAlign: center;" v-if="contactlist.length <= 0 && teamlist.length <= 0">暂无搜索结果~</div>
    <!-- 搜索联系人 -->
    <div v-if="contactlist.length > 0" class="title n-padding">联系人</div>
    <ul
      v-if="contactlist.length > 0"
      :class="showTeam ? 'u-list s-default' : 'u-list s-auto'"
      @scroll="loadMore($event)"
    >
      <li
        class="u-list-item s-list-item"
        v-for="item in contactlist"
        :key="item.id"
        :id="item.id"
        :title="item.company"
        @click="chooseContact(item)"
      >
        <span :class="className(item, 'user')"></span>
        <img :src="item.avatar || myGroupIcon" class="s-img">
        <div style="paddingLeft: 10px;">
          <div class="s-one-line"><span :class="nameClass(text)" v-for="text in item.name" :key="text.id" :id="text.id">{{text}}</span></div>
          <div class="s-name default">{{item.companyName}}</div>
        </div>
      </li>
      <li v-if="noMoreData && !showTeam" class="n-data">已无更多记录...</li>
    </ul>
    <a v-if="contactShowMore" class="s-cheak-more searchevent" style="marginBottom: 15px;" @click="checkMore('contact')">{{contactShowMore === 2 ? '收起' : '显示更多'}}</a>
    <!-- 搜索群组 -->
    <div v-if="showTeam && teamlist.length > 0" class="title n-padding">群组</div>
    <ul v-if="showTeam && teamlist.length > 0" class="u-list s-default">
      <li
        class="u-list-item s-list-item"
        v-for="item in teamlist"
        :key="item.id"
        :id="item.id"
        @click="chooseTeam(item)"
      >
        <span :class="className(item, 'team')"></span>
        <img :src="item.avatar || myGroupIcon" class="s-img">
        <div style="paddingLeft: 10px;">
          <div class="s-one-line"><span :class="nameClass(text)" v-for="text in item.name" :key="text.id" :id="text.id">{{text}}</span></div>
          <div v-if="item.contain">
            <span class="s-name default">包含:</span>
            <span :class="nameClass(val, 'default')" v-for="val in item.contain" :key="val.id" :id="val.id">{{val}}</span>
          </div>
        </div>
      </li>
    </ul>
    <a v-if="teamShowMore" class="s-cheak-more" @click="checkMore('team')">{{teamShowMore === 2 ? '收起' : '显示全部'}}</a>
  </div>
</template>

<script>
  import config from '../../configs'
  import SearchData from './search.js'
  export default {
    name: 'search-contact',
    props: {
      showTeam: Boolean,
      value: String,
      clearStatus: Function
    },
    data () {
      return {
        beforeValue: '', // 上一次输入的值，做延时搜索
        contactlist: [], // 联系人集合
        contactShowMore: 0, // 联系人显示更多 0-不显示，1-显示更多，2-收起
        teamlist: [], // 群组集合
        teamHeight: 'auto', // 群组列表高度
        teamShowMore: 0, // 群组显示全部 0-不显示，1-显示全部，2-收起
        teamlimitNum: 5,
        noMoreData: false,
        myGroupIcon: config.defaultUserIcon
      }
    },
    mounted () {
      this.renderItem(this.value)
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
        this.showTeam && this.searchInTeam(value)
      },
      async searchInContact (value, page) {
        // 搜索联系人
        let userId = 0
        if (page > 1 && this.contactlist[this.contactlist.length - 1]) {
          userId = this.contactlist[this.contactlist.length - 1].accid
        }
        let result = []
        try {
          result = await SearchData.getContactlists(value, page > 1 ? 10 : 6, userId)
        } catch (error) {}
        let contactlistTemp = []
        for (let i in result) {
          if (this.showTeam) {
            if (contactlistTemp.length === (page > 1 ? 10 : 5)) this.contactShowMore = 1
            else contactlistTemp.push(result[i])
          } else {
            contactlistTemp.push(result[i])
          }
        }
        if (page > 1 && contactlistTemp.length < 10) {
          if (this.showTeam) {
            this.contactShowMore = 2
          } else {
            this.noMoreData = true
          }
        } else {
          if (this.showTeam && contactlistTemp.length < 5) this.contactShowMore = 0
        }
        // 数据update
        if (page > 1) this.contactlist = this.contactlist.concat(contactlistTemp)
        else this.contactlist = Object.assign([], contactlistTemp)
      },
      async searchInTeam (value, isCheckMore) {
        if (!isCheckMore) {
          this.teamShowMore = 0
          this.teamlimitNum = 5
        }
        let teamlistTemp = []
        try {
          teamlistTemp = await SearchData.getTeamMembersList(this.teamlimitNum, value, () => { this.teamShowMore = 1 })
        } catch (error) { console.log(error) }
        // 数据update
        this.teamlist = Object.assign([], teamlistTemp)
      },
      loadMore (e) {
        if (this.showTeam) return
        let { scrollTop, clientHeight, scrollHeight } = e.target
        if (scrollTop + clientHeight === scrollHeight) {
          this.searchInContact(this.value, 2)
        }
      },
      className (item, type) {
        if (type === 'user') {
          if (this.isDisabled(item)) {
            return 'disabled common'
          }
        }
        if (this.isChecked(item, type)) {
          return 'checked common'
        }
        return 'check common'
      },
      isDisabled (user) {
        let orgDisabledlist = this.$store.state.orgDisabledlist
        for (let i in orgDisabledlist) {
          if (orgDisabledlist[i] === user.accid) {
            return true
          }
        }
        if (this.$store.state.personInfos === user.accid) return true
        return false
      },
      isChecked (item, type) {
        let createTeamSelect = this.$store.state.createTeamSelect
        for (let i in createTeamSelect) {
          if (type === 'user') {
            if (createTeamSelect[i].accid === item.accid) {
              return true
            }
          } else if (type === 'team') {
            if (createTeamSelect[i].teamId === item.teamId) {
              return true
            }
          }
        }
        return false
      },
      nameClass (text, classname) {
        classname = classname || ''
        for (let i in this.value) {
          if (this.value[i] === text) {
            return 's-name active ' + classname
          }
        }
        return 's-name ' + classname
      },
      checkMore (type) {
        switch (type) {
          case 'contact':
            let page = this.contactShowMore === 2 ? 1 : 2
            this.searchInContact(this.value, page)
            break
          case 'team':
            this.teamShowMore = this.teamShowMore === 1 ? 2 : 1
            this.teamlimitNum = this.teamlimitNum === 5 ? 1000000 : 5
            this.searchInTeam(this.value, true)
            break
        }
      },
      reset () {
        this.beforeValue = ''
        this.contactlist = []
        this.noMoreData = false
      },
      chooseTeam (group) {
        // 选择群
        group.scene = 'team'
        group.to = group.teamId
        this.$store.commit('upadteCreateTeamSelect', {type: 'update', data: group})
      },
      chooseContact (user) {
        // 选择联系人
        if (!user.accid) {
          return false
        }
        if (this.isDisabled(user)) return false
        user.scene = 'p2p'
        user.to = user.accid
        this.$store.commit('upadteCreateTeamSelect', {type: 'update', data: user})
      }
    }
  }
</script>

<style scoped>
  .s-cont {
    position: absolute;
    top: 56px;
    bottom: 0;
    box-sizing: border-box;
    width: 100%;
  }

  .s-cont > .s-default {
    position: relative;
    top: 0;
    margin: 10px 0;
    overflow-y: inherit;
    padding: 0 10px;
  }
  .s-cont > .s-auto {
    position: absolute;
    top: 24px;
    left: 0;
    bottom: 0;
    height: auto;
    box-sizing: border-box;
    overflow-y: auto;
    padding: 0 10px;
  }

  .m-selectcontact .u-list .u-list-item.s-list-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 56px;
    box-sizing: border-box;
    padding: 10px 16px;
    cursor: default;
  }

  .s-img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-left: 5px;
  }

  .s-list-item .s-name {
    font-size: 13px;
  }
  .s-list-item .s-name.default {
    color: #999;
    font-size: 12px;
  }

  .n-data {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px 0;
    font-size: 12px;
    color: #999;
  }

  .s-cont .s-list-item .common {
    display: inline-block;
    width: 15px;
    height: 15px;
    margin-right: 6px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
  }

  .s-cont .s-list-item .check {
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 100% 100%;
  }
  .s-cont .s-list-item .check:hover, .check:focus {
    background-image: url('../../../../static/img/setting/checkboxborder-p.png');
  }

  .s-cont .s-list-item .disabled {
    background-image: url('../../../../static/img/setting/checkbox-d.png');
    background-size: 100% 100%;
  }

  .s-cont .s-list-item .unActive {
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 100% 100%;
    opacity: .5;
  }

  .s-cont .s-list-item .checked {
    background-image: url('../../../../static/img/setting/checkbox-c.png');
    background-size: 100% 100%;
  }

  .s-cont .n-padding {
    padding-top: 0;
    padding-bottom: 0;
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

