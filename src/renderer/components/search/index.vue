<template>
  <div class="s-cont">
    <div v-if="!isEmpty" class="s-empty">暂无搜索结果~</div>
  </div>
</template>

<script>
  export default {
    name: 'search',
    props: {
      value: String,
      type: String
    },
    data () {
      return {
        contactlist: [],
        teamlist: [],
        recoedlist: [],
        branchlist: []
      }
    },
    computed: {
      isEmpty () {
        if (this.type === 'session') {
          return this.contactlist.length > 0 || this.teamlist.length > 0 || this.recoedlist.length > 0
        } else if (this.type === 'contact') {
          return this.contactlist.length > 0 || this.teamlist.length > 0 || this.branchlist.length > 0
        }
      }
    }
  }
</script>

<style scoped>
  .s-cont {
    box-sizing: border-box;
    position: absolute;
    top: 56px;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    background-color: #fff;
  }

  .s-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    font-size: 14px;
    color: #C4C4C4;
  }
</style>
