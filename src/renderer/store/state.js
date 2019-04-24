/* 内存数据状态 */

export default {
  // 正在加载中
  isLoading: true,
  // 操作是否是刷新页面，刷新初始没有nim实例，会导致时序问题
  isRefresh: true,
  // 全屏显示的原图
  isFullscreenImgShow: false,
  fullscreenImgSrc: '',
  // 切页动画 forward，backward
  transitionName: 'forward',

  // IM相关
  // 登录结果
  loginCode: 200,
  // NIM SDK 实例
  nim: null,
  // 登录账户ID
  userUID: null,
  // 用户名片
  myInfo: {},
  // 会话标题名称
  sessionName: '',
  // 好友/黑名单/陌生人名片, 数据结构如：{cid: {attr: ...}, ...}
  userInfos: {},
  // 用户订阅的事件同步, 数据结构如：{cid: {typeid: {...}, ...}, ...}
  userSubscribes: {},

  // 好友列表
  friendslist: [],
  // 机器人列表
  robotslist: [],
  // 用于判定帐号是否是robots
  robotInfos: {},
  robotInfosByNick: {},
  // 黑名单列表
  blacklist: [],
  // 禁言列表
  // mutelist: [],
  // 静音列表
  mutelist: [],

  teamlist: [],
  // 群自身的属性，数据结构如：{tid: {attr: ...}, ...}
  // teamAttrs: {},
  // 群对象的成员列表，数据结构如：{tid: {members: [...], ...}, ...}
  teamMembers: {},
  // 关闭群提醒的群id列表
  muteTeamIds: [],
  // 群设置传递数据
  teamSettingConfig: {},

  // 已发送群消息回执Map,key为群Id
  sentReceipedMap: {},
  // 当前群消息回执查询的群id
  currReceiptQueryTeamId: null,
  // 群消息回执查询的消息列表
  receiptQueryList: [],
  // 群消息回执查询结果列表
  teamMsgReads: [],
  // 群消息已读未读账号列表
  teamMsgReadsDetail: {
    readAccounts: [],
    unreadAccounts: []
  },

  // 消息列表
  msgs: {}, // 以sessionId作为key
  msgsMap: {}, // 以idClient作为key，诸如消息撤回等的消息查找
  // 会话列表
  sessionlist: [],
  sessionMap: {},
  // 当前会话ID（即当前聊天列表，只有单聊群聊采用，可用于判别）
  currSessionId: null,
  currSessionMsgs: [],
  // 是否有更多历史消息，用于上拉加载更多
  noMoreHistoryMsgs: false,
  // 继续对话的机器人id
  continueRobotAccid: '',

  newMsg: {},
  // 当前历史消息记录初始化数据
  msgRecordInitList: [],
  // 当前选中的历史消息记录
  checkedMsgs: [],
  // 系统消息
  sysMsgs: [],
  customSysMsgs: [],
  sysMsgUnread: {
    total: 0
  },
  customSysMsgUnread: 0,

  // 临时变量
  // 缓存需要获取的用户信息账号,如searchUser
  searchedUsers: [],
  // 缓存需要获取的群组账号
  searchedTeams: [],

  // 聊天室相关
  // 聊天室sdk实例
  chatroomInsts: {},
  chatroomInfos: {},
  // 聊天室分房间消息集合
  chatroomMsgs: {},
  // 当前聊天室实例及id
  currChatroom: null,
  currChatroomId: null,
  currChatroomMsgs: [],
  currChatroomInfo: {},
  // 聊天室成员列表
  currChatroomMembers: [],

  // 自定义
  // 图片查看器
  imgModal: false,
  curModalImg: '',
  allModalImg: [],
  // 右键列表选项
  showListOptions: false,
  listOptionsPos: {
    x: 0,
    y: 0
  },
  listOptionsItems: [],
  slideMenuStatus: 1,
  // 全局提示对象
  toastConfig: {},
  networkStatus: 200,
  sessionAc: '',
  noticeAc: '',
  // 当前已读未读账号列表
  curUnreadList: [],
  curReadList: [],
  curTeamId: '',
  curIdServer: '',
  // 个人信息
  personInfos: {},
  // 通讯录用户信息
  contactslist: [],
  // 通讯录选中项
  contactSelectObj: {},
  // 发起群聊选中成员
  createTeamSelect: [],
  // 组织列表
  orgnizeObj: {},
  // 组织架构禁用成员列表
  orgDisabledlist: [],
  // 我的部门列表
  myDeptObj: {},
  // 登录信息保存
  loginInfo: {},
  // 群右键选中
  teamAc: -1,
  // 聊天记录背景高亮标识
  msgHighBgIdClient: '',
  // 好友状态列表
  friendsStatusList: {},
  mobileOnline: false,
  // 下线modal状态管理
  downlineStatus: false,
  // 常用联系人列表
  contactsToplist: [],
  // 是否处于放大状态
  isWindowMax: false,
  // 上传列表
  uploadprogressList: [],
  // 免登录域名列表
  thirdUrls: [],
  // 下载文件列表
  downloadFileList: [],
  // 当前消息播放音频消息对象
  currentMsgAudio: {},
  // 当前音频消息播放状态
  currentMsgPlay: {},
  // 当前会话云端历史消息
  currSessionHistoryMsgs: [],
  // 当前用户对应的密钥
  currentUserSecret: 'asdasdhhq192hd1f',
  // 远程桌面相关
  remoteWaitingObj: {},
  remoteConnectObj: {}
}
