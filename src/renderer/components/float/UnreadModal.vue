<template>
  <div v-if="showUnreadModal" class="m-unread" :style="{left: left + 'px', top: top + 'px'}" v-clickoutside="closeModal">
    <div class="unreadList" style="box-sizing: border-box;padding-left: 20px;">
      <div style="width: 100%;height: 46px;font-size: 14px;color: #333;line-height: 46px;">
        未读({{unreadList.length}}人)
      </div>
      <ul style="width: 100%;height: 174px;overflow-y: auto;overflow-x: hidden;">
        <li v-for="(item, index) in unreadList" :key="index" style="margin-bottom: 10px;width: 100%;height: 24px;">
          <img :src="item.avatar" alt="" style="display: block;float: left;width: 24px;height: 24px;border-radius: 50%;"/>
          <span style="display: block;float: left;margin-left: 10px;overflow: hidden;width: 100px;line-height: 24px;color: #666;font-size: 12px;text-overflow: ellipsis;white-space: nowrap;">
            {{item.alias}}
          </span>
        </li>
      </ul>
    </div>
    <div class="readList" style="box-sizing: border-box;padding-left: 20px;">
      <div style="width: 100%;height: 46px;font-size: 14px;color: #333;line-height: 46px;">
        已读({{readList.length}}人)
      </div>
      <ul style="width: 100%;height: 174px;overflow-y: auto;overflow-x: hidden;">
        <li v-for="(item, index) in readList" :key="index" style="margin-bottom: 10px;width: 100%;height: 24px;">
          <img :src="item.avatar" alt="" style="display: block;float: left;width: 24px;height: 24px;border-radius: 50%;"/>
          <span style="display: block;float: left;margin-left: 10px;overflow: hidden;width: 100px;line-height: 24px;color: #666;font-size: 12px;text-overflow: ellipsis;white-space: nowrap;">
            {{item.alias}}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import clickoutside from '../../utils/clickoutside.js'
export default {
  name: 'unread-modal',
  directives: {clickoutside},
  data () {
    return {
      showUnreadModal: false,
      left: -1,
      top: -1
    }
  },
  mounted () {
    this.eventBus.$on('showUnreadModal', (obj) => {
      this.showUnreadModal = true
      this.left = obj.pos.x - 330
      this.top = obj.pos.y + 220 >= document.body.clientHeight ? obj.pos.y - 220 : obj.pos.y
    })
  },
  beforeDestroy () {
    this.eventBus.$off('showUnreadModal')
  },
  computed: {
    unreadList () {
      return this.$store.state.curUnreadList
    },
    readList () {
      return this.$store.state.curReadList
    }
  },
  methods: {
    closeModal () {
      this.showUnreadModal = false
    }
  }
}
</script>

<style>
.m-unread {
  position: absolute;
  z-index: 1000;
  width: 330px;
  height: 220px;
  background: #FFFFFF;
  border: 0 solid #CCCCCC;
  box-shadow: 0 10px 20px 0 rgba(0,0,0,0.24);
}
.m-unread:after{
  content: '';
  position: absolute;
  width: 1px;
  height: 100%;
  left: 50%;
  top: 0;
  background: #D8D8D8;
}
.m-unread .unreadList, .m-unread .readList{
  float: left;
  width: 165px;
  height: 100%;
}
</style>