/**
 * 初始化监听body点击事件指令
 */
const clickoutside = {
  bind (el, binding, vnode) {
    function documentHandler (e) {
      // 判断点击的元素是否是本身，是本身，则返回
      if (el.contains(e.target)) {
        return false
      }
      if (binding.expression) {
        binding.value(el, e)
      }
    }
    el.__vueClickOutside__ = documentHandler
    // document.addEventListener('click', documentHandler)
    document.addEventListener('mousedown', documentHandler)
  },
  update () {},
  unbind (el, binding) {
    // 解除事件监听
    // document.removeEventListener('click', el.__vueClickOutside__)
    document.removeEventListener('mousedown', el.__vueClickOutside__)
    delete el.__vueClickOutside__
  }
}

export default clickoutside
