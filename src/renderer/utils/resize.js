/**
 * 左右(上下)可拖动改变宽度
 * @param range 拖动范围
 */
import config from '../configs'
import NativeLogic from './nativeLogic.js'
const Resize = {
  changeSideRange (range) {
    let _this = this
    let resizeDom = document.getElementById('resize-we')
    let leftDom = document.getElementById('resize-side-lf')
    let rightDom = document.getElementById('resize-side-rt')
    if (resizeDom) {
      resizeDom.onmousedown = (e) => {
        let startP = e.clientX
        let leftDomWidth = Number(leftDom.style.width.split('px')[0])
        let rightDomMarginLeft = Number(rightDom.style.marginLeft.split('px')[0])
        document.onmousemove = (event) => {
          let moveLen = event.clientX - startP
          let rightDomCurrentMarginLeft = rightDomMarginLeft + moveLen
          let manageFn = (width, marginLeft) => {
            document.body.style.cursor = 'w-resize'
            leftDom.style.width = width + 'px'
            rightDom.style.marginLeft = marginLeft + 'px'
          }
          if (rightDomCurrentMarginLeft < range.max && rightDomCurrentMarginLeft > range.min) {
            manageFn(leftDomWidth + moveLen, rightDomCurrentMarginLeft)
          } else if (rightDomCurrentMarginLeft >= range.max) {
            manageFn(range.max, range.max)
          } else if (rightDomCurrentMarginLeft <= range.min) {
            manageFn(range.min, range.min)
          }
          return false
        }
        document.onmouseup = (evt) => {
          _this.eventRemove(resizeDom)
        }
        resizeDom.setCapture && resizeDom.setCapture()
        return false
      }
    }
  },
  changeChatRange (range) {
    let _this = this
    let resizeDom = document.getElementById('resize-ns')
    let topDom = document.getElementById('resize-chat-tp')
    let bottomDom = document.getElementById('resize-chat-btm')
    if (resizeDom) {
      resizeDom.onmousedown = (e) => {
        let startP = e.clientY
        let topDomBottom = Number(topDom.style.bottom.split('px')[0])
        let bottomDomHeight = Number(bottomDom.style.height.split('px')[0])
        if (startP) {
          document.onmousemove = (event) => {
            let moveLen = event.clientY - startP
            let bottomDomCurrentHeight = bottomDomHeight - moveLen
            let manageFn = (bottom, height) => {
              document.body.style.cursor = 'n-resize'
              topDom.style.bottom = bottom + 'px'
              bottomDom.style.height = height + 'px'
            }
            if (bottomDomCurrentHeight < range.max && bottomDomCurrentHeight > range.min) {
              manageFn(topDomBottom - moveLen, bottomDomCurrentHeight)
            } else if (bottomDomCurrentHeight >= range.max) {
              manageFn(range.max, range.max)
            } else if (bottomDomCurrentHeight <= range.min) {
              manageFn(range.min, range.min)
            }
          }
          document.onmouseup = (evt) => {
            _this.eventRemove(resizeDom)
          }
          resizeDom.setCapture && resizeDom.setCapture()
          return false
        }
      }
    }
  },
  eventRemove (resizeDom) {
    this.setDragArea()
    document.onmousemove = null
    document.onmouseup = null
    document.body.style.cursor = 'default'
    resizeDom.releaseCapture && resizeDom.releaseCapture()
  },
  setDragArea () {
    let leftDom = document.getElementById('resize-side-lf')
    let leftWidth = (leftDom.style.width).split('px')[0]
    let percent = ((Number(leftWidth) + 70) / Number(config.mainWinWidth)).toFixed(2) // 70----最左边导航宽，为固定宽
    /**
    * @params:  percent, // 左边占整个应用的百分比：如：0.3
    * @params:  leftTitleHeight, // 左侧可拖动区域高度：20
    * @params:  rightTitleHeight, // 右侧可拖动区域高度：30
    * * */
    if (config.environment === 'web') {
      NativeLogic.native.setDraggableArea(percent, 20, 30)
    }
  }
}

export default Resize
