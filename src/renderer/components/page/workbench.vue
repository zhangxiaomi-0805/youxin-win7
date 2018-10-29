<template>
<div style="height:100%;position:relative;">
  <system-caption/>
  <div class="c-default">
    <div class="title" style="borderBottom: 0;">外部接入系统</div>
    <div class="body" style="backgroundColor: #fff;">
      <ul class="list-box">
        <li 
          class="list-item" v-for="(item, $index) of dataList" :key="$index"
          @mouseover="selectedIndex = $index"
          @mnouseout="selectedIndex = $index"
        >
          <div class="list-content-box">
            <div style="width: 65px; height: 65px;display: flex; align-items: center">
              <img :src="item.img" alt="" style="width: 100%">
            </div> 

            <div style="width: 70%; padding: 0 5px 0 10px">
              <div class="item-title">{{item.title}}</div>
              <div class="item-content">{{item.content}}</div>
            </div>
          </div>

          <!-- btn -->
          <div class="btn" v-if="selectedIndex === $index">立即进入</div>
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
      selectedIndex: -1,
      logo: './static/img/no-msg.png',
      dataList: [ {img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1540556654448&di=c8b410e77ba76e0cc630ef5c75dfd661&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01730758f113e7a8012049efbab035.png%402o.jpg', title: '网易云音乐-音乐的力量', content: '和4亿有趣的人听歌看评论'}, {img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1540556654448&di=c8b410e77ba76e0cc630ef5c75dfd661&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01730758f113e7a8012049efbab035.png%402o.jpg', title: '网易考拉', content: '买进口，上考拉！'}, {img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1540556654448&di=c8b410e77ba76e0cc630ef5c75dfd661&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01730758f113e7a8012049efbab035.png%402o.jpg', title: '网易邮箱大师', content: '高效强大的圈平台邮箱客户端'}, {img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1540556654448&di=c8b410e77ba76e0cc630ef5c75dfd661&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01730758f113e7a8012049efbab035.png%402o.jpg', title: '网易新闻', content: '头条视频先看'} ]
    }
  }
}
</script>
<style>
.c-default .title {
  color: #333;
  font-size: 15px;
  margin-left: 43px;
}
.c-default .body {
  position: absolute;
  top: 31px;
  bottom: 0;
  padding-bottom: 56px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
}
.c-default .list-box {
  box-sizing: border-box;
  padding: 42px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
}
.c-default .list-item {
  width: 46%;
  height: 5.2rem;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid rgba(0,38,63,0.1);
  border-radius: 2px;
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.c-default .list-item .list-content-box {
  width: 70%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.c-default .list-item .item-title {
  color: #333;
  font-size: 17px;
  line-height: 24px;
}
.c-default .list-item .item-content {
  width: 90%;
  overflow:hidden;
  text-overflow:ellipsis; 
  text-align:left;
  white-space:nowrap;
  color: #999;
  font-size: 15px;
  line-height: 21px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.c-default .btn {
  width: 3.6rem;
  height: 1.3rem;
  background-color: #049AFF;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
