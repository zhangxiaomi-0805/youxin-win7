<template>
  <!-- 历史消息记录 -->
  <transition name="fade">
    <div :class="isXp ? 'm-historymsg-contain contain-top' : 'm-historymsg-contain'" v-if="showHistoryMsg">
      <div class="m-historymsg-cover" @click="closeCover"></div>
      <div class="m-info-box" style="width:600px;height:502px;">
        <!-- 头部 -->
        <div class="drag" id="historyMsgDrag">
          <!-- 单聊 -->
          <ul  v-if='scene === "p2p"' class="session-box">
            <li
              class="session-box"
              v-for="member in memberList"
              :key="member.id"
              :id="member.id"
            >
              <img class="session-avatar" :src="member.avatar">
              <div class="session-name">{{member.alias}}</div>
            </li>
          </ul>
          <!-- 群聊 -->
          <div v-else class="session-box">
            <img :src="teamInfo.avatar" alt="" class="session-avatar">
            <div class="session-name">{{sessionName}}</div>
          </div>

          <div class="u-sysbtn close">
            <a class="btn-close" @click="closeModal"/>
          </div>
        </div>
        <!-- 内容 -->
        <div class="m-historymsg-content">
          <date-picker ref="datePicker" :callback="dateFilter"/>
          <!-- 搜索 -->
          <div class="search-bar" style="position: relative;">
            <input :class="showSearch ? 'active' : ''" type="text" autofocus="autofocus" v-model="searchValue" placeholder="搜索" @focus="showSearch = true"/>
            <span v-if="showSearch" class="clear" @click="clearStatus"/>
            <div v-if="date" style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;background: #fff;opacity: 0.5;"/>
          </div>
          <!-- 转发 && 删除 && 取消 -->
          <div v-if="(isCheckMore || isSearchCheckMore)" class="tab-right-title">
            <a :class="className('forword')" @click.stop="checkedMsgList && checkedMsgList.length > 0 ? toggleFunc('forword') : null">转发</a>
            <a :class="className('delete')" @click.stop="checkedMsgList && checkedMsgList.length > 0 ? toggleFunc('delete') : null">删除</a>
            <a :class="className('cancel')" @click.stop=" toggleFunc('cancel')">取消</a>
          </div>

          <!-- 全部 && 图片 && 文件 -->
          <div v-else class="tab-left-title">
            <a :class="checkType === 'all' ? 'tab-title-item active' : 'tab-title-item'" @click.stop="toggleList('all')">全部</a>
            <a :class="checkType === 'image' ? 'tab-title-item active' : 'tab-title-item'" @click.stop="toggleList('image')">图片</a>
            <a :class="checkType === 'file' ? 'tab-title-item active' : 'tab-title-item'" @click.stop="toggleList('file')">文件</a>
            <div class="tab-data-side">
              <transition name="fade">
              <a class="date" v-show="date"><span>{{date && date.join('/')}}</span><span class="clear" @click="clearDate"></span></a>
              </transition>
              <a class="icon" @click="showPicker"></a>
            </div>
            <div v-if="date" style="position: absolute;top: 0;left: 0;width: 60%;height: 100%;background: #fff;opacity: 0.5;"/>
          </div>

          <!-- 短信选择 -->
          <div class="message-box">
            <div @click.stop="checkType === 'all' && toggleShortMsgStatus()">
              <span :class="(checkType === 'all' && shortMsgCheck) ? 'checked common':'check common'"></span>
              <span style="font-size: 12px; color: #333; line-height:40px">短信</span>
            </div>

            <div v-if="date" style="position: absolute;top: 0;right: 0;width: 15%;height: 100%;background: #fff;opacity: 0.5;"/>
          </div>

          <!-- 内容列表 -->
          <!-- 全部 -->
          <ul id="msg-record-box-all" v-show ="checkType === 'all'" style="width: 100%;overflow-y: scroll; height:300px"  @scroll.stop="checkType === 'all' && scrollTopLoad($event, 'msg-record-box-all')">
            <msg-item
              @checkMore="checkMoreFn"
              :isCheckMore="isCheckMore"
              :sessionId="sessionId"
              :checkedMsgList="checkedMsgList"
              keep-alive
              v-for="(msg, $index) in allMsgList"
              :key = $index
              :msg="msg"
              :idClient="msg.idClient"
              :isRobot="isRobot"
              :userInfos="userInfos"
              :myInfo="myInfo"/>
          </ul>
          <!-- 图片 -->
          <ul id="msg-record-box-image" v-show ="checkType === 'image'" style="width: 100%;overflow-y: scroll; height:300px"  @scroll.stop="checkType === 'image' && scrollTopLoad($event, 'msg-record-box-image')">
            <msg-item
              @checkMore="checkMoreFn"
              :isCheckMore="isCheckMore"
              :sessionId="sessionId"
              :checkedMsgList="checkedMsgList"
              keep-alive
              v-for="(msg, $index) in imageMsgList"
              :key = $index
              :msg="msg"
              :idClient="msg.idClient"
              :isRobot="isRobot"
              :userInfos="userInfos"
              :myInfo="myInfo"/>
          </ul>
          <!-- 文件 -->
          <ul id="msg-record-box-file" v-show ="checkType === 'file'" style="width:100%;overflow-y: scroll; height:300px"  @scroll.stop="checkType === 'file' && scrollTopLoad($event, 'msg-record-box-file')">
            <msg-item
              @checkMore="checkMoreFn"
              :isCheckMore="isCheckMore"
              :sessionId="sessionId"
              :checkedMsgList="checkedMsgList"
              keep-alive
              v-for="(msg, $index) in fileMsgList"
              :key = $index
              :msg="msg"
              :idClient="msg.idClient"
              :isRobot="isRobot"
              :userInfos="userInfos"
              :myInfo="myInfo"/>
          </ul>
          <!-- 搜索结果 -->
          <search-msg
            v-show="searchValue"
            @searchCheckMore="searchCheckMoreFn"
            :isSearchCheckMore="isSearchCheckMore"
            :sessionId="sessionId"
            :checkedMsgList="checkedMsgList"
            keep-alive
            :searchValue="searchValue"
            :checkType="checkType"
            :userInfos="userInfos"
            :myInfo="myInfo"
            :shortMsgCheck="shortMsgCheck"
            :clearStatus="clearStatus"
            :closeCover="closeCover"/>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import drag from '../../utils/drag.js'
  import clickoutside from '../../utils/clickoutside.js'
  import MsgItem from './MsgItem'
  import SearchMsg from './SearchMsg'
  import util from '../../utils'
  import config from '../../configs'
  import emojiObj from '../../configs/emoji'
  import MsgRecordFn from './msgRecord.js'
  import DatePicker from './DatePicker.vue'
  import SearchData from '../search/search.js'
  export default {
    name: 'msg-record',
    directives: {clickoutside},
    components: {
      MsgItem, SearchMsg, DatePicker
    },
    data () {
      return {
        myGroupIcon: config.defaultGroupIcon,
        showHistoryMsg: false,
        showConfirmCover: false,
        showSearch: false,
        searchValue: '',
        loading: false,
        isRobot: false,
        shortMsgCheck: false, // 短信勾选状态
        checkType: 'all', // all---全部; image---图片; file---文件
        checkFunc: '', // forword---转发; delete---删除; cancel---取消
        scene: 'p2p', // p2p---单聊； team---群聊
        to: '',
        sessionName: '',
        teamInfo: {},
        beforeValue: '', // 上一次输入的值，做延时搜索
        isCheckMore: false,
        isSearchCheckMore: false,
        date: '',
        endTime: '',
        isXp: false,
        lastMsgIdServer: null,
        isInitLoadAll: true,
        isInitLoadImage: true,
        isInitLoadFile: true
      }
    },
    mounted () {
      this.eventBus.$on('checkHistoryMsg', (data) => {
        // 初始化当前聊天记录---全部
        this.InitLocalAllMsg()
        this.isInitLoadAll = true
        this.isInitLoadImage = true
        this.isInitLoadFile = true
        this.showHistoryMsg = true
        if (config.environment === 'web') { // Xp系统时，头部预留30px拖拽区域
          this.isXp = true
        }
        this.isRobot = data.isRobot
        this.sessionName = data.sessionName
        this.teamInfo = data.teamInfo
        this.scene = data.scene
        this.to = data.to
        setTimeout(() => {
          this.$nextTick(() => {
            this.scrollToBottom('msg-record-box-all')
            this.isInitLoadAll = false
          })
        }, 100)
      })
    },
    beforeDestroy () {
      this.eventBus.$off('checkHistoryMsg')
    },
    watch: {
      // 监听搜索关键字变化
      searchValue (newValue, oldValue) {
        this.beforeValue = newValue
        setTimeout(() => {
          this.checkType = 'all'
          if (newValue !== this.beforeValue) return
          this.beforeValue = ''
        }, 500)
      },
      // 监听短信勾选状态
      shortMsgCheck (newValue, oldValue) {
        if (newValue) {
          // 初始化当前聊天短信记录
          this.initShortMsgList()
        } else {
          this.isInitLoadAll = true
          // 初始化当前聊天记录
          this.InitLocalAllMsg()
        }
        setTimeout(() => {
          this.$nextTick(() => {
            this.scrollToBottom('msg-record-box-all')
          })
        }, 100)
      },
      // 监听是否有日期筛选
      date (newValue, oldValue) {
        if (newValue) {
          // 初始化当前日期筛选历史记录
          this.InitHistoryMsg()
        } else {
          if (this.shortMsgCheck) {
            // 初始化当前聊天短信记录
            this.initShortMsgList()
          } else {
            this.isInitLoadAll = true
            // 初始化当前聊天记录
            this.InitLocalAllMsg()
          }
        }
        setTimeout(() => {
          this.$nextTick(() => {
            this.scrollToBottom('msg-record-box-all')
          })
        }, 100)
      },
      // 监听选中类型状态变化
      checkType (newValue, oldValue) {
        let domId = ''
        switch (newValue) {
          case 'all':
            domId = 'msg-record-box-all'
            // 初始化当前聊天记录---全部
            this.isInitLoadAll && this.InitLocalAllMsg()
            break
          case 'image':
            domId = 'msg-record-box-image'
            // 初始化当前聊天记录---图片
            this.isInitLoadImage && this.InitLocalImageMsg()
            break
          case 'file':
            domId = 'msg-record-box-file'
            // 初始化当前聊天记录---文件
            this.isInitLoadFile && this.InitLocalFileMsg()
            break
        }
        setTimeout(() => {
          this.$nextTick(() => {
            if (this.checkType === 'all' && this.isInitLoadAll) {
              this.scrollToBottom(domId)
              this.isInitLoadAll = false
            } else if ((this.checkType === 'image' && this.isInitLoadImage)) {
              this.scrollToBottom(domId)
              this.isInitLoadImage = false
            } else if ((this.checkType === 'file' && this.isInitLoadFile)) {
              this.scrollToBottom(domId)
              this.isInitLoadFile = false
            }
          })
        }, 100)
      }
    },
    computed: {
      time () {
        let currSessionMsgs = JSON.parse(JSON.stringify(this.$store.state.currSessionMsgs))
        if (currSessionMsgs && currSessionMsgs.length > 0) {
          return currSessionMsgs[currSessionMsgs.length - 1].time || currSessionMsgs[currSessionMsgs.length - 2].time
        }
        return 0
      },
      currSessionMsgs () {
        let currSessionMsgs = JSON.parse(JSON.stringify(this.$store.state.currSessionMsgs))
        return currSessionMsgs
      },
      msgRecordAllList () {
        let msgRecordAllList = this.$store.state.msgRecordAllList
        return msgRecordAllList
      },
      msgRecordImageList () {
        let msgRecordImageList = this.$store.state.msgRecordImageList
        return msgRecordImageList
      },
      msgRecordFileList () {
        let msgRecordFileList = this.$store.state.msgRecordFileList
        return msgRecordFileList
      },
      myPhoneId () {
        return `${this.$store.state.userUID}`
      },
      myInfo () {
        return this.$store.state.myInfo
      },
      userInfos () {
        return this.$store.state.userInfos
      },
      sessionId () {
        let sessionId = this.$route.query.sessionId || this.$store.state.currSessionId
        return sessionId
      },
      memberList () {
        if (this.scene === 'p2p') {
          let members = []
          if (this.to === this.$store.state.userUID) {
            // 自己同自己发消息
            members.push({
              alias: this.$store.state.myInfo.nick,
              avatar: this.$store.state.myInfo.avatar
            })
          } else {
            let userInfo = this.userInfos[this.to]
            if (userInfo) {
              members.push({
                alias: util.getFriendAlias(userInfo),
                avatar: userInfo.avatar
              })
            }
          }
          return members
        }
        let teamMembers = this.$store.state.teamMembers
        let teamId = this.sessionId.replace('team-', '')
        let members = teamMembers && teamMembers[teamId]
        let needSearchAccounts = []
        if (members) {
          members = members.map(item => {
            var member = Object.assign({}, item) // 重新创建一个对象，用于存储展示数据，避免对vuex数据源的修改
            member.valid = true // 被管理员移除后，标记为false
            if (member.account === this.$store.state.userUID) {
              member.alias = '我'
              member.avatar = this.$store.state.myInfo.avatar
            } else if (this.userInfos[member.account] === undefined) {
              needSearchAccounts.push(member.account)
              member.avatar = member.avatar || this.avatar
              member.alias = member.nickInTeam || member.account
            } else {
              member.avatar = this.userInfos[member.account].avatar
              member.alias = this.userInfos[member.account].alias || member.nickInTeam || this.userInfos[member.account].nick
            }
            return member
          })
          if (needSearchAccounts.length > 0) {
            while (needSearchAccounts.length > 0) {
              this.searchUsers(needSearchAccounts.splice(0, 150))
            }
          }
          return members
        }
      },
      allMsgList () {
        let allList = []
        let msgRecordAllList = this.msgRecordAllList
        if (this.date) {
          msgRecordAllList = this.$store.state.currSessionHistoryMsgs
        }
        msgRecordAllList && msgRecordAllList.length > 0 && msgRecordAllList.map((item, index) => {
          item = this.manageItem(item)
          if (item.type !== 'timeTag' && item.type !== 'tip' && item.type !== 'notification') {
            allList.push(item)
          }
        })
        return allList
      },
      imageMsgList () {
        let imageAllList = []
        this.msgRecordImageList && this.msgRecordImageList.length > 0 && this.msgRecordImageList.map((item, index) => {
          item = this.manageItem(item)
          if (item.type === 'image') {
            imageAllList.push(item)
          }
        })
        return imageAllList
      },
      fileMsgList () {
        let fileList = []
        this.msgRecordFileList && this.msgRecordFileList.length > 0 && this.msgRecordFileList.map((item, index) => {
          item = this.manageItem(item)
          if (item.type === 'file') {
            fileList.push(item)
          }
        })
        return fileList
      },
      checkedMsgList () {
        // 多选时选中的消息
        if (this.$store.state.checkedMsgs && this.$store.state.checkedMsgs.length > 0) {
          return this.$store.state.checkedMsgs
        } else {
          return []
        }
      }
    },
    updated () {
      drag.dragPosition('historyMsgDrag', 1)
    },
    methods: {
      toggleShortMsgStatus () {
        this.shortMsgCheck = !this.shortMsgCheck
      },
      scrollToBottom (domId) {
        this.msgRecordInterval = setInterval(() => {
          let dom = document.getElementById(domId)
          if (dom) {
            dom.scrollTop = dom.scrollHeight
            clearInterval(this.msgRecordInterval)
          }
        }, 100)
      },
      className (value) {
        let className = 'tab-title-item'
        if (value === this.checkFunc) {
          if (this.checkedMsgList && this.checkedMsgList.length > 0) {
            className = 'tab-title-item active'
          }
        }
        if (this.checkedMsgList.length <= 0 && value !== 'cancel') {
          className = 'tab-title-item disable'
          this.checkFunc = ''
        }
        return className
      },
      checkMoreFn () {
        this.isCheckMore = true
      },
      searchCheckMoreFn () {
        this.isSearchCheckMore = true
      },
      // 初始化短信消息---短信
      async initShortMsgList () {
        let beforeMsgList = null
        try {
          beforeMsgList = await this.getBeforeMsgList(this.time + 1000, 'all', true) // 需要过滤函数,过滤出短信消息,查询所有消息类型的短信消息
        } catch (err) {}
        this.$store.commit('updateMsgRecordAllList', beforeMsgList)
      },
      // 初始化历史消息---全部
      async InitLocalAllMsg () {
        let beforeMsgList = null
        try {
          beforeMsgList = await this.getBeforeMsgList()
        } catch (err) {}
        this.$store.commit('updateMsgRecordAllList', beforeMsgList)
      },
      // 初始化历史消息---图片
      async InitLocalImageMsg () {
        let beforeMsgList = null
        try {
          beforeMsgList = await this.getBeforeMsgList(this.time + 1000, 'image', false)
        } catch (err) {}
        this.$store.commit('updateMsgRecordImageList', beforeMsgList)
      },
      // 初始化历史消息---文件
      async InitLocalFileMsg () {
        let beforeMsgList = null
        try {
          beforeMsgList = await this.getBeforeMsgList(this.time + 1000, 'file', false)
        } catch (err) {}
        this.$store.commit('updateMsgRecordFileList', beforeMsgList)
      },
      // 获取当前消息之前的消息
      async getBeforeMsgList (time, msgType, needFilterFunc) {
        let beforeMsgList = null
        try {
          beforeMsgList = await SearchData.getRecordsDetailData({start: 0, end: time || (this.time + 1000)}, null, this.sessionId, true, msgType, needFilterFunc)
        } catch (err) {}
        if (beforeMsgList && beforeMsgList.length > 0) {
          return beforeMsgList.reverse() // 反转
        }
      },
      // 日期筛选，获取远程消息
      InitHistoryMsg (callBack) {
        let currSessionHistoryMsgs = this.$store.state.currSessionHistoryMsgs
        let lastMsg = null
        if (currSessionHistoryMsgs && currSessionHistoryMsgs.length > 1) {
          lastMsg = currSessionHistoryMsgs[1]
        }
        let date = this.date.join('-')
        let beginTime = new Date(date + ' 00:00:00').getTime()
        let endTime = new Date(date + ' 24:00:00').getTime()
        let params = {
          scene: this.scene,
          to: this.to,
          beginTime,
          endTime,
          callBack
        }
        if (lastMsg) {
          params.lastMsgId = lastMsg.idServer
          params.endTime = lastMsg.time
        }
        if (!lastMsg || (lastMsg && lastMsg.idServer !== this.lastMsgIdServer)) {
          if (lastMsg) {
            this.lastMsgIdServer = lastMsg.idServer // 缓存当前最后一条消息id与下一条对比
          }
          this.$store.dispatch('getHistoryMsgs', params)
        }
      },
      manageItem (item) {
        if (item.flow === 'in') {
          if (item.type === 'robot' && item.content && item.content.msgOut) {
            // 机器人下行消息
            let robotAccid = item.content.robotAccid
            item.avatar = this.robotInfos[robotAccid].avatar
            item.isRobot = true
            item.link = `#/mainpage/contacts/card?accid=${robotAccid}`
          } else if (item.from !== this.$store.state.userUID) {
            item.avatar = (this.userInfos[item.from] && this.userInfos[item.from].avatar) || config.defaultUserIcon
            item.link = `#/mainpage/contacts/card?accid=${item.from}`
            //  todo如果是未加好友的人发了消息，是否能看到名片
          } else {
            item.avatar = this.myInfo.avatar
            // item.avatar = `${config.myPhoneIcon}`
          }
        } else if (item.flow === 'out') {
          item.avatar = this.myInfo.avatar
        }
        if (item.type === 'text') {
          item.showText = item.text
          // 标签解析
          item.showText = util.escape(item.showText)
          // 文本消息
          let variable = 0
          let replaceArr = []
          // 处理url
          let httpUrls = MsgRecordFn.httpSpring(item.text)
          if (httpUrls.length > 0) {
            httpUrls.map(url => {
              item.showText = item.showText.replace(url, (m) => {
                variable++
                replaceArr.push(`<a style="text-decoration: underline;display: inline-block;max-width: 100%;" data-url="[${url}]">${url}</a>`)
                return `{---===${variable}}`
              })
            })
          }
          if (item.apns && item.flow === 'in') {
            if (!item.apns.accounts) {
              item.showText = item.showText.replace('@所有人', '<span style="color: #4F8DFF;">@所有人 </span>')
            } else if (item.apns.accounts.includes(this.myInfo.account)) {
              let name = util.escape(this.nickInTeam) || util.escape(this.myInfo.nick)
              item.showText = item.showText.replace('@' + name, `<span style="color: #4F8DFF;">@${name} </span>`)
            }
          }
          if (/\[[\u4e00-\u9fa5]+\]/.test(item.showText)) {
            let emojiItems = item.showText.match(/\[[\u4e00-\u9fa5]+\]/g)
            emojiItems.forEach(text => {
              let emojiCnt = emojiObj.emojiList.emoji
              if (emojiCnt[text]) {
                let dataKey = text.slice(1, -1)
                item.showText = item.showText.replace(text, `<img data-key='${dataKey}' style="width: 23px;height: 23px;vertical-align: middle;" class='emoji-small' src='${emojiCnt[text].img}'>`)
              }
            })
          }
          // 变量替换
          if (replaceArr.length > 0) {
            for (let i = 0; i < replaceArr.length; i++) {
              item.showText = item.showText.replace(`{---===${i + 1}}`, replaceArr[i])
            }
          }
        } else if (item.type === 'custom') {
          let content = JSON.parse(item.content)
          // type 1 为猜拳消息
          if (content.type === 1) {
            let data = content.data
            let resourceUrl = config.resourceUrl
            item.type = 'custom-type1'
            item.imgUrl = `${resourceUrl}/im/play-${data.value}.png`
            // type 3 为贴图表情
          } else if (content.type === 3) {
            let data = content.data
            let emojiCnt = ''
            if (emojiObj.pinupList[data.catalog]) {
              emojiCnt = emojiObj.pinupList[data.catalog][data.chartlet]
              item.type = 'custom-type3'
              item.imgUrl = `${emojiCnt.img}`
            }
          } else if (content.type === 7) {
            // 自定义富文本消息
            item.type = 'custom-type7'
            item.showText = content.data.value
          } else if (content.type === 8) {
            // 自定义邀请入群消息
            item.type = 'custom-type8'
            if (!content.data.value.teamAvatarUrl) {
              content.data.value.teamAvatarUrl = config.defaultGroupIcon
            }
            item.showText = content.data.value
          } else {
            item.showText = util.parseCustomMsg(item)
            if (item.showText !== '[自定义消息]') {
              item.showText += ',请到手机或电脑客户端查看'
            }
          }
        } else if (item.type === 'custom-type7') {
          // 自定义富文本消息
          let content = JSON.parse(item.content)
          item.showText = content.data.value
        } else if (item.type === 'custom-type8') {
          // 自定义邀请入群消息
          let content = JSON.parse(item.content)
          if (!content.data.value.teamAvatarUrl) {
            content.data.value.teamAvatarUrl = config.defaultGroupIcon
          }
          item.showText = content.data.value
        } else if (item.type === 'image') {
          // 原始图片全屏显示
          item.originLink = item.file.url
          if (item.file.w < 180) {
            item.w = item.file.w
            item.h = item.file.h
          } else {
            item.w = 180
            item.h = 180 / (item.file.w / item.file.h)
          }
        } else if (item.type === 'video') {
          if (/(mov|mp4|ogg|webm)/i.test(item.file.ext)) {
            item.src = item.file.url
          } else {
            item.src = ''
            item.href = item.file.url
          }
        } else if (item.type === 'audio') {
          item.audioSrc = item.file.mp3Url
          item.showText = Math.round(item.file.dur / 1000) + '" 点击播放'
        } else if (item.type === 'file') {
          item.fileLink = item.file.url
          item.showText = item.file.name
        } else {
          item.showText = `[${util.mapMsgType(item)}],请到手机或电脑客户端查看`
        }
        return item
      },
      closeCover () {
        this.showHistoryMsg = false
        this.reset()
      },
      closeModal () {
        this.showHistoryMsg = false
        this.reset()
      },
      clearStatus (el, e) {
        if (e) {
          let className = e.target.className
          if (className.indexOf('searchevent') > -1) return
        }
        this.reset()
        // 初始化当前聊天记录---全部
        this.isInitLoadAll = true
        this.isInitLoadImage = true
        this.isInitLoadFile = true
        this.InitLocalAllMsg()
        setTimeout(() => {
          this.$nextTick(() => {
            this.scrollToBottom('msg-record-box-all')
            this.isInitLoadAll = false
          })
        }, 100)
      },
      toggleList (value) {
        if (this.checkType === value) return
        this.checkType = value
      },
      toggleFunc (value) {
        if (this.checkFunc === value) return
        this.checkFunc = value
        switch (value) {
          case 'forword':
            let sidelist = MsgRecordFn.forwordMsg(this.to, this.myPhoneId, this.userInfos, this.myInfo, this.myGroupIcon) // type:8---多条转发， type:7---单条转发
            this.eventBus.$emit('selectContact', {type: 8, sidelist, msg: this.checkedMsgList})
            // 状态重置
            this.reset()
            break
          case 'delete':
            this.deleteMsgs()
            break
          case 'cancel':
            this.reset()
            break
        }
      },
      deleteMsgs () {
        for (let i = 0; i < this.checkedMsgList.length; i++) {
          this.$store.dispatch('deleteMsg', this.checkedMsgList[i])
        }
        this.reset()
      },
      reset () {
        this.loading = false
        this.showSearch = false
        this.searchValue = ''
        this.checkType = 'all'
        this.isCheckMore = false
        this.checkFunc = ''
        this.isSearchCheckMore = false
        this.$store.commit('updateCheckedMsgs', [])
        this.$store.commit('updateMsgRecordAllList', [])
        this.$store.commit('updateMsgRecordImageList', [])
        this.$store.commit('updateMsgRecordFileList', [])
        this.date = ''
      },
      // 向上滚动到顶部加载更多
      async scrollTopLoad (e, domId) {
        let { scrollTop } = e.target
        if (scrollTop <= 1) {
          if (this.date) {
            let preFirstDom = document.getElementById(domId).childNodes[0]
            let preFirstId = preFirstDom && preFirstDom.getAttribute('id')
            if (this.$store.state.currSessionHistoryMsgs && this.$store.state.currSessionHistoryMsgs.length > 0) {
              this.InitHistoryMsg(() => {
                setTimeout(() => {
                  let currSessionHistoryMsgs = this.$store.state.currSessionHistoryMsgs
                  if (currSessionHistoryMsgs.length > 2 && preFirstDom) {
                    let offsetTop = document.getElementById(`${preFirstId}`).offsetTop
                    this.$nextTick(() => {
                      document.getElementById(domId).scrollTop = offsetTop - 50
                    })
                  }
                }, 0)
              })
            }
          } else {
            // 滚动到顶部，继续加载第一条前面的消息
            let newMsgList = null
            if (this.checkType === 'all') {
              newMsgList = this.allMsgList
            } else if (this.checkType === 'image') {
              newMsgList = this.imageMsgList
            } else if (this.checkType === 'file') {
              newMsgList = this.fileMsgList
            }
            if (newMsgList && newMsgList.length > 0) {
              let firstMsgTime = newMsgList[0].time
              let firstMsgId = document.getElementById(domId).childNodes[0].getAttribute('id')
              let beforeMsgList = null
              try {
                if (this.shortMsgCheck) {
                  let needFilterFunc = true
                  beforeMsgList = await this.getBeforeMsgList(firstMsgTime, 'all', needFilterFunc) // 短信消息查询时传入过滤函数,短信消息查询所有类型
                } else {
                  beforeMsgList = await this.getBeforeMsgList(firstMsgTime, this.checkType)
                }
              } catch (err) {}
              if (beforeMsgList && beforeMsgList.length > 0) {
                newMsgList.unshift(...beforeMsgList)
                this.$store.commit('updateMsgRecordAllList', newMsgList)
                setTimeout(() => {
                  let prevFirstObj = document.getElementById(`${firstMsgId}`)
                  if (beforeMsgList.length > 2) {
                    document.getElementById(domId).scrollTop = prevFirstObj.offsetTop - 50
                  }
                }, 0)
              }
            }
          }
        }
      },
      showPicker (evt) {
        this.showSearch = false
        this.searchValue = ''
        this.$refs.datePicker.initStatus()
      },
      dateFilter (params) {
        // 日期筛选
        this.date = params
        this.checkType = 'all'
        this.shortMsgCheck = false
        this.$store.commit('updateCurrSessionHistoryMsgs', { type: 'destroy' })
      },
      clearDate () {
        this.date = ''
      }
    }
  }
