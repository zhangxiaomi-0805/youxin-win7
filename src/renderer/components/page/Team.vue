<template>
  <div style="height:100%;">
    <team-list :callBack="checkCard" :isApplyTeam="isApplyTeam"/>
    <div class="m-main-content" id="resize-side-rt" style="margin-left:271px;">
      <system-caption/>
      <div class="c-default">
        <div :class="type === 'sysmsgs' ? 'title active' : 'title'"><span v-if="type === 'sysmsgs'">群聊验证消息</span></div>
        <div v-if="type === 'default'" class="body" style="backgroundColor: #fff">
          <div style="paddingTop: 7%;"><span class="nice"/><div class="no-msg" style="color: #999;fontSize: 14px;">优信</div></div>
        </div>
        <name-card v-else-if="type === 'team'" pageType="team" :teamId="teamId"/>
        <sys-msgs v-else-if="type === 'sysmsgs'"/>
      </div>
    </div>
  </div>
</template>

<script>
  import SystemCaption from '../controls/SystemCaption.vue'
  import TeamList from '../module/TeamList.vue'
  import Resize from '../../utils/resize.js'
  import NameCard from '../module/NameCard.vue'
  import SysMsgs from '../module/SysMsgs.vue'
  export default {
    name: 'team',
    components: {TeamList, SystemCaption, NameCard, SysMsgs},
    data () {
      return {
        teamId: '',
        type: 'default'
      }
    },
    mounted () {
      // 初始化窗口拖拽函数
      Resize.changeSideRange({max: 300, min: 250})
    },
    computed: {
      isApplyTeam () {
        return this.$route.query.isApplyTeam
      }
    },
    methods: {
      checkCard (params) {
        this.type = params.type
        if (params.teamId) this.teamId = params.teamId
      }
    }
  }
</script>

<style scoped>
  .c-default .title {
    padding-left: 20px;
    padding-right: 10px;
    border-bottom: 1px solid #fff;
    font-size: 14px;
    color: rgba(11,13,12,1);
  }
  .c-default .title.active {
    border-bottom: 1px solid rgba(214,214,214,1);
  }
</style>

