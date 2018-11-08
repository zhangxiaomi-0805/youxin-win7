/**
 * 提供Fetch请求方法
 */
import store from '../store'
import Fetch from './fetch'

function LoginAuth (params, $this) {
  /*
   * 登录鉴权
   * @param account  原账号
   * @param password  新密码 (需要使用DES进行加密,秘钥:8fgt6jhk45frgt5k)
   */
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/login/auth', params, $this).then(res => resolve(res)).catch(err => reject(err))
  })
}

function GetUserInfo (params, $this) {
  /*
   * 获取用户基本信息
   * @param(header) platformType: 平台类型,可选值:1,2 1-移动端 , 2-PC端
   * @param(header) token: 初次设置密码&登录成功,返回token,携带获取用户登录信息
   */
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/userInfo', params, $this).then(res => resolve(res)).catch(err => reject(err))
  })
}

function ResetPassword (params, $this) {
  /*
   * 设置新密码
   * @param account: 账号
   * @param password: 要设置的密码(需要使用DES进行加密,秘钥:8fgt6jhk45frgt5k)
   * @param confirmPassword: 要设置的确认密码(需要使用DES进行加密,秘钥:8fgt6jhk45frgt5k)
   */
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/resetPassword', params, $this).then(res => resolve(res)).catch(err => reject(err))
  })
}

function PullUserInfo (params, $this) {
  /*
   * 获取用户信息
   * @param JSON字符串(对象数组)
   */
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/pullUserInfo', JSON.stringify(params), $this, 'application/json').then(res => resolve(res)).catch(err => reject(err))
  })
}

function Logout (params, $this) {
  /*
   * 退出登录
   */
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/logout', params, $this).then(res => resolve(res)).catch(err => reject(err))
  })
}

function ModifyUserInfo (params, $this) {
  /*
   * 修改个人信息
   */
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/modifyUserInfo', params, $this).then(res => resolve(res)).catch(err => reject(err))
  })
}

function ConfirmOrigPassword (params, $this) {
  /*
   * 登录成功后确认原密码
   * @param password: 待确认的原密码 (需要使用DES进行加密,秘钥:8fgt6jhk45frgt5k)
   */
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/confirmOrigPassword', params, $this).then(res => resolve(res)).catch(err => reject(err))
  })
}

function ModifyMobileOrEmail (url, params, $this) {
  /*
   * 登录成功修改手机号 api/appPc/modifyMobile
   * 登录成功修改邮箱 api/appPc/modifyEmail
   * @param mobile: 手机号 如果是海外账号 要求格式 +xx-xxx
   * @param code: 验证码
   * @receive invalid: 1-验证码失效, 2-验证码错误
   */
  return new Promise((resolve, reject) => {
    Fetch.post(url, params, $this).then(res => resolve(res)).catch(err => reject(err))
  })
}

function ModifyPassword (params, $this) {
  /*
   * 登录成功修改密码
   * @param password: 修改密码的内容 (需要使用DES进行加密,秘钥:8fgt6jhk45frgt5k)
   */
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/modifyPassword', params, $this).then(res => resolve(res)).catch(err => reject(err))
  })
}

function GetCode (url, params, $this) {
  /*
   * 获取激活验证码  api/niceAccount/genAuthCode
   * 获取忘记密码验证码  api/appPc/getForgetPasswordCode
   * 获取修改手机号和邮箱的验证码  api/appPc/getModifyCode
   * @param account: 账号 后台注册的 手机号或者邮箱 注意:海外手机号 格式:+xx-xxxx
   */
  return new Promise((resolve, reject) => {
    Fetch.post(url, params, $this).then(res => resolve(res)).then(res => resolve(res)).catch((err) => reject(err))
  })
}

function getContactUserList (params, $this) {
  // 获取常用联系人列表
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/contactUserList', params, $this).then(res => resolve(res)).catch((err) => reject(err))
  })
}

function QueryUserList (params, $this) {
  /*
   * 模糊搜索成员
   * @param  keyParam: 查询参数
   * @param  pageSize: 查询展示的条数 默认为20
   * @param  lastId: 代表最后一条记录的accid，首次查询时 传 字符串0
   */
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/queryUserList', params, $this).then(res => resolve(res)).catch((err) => reject(err))
  })
}

function AddOrDelContactUser (params, $this) {
  /**
   * 常用联系人修改
   * @param accid     （添加、删除）用户id
   * @param userType  （1-新增 2-删除）
   */
  Fetch.post('api/appPc/addOrDelContactUser', params, $this).then(res => {
    store.commit('toastConfig', {
      show: true,
      type: 'success',
      toastText: '添加成功！'
    })
  }).catch((err) => {
    store.commit('toastConfig', {
      show: true,
      type: 'fail',
      toastText: err.msg
    })
  })
}

function GetThirdList (params, $this) {
  // 获取接入系统列表
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/thirdList', params, $this).then(res => resolve(res)).catch((err) => reject(err))
  })
}

function PullDepartment (params, $this) {
  /*
   * 拉取组织框架
   * @param  depId: 节点id
   * @param  tag: 时间戳,拉取截止的时间戳, 拉取所有,传0
   */
  return new Promise((resolve, reject) => {
    Fetch.post('api/appPc/pullDepartment', params, $this).then(res => resolve(res)).catch((err) => reject(err))
  })
}

function DelTeam (params, $this) {
  /**
   * 删除群组
   * @param tid     群组Id
   * @param owner   群主账号
   */
  return new Promise((resolve, reject) => {
    Fetch.post('api/im/delTeam', params, $this).then(res => resolve(res)).catch((err) => reject(err))
  })
}

export default {
  LoginAuth,
  GetUserInfo,
  ResetPassword,
  PullUserInfo,
  Logout,
  ModifyUserInfo,
  ConfirmOrigPassword,
  ModifyMobileOrEmail,
  ModifyPassword,
  GetCode,
  getContactUserList,
  QueryUserList,
  AddOrDelContactUser,
  GetThirdList,
  PullDepartment,
  DelTeam
}
