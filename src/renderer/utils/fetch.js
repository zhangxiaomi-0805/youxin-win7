/**
 * Encapsulation of the fetch method
 */
var Fetch = {
  last_url: null,
  DOMAINNAME: 'http://59.111.148.80:8088/',
  DOMAINNAME_TEST: 'https://nice.yunxin.163.com/'
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
    'api/niceAccount/isActivated', 'api/niceAccount/genAuthCode',
    'api/niceAccount/activeAccount', 'api/niceAccount/setPassword',
    'api/appPc/getLoginCode', 'api/appPc/login/auth',
    'api/appPc/getForgetPasswordCode', 'api/appPc/validForgetPasswordCode',
    'api/appPc/resetPassword'
  ]
  let needToken = true
  for (let key in noTokenUrl) {
    if (noTokenUrl[key] === url) {
      needToken = false
      break
    }
  }
  let headers = { 'Content-Type': ContentType, 'platformType': 2 }
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
      const electron = require('electron')
      const ipcRenderer = electron.ipcRenderer
      localStorage.removeItem('AUTOLOGIN')
      ipcRenderer.send('relaunch-app')
    }
    fetch(this.DOMAINNAME_TEST + url, {
      method: 'POST',
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
          resolve(respResult.ret)
          break
        case 411: // 账号已激活
          resolve({isActive: 1})
          break
        case 412: // 账号未激活
          resolve({isActive: 2})
          break
        case 414: // 验证码失效
          resolve({invalid: 1})
          break
        case 415: // 验证码错误
          resolve({invalid: 2})
          break
        case 404: // 请求资源不存在
          resolve({msg: '请求资源不存在'})
          break
        case 427: // 企业过期
          if (needToken) {
            $this.eventBus.$emit('forwordFail', {type: 3})
          } else {
            let error = {msg: '体验时长到期，请联系相应的商务经理'}
            reject(error)
          }
          break
        case 500: // 服务器异常
          resolve({msg: '服务器异常'})
          break
        case 2001: // 鉴权失败
          reLoginFn()
          break
        case 3001: // 平台鉴权失败
          reLoginFn()
          break
        default :
          reject(respResult)
          break
      }
    }).catch((error) => {
      this.last_url = null
      $this.$store.commit('toastConfig', {
        show: true,
        type: 'fail',
        toastText: '网络不佳，请检查网络连接'
      })
      reject(error)
    })
  })
}

export default Fetch