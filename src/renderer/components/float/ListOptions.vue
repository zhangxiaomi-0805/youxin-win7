<template>
  <div v-if="showListOptions" class="m-options" :style="{left: left + 'px', top: top + 'px'}" v-clickoutside="closeModal">
    <div class="item" v-for="item in items" :key="item.id" @click="item.callBack" :class="item.title === '群设置' ? 'b-more' : ''">{{item.title}}</div>
  </div>
</template>

<script>
import clickoutside from '../../utils/clickoutside.js'
export default {
  name: 'list-options',
  directives: {clickoutside},
  computed: {
    showListOptions () {
      return this.$store.state.showListOptions
    },
    items () {
      return this.$store.state.listOptionsItems
    },
    left () {
      let left = this.$store.state.listOptionsPos.x
      let leftMax = this.$store.state.listOptionsPos.left
      let maxTitle = 0
      this.items.forEach(item => {
        if (item.title.length > maxTitle) {
          maxTitle = item.title.length
        }
      })
      leftMax = maxTitle * 14 + 66
      if (!leftMax) leftMax = 100
      // 超出右侧
      let clientWidth = document.body.clientWidth
      if (clientWidth - left < (leftMax + 10)) {
        left = left - leftMax - 6
      }
      return left + 2
    },
    top () {
      let top = this.$store.state.listOptionsPos.y
      let height = this.items.length * 30
      // 超出底部
      let clientHeight = document.body.clientHeight
      if (clientHeight - top < height) {
        top = top - height
      }
      return top
    }
  },
  methods: {
    closeModal () {
      this.$store.dispatch('showListOptions', {
        show: false
      })
    }
  }
}
</script>

<style>
.m-options {
  position: absolute;
  width: auto;
  height: auto;
  background: #ffffff;
  box-shadow: 0 0 10px 0 rgba(0,0,0,0.16);
  border-radius: 10px;
  z-index: 10005;
}

.m-options .item {
  width: fit-content;
  padding: 0 33px;
  cursor: pointer;
  height: 30px;
  line-height: 30px;
  color: #333;
  font-size: 14px;
  transition: all .2s;
}
.m-options .item:hover{
  color: #049AFF;
}

</style>

