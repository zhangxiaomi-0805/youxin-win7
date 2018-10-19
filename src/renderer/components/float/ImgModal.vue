<template>
<!-- <transition name="fade"> -->
  <!-- 图片查看组件 -->
  <div class="m-selectcontact-contain" v-if="showImgModal">
    <div class="m-selectcontact-cover"></div>
    <div class="m-imgMd" style="width:624px;height:468px;">
      <div class="u-caption" id="imgModalDrag">
          <div class="u-sysbtn">
            <a class="btn-close" @click="onCloseModal"/>
          </div>
      </div>
      <div 
        class="g-imgMd-body" 
        @mousewheel="onChangeImgSize('mw', $event)" 
        @mousedown="onDragImg('start', $event)" 
        @mouseup="onDragImg('stop', $event)" 
        @mousemove="onDragImg('move', $event)"
        @mouseout="onDragImg('stop', $event)" 
        ref="imgMdBodyDom" 
      >
        <img 
          :src="curImg" 
          alt="" 
          ref="curImgDom" 
          :style="{maxWidth: maxWidth + '%', maxHeight:  maxHeight +'%', width, height, top: imgTop + 'px', left: imgLeft + 'px', transform: `translate(-50%, -50%) rotate(${imgRotate}deg)`, cursor: canDrag ? 'pointer' : 'default', transition }" 
        />
        <div :class="!isFirstImg ? 'u-imgMd-btn lbtn' : 'u-imgMd-btn lbtn z-fir'" @click="onChangeImg('left')"></div>
        <div :class="!isLastImg ? 'u-imgMd-btn rbtn' : 'u-imgMd-btn rbtn z-lt'" @click="onChangeImg('right')"></div>
        <div class="g-imgMd-foot">
            <div style="display: none;">{{startIndex}}</div>
            <div class="foot-menu">
              <div class="item item-1" @click="onChangeImgSize('narrow')"></div>
              <div class="item item-2" @click="onChangeImgSize('large')"></div>
              <div class="item item-3" @click="onChangeImgRotate"></div>
              <div class="item item-4"><a :href="downloadImg" type="image/*" style="width: 100%;height: 100%;display: block;" download="image"></a></div>
            </div>
        </div>
      </div>
    </div>
  </div>
<!-- </transition> -->
</template>

