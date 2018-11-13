var config = {
  sdk: 'NIM_Web_SDK_v5.7.0',
  // 用户自定义的登录注册地址
  loginUrl: '#/',
  registUrl: '/webdemo/h5/regist.html',
  homeUrl: '#/mainpage/session/session-default',
  // default icon
  defaultIcon: './static/default.png',
  // 资源路径根目录，为了方便用户部署在二级以上URL路径上
  resourceUrl: 'http://yx-web.nos.netease.com/webdoc/h5',
  // 用户logo地址
  logo: 'http://yx-web.nos.netease.com/webdoc/h5/im/logo.png',
  // 默认用户头像
  defaultUserIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/default-icon.png',
  // 默认普通群头像
  defaultGroupIcon: './static/img/team/group-default.png',
  // 默认讨论组头像
  defaultDiscussGroupIcon: './static/img/team/discuss-group-default.png',
  // 默认高级群头像
  defaultAdvancedIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/default-advanced.png',
  // 系统通知图标
  noticeIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/notice-icon.png',
  // 我的手机图标
  myPhoneIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/my-phone.png',
  // 本地消息显示数量，会影响性能
  localMsglimit: 36
}

const env = 'test'

let appConfig = {
  // 用户的appkey
  dev: {
    appkey: 'f5ffcda3b27dc463b668fef67cc3a3da',
    postUrl: 'http://59.111.148.80:8088/'
  },
  test: {
    appkey: '6e2baf0f1988f1ff2c6ca4fe46043e88',
    postUrl: 'http://imapi.eyuntx.com/'
  },
  online: {
    appkey: '393f9c3f3dabdc573cc634303f09573e',
    postUrl: 'https://nice.yunxin.163.com/'
  },
  self: {
    appkey: '8d7e0c79e15ede7eff6bb41631a1f986',
    postUrl: 'http://59.111.110.176:8181/'
  }
}

config = Object.assign(config, appConfig[env])

export default config
