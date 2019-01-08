<template>
  <div>
    <div class="m-chat-emoji">
      <div class="emoji-content">
        <div class="cnt">
          <a class="cover" v-for="item in currEmoji.list" @click.stop="selectEmoji(item)" :key="item.img">
          <span class="emoji-item" :class="{'pinup-item':item.type==='pinup'}">
            <img :src="item.img">
          </span>
          </a>
        </div>
        <!-- <div class="circle">
          <a class="dot" v-for="item in currEmoji.list" :key="item.img"></a>
        </div> -->
      </div>
      <div class="emoji-channel">
        <div :class="activeId === item.name ? 'emoji-con active' : 'emoji-con'" v-for="item in emoji" @click.stop="selectAlbum(item)" :key="item.album">
        <span class="emoji-album" :class="{active: item.name==currAlbum}">
          <img :src="item.album">
        </span>
        </div>
        <div :class="activeId === item.name ? 'emoji-con active' : 'emoji-con'" v-for="item in pinup" @click.stop="selectAlbum(item)" :key="item.album">
        <span v-if="type==='session'" class="emoji-album" :class="{active: item.name==currAlbum}">
          <img :src="item.album">
        </span>
        </div>
      </div>
    </div>
    <div class="m-chat-arrow"></div>
  </div>
</template>

<script>
  import emojiObj from '../../configs/emoji'

  function genEmojiList (type, emojiList) {
    let result = {}
    for (let name in emojiList) {
      let emojiMap = emojiList[name]
      let list = []
      for (let key in emojiMap) {
        list.push({
          type,
          name,
          key,
          img: emojiMap[key].img
        })
      }
      if (list.length > 0) {
        result[name] = {
          type,
          name,
          list,
          album: list[0].img
        }
      }
    }
    return result
  }

  export default {
    name: 'chat-emoji',
    props: {
      type: String,
      scene: String,
      to: String
    },
    data () {
      return {
        currType: 'emoji',
        currAlbum: 'emoji',
        activeId: 'emoji'
      }
    },
    computed: {
      emoji () {
        return genEmojiList('emoji', emojiObj.emojiList)
      },
      pinup () {
        return genEmojiList('pinup', emojiObj.pinupList)
      },
      currEmoji () {
        if (this.currType === 'emoji') {
          return this.emoji[this.currAlbum]
        } else if (this.currType === 'pinup') {
          return this.pinup[this.currAlbum]
        }
        return []
      }
    },
    methods: {
      selectAlbum (album) {
        this.currType = album.type
        this.currAlbum = album.name
        this.activeId = album.name
      },
      selectEmoji (emoji) {
        if (this.currType === 'emoji') {
          // 由触发父组件事件，增加表情文案
          this.$emit('add-emoji', emoji)
        } else if (this.currType === 'pinup') {
          if (this.type === 'session') {
            this.$store.dispatch('sendMsg', {
              type: 'custom',
              scene: this.scene,
              to: this.to,
              pushContent: '[贴图表情]',
              content: {
                type: 3,
                data: {
                  catalog: this.currAlbum,
                  chartlet: emoji.key
                }
              }
            })
          } else if (this.type === 'chatroom') {
            this.$store.dispatch('sendChatroomMsg', {
              type: 'custom',
              pushContent: '[贴图表情]',
              content: {
                type: 3,
                data: {
                  catalog: this.currAlbum,
                  chartlet: emoji.key
                }
              }
            })
          }
          this.$emit('hide-emoji')
        }
      }
    }
  }
</script>

<style type="text/css">
  .m-chat-emoji {
    position: absolute;
    top: -264px;
    left: -175px;
    width: 408px;
    height: 266px;
    background: #fff;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.30);
    border-radius: 10px;
    z-index: 1000;
  }

  .m-chat-arrow {
    position: absolute;
    top: -5px;
    left: 19px;
    width: 10px;
    height: 10px;
    transform: rotate(-45deg);
    border: 1px solid rgba(195,195,195,1);
    background-color: #fff;
    z-index: 999;
  }

  .m-chat-emoji .emoji-channel {
    box-sizing: border-box;
    position: relative;
    width: 100%;
    height: 40px;
    background: #F2F2F2;
    border-radius: 0 0 10px 10px;
    padding-left: 10px;
    padding-right: 10px;
    display: flex;
    align-items: center;
  }

  .m-chat-emoji .emoji-channel .emoji-con {
    display: inline-block;
    width: 40px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .m-chat-emoji .emoji-channel .emoji-con.active {
    background-color: #fff;
  }

  .m-chat-emoji .emoji-channel .emoji-album {
    display: inline-block;
    width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
  }

  .m-chat-emoji .emoji-channel .emoji-album img {
    margin: 0;
    display: block;
    width: inherit;
    height: inherit;
  }

  .m-chat-emoji .emoji-channel .emoji-album img .active {
    background-color: #f0f0f0;
  }

  .emoji-content {
    position: relative;
    width: 100%;
    height: 226px;
    background-color: #fff;
    overflow-y: auto;
    border-radius: 10px 10px 0 0;
  }


  .emoji-content .cnt {
    box-sizing: border-box;
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    padding: 15px 14px;
    text-align: left;
    overflow-y: auto;
  }

  .emoji-content .cnt .cover {
    display: inline-block;
    width: 34px;
    height: 38px;
    line-height: 38px;
    text-align: center;
  }

  .emoji-content .cnt .cover:hover {
    background: #F2F2F2;
    border-radius: 4px;
  }

  .emoji-content .emoji-item {
    display: inline-block;
    width: 24px;
    height: 24px;
    padding: 2px;
    vertical-align: middle;
    /*border: 1px solid #fff;*/
    /*margin-left: -1px;*/
    /*margin-bottom: -1px;*/
  }

  .emoji-content .emoji-item img {
    width: inherit;
    height: inherit;
  }
  .pinup-item {
    width: 44px;
    height: 44px;
  }

  /* @media screen and (min-width: 300px) and (max-width: 420px) {
    .emoji-content .cnt {
      width: 300px;
    }
  }

  @media screen and (min-width: 420px) and (max-width: 600px) {
    .emoji-content .cnt {
      width: 420px;
    }
  }

  @media screen and (min-width: 600px) and (max-width: 720px) {
    .emoji-content .cnt {
      width: 600px;
    }
  }

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    .emoji-content .cnt {
      width: 720px;
    }
  }

  @media screen and (min-width: 1080px){
    .emoji-content .cnt {
      width: 1080px;
    }
  } */
</style>