<script>
import drag from '../../utils/drag.js'
export default {
  name: 'img-modal',
  data () {
    return {
      currentIndex: -1,
      maxWidth: 100,
      maxHeight: 100,
      width: 'auto',
      height: 'auto',
      dragW: 'auto',
      dragH: 'auto',
      curSize: 1,
      imgSize: {
        h: 0,
        w: 0
      },
      imgRotate: 0,
      canDrag: false,
      startPos: {
        x: -1,
        y: -1
      },
      movePos: {
        x: -1,
        y: -1
      },
      isDragStart: false,
      bodyH: 440,
      bodyW: 624,
      imgTop: 220,
      imgLeft: 312,
      imgTopStart: 220,
      imgLeftStart: 312,
      transition: '',
      zIndex: 70,
      canManage: false,
      isReverse: false
    }
  },
  watch: {
    currentIndex: function () {
      this.canManage = false
      this.$refs.curImgDom.onload = () => {
        this.imgSize = {
          h: this.$refs.curImgDom.height,
          w: this.$refs.curImgDom.width
        }
        this.canManage = true
      }
    },
    width: function () {
      if (this.isReverse) {
        this.dragH = this.width
      } else {
        this.dragW = this.width
      }
    },
    height: function () {
      if (this.isReverse) {
        this.dragW = this.height
      } else {
        this.dragH = this.height
      }
    }
  },
  computed: {
    // 图片列表
    imgList () {
      return this.$store.state.allModalImg
    },
    showImgModal () {
      return this.$store.state.imgModal
    },
    // 点进去的图片的下标
    startIndex () {
      let startIndex = -1
      let startImg = this.$store.state.curModalImg
      this.imgList.forEach((item, index) => {
        if (item.file.url === startImg) {
          startIndex = index
        }
      })
      this.currentIndex = startIndex
      return startIndex
    },
    // 当前显示图片的url
    curImg () {
      if (this.imgList && this.currentIndex >= 0) {
        if (this.canManage) {
          return this.imgList[this.currentIndex].file.url.split('?')[0]
        } else {
          return './static/img/setting/loading-b.gif'
        }
      } else {
        return ''
      }
    },
    // 下载图片
    downloadImg () {
      const nim = this.$store.state.nim
      const nameUrl = nim.packFileDownloadName({
        url: this.imgList[this.currentIndex].file.url,
        name: this.imgList[this.currentIndex].file.name
      })
      return nameUrl
    },
    isFirstImg () {
      if (this.currentIndex === 0) {
        return true
      } else {
        return false
      }
    },
    isLastImg () {
      if (this.currentIndex === this.imgList.length - 1) {
        return true
      } else {
        return false
      }
    }
  },
  updated () {
    drag.dragPosition('imgModalDrag')
  },
  methods: {
    onCloseModal () {
      this.resetImg()
      this.$store.commit('updateImgModal', {})
      this.currentIndex = -1
    },
    // 切换图片
    onChangeImg (key) {
      if (key === 'right' && this.currentIndex < this.imgList.length - 1) {
        this.currentIndex += 1
        this.resetImg()
      } else if (key === 'left' && this.currentIndex > 0) {
        this.currentIndex -= 1
        this.resetImg()
      }
    },
    // 改变图片大小
    onChangeImgSize (key, e) {
      if (key === 'mw') {
        if (e.wheelDelta > 0 && this.canManage) {
          this.largeImg()
        }
        if (e.wheelDelta < 0 && this.canManage) {
          this.narrowImg()
        }
      }
      if (key === 'large' && this.canManage) {
        this.largeImg()
      } else if (key === 'narrow' && this.canManage) {
        this.narrowImg()
      }
    },
    // 旋转图片
    onChangeImgRotate () {
      this.imgTop = this.bodyH / 2
      this.imgLeft = this.bodyW / 2
      this.imgTopStart = this.bodyH / 2
      this.imgLeftStart = this.bodyW / 2
      if (this.imgRotate < -180) {
        this.imgRotate = 0
      } else {
        this.imgRotate -= 90
      }
      if (this.imgRotate === -90 || this.imgRotate === -270) {
        let i = 0
        i = this.dragW
        this.dragW = this.dragH
        this.dragH = i
        this.isReverse = true
      } else if (this.isReverse) {
        let i = 0
        i = this.dragW
        this.dragW = this.dragH
        this.dragH = i
        this.isReverse = false
      }
    },
    // 拖动图片
    onDragImg (key, e) {
      e.preventDefault()
      let canDragX = parseFloat(this.dragW) - this.bodyW > 0
      let canDragY = parseFloat(this.dragH) - this.bodyH > 0
      if (key === 'start' && this.canDrag) {
        this.startPos = {
          x: e.clientX,
          y: e.clientY
        }
        this.isDragStart = true
      }
      if (key === 'move' && this.isDragStart) {
        this.zIndex = 90
        this.movePos = {
          x: e.clientX,
          y: e.clientY
        }
        if (canDragX) {
          this.imgLeft = this.movePos.x - this.startPos.x + this.imgLeftStart
        }
        if (canDragY) {
          this.imgTop = this.movePos.y - this.startPos.y + this.imgTopStart
        }
      }
      if (key === 'stop') {
        this.zIndex = 70
        let marginW = (parseFloat(this.dragW) - this.bodyW) / 2
        let marginH = (parseFloat(this.dragH) - this.bodyH) / 2
        this.isDragStart = false
        this.transition = true
        if (Math.abs(this.imgLeft - this.bodyW / 2) > marginW && canDragX) {
          this.imgLeft - (this.bodyW / 2) > 0 ? this.imgLeft = (this.bodyW / 2) + marginW : this.imgLeft = (this.bodyW / 2) - marginW
        }
        if (Math.abs(this.imgTop - (this.bodyH / 2)) > marginH && canDragY) {
          this.imgTop - (this.bodyH / 2) > 0 ? this.imgTop = (this.bodyH / 2) + marginH : this.imgTop = (this.bodyH / 2) - marginH
        }
        this.imgTopStart = this.imgTop
        this.imgLeftStart = this.imgLeft
      }
    },
    // 放大图片
    largeImg () {
      if (this.width === 'auto') {
        this.width = 1.1 * this.imgSize.w + 'px'
        this.height = 1.1 * this.imgSize.h + 'px'
        this.curSize = 1.1
        this.maxWidth = 100 * this.curSize
        this.maxHeight = 100 * this.curSize
      } else if (this.curSize < 5) {
        this.curSize += 0.1
        this.width = this.curSize * this.imgSize.w + 'px'
        this.height = this.curSize * this.imgSize.h + 'px'
        this.maxWidth = 100 * this.curSize
        this.maxHeight = 100 * this.curSize
      }
      if (parseFloat(this.width) > this.bodyW || parseFloat(this.height) > this.bodyH) {
        this.canDrag = true
      } else {
        this.canDrag = false
      }
    },
    // 缩小图片
    narrowImg () {
      if (this.width === 'auto') {
        this.width = 0.9 * this.imgSize.w + 'px'
        this.height = 0.9 * this.imgSize.h + 'px'
        this.curSize = 0.9
      } else if (this.curSize > 0.11) {
        this.curSize -= 0.1
        this.width = this.curSize * this.imgSize.w + 'px'
        this.height = this.curSize * this.imgSize.h + 'px'
      }
      if (parseFloat(this.width) > this.bodyW || parseFloat(this.height) > this.bodyH) {
        this.canDrag = true
      } else {
        this.canDrag = false
      }
      // 判断是否可以拖动
      let canDragX = parseFloat(this.dragW) - this.bodyW > 0
      let canDragY = parseFloat(this.dragH) - this.bodyH > 0
      // 获取图片与四周距离
      let marginW = (parseFloat(this.width) - this.bodyW) / 2
      let marginH = (parseFloat(this.height) - this.bodyH) / 2
      if (Math.abs(this.imgLeft - (this.bodyW / 2)) > marginW && canDragX) {
        this.imgLeft - (this.bodyW / 2) > 0 ? this.imgLeft = (this.bodyW / 2) + marginW : this.imgLeft = (this.bodyW / 2) - marginW
      }
      if (!canDragX) {
        this.imgLeft = this.bodyW / 2
      }
      if (Math.abs(this.imgTop - (this.bodyH / 2)) > marginH && canDragY) {
        this.imgTop - (this.bodyH / 2) > 0 ? this.imgTop = (this.bodyH / 2) + marginH : this.imgTop = (this.bodyH / 2) - marginH
      }
      if (!canDragY) {
        this.imgTop = this.bodyH / 2
      }
      this.imgTopStart = this.imgTop
      this.imgLeftStart = this.imgLeft
    },
    // 初始化图片数据
    resetImg () {
      this.width = 'auto'
      this.height = 'auto'
      this.curSize = 1
      this.maxWidth = 100
      this.maxHeight = 100
      this.imgRotate = 0
      this.canDrag = false
      this.imgTop = (this.bodyH / 2)
      this.imgLeft = (this.bodyW / 2)
      this.isReverse = false
    }
  }
}
</script>

