var config = {
  env: 'test',
  sdk: 'NIM_Web_SDK_v5.7.0',
  // 用户自定义的登录注册地址
  loginUrl: '#/',
  registUrl: '/webdemo/h5/regist.html',
  homeUrl: '#/mainpage/session/session-default',
  // default icon
  defaultIcon: `${__static}/default.png`,
  // 资源路径根目录，为了方便用户部署在二级以上URL路径上
  resourceUrl: 'http://yx-web.nos.netease.com/webdoc/h5',
  // 用户logo地址
  logo: 'http://yx-web.nos.netease.com/webdoc/h5/im/logo.png',
  // 默认用户头像
  defaultUserIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/default-icon.png',
  // 默认普通群头像
  defaultGroupIcon: `${__static}/img/team/group-default.png`,
  // 默认讨论组头像
  defaultDiscussGroupIcon: `${__static}/img/team/discuss-group-default.png`,
  // 默认高级群头像
  defaultAdvancedIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/default-advanced.png',
  // 系统通知图标
  noticeIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/notice-icon.png',
  // 我的手机图标
  myPhoneIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/my-phone.png',
  // 本地消息显示数量，会影响性能
  localMsglimit: 36,
  // 私有化配置文件
  privateConf: {
    lbs_web: 'http://132.252.136.55:10081/lbs/webconf.jsp',
    link_ssl_web: false,
    nos_uploader_web: 'http://132.252.136.54:10080',
    https_enabled: false,
    nos_downloader: '132.252.136.54:10080/{bucket}/{object}',
    nos_accelerate: '',
    nos_accelerate_host: '',
    nt_server: ''
  }
}

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
    appkey: 'fd786db12662c1c6aa2d9fa13a02d830',
    postUrl: 'http://132.252.136.47:10581/'
  }
}

config = Object.assign(config, appConfig[config.env])

export default config
