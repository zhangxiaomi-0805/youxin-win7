<template>
<div style="height:100%;">
  <contacts-list :callBack="checkCard"/>
  <div class="m-main-content" id="resize-side-rt" style="margin-left:271px;">
    <system-caption/>
    <div class="c-default">
      <div class="title" style="borderBottomWidth: 0"></div>
      <div v-if="!showCard" class="body" style="backgroundColor: #fff">
        <div style="paddingTop: 7%;"><span class="nice"/><div class="no-msg" style="color: #999;fontSize: 14px;">优信</div></div>
      </div>
      <name-card v-else pageType="p2p" :contactId="contactId"/>
    </div>
  </div>
</div>
</template>

<script>
import ContactsList from '../module/ContactsList.vue'
import SystemCaption from '../controls/SystemCaption.vue'
import Resize from '../../utils/resize.js'
import NameCard from '../module/NameCard.vue'
export default {
  name: 'contacts',
  components: {ContactsList, SystemCaption, NameCard},
  data () {
    return {
      contactId: '',
      showCard: false
    }
  },
  mounted () {
    // 初始化窗口拖拽函数
    Resize.changeSideRange({max: 300, min: 250})
  },
  methods: {
    checkCard (params) {
      console.log(params)
      this.showCard = true
      this.contactId = params.contactId
    }
  }
}
</script>