<style scoped>
.u-caption{
  -webkit-app-region: no-drag;
  height: 29px;
  overflow: hidden;
  background: #fff;
}
.m-imgMd {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 90;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 30px 44px -20px rgba(0,0,0,0.50);
    transform: translate(-50%, -50%);
    width: 624px;
    height: 468px;
    border-radius: 4px;
    border: 1px solid #ccc;
    border-bottom: none;
}
.g-imgMd-body{
    position: relative;
    z-index: 110;
    overflow: hidden;
    height: 440px;
    width: 100%;
    background: #fff;
    margin-top: 29px;
}
.g-imgMd-body img{
  position: absolute;
}
.g-imgMd-foot{
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 80;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all .3s;
    height: 46px;
    width: 236px;
    background: rgba(0,0,0,0.60);
    border-radius: 4px 4px 0 0;
    opacity: 0;
}
.g-imgMd-body:hover .g-imgMd-foot{
  opacity: 1;
}
.g-imgMd-foot .foot-menu{
    display: flex;
    justify-content: space-between;
    width: 10rem;
    height: 1.5rem;
}
.g-imgMd-foot .foot-menu .item{
    width: 20px;
    height: 20px;
    cursor: pointer;
    transition: all .2s linear;
}
.g-imgMd-foot .foot-menu .item-1{
    background: url(../../../../static/img/imgModal/imgModal-icon1.png) no-repeat center center;
    background-size: 100% 100%;
}
.g-imgMd-foot .foot-menu .item-1:hover{
    background: url(../../../../static/img/imgModal/imgModal-icon1-h.png) no-repeat center center;
    background-size: 100% 100%;
}
.g-imgMd-foot .foot-menu .item-1:active{
    background: url(../../../../static/img/imgModal/imgModal-icon1-p.png) no-repeat center center;
    background-size: 100% 100%;
}

