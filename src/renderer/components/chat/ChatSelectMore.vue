<template>
  <div class="m-chat-select-more">
    <textarea style="width: 1px;height: 1px;position: absolute;left: -1px;display:none" id="clipboard_checkMore"></textarea>

    <!-- 关闭按钮 -->
    <div style='width:100%;height:30px;position:relative'>
      <a class="close-btn" @click="reset"/>
    </div>

    <div class="m-chat-select-more-main">
      <div>
        <div class="btn-box"  @click.stop="checkedMsgList && checkedMsgList.length > 0 ? toggleFunc('forword') : null">
          <span class="btn-forward"/>
          <!-- 遮罩 -->
          <div v-if="!(checkedMsgList && checkedMsgList.length > 0)" class="btn-box-mask"/>
        </div>
        <p>转发</p>
      </div>

      <div>
        <div class="btn-box"  @click.stop="checkedMsgList && checkedMsgList.length > 0 ? toggleFunc('copy', 'clipboard_checkMore') : null">
          <span class="btn-copy"/>
          <div v-if="!(checkedMsgList && checkedMsgList.length > 0)" class="btn-box-mask"/>
        </div>
        <p>复制</p>
      </div>
    </div>
  </div>
</template>

<script>
  import MsgRecordFn from '../msgRecord/msgRecord.js'
  import config from '../../configs'
  // import util from '../../utils'
  export default {
    mounted () {
      this.eventBus.$on('resetCheckMoreStatus', () => { // 转发 || 复制完成后重置多选状态
        this.reset()
      })
    },
    beforeDestroy () {
      this.eventBus.$off('resetCheckMoreStatus')
    },
    watch: {
    },
    data () {
      return {
        myGroupIcon: config.defaultGroupIcon
      }
    },
    computed: {
      myPhoneId () {
        return `${this.$store.state.userUID}`
      },
      userInfos () {
        return this.$store.state.userInfos
      },
      myInfo () {
        return this.$store.state.myInfo
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
    methods: {
      toggleFunc (value, textAreaId) {
        switch (value) {
          case 'forword':
            let sidelist = MsgRecordFn.forwordMsg(this.to, this.myPhoneId, this.userInfos, this.myInfo, this.myGroupIcon) // type:8---多条转发， type:7---单条转发
            // 自定义邀请入群消息不允许转发
            for (let i = 0; i < this.checkedMsgList.length; i++) {
              if (this.checkedMsgList[i].type === 'custom-type8') {
                this.checkedMsgList.splice(i, 1)
              }
            }
            this.checkedMsgList.sort(function (obj1, obj2) {
              return obj1.time - obj2.time
            })
            this.eventBus.$emit('selectContact', {type: 8, sidelist, msg: this.checkedMsgList})
            break
          case 'copy':
            // 复制
            MsgRecordFn.copyMoreText(textAreaId, this.checkedMsgList, () => { this.reset() })
            break
        }
      },
      reset () {
        this.$store.commit('updateCheckedMsgs', [])
        this.eventBus.$emit('updateIsCheckMoreChat', {isMore: false}) // 关闭底部多选操作按钮，显示为输入框
      }
    }
  }
</script>

<style scoped>
  .g-window .m-chat-select-more {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #F5F5F5;
    z-index: 1000
  }
  /* 删除按钮 */
  .g-window .m-chat-select-more .close-btn {
    position: absolute;
    right: 25px;
    top: 15px;
    display: block;
    width: 12px;
    height: 12px;
    background-image: url('../../../../static/img/wnd/btn_wnd_gray_close.png');
    background-size: 100% 100%;
    cursor: pointer;
    background-repeat: no-repeat;
    background-position: center center;
    transition: all .3s linear;
  }
  .g-window .m-chat-select-more .close-btn:hover {
    background-image: url('../../../../static/img/wnd/btn_wnd_gray_close_hovered.png');
  }
  .m-chat-select-more-main {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    padding: 0;
    width: 100%;
    height: 120px;
    padding: 0 50px
  }
  .m-chat-select-more-main .btn-box {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #ffffff;
    cursor: pointer;
  }
  .m-chat-select-more-main .btn-box .btn-box-mask {
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: rgba(255,255,255,0.6);
  }
  .m-chat-select-more-main .btn-box:hover {
    background-color: #F9F9F9
  }
  .m-chat-select-more-main .btn-box .btn-forward:hover {
    background: url('../../../../static/img/setting/forward-icon-gray.png') no-repeat center center;
    background-size: 26px 21px;
  }
  .m-chat-select-more-main .btn-box .btn-copy:hover {
    background: url('../../../../static/img/setting/copy-icon-gray.png') no-repeat center center;
    background-size: 22px 22px;
  }
  .m-chat-select-more-main .btn-box .btn-forward {
    display: block;
    width: 100%;
    height: 100%;
    background: url('../../../../static/img/setting/forward-icon.png') no-repeat center center;
    background-size: 26px 21px;
  }
  .m-chat-select-more-main .btn-box .btn-copy{
    display: block;
    width: 100%;
    height: 100%;
    background: url('../../../../static/img/setting/copy-icon.png') no-repeat center center;
    background-size: 22px 22px;
  }
  .m-chat-select-more-main p {
    text-align: center;
    margin: 10px 0 0 0;
    color: #4B4B4B;
    font-size: 14px
  }
</style>
