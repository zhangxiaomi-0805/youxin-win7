<template>
<div class="m-main-list" id="resize-side-lf" style="width:270px;">
  <div class="u-search"><h3>通讯录</h3></div>
  <div class="contact-con" ref="contactCon" @scroll="scrollTop = $event.target.scrollTop"><tree showTeam/></div>
  <div class="border" id="resize-we"></div>
</div>
</template>

<script>
import Tree from '../tree/Tree.vue'
export default {
  name: 'contacts-list',
  components: {Tree},
  data () {
    return {
      scrollTop: 0
    }
  },
  activated () {
    // 重置滚动条位置、重置路由
    this.$refs.contactCon.scrollTop = this.scrollTop
    let contactSelectObj = this.$store.state.contactSelectObj
    if (contactSelectObj.type === 'team') {
      let cardInfo = this.$store.state.teamlist.find(item => {
        return item.teamId === contactSelectObj.id
      })
      if (!cardInfo) {
        // 不存在该群
        this.$router.push({name: 'contacts-default', query: {pageType: 1}})
        return
      }
      this.$router.push({name: 'namecard', query: {id: contactSelectObj.id, pageType: 'team'}})
    } else if (contactSelectObj.type === 'p2p') {
      this.$router.push({name: 'namecard', query: {accid: contactSelectObj.accid, id: contactSelectObj.id, pageType: 'p2p'}})
    } else {
      this.$router.push({name: 'contacts-default', query: {pageType: 1}})
    }
  }
}
</script>

<style scoped>
  .contact-con {
    position: absolute;
    top: 60px;
    bottom: 0;
    width: 100%;
    overflow-y: auto;
  }
</style>
