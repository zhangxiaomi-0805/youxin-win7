/**
 * 常用兼容性js方法
 * @version 1.0
 * @author zzy
 */

const platform = {
  getOsInfo: function () {
    var userAgent = navigator.userAgent.toLowerCase()
    var name = 'Unknown'
    if (userAgent.indexOf('win') > -1) {
      name = 'Windows'
    } else if (userAgent.indexOf('iphone') > -1) {
      name = 'Iphone'
    } else if (userAgent.indexOf('mac') > -1) {
      name = 'Mac'
    } else if (userAgent.indexOf('x11') > -1 || userAgent.indexOf('unix') > -1 || userAgent.indexOf('sunname') > -1 || userAgent.indexOf('bsd') > -1) {
      name = 'Unix'
    } else if (userAgent.indexOf('linux') > -1) {
      if (userAgent.indexOf('android') > -1) {
        name = 'Android'
      } else {
        name = 'Linux'
      }
    } else {
      name = 'Unknown'
    }
    return name
  },
  getWinVer: function () {
    var userAgent = navigator.userAgent.toLowerCase()
    var version = 'Unknown'
    if (userAgent.indexOf('win') > -1) {
      if (userAgent.indexOf('windows nt 5.0') > -1) {
        version = 'Windows 2000'
      } else if (userAgent.indexOf('windows nt 5.1') > -1 || userAgent.indexOf('windows nt 5.2') > -1) {
        version = 'Windows XP'
      } else if (userAgent.indexOf('windows nt 6.0') > -1) {
        version = 'Windows Vista'
      } else if (userAgent.indexOf('windows nt 6.1') > -1 || userAgent.indexOf('windows 7') > -1) {
        version = 'Windows 7'
      } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows 8') > -1) {
        version = 'Windows 8'
      } else if (userAgent.indexOf('windows nt 6.3') > -1) {
        version = 'Windows 8.1'
      } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows nt 10.0') > -1) {
        version = 'Windows 10'
      } else {
        version = 'Unknown'
      }
    }
    return version
  }
}

/**
 * 遍历对象
 * @param  {Object}   对象
 * @param  {Function} 迭代回调
 * @param  {Object}   回调执行对象
 * @return {String}   循环中断时的key值
 */
platform.__forIn = function (_obj, _callback, _this) {
  if (!_obj || !_callback) {
    return null
  }
  var _keys = Object.keys(_obj)
  for (var i = 0, l = _keys.length, _key, _ret; i < l; i++) {
    _key = _keys[i]
    _ret = _callback.call(
      _this || null,
      _obj[_key], _key, _obj
    )
    if (_ret) {
      return _key
    }
  }
  return null
}
/**
 * 遍历列表
 * @param  {Array}    列表
 * @param  {Function} 迭代回调
 * @param  {Object}   回调执行对象
 * @return {Void}
 */
platform.__forEach = function (_list, _callback, _this) {
  _list.forEach(_callback, _this)
}
/**
 * 集合转数组
 * @param  {Object} 集合
 * @return {Array}  数组
 */
platform.__col2array = function (_list) {
  return [].slice.call(_list, 0)
}
/**
 * YYYY-MM-DDTHH:mm:ss.sssZ格式时间串转时间戳
 * @param  {String} 时间串
 * @return {Number} 时间戳
 */
platform.__str2time = function (_str) {
  return Date.parse(_str)
}

export default platform
