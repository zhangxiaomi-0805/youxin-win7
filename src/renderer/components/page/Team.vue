<template>
<div style="height:100%;">
  <team-list :callBack="checkCard"/>
  <div class="m-main-content" id="resize-side-rt" style="margin-left:271px;">
    <system-caption/>
    <div class="c-default">
      <div class="title" style="borderBottomWidth: 0"></div>
      <div v-if="!showCard" class="body" style="backgroundColor: #fff">
        <div style="paddingTop: 7%;"><span class="nice"/><div class="no-msg" style="color: #999;fontSize: 14px;">优信</div></div>
      </div>
      <name-card v-else pageType="team" :teamId="teamId"/>
    </div>
  </div>
</div>
</template>

<script>
import SystemCaption from '../controls/SystemCaption.vue'
import TeamList from '../module/TeamList.vue'
import Resize from '../../utils/resize.js'
import NameCard from '../module/NameCard.vue'
export default {
  name: 'team',
  components: {TeamList, SystemCaption, NameCard},
  data () {
    return {
      teamId: '',
      showCard: false
    }
  },
  mounted () {
    // 初始化窗口拖拽函数
    Resize.changeSideRange({max: 300, min: 250})
  },
  methods: {
    checkCard (params) {
      this.showCard = true
      this.teamId = params.teamId
    }
  }
}
</script>