.g-imgMd-foot .foot-menu .item-2{
    background: url(../../../../static/img/imgModal/imgModal-icon2.png) no-repeat center center;
    background-size: 100% 100%;
}
.g-imgMd-foot .foot-menu .item-2:hover{
    background: url(../../../../static/img/imgModal/imgModal-icon2-h.png) no-repeat center center;
    background-size: 100% 100%;
}
.g-imgMd-foot .foot-menu .item-2:active{
    background: url(../../../../static/img/imgModal/imgModal-icon2-p.png) no-repeat center center;
    background-size: 100% 100%;
}

.g-imgMd-foot .foot-menu .item-3{
    background: url(../../../../static/img/imgModal/imgModal-icon3.png) no-repeat center center;
    background-size: 100% 100%;
}
.g-imgMd-foot .foot-menu .item-3:hover{
    background: url(../../../../static/img/imgModal/imgModal-icon3-h.png) no-repeat center center;
    background-size: 100% 100%;
}
.g-imgMd-foot .foot-menu .item-3:active{
    background: url(../../../../static/img/imgModal/imgModal-icon3-p.png) no-repeat center center;
    background-size: 100% 100%;
}

.g-imgMd-foot .foot-menu .item-4{
    background: url(../../../../static/img/imgModal/imgModal-icon4.png) no-repeat center center;
    background-size: 100% 100%;
}
.g-imgMd-foot .foot-menu .item-4:hover{
    background: url(../../../../static/img/imgModal/imgModal-icon4-h.png) no-repeat center center;
    background-size: 100% 100%;
}
.g-imgMd-foot .foot-menu .item-4:active{
    background: url(../../../../static/img/imgModal/imgModal-icon4-p.png) no-repeat center center;
    background-size: 100% 100%;
}
.u-imgMd-btn{
  position: absolute;
  top: 50%;
  margin-top: -25px;
  z-index: 80;
  transition: all .3s;
  cursor: pointer;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-size: 100%;
  opacity: 0;
  transition: all .2s linear;
}
.g-imgMd-body:hover .u-imgMd-btn{
  opacity: 1;
}

.u-imgMd-btn.lbtn{
  left: 20px;
  background-image: url(../../../../static/img/imgModal/imgModal-lbtn.png)
}
.u-imgMd-btn.lbtn:hover{
  background-image: url(../../../../static/img/imgModal/imgModal-lbtn-h.png)
}
.u-imgMd-btn.lbtn:active{
  background-image: url(../../../../static/img/imgModal/imgModal-lbtn-p.png)
}

.u-imgMd-btn.rbtn{
  right: 20px;
  background-image: url(../../../../static/img/imgModal/imgModal-rbtn.png)
}
.u-imgMd-btn.rbtn:hover{
  background-image: url(../../../../static/img/imgModal/imgModal-rbtn-h.png)
}
.u-imgMd-btn.rbtn:active{
  background-image: url(../../../../static/img/imgModal/imgModal-rbtn-p.png)
}
.u-imgMd-btn.lbtn.z-fir{
  background-image: url(../../../../static/img/imgModal/imgModal-lbtn-s.png)
}
.u-imgMd-btn.rbtn.z-lt{
  background-image: url(../../../../static/img/imgModal/imgModal-rbtn-s.png)
}

</style>
