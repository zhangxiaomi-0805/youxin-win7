<template>
  <div class="m-chat-select-more">
    <!-- 关闭按钮 -->
    <div style='width:100%;height:30px;position:relative'>
      <a class="close-btn" @click="reset"/>
    </div>

    <div class="m-chat-select-more-main">
      <div>
        <div class="btn-box"  @click.stop="checkedMsgList && checkedMsgList.length > 0 ? toggleFunc('forword') : null">
          <span class="btn-forward"/>
        </div>
        <p>转发</p>
      </div>

      <div>
        <div class="btn-box"  @click.stop="checkedMsgList && checkedMsgList.length > 0 ? toggleFunc('copy') : null">
          <span class="btn-copy"/>
        </div>
        <p>复制</p>
      </div>
    </div>
  </div>
</template>

<script>
  import MsgRecordFn from '../msgRecord/msgRecord.js'
  import config from '../../configs'
  export default {
    mounted () {
      this.eventBus.$on('resetCheckMoreStatus', () => { // 转发 || 复制完成后重置多选状态
        this.reset()
      })
    },
    watch: {
    },
    data () {
      return {
        myGroupIcon: config.defaultGroupIcon,
        checkFunc: '' // forword---转发; copy---复制
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
      toggleFunc (value) {
        if (this.checkFunc === value) return
        this.checkFunc = value
        switch (value) {
          case 'forword':
            let sidelist = MsgRecordFn.forwordMsg(this.to, this.myPhoneId, this.userInfos, this.myInfo, this.myGroupIcon) // type:8---多条转发， type:7---单条转发
            this.eventBus.$emit('selectContact', {type: 8, sidelist, msg: this.checkedMsgList})
            // 状态重置
            // this.reset()
            break
          case 'copy':
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
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #ffffff;
    cursor: pointer;
  }
  .m-chat-select-more-main .btn-box:hover {
    background-color: #F9F9F9
  }
  .m-chat-select-more-main .btn-box .btn-forward{
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
