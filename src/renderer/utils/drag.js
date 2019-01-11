/**
 * 拖拽方法
 * dragItem  -  dom对象
 * position  -  domParent初始位置
 */
import config from '../configs'
const drag = {
  dragPosition: (dragItem, position) => {
    let dom = document.getElementById(dragItem)
    if (dom) {
      let domParent = dom.parentNode
      let translateX = 0
      let translateY = 0
      let domParentTop = 0
      if (domParent.style.width) {
        // 需style中定义宽高
        translateX = Number(domParent.style.width.split('px')[0]) / 2
        translateY = Number(domParent.style.height.split('px')[0]) / 2
        domParentTop = translateY
        if (position) {
          translateY = translateY * 2
          domParentTop = position
        }
      }
      if (!dom && !domParent && !translateX) return
      dom.onmousedown = (e) => {
        let diffX = e.clientX - domParent.offsetLeft
        let diffY = e.clientY - domParent.offsetTop
        if (typeof dom.setCapture !== 'undefined') dom.setCapture()
        document.onmousemove = (e) => {
          let left = e.clientX - diffX
          let top = e.clientY - diffY
          if (left < translateX + 69) { // 避免在mac上弹窗层级没有系统按钮层级高，做拖动位置限制
            left = translateX + 69
          } else if (left > window.innerWidth - domParent.offsetWidth + translateX) {
            left = window.innerWidth - domParent.offsetWidth + translateX
          }
          if (config.environment === 'web') { // 头部预留30px
            let newTop = domParentTop
            if (position === 1) {
              newTop = domParentTop
            } else {
              newTop = domParentTop + 30
            }
            if (top < newTop) {
              top = newTop
            } else if (top > window.innerHeight - translateY) {
              top = window.innerHeight - translateY
            }
          } else {
            if (top < domParentTop) {
              top = domParentTop
            } else if (top > window.innerHeight - translateY) {
              top = window.innerHeight - translateY
            }
          }
          domParent.style.left = left / window.innerWidth * 100 + '%'
          domParent.style.top = top / window.innerHeight * 100 + '%'
        }
        document.onmouseup = (e) => {
          // 鼠标mouseup事件触发后清空监听
          document.onmousemove = null
          document.onmouseup = null
        }
      }
      window.onresize = (e) => {
        // 当屏幕缩小时，还原显示弹窗的位置
        let currentWidth = window.innerWidth
        if (!window.beforeWidth) {
          // 保存上一个位置
          window.beforeWidth = window.innerWidth
        }
        let decress = currentWidth - window.beforeWidth
        if (decress < 0 && domParent) {
          if (position) {
            if (!(domParent.style.left === '50%' && domParent.style.top === position)) {
              domParent.style.left = '50%'
              domParent.style.top = position + 'px'
            }
          } else {
            if (!(domParent.style.left === '50%' && domParent.style.top === '50%')) {
              domParent.style.left = '50%'
              domParent.style.top = '50%'
            }
          }
          // 弹窗位置重置后清空
          window.beforeWidth = null
        }
        if (window.beforeWidth) {
          window.beforeWidth = currentWidth
        }
      }
    }
  }
}

export default drag
