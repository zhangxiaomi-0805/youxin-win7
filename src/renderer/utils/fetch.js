/**
 * Encapsulation of the fetch method
 */
import configs from '../configs/index'
import NativeLogic from './nativeLogic'
import DES from '../utils/des'
var Fetch = {
  last_url: null
}

/**
 * Asynchronous         异步
 * @param url
 * @param params
 * @param $this
 * @param ContentType
 */
Fetch.post = async function (url, params, $this, ContentType) {
  params = params || {}
  ContentType = ContentType || 'application/x-www-form-urlencoded'
  // 重复请求校验
  if (this.last_url === JSON.stringify(params)) return
  this.last_url = JSON.stringify(params)
  // 不需要携带token
  let noTokenUrl = [
    'api/appPc/resetPassword',
    'api/appPc/login/auth'
  ]
  let needToken = true
  for (let key in noTokenUrl) {
    if (noTokenUrl[key] === url) {
      needToken = false
      break
    }
  }
  let headers = { 'Content-Type': ContentType, 'platformType': 2, 'Access-Control-Allow-Origin': '*', osType: configs.environment === 'web' ? 4 : 3 }
  if (localStorage.sessionId) {
    headers['sessionId'] = localStorage.sessionId + ''
  }
  if (needToken) {
    try {
      if (localStorage.sessionToken) {
        headers['token'] = localStorage.sessionToken + ''
      }
    } catch (err) {
    }
  }
  // 参数封装
  let uriParams = ''
  if (ContentType === 'application/x-www-form-urlencoded') {
    Object.keys(params).forEach(key => {
      uriParams += key + '=' + params[key] + '&'
    })
    uriParams = uriParams.substring(0, uriParams.length - 1)
  } else if (ContentType === 'application/json') {
    uriParams = params
  }
  return new Promise((resolve, reject) => {
    let reLoginFn = () => {
      // 鉴权失败处理
      localStorage.removeItem('AUTOLOGIN')
      if (configs.environment === 'web') { // web分支
        // 先关闭所有子窗口，再重启主窗口
        NativeLogic.native.setWinStatus('aplWindow', 3) // 类型（1-最小化，2-最大化，3-关闭，4-重启，5-隐藏，6-显示）
        NativeLogic.native.setWinStatus('main', 4)
      } else { // electron分支
        let { ipcRenderer } = require('electron')
        ipcRenderer.send('relaunch-app')
      }
    }
    fetch(configs.postUrl + url, {
      method: 'POST',
      mode: 'cors',
      headers,
      body: uriParams
    }).then((response) => {
      this.last_url = null
      if (response.ok) {
        return response.json()
      }
    }).then((respResult) => {
      switch (respResult.code) {
        case 200: // 成功
          if (respResult.retJson) {
            let retJson = DES.decryptByDESModeEBC(respResult.retJson, !needToken ? 1 : 3)
            try {
              retJson = JSON.parse(retJson)
            } catch (error) { console.log(error) }
            resolve(retJson)
          } else {
            resolve(respResult.ret)
          }
          break
        case 412: // 账号未激活---去设置新密码
          resolve({ type: 'setPassword', secret: DES.decryptByDESModeEBC(respResult.retJson, 3) })
          break
        case 404: // 请求资源不存在
          resolve({ msg: '请求资源不存在' })
          break
        case 427: // 企业过期
          if (needToken) {
            $this.eventBus.$emit('forwordFail', { type: 3 })
          } else {
            let error = { msg: '体验时长到期，请联系相应的商务经理' }
            reject(error)
          }
          break
        case 500: // 服务器异常
          resolve({ msg: '服务器异常' })
          break
        case 2001: // 鉴权失败
          reLoginFn()
          break
        case 3001: // 平台鉴权失败
          reLoginFn()
          break
        default:
          reject(respResult)
          break
      }
    }).catch(() => {
      this.last_url = null
      if ($this) {
        $this.$store.commit('toastConfig', {
          show: true,
          type: 'fail',
          toastText: '当前网络异常，请检查网络设置'
        })
      }
      let errMsg = { msg: '当前网络异常，请检查您的网络设置' }
      reject(errMsg)
    })
  })
}

export default Fetch
