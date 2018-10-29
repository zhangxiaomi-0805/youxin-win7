<template>
<div style="height:100%;position:relative;">
  <system-caption/>
  <div class="c-default">
    <div class="title" style="borderBottom: 0;"></div>
    <div class="body" style="backgroundColor: #fff;">
      <ul>
        <li v-for="(item, $index) of dataList" :key="$index">
          <div>
            <div style="width: 40px; height: 40px">
              <img :src="item.img" alt="" style="width: 100%">
            </div> 

            <div>
              <span>{{item.title}}</span>
              <div>
                {{item.content}}
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</div>
</template>

<script>
import SystemCaption from '../controls/SystemCaption.vue'
export default {
  name: 'workbench',
  components: {SystemCaption},
  data () {
    return {
      logo: './static/img/no-msg.png',
      dataList: [ {img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1540556654448&di=c8b410e77ba76e0cc630ef5c75dfd661&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01730758f113e7a8012049efbab035.png%402o.jpg', title: '网易云音乐-音乐的力量', content: '和4亿有趣的人听歌看评论'}, {img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1540556654448&di=c8b410e77ba76e0cc630ef5c75dfd661&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01730758f113e7a8012049efbab035.png%402o.jpg', title: '网易云音乐-音乐的力量', content: '和4亿有趣的人听歌看评论'}, {img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1540556654448&di=c8b410e77ba76e0cc630ef5c75dfd661&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01730758f113e7a8012049efbab035.png%402o.jpg', title: '网易云音乐-音乐的力量', content: '和4亿有趣的人听歌看评论'}, {img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1540556654448&di=c8b410e77ba76e0cc630ef5c75dfd661&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01730758f113e7a8012049efbab035.png%402o.jpg', title: '网易云音乐-音乐的力量', content: '和4亿有趣的人听歌看评论'} ]
    }
  }
}
</script>