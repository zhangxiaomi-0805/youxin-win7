<template>
  <ul id="chat-list" class="p-chat-list" @scroll="scroll">
    <li class="msg-attri-tip" v-if="canLoadMore" @click="loadMore">
      点击加载更多
    </li>
    <li class="msg-attri-tip" v-else>
      已无更多记录
    </li>
    <chat-item
      v-for="msg in msglist"
      :type="type"
      :scene="scene"
      :to="to"
      :rawMsg="msg"
      :isRobot="isRobot"
      :userInfos="userInfos"
      :myInfo="myInfo"
      :teamId="teamId"
      :key="msg.idClient"
      :idClient="msg.idClient"
      :isHistory='isHistory'
      :msglist='msglist'
      @msg-loaded="msgLoaded"
      :isCheckMore="isChatCheckMore"
    ></chat-item>
  </ul>
</template>
<script>
  import ChatItem from './ChatItem'
  import pageUtil from '../../utils/page'

  export default {
    components: {
      ChatItem
    },
    props: {
      type: String, // 类型，chatroom, session
      scene: String,
      to: String,
      canLoadMore: [String, Boolean],
      teamId: String,
      isRobot: {
        type: Boolean,
        default () {
          return false
        }
      },
      msglist: {
        type: Array,
        default () {
          return []
        }
      },
      userInfos: {
        type: Object,
        default () {
          return {}
        }
      },
      myInfo: {
        type: Object,
        default () {
          return {}
        }
      },
      isHistory: {
        type: Boolean,
        default () {
          return false
        }
      }
    },
    data () {
      return {
        isFullImgShow: false,
        msgLoadedTimer: null,
        isChatCheckMore: false
      }
    },
    mounted () {
      // 消息列表是否多选
      this.eventBus.$on('updateIsCheckMoreChat', (data) => {
        this.isChatCheckMore = data.isMore
      })
    },
    beforeDestroy () {
      this.eventBus.$off('updateIsCheckMoreChat')
    },
    methods: {
      scrollToBottom () {
        pageUtil.scrollChatListDown()
        this.showNewMsgTip = false
      },
      showFullImg (src) {
        this.$store.dispatch('showFullscreenImg', {
          src
        })
      },
      msgLoaded () {
        clearTimeout(this.msgLoadedTimer)
        this.msgLoadedTimer = setTimeout(() => {
          this.$emit('msgs-loaded')
        }, 20)
      },
      loadMore () {
        this.$emit('load-more')
      },
      scroll () {
        let chatUl = document.getElementById('chat-list')
        if (chatUl.scrollTop === 0 && chatUl.childNodes.length > 10 && this.canLoadMore) {
          // 滚动到顶部，且非首次加载
          this.loadMore()
        }
      }
    }
  }
</script>

<style type="text/css">
  .p-chat-list{
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    padding-top: 11px;
    transition: all .3s;
    transform: translate3d(0, 0, 0)
  }

  .p-chat-list .u-icon {
    width: 1.4rem;
    height: 1.6rem;
    margin-right: 0.2rem;
    vertical-align: bottom;
  }

  .p-chat-list .msg-attri-tip{
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: white;
    background-color:#ccc;
    margin: auto;
    width: 10rem;
    border-radius: 0.4rem;
    cursor: pointer;
  }
</style>