</script>

<style scoped>
  .m-historymsg-contain {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1001;
  }
  .contain-top {
    top: 30px;
  }
  .m-historymsg-contain .m-historymsg-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }
  .m-historymsg-contain .m-info-box {
    box-sizing: border-box;
    position: absolute;
    top: 1px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 502px;
    background: #fff;
    border: 0.5px solid #ccc;
    box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
    z-index: 100;
    padding: 0 0 0 40px;
  }
  .m-historymsg-contain .m-info-box .drag {
    -webkit-app-region: no-drag;
    box-sizing: border-box;
    position: relative;
    width: 100%;
    padding: 15px 0 8px 0;
    font-size: 14px;
    color: #999;
  }

  .m-info-box .close {
    position: absolute;
    right: 0;
    top: 0;
  }
  .m-historymsg-content {
    position: relative;
    /* padding: 0 40px 0 0; */
    padding: 0;
    height: 420px;
    overflow: hidden;
    box-sizing: border-box;
  }
  /* 聊天对象头像 && 昵称 */
  .m-info-box .session-box {
    display: flex;
    flex-direction: row;
    align-items: center
  }
  .m-info-box .session-avatar {
    width: 32px;
    height: 32px;
    border-radius: 16px
  }
  .m-info-box .session-name {
    font-size:14px;
    color:#333 ;
    padding-left: 10px;
    width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 搜索框 */
  .m-info-box .search-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 520px;
    height:28px;
    box-sizing: border-box;
    padding: 0;
  }
  .m-info-box .search-bar input {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background: #F0F0F0 url('../../../../static/img/nav/main-tab-search.png') 8px center no-repeat;
    background-size: 12px 12px;
    border-radius: 2px;
    border: 1px solid rgb(220, 222, 224);
    font-size: 12px;
    color: #333;
    padding: 0 26px;
    border: 1px solid transparent;
    transition: border .1s linear;
  }
  .m-info-box .search-bar input.active{
    border: 1px solid rgba(4,154,255,1);
  }
  .m-info-box .search-bar .clear {
    position: absolute;
    right: 10px;
    top: 8px;
    display: block;
    width: 13px;
    height: 13px;
    background-image: url('../../../../static/img/setting/delete.png');
    background-size: 100% 100%;
    cursor: pointer;
  }
  /* tab头 */
  /* 左 */
  .m-info-box .tab-left-title {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    /* width: 100%; */
    width: 520px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(0,0,0,0.15)
  }
  .m-info-box .tab-left-title .tab-title-item {
    width: 15%;
    height: 100%;
    line-height: 27px;
    text-align: left;
    color: #333;
    font-size: 12px;
    transition: opacity .3s linear;
  }
  .m-info-box .tab-left-title .tab-title-item:hover {
    opacity: 0.7;
  }

  .m-info-box .tab-left-title .tab-title-item.active {
    color: #049AFF;
  }

  /* 日历相关样式 */
  .m-info-box .tab-left-title .tab-data-side {
    position: absolute;
    right: 0;
    width: 200px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .m-info-box .tab-left-title .tab-data-side .icon {
    width: 16px;
    height: 17px;
    background: url('../../../../static/img/msgRecord/rili.png') no-repeat center center;
    background-size: 16px 17px;
    transition: all .24s linear;
  }
  .m-info-box .tab-left-title .tab-data-side .icon:hover {
    background: url('../../../../static/img/msgRecord/rili-c.png') no-repeat center center;
    background-size: 16px 17px;
  }

  .m-info-box .tab-left-title .tab-data-side .date {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 6px;
    color: #999;
    background-color: #F0F0F0;
    font-size: 12px;
    border-radius: 3px;
    cursor: default;
    margin-right: 8px;
  }

  .m-info-box .tab-left-title .tab-data-side .clear {
    display: block;
    width: 13px;
    height: 13px;
    background-image: url('../../../../static/img/setting/delete.png');
    background-size: 100% 100%;
    cursor: pointer;
    margin-left: 8px;
  }

  /* 右 */
  .m-info-box .tab-right-title {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    width:520px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(0,0,0,0.15)
  }
  .m-info-box .tab-right-title .tab-title-item {
    width: 11%;
    height: 100%;
    line-height: 27px;
    text-align: left;
    color: #333;
    font-size: 12px;
    transition: opacity .3s linear;
    background-color: #F2F2F2;
    border-radius: 4px;
    margin-left: 10px;
    text-align: center;
  }
  .m-info-box .tab-right-title .tab-title-item:hover {
    opacity: 0.7;
  }

  .m-info-box .tab-right-title .tab-title-item.active {
    color: #F43530;
  }
  .m-info-box .tab-right-title .tab-title-item.disable {
    opacity: .5;
  }
  /* 短信选择 */
  .m-info-box .message-box{
    width: 520px;
    /* width: 100%; */
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding:5px 0;
    position: relative;
  }
  .m-info-box .message-box > div:first-child {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .m-info-box .common {
    display: inline-block;
    width: 15px;
    height: 15px;
    margin-right: 6px;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .2s linear;
  }
  .m-info-box  .check {
    background-image: url('../../../../static/img/setting/checkboxborder.png');
    background-size: 14px 14px;
  }
  .m-info-box  .check:hover, .check:focus {
    background-image: url('../../../../static/img/setting/checkboxborder-p.png');
  }

  .m-info-box  .checked {
    background-image: url('../../../../static/img/setting/checkbox-c.png');
    background-size: 100% 100%;
  }

</style>

